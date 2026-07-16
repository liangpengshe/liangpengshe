<#
  沉浸式 SOP 详情页 · 一键测试启动脚本 (Windows PowerShell)
  ------------------------------------------------------------
  功能：
    1. 自动检测/启动 Next.js dev server（3001 端口）
    2. 等待服务就绪
    3. 运行 Playwright 沉浸式 SOP 验证
    4. 在默认浏览器中打开可视化测试报告

  用法：
    .\tests\run-immersive-sop-test.ps1
    npm run test:sop
#>

# 强制使用 UTF-8 输出（兼容 Windows 终端）
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$PSDefaultParameterValues['Out-File:Encoding'] = 'utf8'

$ErrorActionPreference = 'Continue'
$ProjectRoot = (Resolve-Path "$PSScriptRoot\..").Path
$BrowserTestDir = Join-Path $ProjectRoot 'tests\browser-test'
$TestScript = Join-Path $BrowserTestDir 'test-immersive-sop.js'
$Port = 3001
$BaseUrl = "http://localhost:$Port"

# ────────── 颜色输出 ──────────
function Write-Step([string]$msg) { Write-Host "`n>>> $msg" -ForegroundColor Cyan }
function Write-Ok([string]$msg)   { Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Warn([string]$msg) { Write-Host "  [WARN] $msg" -ForegroundColor Yellow }
function Write-Err([string]$msg)  { Write-Host "  [ERR] $msg" -ForegroundColor Red }

# ────────── 工具函数 ──────────
function Test-ServerReady {
  param([string]$Url, [int]$TimeoutSec = 3)
  $result = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec $TimeoutSec -ErrorAction SilentlyContinue
  return $null -ne $result
}

function Stop-NextDevProcess {
  $procs = Get-Process -Name 'node' -ErrorAction SilentlyContinue
  foreach ($p in $procs) {
    if ($p.CommandLine -like '*next dev*') {
      Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue
    }
  }
  Start-Sleep -Seconds 1
}

# ────────── 0. 进入项目根目录 ──────────
Set-Location $ProjectRoot
Write-Step "Project: $ProjectRoot"

# ────────── 1. 检查/启动 dev server ──────────
Write-Step "Check dev server (port $Port)..."
$serverRunning = Test-ServerReady -Url "$BaseUrl/"

if ($serverRunning) {
  Write-Ok "dev server already running"
} else {
  Write-Warn "dev server not running, starting..."
  Stop-NextDevProcess

  Write-Step "Starting Next.js dev server..."
  $devLog = Join-Path $env:TEMP 'liangpengshe-dev.log'
  $devErrLog = Join-Path $env:TEMP 'liangpengshe-dev.err.log'
  $devProcess = Start-Process -FilePath 'npm.cmd' `
    -ArgumentList 'run', 'dev' `
    -WorkingDirectory $ProjectRoot `
    -WindowStyle Hidden `
    -PassThru -RedirectStandardOutput $devLog `
    -RedirectStandardError $devErrLog

  # 等待服务就绪（最多 60s）
  $ready = $false
  for ($i = 1; $i -le 60; $i++) {
    Start-Sleep -Seconds 1
    if (Test-ServerReady -Url "$BaseUrl/" -TimeoutSec 2) {
      $ready = $true
      Write-Ok "dev server ready (${i}s)"
      break
    }
    if ($i % 5 -eq 0) {
      Write-Host "    waiting... ${i}s" -ForegroundColor DarkGray
    }
  }

  if (-not $ready) {
    Write-Err "dev server start timeout (60s)"
    Write-Host "  Log: $devLog" -ForegroundColor Gray
    exit 1
  }
}

# ────────── 2. 检查 Playwright 依赖 ──────────
Write-Step "Check Playwright dependencies..."
$playwrightInstalled = Test-Path (Join-Path $BrowserTestDir 'node_modules\playwright')
if (-not $playwrightInstalled) {
  Write-Warn "Playwright not installed, installing..."
  Push-Location $BrowserTestDir
  npm install playwright --no-audit --no-fund 2>&1 | Out-Null
  Pop-Location
  Write-Ok "Playwright installed"
} else {
  Write-Ok "Playwright installed"
}

# ────────── 3. 检查浏览器二进制 ──────────
Write-Step "Check Playwright Chromium..."
Push-Location $BrowserTestDir
$env:PLAYWRIGHT_BROWSERS_PATH = '0'
$playwrightOutput = npx playwright install chromium 2>&1 | Out-String
if ($LASTEXITCODE -eq 0) {
  Write-Ok "Chromium ready"
} else {
  Write-Warn "Chromium install: $playwrightOutput"
}
Pop-Location

# ────────── 4. 跑测试 ──────────
Write-Step "Running Playwright immersive SOP tests..."
Push-Location $BrowserTestDir
$testStart = Get-Date
& node test-immersive-sop.js
$testExit = $LASTEXITCODE
$testDur = (Get-Date) - $testStart
Write-Host ""

if ($testExit -ne 0) {
  Write-Warn "Test exit code: $testExit ($(($testDur.TotalSeconds).ToString('0.0'))s)"
} else {
  Write-Ok "Test completed ($(($testDur.TotalSeconds).ToString('0.0'))s)"
}
Pop-Location

# ────────── 5. 生成并打开 HTML 报告 ──────────
$reportPath = Join-Path $env:TEMP 'immersive-sop-report.html'
$reportJson = Join-Path $env:TEMP 'immersive-sop-report.json'

if (Test-Path $reportJson) {
  Write-Step "Generate visual report..."
  $buildOk = $true
  & node "$PSScriptRoot\build-immersive-report.js" $reportJson $reportPath 2>&1 | Out-Null
  if ($LASTEXITCODE -ne 0) { $buildOk = $false }

  if ($buildOk -and (Test-Path $reportPath)) {
    Write-Ok "Report: $reportPath"
    Write-Step "Opening report in browser..."
    Start-Process $reportPath
  } else {
    Write-Warn "Falling back to JSON report"
    Start-Process $reportJson
  }
} else {
  Write-Warn "JSON report not found: $reportJson"
}

# ────────── 6. 显示截图位置 ──────────
$screens = @(
  (Join-Path $env:TEMP 'immersive-sop-pc.png'),
  (Join-Path $env:TEMP 'immersive-sop-mobile.png'),
  (Join-Path $env:TEMP 'immersive-sop-ai-coach.png'),
  (Join-Path $env:TEMP 'immersive-sop-paywall.png')
) | Where-Object { Test-Path $_ }

if ($screens.Count -gt 0) {
  Write-Host ""
  Write-Ok "Screenshots generated (in system Temp folder):"
  foreach ($s in $screens) {
    Write-Host "    [img] $s" -ForegroundColor DarkGray
  }
}

Write-Host ""
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "  Test done. Browser report opened automatically." -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan

if ($devProcess) {
  Write-Host ""
  Write-Host "Tip: dev server still running (PID $($devProcess.Id))" -ForegroundColor DarkGray
  Write-Host "     Stop: Get-Process -Id $($devProcess.Id) | Stop-Process" -ForegroundColor DarkGray
}

exit $testExit
