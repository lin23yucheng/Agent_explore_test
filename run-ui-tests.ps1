param(
    [string]$Username = 'admin',
    [string]$Password,
    [string]$SourceCsv = 'cases/current.csv',
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
    'tests/ui/roles.spec.js',
    'tests/ui/users.spec.js'
)
$reportsRoot = 'reports'
$latestRoot = Join-Path $reportsRoot 'latest'
$batchResultsFile = Join-Path $latestRoot 'playwright-results.json'
$runId = (Get-Date).ToUniversalTime().ToString('yyyyMMddTHHmmssfffZ')
$startedAt = (Get-Date).ToUniversalTime().ToString('o')

if ($Full -and $TestFiles.Count -gt 0) {
    throw '不能同时使用 -Full 和 -TestFiles。'
}
if ($Full) {
    & $pythonExecutable .\scripts\testflow.py validate-automation $SourceCsv
    if ($LASTEXITCODE -ne 0) {
        throw '完整回归前检查未通过，请先修复用例与自动化映射。'
    }
    $fullRegressionFiles = @(& $pythonExecutable .\scripts\testflow.py list-specs)
    if ($LASTEXITCODE -ne 0) {
        throw '无法从自动化注册表读取完整回归脚本。'
    }
    if ($fullRegressionFiles.Count -eq 0) {
        throw '自动化注册表中没有有效脚本，请先探索用例并登记脚本映射。'
    }
    $sessionSensitiveFiles = $sessionSensitiveFiles | Where-Object { $_ -in $fullRegressionFiles }
    $adminParallelFiles = $fullRegressionFiles | Where-Object { $_ -notin $sessionSensitiveFiles }
    $runKind = '完整回归'
} elseif ($TestFiles.Count -gt 0) {
    # Accept both PowerShell arrays and comma-separated file lists passed through
    # -File so a module can execute several registered specs in one batch.
    $selectedFiles = @($TestFiles | ForEach-Object { $_ -split ',' } | ForEach-Object { $_.Trim() } | Where-Object { $_ })
    $runKind = '增量批次'
} else {
    throw '请使用 -TestFiles 指定本批脚本；只有明确需要全量回归时才使用 -Full。'
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

# A batch is self-contained. Never let an older report or attachment participate
# in the current result merge.
if (Test-Path -LiteralPath $latestRoot) {
    Remove-Item -LiteralPath $latestRoot -Recurse -Force
}
New-Item -ItemType Directory -Path $latestRoot -Force | Out-Null

Write-Output ("执行类型: " + $runKind)
if ($Full) {
    $selectedFiles = $fullRegressionFiles
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
& $pythonExecutable .\scripts\build_case_report.py --source 'cases/current.csv' --report-dir $reportsRoot --history 'reports/history/case-results.json'
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$manifest = [ordered]@{
    runId = $runId
    startedAt = $startedAt
    finishedAt = (Get-Date).ToUniversalTime().ToString('o')
    runKind = $runKind
    sourceCsv = (Resolve-Path -LiteralPath $SourceCsv).Path
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
