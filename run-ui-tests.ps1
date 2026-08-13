param(
    [string]$Username = 'admin',
    [string]$Password,
    [string]$SourceCsv = 'cases/current.csv',
    [string]$RunPlan = '',
    [string[]]$TestFiles = @(),
    [string]$Grep = '',
    [switch]$Full,
    [switch]$EnableAiHealing
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path -LiteralPath $SourceCsv)) {
    throw "当前有效用例文件不存在: $SourceCsv"
}

$pythonExecutable = if (Test-Path '.\venv\Scripts\python.exe') {
    '.\venv\Scripts\python.exe'
} else {
    'python'
}

$sessionSensitiveFiles = @(
    'tests/ui/specs/roles.spec.js',
    'tests/ui/specs/users.spec.js'
)
$reportsRoot = 'reports'
$latestRoot = Join-Path $reportsRoot 'latest'
$batchResultsFile = Join-Path $latestRoot 'playwright-results.json'
$runId = (Get-Date).ToUniversalTime().ToString('yyyyMMddTHHmmssfffZ')
$startedAt = (Get-Date).ToUniversalTime().ToString('o')

if ($Full -and ($TestFiles.Count -gt 0 -or -not [string]::IsNullOrWhiteSpace($RunPlan))) {
    throw '不能同时使用 -Full、-RunPlan 和 -TestFiles。'
}
if ($Full) {
    & $pythonExecutable .\scripts\testflow.py validate-automation $SourceCsv
    if ($LASTEXITCODE -ne 0) {
        throw '完整回归前检查未通过，请先修复用例与自动化映射。'
    }
    $fullPlanPath = Join-Path 'cases\runs' ("full-" + $runId + ".json")
    & $pythonExecutable .\scripts\testflow.py make-run-plan $SourceCsv --output $fullPlanPath
    if ($LASTEXITCODE -ne 0) {
        throw '无法生成完整回归运行计划。'
    }
    $RunPlan = $fullPlanPath
    $runPlanPayload = Get-Content -LiteralPath $RunPlan -Raw | ConvertFrom-Json
    $allowedCaseIds = @($runPlanPayload.caseIds)
    $expectedBindings = @($runPlanPayload.bindings)
    $selectedFiles = @($runPlanPayload.testFiles)
    $Grep = '(?:' + ((@($runPlanPayload.testTitles) | ForEach-Object { [regex]::Escape($_) }) -join '|') + ')$'
    $runKind = '完整回归'
} elseif (-not [string]::IsNullOrWhiteSpace($RunPlan)) {
    if (-not (Test-Path -LiteralPath $RunPlan)) {
        throw "运行计划不存在: $RunPlan"
    }
    $runPlanPayload = Get-Content -LiteralPath $RunPlan -Raw | ConvertFrom-Json
    if ($runPlanPayload.status -ne 'ready') {
        throw '运行计划状态不是ready。'
    }
    $allowedCaseIds = @($runPlanPayload.caseIds)
    $expectedBindings = @($runPlanPayload.bindings)
    $selectedFiles = @($runPlanPayload.testFiles)
    if ($allowedCaseIds.Count -eq 0 -or $selectedFiles.Count -eq 0) {
        throw '运行计划没有可执行的CASE-ID或脚本文件。'
    }
    $planGrep = '(?:' + ((@($runPlanPayload.testTitles) | ForEach-Object { [regex]::Escape($_) }) -join '|') + ')$'
    if (-not [string]::IsNullOrWhiteSpace($Grep)) {
        throw '使用 -RunPlan 时不能另外指定 -Grep。'
    }
    $Grep = $planGrep
    $runKind = '精确CASE-ID增量批次'
} elseif ($TestFiles.Count -gt 0) {
    throw '正式执行不再接受按文件选择范围。请先使用 testflow.py make-run-plan 生成精确CASE-ID运行计划，再传入 -RunPlan。'
} else {
    throw '请使用 -RunPlan 指定精确CASE-ID批次；只有明确需要全量回归时才使用 -Full。'
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
$env:AI_HEALING = if ($EnableAiHealing) { 'true' } else { 'false' }
$env:FORMAL_UI_RUN = 'true'
$env:TEST_RUN_ID = $runId
$env:PLAYWRIGHT_HTML_DIR = (Join-Path $latestRoot 'playwright-report')
$env:PLAYWRIGHT_OUTPUT_DIR = (Join-Path $latestRoot 'test-results')
$env:CASE_RESULTS_FILE = $batchResultsFile
$env:ALLOWED_CASE_IDS = ($allowedCaseIds -join ',')
$env:EXPECTED_CASE_BINDINGS = ($expectedBindings | ConvertTo-Json -Depth 8 -Compress)
$env:RUN_PLAN_FILE = $RunPlan

# A batch is self-contained. Never let an older report or attachment participate
# in the current result merge.
if (Test-Path -LiteralPath $latestRoot) {
    Remove-Item -LiteralPath $latestRoot -Recurse -Force
}
New-Item -ItemType Directory -Path $latestRoot -Force | Out-Null

Write-Output ("执行类型: " + $runKind)
if ($Full) {
    $runKind = '完整回归（单批）'
    $playwrightArguments = @('playwright', 'test') + $selectedFiles + @('--workers=1')
    if (-not [string]::IsNullOrWhiteSpace($Grep)) {
        $playwrightArguments += @('--grep', $Grep)
    }
    Write-Output ("测试文件: " + ($selectedFiles -join ', '))
    & npx.cmd @playwrightArguments
    $playwrightExitCode = $LASTEXITCODE
} else {
    Write-Output ("测试文件: " + ($selectedFiles -join ', '))
    $playwrightArguments = @('playwright', 'test') + $selectedFiles
    if (-not [string]::IsNullOrWhiteSpace($Grep)) {
        $playwrightArguments += @('--grep', $Grep)
    }
    & npx.cmd @playwrightArguments
    $playwrightExitCode = $LASTEXITCODE
}

if (-not (Test-Path -LiteralPath $batchResultsFile)) {
    throw '本批Playwright未生成结果文件，禁止复用上一批结果。'
}
# SourceCsv scopes this batch only. The canonical CSV report must always be
# rebuilt from the complete, currently active case set.
$reportArguments = @('.\scripts\build_case_report.py', '--source', 'cases/current.csv', '--report-dir', $reportsRoot, '--history', 'reports/history/case-results.json')
if (-not [string]::IsNullOrWhiteSpace($RunPlan)) {
    $reportArguments += @('--run-plan', $RunPlan)
}
& $pythonExecutable @reportArguments
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$manifest = [ordered]@{
    runId = $runId
    startedAt = $startedAt
    finishedAt = (Get-Date).ToUniversalTime().ToString('o')
    runKind = $runKind
    sourceCsv = (Resolve-Path -LiteralPath $SourceCsv).Path
    runPlan = $(if ([string]::IsNullOrWhiteSpace($RunPlan)) { '' } else { (Resolve-Path -LiteralPath $RunPlan).Path })
    plannedCaseIds = @($allowedCaseIds)
    testFiles = @($selectedFiles)
    playwrightExitCode = $playwrightExitCode
    reportRoot = (Resolve-Path -LiteralPath $latestRoot).Path
    resultPolicy = '本批结果独立生成；未执行用例不复用为本批通过'
}
$manifest | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $latestRoot 'run-manifest.json') -Encoding utf8

Write-Output ("本批运行ID: " + $runId)
Write-Output '本批 HTML 报告: reports\latest\playwright-report\index.html'
Write-Output '全量 CSV 报告: reports\execution_report.csv'
Write-Output '累计历史: reports\history\case-results.json'
Write-Output ("AI 自愈: " + $(if ($EnableAiHealing) { '启用' } else { '关闭' }))
if ($playwrightExitCode -ne 0) { exit $playwrightExitCode }
