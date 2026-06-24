$ErrorActionPreference = 'SilentlyContinue'
$base = 'http://localhost:3001'

$apis = @(
  @{ m='GET'; p='/api/community/heartbeat'; b=$null; d='community heartbeat' }
  @{ m='GET'; p='/api/activities'; b=$null; d='activities list' }
  @{ m='GET'; p='/api/projects'; b=$null; d='projects list' }
  @{ m='GET'; p='/api/partner'; b=$null; d='partners list' }
  @{ m='GET'; p='/api/order/revenue'; b=$null; d='revenue records' }
  @{ m='GET'; p='/api/console/stats'; b=$null; d='console stats' }
  @{ m='GET'; p='/api/console/applications'; b=$null; d='applications list' }
  @{ m='GET'; p='/api/console/projects'; b=$null; d='projects review' }
  @{ m='GET'; p='/api/console/salons'; b=$null; d='salons list' }
  @{ m='GET'; p='/api/revenue/dashboard'; b=$null; d='revenue dashboard' }
  @{ m='GET'; p='/api/ai/tts'; b=$null; d='TTS health check' }
  @{ m='POST'; p='/api/ai/tools-recommend'; b='{"userInput":"I want AI digital human short video"}'; d='TOOL recommend' }
  @{ m='POST'; p='/api/ai/project-plan'; b='{"name":"ZhangSan","phone":"13800000000","birthday":"1990-01-01","targetIncome":"1M","background":"5y e-commerce"}'; d='PLAN plan' }
  @{ m='POST'; p='/api/ai/diagnose'; b='{"name":"LiZong","phone":"13900000000","role":"founder","goals":["save-cost"],"description":"traditional mfg AI upgrade"}'; d='DIAGNOSE' }
  @{ m='POST'; p='/api/ai/daily-brief'; b='{"userId":"test-001","force":true}'; d='DAILY brief' }
  @{ m='POST'; p='/api/ai/match'; b='{"description":"short video live commerce"}'; d='AI match' }
  @{ m='POST'; p='/api/ai/chat'; b='{"message":"hello"}'; d='AI chat' }
  @{ m='POST'; p='/api/coins'; b='{"phone":"13800000000","action":"signin","amount":10}'; d='coins' }
  @{ m='POST'; p='/api/order/create'; b='{"orderId":"test-001","amount":1000,"productId":"p1","productName":"Test","sellerId":"s1","referrerId":"r1"}'; d='order create' }
  @{ m='POST'; p='/api/pay/salon'; b='{"amount":99}'; d='salon pay' }
  @{ m='POST'; p='/api/tools/submit'; b='{"toolName":"TestTool","category":"AI","description":"Test","contact":"13800000000"}'; d='tool submit' }
  @{ m='POST'; p='/api/services/join'; b='{"name":"Test","phone":"13800000000","serviceType":"AI training","description":"Test"}'; d='service join' }
  @{ m='POST'; p='/api/review'; b='{"targetId":"t1","targetType":"tool","rating":5,"comment":"Test","contact":"13800000000"}'; d='review' }
  @{ m='POST'; p='/api/member/roadmap'; b='{"userId":"test-001"}'; d='roadmap' }
  @{ m='POST'; p='/api/user/preference'; b='{"userId":"test-001","dailyBrief":true}'; d='user pref' }
  @{ m='POST'; p='/api/console/applications/test-id/approve'; b='{"reviewNote":"OK"}'; d='app approve' }
  @{ m='POST'; p='/api/console/applications/test-id/reject'; b='{"reviewNote":"NO"}'; d='app reject' }
  @{ m='POST'; p='/api/console/salons/test-id'; b='{"status":"APPROVED"}'; d='salon review' }
  @{ m='POST'; p='/api/console/projects/test-id'; b='{"status":"APPROVED"}'; d='project review' }
)

$ok = 0; $err = 0; $rows = @()
foreach ($api in $apis) {
  $t0 = Get-Date
  try {
    $opts = @{ Method = $api.m; UseBasicParsing = $true; TimeoutSec = 180 }
    if ($api.b) {
      $opts.Add('ContentType', 'application/json')
      $opts.Add('Body', $api.b)
    }
    $r = Invoke-WebRequest -Uri ($base + $api.p) @opts
    $ms = ((Get-Date) - $t0).TotalMilliseconds
    $ok++
    $rows += [pscustomobject]@{ Method=$api.m; Path=$api.p; Status=$r.StatusCode; Time="$([math]::Round($ms))ms"; Desc=$api.d }
  } catch {
    $ms = ((Get-Date) - $t0).TotalMilliseconds
    $code = $null
    if ($_.Exception.Response) { $code = [int]$_.Exception.Response.StatusCode }
    $err++
    $msg = $_.Exception.Message -replace "`n"," " | Select-Object -First 1
    $rows += [pscustomobject]@{ Method=$api.m; Path=$api.p; Status=if($code){"$code"}else{"ERR"}; Time="$([math]::Round($ms))ms"; Desc="$api.d | $($msg.Substring(0,[Math]::Min(40,$msg.Length)))" }
  }
}
Write-Host "========== API Test ==========" -ForegroundColor Cyan
Write-Host ("Total: {0}  OK: {1}  ERR: {2}" -f $apis.Count, $ok, $err)
$rows | Format-Table -AutoSize
