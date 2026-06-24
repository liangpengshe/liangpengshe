$ErrorActionPreference = 'SilentlyContinue'
$base = 'http://localhost:3001'
$pages = @(
  '/', '/tools', '/tools/leopard', '/tools/lingxi', '/tools/pioneer', '/tools/market', '/tools/submit',
  '/projects', '/projects/submit', '/services', '/services/join', '/resources',
  '/salon', '/member', '/contact', '/more', '/partner', '/profile',
  '/dashboard',
  '/auth/login', '/auth/signup',
  '/console', '/console/revenue', '/console/reviews', '/console/diagnoses',
  '/console/applications', '/console/projects', '/console/salons',
  '/test-dify'
)
$ok = 0; $fail = 0; $rows = @()
foreach ($p in $pages) {
  $t0 = Get-Date
  try {
    $r = Invoke-WebRequest -Uri ($base + $p) -UseBasicParsing -TimeoutSec 30
    $ms = ((Get-Date) - $t0).TotalMilliseconds
    if ($r.StatusCode -ge 200 -and $r.StatusCode -lt 400) {
      $ok++
      $rows += [pscustomobject]@{ Path=$p; Status=$r.StatusCode; Time="$([math]::Round($ms))ms"; Size=$r.Content.Length; Result='OK' }
    } else {
      $fail++
      $rows += [pscustomobject]@{ Path=$p; Status=$r.StatusCode; Time="$([math]::Round($ms))ms"; Size=$r.Content.Length; Result='FAIL' }
    }
  } catch {
    $fail++
    $msg = $_.Exception.Message -replace "`n"," " | Select-Object -First 1
    $rows += [pscustomobject]@{ Path=$p; Status='ERR'; Time='-'; Size=0; Result=$msg.Substring(0, [Math]::Min(80, $msg.Length)) }
  }
}
Write-Host "========== Page Test ==========" -ForegroundColor Cyan
Write-Host ("Total: {0}  OK: {1}  FAIL: {2}" -f $pages.Count, $ok, $fail)
Write-Host ""
$rows | Format-Table Path, Status, Time, Size, Result -AutoSize
