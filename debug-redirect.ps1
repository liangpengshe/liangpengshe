try {
  $r = Invoke-WebRequest 'http://localhost:3001/dongguan' -UseBasicParsing -MaximumRedirection 0 -ErrorAction Stop
  Write-Host "SUCCESS: $($r.StatusCode)"
} catch {
  $resp = $_.Exception.Response
  if ($resp) {
    Write-Host "STATUS: $($resp.StatusCode)"
    Write-Host "HEADERS:"
    foreach ($h in $resp.Headers.Keys) {
      $val = $resp.Headers[$h]
      if ($val -is [array]) {
        $val = $val -join ','
      }
      Write-Host "  $h = $val"
    }
  } else {
    Write-Host "NO RESPONSE: $($_.Exception.Message)"
  }
}
