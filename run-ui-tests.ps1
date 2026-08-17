param(
    [string]$Username = 'admin',
    [string]$Password,
    [string]$SourceCsv = 'cases/current.csv',
    [string]$RunPlan = '',
    [string]$MergePlan = '',
    [string[]]$CaseId = @(),
    [string[]]$Module = @(),
    [int]$Workers = 1,
    [switch]$Promotion,
    [switch]$Full,
    [switch]$Resume,
    [switch]$Rerun
)

$ErrorActionPreference = 'Stop'
$sourceCsvWasProvided = $PSBoundParameters.ContainsKey('SourceCsv')
$resumeConflicts = @('SourceCsv', 'RunPlan', 'MergePlan', 'CaseId', 'Module', 'Promotion', 'Full') |
    Where-Object { $PSBoundParameters.ContainsKey($_) }

if ($Resume -and $resumeConflicts.Count -gt 0) {
    throw ('-Resume不能与范围参数同时使用: ' + ($resumeConflicts -join ', '))
}
if ($Rerun -and -not $Resume) {
    throw '-Rerun只能与-Resume一起使用。'
}
if (-not $Resume -and
        ([string]::IsNullOrWhiteSpace($RunPlan) -or $sourceCsvWasProvided -or $Full) -and
        -not (Test-Path -LiteralPath $SourceCsv)) {
    throw "测试范围CSV不存在: $SourceCsv"
}
if ($Full -and (-not [string]::IsNullOrWhiteSpace($RunPlan) -or $CaseId.Count -gt 0 -or
        $Module.Count -gt 0 -or $Promotion)) {
    throw '-Full不能与-RunPlan、-CaseId、-Module或-Promotion同时使用。'
}

function Write-JsonAtomic {
    param([string]$Path, [object]$Value)
    $parent = Split-Path -Parent $Path
    if (-not [string]::IsNullOrWhiteSpace($parent)) {
        New-Item -ItemType Directory -Path $parent -Force | Out-Null
    }
    $leaf = Split-Path -Leaf $Path
    $temporary = Join-Path $parent ('.' + $leaf + '.' + $PID + '.' + [guid]::NewGuid().ToString('N') + '.tmp')
    try {
        $json = $Value | ConvertTo-Json -Depth 12
        [System.IO.File]::WriteAllText(
            $temporary, $json, [System.Text.UTF8Encoding]::new($false)
        )
        Move-Item -LiteralPath $temporary -Destination $Path -Force
    } finally {
        if (Test-Path -LiteralPath $temporary) {
            Remove-Item -LiteralPath $temporary -Force -ErrorAction SilentlyContinue
        }
    }
}

function Update-RunCheckpoint {
    param(
        [string]$Status,
        [string]$NextAction,
        [string]$ErrorMessage = ''
    )
    if ($null -eq $script:checkpointPayload) { return }
    $script:checkpointPayload.status = $Status
    $script:checkpointPayload.nextAction = $NextAction
    $script:checkpointPayload.lastError = $ErrorMessage
    $script:checkpointPayload.updatedAt = (Get-Date).ToUniversalTime().ToString('o')
    if (Test-Path -LiteralPath $script:batchResultsFile) {
        $script:checkpointPayload.batchResultsHash = (
            Get-FileHash -LiteralPath $script:batchResultsFile -Algorithm SHA256
        ).Hash.ToLowerInvariant()
    }
    Write-JsonAtomic -Path $script:checkpointPath -Value $script:checkpointPayload
}

function ConvertTo-OrderedMap {
    param([object]$Value)
    $result = [ordered]@{}
    foreach ($property in $Value.PSObject.Properties) {
        $result[$property.Name] = $property.Value
    }
    return $result
}

$pythonExecutable = if (Test-Path '.\venv\Scripts\python.exe') {
    '.\venv\Scripts\python.exe'
} else {
    'python'
}
$reportsRoot = 'reports'
$latestRoot = Join-Path $reportsRoot 'latest'
$interruptedRoot = Join-Path $reportsRoot 'interrupted'
$script:batchResultsFile = Join-Path $latestRoot 'playwright-results.json'
$script:checkpointPath = Join-Path $latestRoot 'run-checkpoint.json'
$script:checkpointPayload = $null
$runId = (Get-Date).ToUniversalTime().ToString('yyyyMMddTHHmmssfffZ')
$startedAt = (Get-Date).ToUniversalTime().ToString('o')
$lockPath = Join-Path 'cases' '.testflow-state.lock'
$lockStream = $null
$expectedBindingsFile = $null
$finalExitCode = 0
$resumeMergeOnly = $false
$resumeFinalizeOnly = $false
$resumeCheckpoint = $null
$previousRunId = ''
$runKind = ''
$managedEnvironmentNames = @(
    'UI_USERNAME', 'UI_PASSWORD', 'FORMAL_UI_RUN', 'PLAYWRIGHT_REUSE_AUTH',
    'TEST_RUN_ID', 'PLAYWRIGHT_HTML_DIR', 'PLAYWRIGHT_OUTPUT_DIR',
    'CASE_RESULTS_FILE', 'ALLOWED_CASE_IDS', 'EXPECTED_CASE_BINDINGS_FILE',
    'EXPECTED_CASE_BINDINGS', 'RUN_PLAN_FILE', 'PLAYWRIGHT_WORKERS',
    'TESTFLOW_LOCK_HELD'
)
$previousEnvironment = @{}
foreach ($name in $managedEnvironmentNames) {
    $previousEnvironment[$name] = [Environment]::GetEnvironmentVariable($name, 'Process')
}

New-Item -ItemType Directory -Path $reportsRoot -Force | Out-Null
try {
    $lockStream = [System.IO.File]::Open(
        $lockPath,
        [System.IO.FileMode]::OpenOrCreate,
        [System.IO.FileAccess]::ReadWrite,
        [System.IO.FileShare]::None
    )
    $lockPayload = [System.Text.Encoding]::UTF8.GetBytes("runId=$runId`nstartedAt=$startedAt`n")
    $lockStream.SetLength(0)
    $lockStream.Write($lockPayload, 0, $lockPayload.Length)
    $lockStream.Flush()
    $env:TESTFLOW_LOCK_HELD = 'true'
} catch {
    if ($lockStream) { $lockStream.Dispose() }
    throw '已有正式UI批次或状态恢复正在执行。'
}

try {
    & $pythonExecutable .\scripts\testflow.py recover-state
    if ($LASTEXITCODE -ne 0) { throw '中断状态恢复失败，禁止开始正式批次。' }

    $existingCheckpoint = $null
    if (Test-Path -LiteralPath $script:checkpointPath) {
        try {
            $existingCheckpoint = Get-Content -LiteralPath $script:checkpointPath -Raw | ConvertFrom-Json
        } catch {
            throw '批次检查点损坏，请先保留reports/latest并人工确认，禁止覆盖。'
        }
    }

    if (-not $Resume -and $existingCheckpoint -and $existingCheckpoint.status -ne 'completed') {
        throw '检测到未完成批次，请先执行 .\run-ui-tests.ps1 -Resume。'
    }

    if ($Resume) {
        if (-not $existingCheckpoint) {
            throw '没有可恢复的批次检查点。'
        }
        if ($existingCheckpoint.status -eq 'completed') {
            throw '最近批次已经完成，不需要恢复。'
        }
        $resumeCheckpoint = $existingCheckpoint
        $previousRunId = [string]$resumeCheckpoint.runId
        $RunPlan = [string]$resumeCheckpoint.runPlan
        $SourceCsv = [string]$resumeCheckpoint.sourceCsv
        $runKind = [string]$resumeCheckpoint.runKind
        if (-not $PSBoundParameters.ContainsKey('Workers') -and $resumeCheckpoint.workers) {
            $Workers = [int]$resumeCheckpoint.workers
        }
        $mergeReceiptPath = Join-Path $latestRoot 'merge-receipt.json'
        if (Test-Path -LiteralPath $mergeReceiptPath) {
            $mergeReceipt = Get-Content -LiteralPath $mergeReceiptPath -Raw | ConvertFrom-Json
            $receiptCaseDifference = @(
                Compare-Object -ReferenceObject @($resumeCheckpoint.caseIds) `
                    -DifferenceObject @($mergeReceipt.caseIds)
            )
            if ($mergeReceipt.status -ne 'committed' -or
                    $mergeReceipt.runPlanHash -ne $resumeCheckpoint.runPlanHash -or
                    $mergeReceipt.batchResultsHash -ne $resumeCheckpoint.batchResultsHash -or
                    $receiptCaseDifference.Count -gt 0) {
                throw '结果合并回执与批次检查点不一致，禁止自动恢复。'
            }
            if ($Rerun) {
                throw '结果事务已经提交，不能使用-Resume -Rerun；请使用-Resume完成收尾。'
            }
            $resumeFinalizeOnly = $true
        }
        $mergePhases = @('results-ready', 'merging', 'merge-failed')
        if (-not $resumeFinalizeOnly -and -not $Rerun -and
                $resumeCheckpoint.status -in $mergePhases -and
                (Test-Path -LiteralPath $script:batchResultsFile)) {
            $actualResultsHash = (
                Get-FileHash -LiteralPath $script:batchResultsFile -Algorithm SHA256
            ).Hash.ToLowerInvariant()
            $resumeMergeOnly = -not [string]::IsNullOrWhiteSpace($resumeCheckpoint.batchResultsHash) -and
                $resumeCheckpoint.batchResultsHash -eq $actualResultsHash
        }
        if ($resumeMergeOnly -or $resumeFinalizeOnly) {
            $runId = $previousRunId
            $startedAt = [string]$resumeCheckpoint.startedAt
            $script:checkpointPayload = ConvertTo-OrderedMap $resumeCheckpoint
        }
    }

    if (-not $resumeMergeOnly -and -not $resumeFinalizeOnly) {
        & $pythonExecutable .\scripts\testflow.py sync-report
        if ($LASTEXITCODE -ne 0) { throw '正式执行前报告同步失败。' }
        & $pythonExecutable .\scripts\testflow.py validate-state
        if ($LASTEXITCODE -ne 0) { throw '正式执行前状态校验失败。' }
    } elseif ($resumeMergeOnly -or $resumeFinalizeOnly) {
        & $pythonExecutable .\scripts\testflow.py validate-state
        if ($LASTEXITCODE -ne 0) { throw '恢复合并前状态校验失败。' }
    }

    if (-not $Resume) {
        if ($Full) {
            & $pythonExecutable .\scripts\testflow.py validate-state --full
            if ($LASTEXITCODE -ne 0) { throw '完整回归前状态校验失败。' }
            $RunPlan = Join-Path 'cases\runs' ("full-$runId.json")
            & $pythonExecutable .\scripts\testflow.py make-run-plan cases\current.csv --output $RunPlan
            if ($LASTEXITCODE -ne 0) { throw '完整回归运行计划生成失败。' }
        } elseif ([string]::IsNullOrWhiteSpace($RunPlan)) {
            if ($CaseId.Count -eq 0 -and $Module.Count -eq 0) {
                throw '请提供-RunPlan，或使用-CaseId/-Module生成精确运行计划。'
            }
            $RunPlan = Join-Path 'cases\runs' ("selected-$runId.json")
            $planArguments = @('.\scripts\testflow.py', 'make-run-plan', $SourceCsv, '--output', $RunPlan)
            if (-not [string]::IsNullOrWhiteSpace($MergePlan)) {
                $planArguments += @('--plan', $MergePlan)
            }
            foreach ($value in $CaseId) { $planArguments += @('--case-id', $value) }
            foreach ($value in $Module) { $planArguments += @('--module', $value) }
            if ($Promotion) { $planArguments += '--promotion' }
            & $pythonExecutable @planArguments
            if ($LASTEXITCODE -ne 0) { throw '精确运行计划生成失败。' }
        }
    }

    if (-not (Test-Path -LiteralPath $RunPlan)) {
        throw "运行计划不存在: $RunPlan"
    }
    $runPlanPayload = Get-Content -LiteralPath $RunPlan -Raw | ConvertFrom-Json
    if ($runPlanPayload.status -ne 'ready') { throw '运行计划状态不是ready。' }
    $resolvedRunPlan = (Resolve-Path -LiteralPath $RunPlan).Path
    $runPlanHash = (Get-FileHash -LiteralPath $RunPlan -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($Resume -and $resumeCheckpoint.runPlanHash -ne $runPlanHash) {
        throw '恢复批次绑定的运行计划已经变化。'
    }
    if (-not $sourceCsvWasProvided -and -not $Full) {
        $SourceCsv = [string]$runPlanPayload.sourceCsv
    }
    if (-not (Test-Path -LiteralPath $SourceCsv)) {
        throw "运行计划绑定的测试范围CSV不存在: $SourceCsv"
    }
    $resolvedSource = (Resolve-Path -LiteralPath $SourceCsv).Path
    if ($runPlanPayload.sourceCsv -ne $resolvedSource) {
        throw '运行计划sourceCsv与-SourceCsv不一致。'
    }
    $sourceHash = (Get-FileHash -LiteralPath $SourceCsv -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($runPlanPayload.sourceHash -ne $sourceHash) {
        throw '测试范围CSV在运行计划生成后发生变化。'
    }
    $currentHash = (Get-FileHash -LiteralPath 'cases\current.csv' -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($runPlanPayload.currentHash -ne $currentHash) {
        throw 'current.csv在运行计划生成后发生变化。'
    }
    if ($Promotion -and $runPlanPayload.runType -ne 'promotion') {
        throw '-Promotion必须使用promotion类型运行计划。'
    }
    if (-not $Promotion -and -not $Full -and $runPlanPayload.runType -eq 'promotion') {
        $Promotion = $true
    }

    $allowedCaseIds = @($runPlanPayload.caseIds)
    $expectedBindings = @($runPlanPayload.bindings)
    $selectedFiles = @($runPlanPayload.testFiles)
    if ($allowedCaseIds.Count -eq 0 -or $selectedFiles.Count -eq 0) {
        throw '运行计划没有可执行用例。'
    }
    $duplicateIds = @($allowedCaseIds | Group-Object | Where-Object { $_.Count -gt 1 })
    if ($duplicateIds.Count -gt 0) { throw '运行计划包含重复CASE-ID。' }
    $leafTitles = @($runPlanPayload.testTitles | ForEach-Object { ($_ -split ' › ')[-1] })
    $duplicateTitles = @($leafTitles | Group-Object | Where-Object { $_.Count -gt 1 })
    if ($duplicateTitles.Count -gt 0) { throw '运行计划包含重复叶子测试标题。' }
    $grep = '(?:' + ((@($runPlanPayload.testTitles) | ForEach-Object {
        [regex]::Escape(($_ -split ' › ')[-1])
    }) -join '|') + ')$'

    if ([string]::IsNullOrWhiteSpace($runKind)) {
        $runKind = if ($Full) { '当前快照完整回归' } elseif ($Promotion) {
            '候选脚本晋级复跑'
        } else { '精确CASE-ID回归' }
    }

    if (-not $resumeMergeOnly -and -not $resumeFinalizeOnly) {
        if ($Resume -and (Test-Path -LiteralPath $latestRoot)) {
            New-Item -ItemType Directory -Path $interruptedRoot -Force | Out-Null
            $safePreviousRun = $previousRunId -replace '[^A-Za-z0-9_.-]', '_'
            $archiveName = "$safePreviousRun-" + (Get-Date).ToUniversalTime().ToString('yyyyMMddTHHmmssfffZ')
            Move-Item -LiteralPath $latestRoot -Destination (Join-Path $interruptedRoot $archiveName)
        } elseif (Test-Path -LiteralPath $latestRoot) {
            Remove-Item -LiteralPath $latestRoot -Recurse -Force
        }
        New-Item -ItemType Directory -Path $latestRoot -Force | Out-Null
        $script:checkpointPayload = [ordered]@{
            schemaVersion = 1
            runId = $runId
            previousRunId = $previousRunId
            status = 'planned'
            nextAction = 'rerun-plan'
            startedAt = $startedAt
            updatedAt = $startedAt
            runKind = $runKind
            runPlan = $resolvedRunPlan
            runPlanHash = $runPlanHash
            sourceCsv = $resolvedSource
            sourceHash = $sourceHash
            currentHash = $currentHash
            caseIds = @($allowedCaseIds)
            testFiles = @($selectedFiles)
            workers = [Math]::Max(1, $Workers)
            batchResults = (Resolve-Path -LiteralPath $latestRoot).Path + '\playwright-results.json'
            batchResultsHash = ''
            playwrightExitCode = $null
            lastError = ''
        }
        Update-RunCheckpoint -Status 'planned' -NextAction 'rerun-plan'

        $preflightArguments = @('playwright', 'test') + $selectedFiles + @('--list')
        $preflightOutput = @(& npx.cmd @preflightArguments 2>&1)
        if ($LASTEXITCODE -ne 0) {
            throw ('Playwright预检失败: ' + (($preflightOutput | Select-Object -Last 20) -join [Environment]::NewLine))
        }
        $listedTitles = @($preflightOutput | ForEach-Object {
            $listedMatch = [regex]::Match(
                [string]$_,
                '\.spec\.js:\d+:\d+\s+›\s+(?<title>.+)$'
            )
            if ($listedMatch.Success) { $listedMatch.Groups['title'].Value.Trim() }
        })
        $difference = @(Compare-Object -ReferenceObject @($runPlanPayload.testTitles) -DifferenceObject $listedTitles)
        if ($difference.Count -gt 0 -or $listedTitles.Count -ne $allowedCaseIds.Count) {
            throw 'Playwright预检结果与运行计划不一致。'
        }
        Update-RunCheckpoint -Status 'preflight-passed' -NextAction 'rerun-plan'

        if ([string]::IsNullOrWhiteSpace($Password)) {
            $securePassword = Read-Host 'FAT 管理员密码' -AsSecureString
            $passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
            try {
                $Password = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)
            } finally {
                [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
            }
        }

        $env:UI_USERNAME = $Username
        $env:UI_PASSWORD = $Password
        $env:FORMAL_UI_RUN = 'true'
        $env:PLAYWRIGHT_REUSE_AUTH = 'true'
        $env:TEST_RUN_ID = $runId
        $env:PLAYWRIGHT_HTML_DIR = (Join-Path $latestRoot 'playwright-report')
        $env:PLAYWRIGHT_OUTPUT_DIR = (Join-Path $latestRoot 'test-results')
        $env:CASE_RESULTS_FILE = $script:batchResultsFile
        $env:ALLOWED_CASE_IDS = ($allowedCaseIds -join ',')
        $expectedBindingsFile = Join-Path 'cases\runs' ("expected-bindings-$runId.json")
        @($expectedBindings) | ConvertTo-Json -Depth 8 |
            Set-Content -LiteralPath $expectedBindingsFile -Encoding utf8
        $env:EXPECTED_CASE_BINDINGS_FILE = (Resolve-Path -LiteralPath $expectedBindingsFile).Path
        $env:EXPECTED_CASE_BINDINGS = ''
        $env:RUN_PLAN_FILE = $resolvedRunPlan
        $env:PLAYWRIGHT_WORKERS = [string][Math]::Max(1, $Workers)

        Write-Output ("执行类型: $runKind")
        Write-Output ("CASE-ID数量: " + $allowedCaseIds.Count)
        Update-RunCheckpoint -Status 'running' -NextAction 'rerun-plan'
        $playwrightArguments = @('playwright', 'test') + $selectedFiles + @('--grep', $grep)
        & npx.cmd @playwrightArguments
        $playwrightExitCode = $LASTEXITCODE
        $script:checkpointPayload.playwrightExitCode = $playwrightExitCode

        if (-not (Test-Path -LiteralPath $script:batchResultsFile)) {
            throw '本批未生成独立Playwright结果，禁止更新执行报告。'
        }
        Update-RunCheckpoint -Status 'results-ready' -NextAction 'resume-merge'
    } elseif ($resumeMergeOnly) {
        $playwrightExitCode = [int]$script:checkpointPayload.playwrightExitCode
        Write-Output ("恢复批次: $runId，仅合并已校验的Playwright结果。")
    } else {
        $playwrightExitCode = [int]$script:checkpointPayload.playwrightExitCode
        Write-Output ("恢复批次: $runId，结果已提交，仅完成批次收尾。")
    }

    if (-not $resumeFinalizeOnly) {
        Update-RunCheckpoint -Status 'merging' -NextAction 'resume-merge'
        & $pythonExecutable .\scripts\build_case_report.py `
            --run-plan $RunPlan --batch-results $script:batchResultsFile
        if ($LASTEXITCODE -ne 0) {
            Update-RunCheckpoint -Status 'merge-failed' -NextAction 'resume-merge' `
                -ErrorMessage "结果合并进程退出码: $LASTEXITCODE"
            throw '正式结果合并失败；检查点和原始结果已保留。'
        }
    }

    $manifest = [ordered]@{
        runId = $runId
        startedAt = $startedAt
        finishedAt = (Get-Date).ToUniversalTime().ToString('o')
        runKind = $runKind
        sourceCsv = $resolvedSource
        runPlan = $resolvedRunPlan
        plannedCaseIds = @($allowedCaseIds)
        testFiles = @($selectedFiles)
        playwrightExitCode = $playwrightExitCode
        resumed = [bool]$Resume
        resultPolicy = '只有脚本正式复跑通过才保留自动化；任何失败均撤销映射并删除独立脚本'
    }
    Write-JsonAtomic -Path (Join-Path $latestRoot 'run-manifest.json') -Value $manifest
    Update-RunCheckpoint -Status 'completed' -NextAction 'none'
    Write-Output '全量当前执行报告: reports\execution_report.csv'
    Write-Output '本批HTML报告: reports\latest\playwright-report\index.html'
    $finalExitCode = $playwrightExitCode
} catch {
    if ($null -ne $script:checkpointPayload -and
            $script:checkpointPayload.status -ne 'completed') {
        $nextAction = if ($script:checkpointPayload.status -in @(
                'results-ready', 'merging', 'merge-failed'
            )) { 'resume-merge' } else { 'rerun-plan' }
        $failureStatus = if ($nextAction -eq 'resume-merge') { 'merge-failed' } else { 'interrupted' }
        try {
            Update-RunCheckpoint -Status $failureStatus -NextAction $nextAction `
                -ErrorMessage $_.Exception.Message
        } catch {
            Write-Warning ('批次失败且检查点更新失败: ' + $_.Exception.Message)
        }
    }
    throw
} finally {
    if ($expectedBindingsFile -and (Test-Path -LiteralPath $expectedBindingsFile)) {
        Remove-Item -LiteralPath $expectedBindingsFile -Force -ErrorAction SilentlyContinue
    }
    if ($lockStream) { $lockStream.Dispose() }
    if (Test-Path -LiteralPath $lockPath) {
        Remove-Item -LiteralPath $lockPath -Force -ErrorAction SilentlyContinue
    }
    foreach ($name in $managedEnvironmentNames) {
        $value = $previousEnvironment[$name]
        if ($null -eq $value) {
            Remove-Item -LiteralPath "Env:$name" -ErrorAction SilentlyContinue
        } else {
            [Environment]::SetEnvironmentVariable($name, $value, 'Process')
        }
    }
}

if ($finalExitCode -ne 0) { exit $finalExitCode }
