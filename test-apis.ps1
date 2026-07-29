# API Health Check (ASCII-only)
$script:base = 'http://localhost:3001/api'
$script:okCount = 0
$script:failCount = 0

# Format: METHOD|PATH|BODY|EXPECTED_KEY|EXPECTED_CODE
$apis = @(
  'GET|/activities||success|200',
  'GET|/community/heartbeat||success|200',
  'GET|/community/pulse||success|200',
  'GET|/community/comments||success|200',
  'GET|/points?userId=test-user-1||success|200',
  'GET|/user/learning-progress?phone=13800000000||success|200',
  'GET|/user/preference?phone=13800000000||success|200',
  'GET|/user/adaptive-alert?phone=13800000000||success|200',
  'GET|/revenue/dashboard||success|200',
  'GET|/console/stats||success|200',
  'GET|/console/city-daily?city=dongguan||success|200',
  'GET|/console/applications||success|200',
  'GET|/console/salons||success|200',
  'GET|/console/projects||success|200',
  'GET|/projects||success|200',
  'GET|/partner||success|200',
  'GET|/review||success|200',
  'GET|/consultations||success|200',
  'GET|/member/roadmap?phone=13800000000||success|200',
  'GET|/order/revenue||success|200',
  'POST|/auth/mock-send-code|{"phone":"13800000000"}|success|200',
  'POST|/auth/mock-verify-code|{"phone":"13800000000","code":"6666"}|success|200',
  'POST|/order/create|{"planKey":"MONTHLY_69","userId":"test-user-1","provider":"mock"}|success|200',
  'POST|/order/create|{"planKey":"CITY_5980","userId":"test-user-1","provider":"mock"}|success|200',
  'POST|/order/fulfill|{"orderId":"test-order-1"}|success|200',
  'POST|/order/record-revenue|{"orderId":"test-order-1","amount":69}|success|200',
  'POST|/payment/cancel|{"subscriptionId":"test-sub-1"}|success|200',
  'POST|/payment/create-checkout|{"planKey":"MONTHLY_69","userId":"test-user-1"}|success|200',
  'POST|/tools/trial|{"toolId":"leopard-plus","phone":"13800000000"}|success|200',
  'POST|/tools/submit|{"name":"Test Tool","description":"Test","phone":"13800000000"}|success|200',
  'POST|/services/inquiry|{"selectedServices":["opc-coaching"],"form":{"name":"Test","phone":"13800000000","city":"SZ"}}|success|200',
  'POST|/services/join|{"name":"Test","phone":"13800000000","city":"SZ","specialty":"AI"}|success|200',
  'POST|/services/expert-apply|{"name":"Test Expert","phone":"13800000000","expertiseTags":["PR"]}|success|200',
  'POST|/services/collaboration-match|{"serviceId":"opc-coaching","opcLevel":"TRADER","city":"SZ"}|success|200',
  'POST|/ai/match|{"preference":"AI tools","opcLevel":"TRADER"}|success|200',
  'POST|/ai/chat|{"message":"hi","phone":"13800000000"}|success|200',
  'POST|/ai/daily-brief|{"phone":"13800000000"}|success|200',
  'POST|/ai/diagnose|{"pain":"flow","budget":"5-10","experience":"1y","opcLevel":"TRADER"}|success|200',
  'POST|/ai/recommend-tools|{"opcLevel":"TRADER"}|success|200',
  'POST|/ai/tools-recommend|{"need":"media"}|success|200',
  'POST|/ai/practice-script|{"step":1,"phone":"13800000000"}|success|200',
  'POST|/ai/project-plan|{"slug":"ai-digital-shop-group","phone":"13800000000"}|success|200',
  'POST|/ai/sop-image|{"step":1}|success|200',
  'POST|/ai/tts|{"text":"test"}|success|200',
  'POST|/diagnosis/generate|{"answers":{"pain":"flow","budget":"5-10"}}||200',
  'POST|/projects/find-opc|{"category":"shop","budget":"5-10"}|success|200',
  'POST|/projects/inquiry|{"slug":"ai-digital-shop-group","phone":"13800000000","name":"Test"}|success|200',
  'POST|/projects/step-progress|{"phone":"13800000000","step":1,"done":true}|success|200',
  'POST|/resources/submit|{"title":"Test Resource","url":"https://example.com","phone":"13800000000"}|success|200',
  'POST|/resources/submissions|{"title":"Test","phone":"13800000000"}|success|200',
  'POST|/resources/interact|{"resourceId":"r-1","action":"like","phone":"13800000000"}|success|200',
  'POST|/resources/seo-description|{"title":"Test","category":"tool"}|success|200',
  'POST|/resources/partner-inquiry|{"name":"Test","phone":"13800000000","resourceId":"r-1"}|success|200',
  'POST|/guide/ai-coach|{"level":"pioneer","step":1,"phone":"13800000000"}|success|200',
  'POST|/pay/salon|{"name":"Test","phone":"13800000000","salonId":"s-1"}|success|200'
)

function Invoke-Api {
  param([string]$method, [string]$url, [string]$body)
  try {
    if ($method -eq 'GET') {
      $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 30 -Method GET -ErrorAction Stop
    } else {
      $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 30 -Method POST `
                              -ContentType 'application/json' -Body $body -ErrorAction Stop
    }
    return @{ Status = [int]$r.StatusCode; Body = $r.Content; Err = $null }
  } catch {
    $code = 0
    $body = ''
    if ($_.Exception.Response) {
      $code = [int]$_.Exception.Response.StatusCode
      try {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $body = $reader.ReadToEnd()
        $reader.Close()
      } catch { $body = '' }
    }
    return @{ Status = $code; Body = $body; Err = $_.Exception.Message }
  }
}

Write-Host ""
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "  API Health Check" -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan

foreach ($api in $apis) {
  $parts = $api.Split('|')
  $method = $parts[0]
  $path = $parts[1]
  $body = $parts[2]
  $expectKey = $parts[3]
  $expectCode = [int]$parts[4]

  $url = "$script:base$path"
  $result = Invoke-Api $method $url $body

  $hasKey = $false
  if ($result.Body -and $result.Body.Length -gt 0) {
    try {
      $j = $result.Body | ConvertFrom-Json -ErrorAction Stop
      if ($expectKey -and ($j.PSObject.Properties.Name -contains $expectKey)) {
        $hasKey = $true
      } elseif (-not $expectKey) {
        $hasKey = $true
      }
    } catch {
      $hasKey = $false
    }
  }

  $pass = ($result.Status -eq $expectCode) -and $hasKey
  if ($pass) {
    Write-Host ("  [PASS] {0,-4} {1,-50}  HTTP {2}" -f $method, $path, $result.Status) -ForegroundColor Green
    $script:okCount++
  } else {
    $preview = $result.Body
    if ($preview.Length -gt 80) { $preview = $preview.Substring(0, 80) + '...' }
    Write-Host ("  [FAIL] {0,-4} {1,-50}  HTTP {2} body={3}" -f $method, $path, $result.Status, $preview) -ForegroundColor Red
    $script:failCount++
  }
}

Write-Host ""
Write-Host "=========================================================" -ForegroundColor Cyan
$color = if ($script:failCount -eq 0) { 'Green' } else { 'Red' }
Write-Host "  Total: PASS=$($script:okCount)  FAIL=$($script:failCount)" -ForegroundColor $color
Write-Host "=========================================================" -ForegroundColor Cyan
