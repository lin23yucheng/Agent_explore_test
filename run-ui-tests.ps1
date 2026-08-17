param(
    [string]$Username = 'admin',
    [string]$Password,
    [string]$SourceCsv = 'cases/current.csv',
    [string]$RunPlan = '',
    [string]$MergePlan = '',
    [string[]]$CaseId = @(),
    [string[]]$Module = @(),
    [int]$Workers = 2,
    [switch]$Promotion,
    [switch]$Full
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path -LiteralPath $SourceCsv)) {
    throw "测试范围CSV不存在: $SourceCsv"
}
if ($Full -and (-not [string]::IsNullOrWhiteSpace($RunPlan) -or $CaseId.Count -gt 0 -or
        $Module.Count -gt 0 -or $Promotion)) {
    throw '-Full不能与-RunPlan、-CaseId、-Module或-Promotion同时使用。'
}

$pythonExecutable = if (Test-Path '.\venv\Scripts\python.exe') {
    '.\venv\Scripts\python.exe'
} else {
    'python'
}
$reportsRoot = 'reports'
$latestRoot = Join-Path $reportsRoot 'latest'
$batchResultsFile = Join-Path $latestRoot 'playwright-results.json'
$runId = (Get-Date).ToUniversalTime().ToString('yyyyMMddTHHmmssfffZ')
$startedAt = (Get-Date).ToUniversalTime().ToString('o')
$lockPath = Join-Path $reportsRoot '.formal-ui-run.lock'
$lockStream = $null
$expectedBindingsFile = $null

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
} catch {
    if ($lockStream) { $lockStream.Dispose() }
    throw '已有正式UI批次正在执行。'
}

try {
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

    if (-not (Test-Path -LiteralPath $RunPlan)) {
        throw "运行计划不存在: $RunPlan"
    }
    $runPlanPayload = Get-Content -LiteralPath $RunPlan -Raw | ConvertFrom-Json
    if ($runPlanPayload.status -ne 'ready') { throw '运行计划状态不是ready。' }
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

    $preflightArguments = @('playwright', 'test') + $selectedFiles + @('--grep', $grep, '--list')
    $preflightOutput = @(& npx.cmd @preflightArguments 2>&1)
    if ($LASTEXITCODE -ne 0) {
        throw ('Playwright预检失败: ' + (($preflightOutput | Select-Object -Last 20) -join [Environment]::NewLine))
    }
    $listedTitles = @($preflightOutput |
        Where-Object { $_ -match '^\s+.+\.spec\.js:\d+:\d+\s+›\s+' } |
        ForEach-Object { (($_ -split ' › ', 2)[1]).Trim() })
    $difference = @(Compare-Object -ReferenceObject @($runPlanPayload.testTitles) -DifferenceObject $listedTitles)
    if ($difference.Count -gt 0 -or $listedTitles.Count -ne $allowedCaseIds.Count) {
        throw 'Playwright预检结果与运行计划不一致。'
    }

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
    $env:CASE_RESULTS_FILE = $batchResultsFile
    $env:ALLOWED_CASE_IDS = ($allowedCaseIds -join ',')
    $expectedBindingsFile = Join-Path 'cases\runs' ("expected-bindings-$runId.json")
    @($expectedBindings) | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $expectedBindingsFile -Encoding utf8
    $env:EXPECTED_CASE_BINDINGS_FILE = (Resolve-Path -LiteralPath $expectedBindingsFile).Path
    $env:EXPECTED_CASE_BINDINGS = ''
    $env:RUN_PLAN_FILE = (Resolve-Path -LiteralPath $RunPlan).Path
    $env:PLAYWRIGHT_WORKERS = [string][Math]::Max(1, $Workers)

    if (Test-Path -LiteralPath $latestRoot) {
        Remove-Item -LiteralPath $latestRoot -Recurse -Force
    }
    New-Item -ItemType Directory -Path $latestRoot -Force | Out-Null

    $runKind = if ($Full) { '当前快照完整回归' } elseif ($Promotion) {
        '候选脚本晋级复跑'
    } else { '精确CASE-ID回归' }
    Write-Output ("执行类型: $runKind")
    Write-Output ("CASE-ID数量: " + $allowedCaseIds.Count)
    $playwrightArguments = @('playwright', 'test') + $selectedFiles + @('--grep', $grep)
    & npx.cmd @playwrightArguments
    $playwrightExitCode = $LASTEXITCODE

    if (-not (Test-Path -LiteralPath $batchResultsFile)) {
        throw '本批未生成独立Playwright结果，禁止更新执行报告。'
    }
    & $pythonExecutable .\scripts\build_case_report.py --run-plan $RunPlan --batch-results $batchResultsFile
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    $manifest = [ordered]@{
        runId = $runId
        startedAt = $startedAt
        finishedAt = (Get-Date).ToUniversalTime().ToString('o')
        runKind = $runKind
        sourceCsv = $resolvedSource
        runPlan = (Resolve-Path -LiteralPath $RunPlan).Path
        plannedCaseIds = @($allowedCaseIds)
        testFiles = @($selectedFiles)
        playwrightExitCode = $playwrightExitCode
        resultPolicy = '只有脚本正式复跑通过才保留自动化；任何失败均撤销映射并删除独立脚本'
    }
    $manifest | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $latestRoot 'run-manifest.json') -Encoding utf8
    Write-Output '全量当前执行报告: reports\execution_report.csv'
    Write-Output '本批HTML报告: reports\latest\playwright-report\index.html'
    if ($playwrightExitCode -ne 0) { exit $playwrightExitCode }
} finally {
    if ($expectedBindingsFile -and (Test-Path -LiteralPath $expectedBindingsFile)) {
        Remove-Item -LiteralPath $expectedBindingsFile -Force -ErrorAction SilentlyContinue
    }
    if ($lockStream) { $lockStream.Dispose() }
    if (Test-Path -LiteralPath $lockPath) {
        Remove-Item -LiteralPath $lockPath -Force -ErrorAction SilentlyContinue
    }
}
