param(
  [int]$Port = 3001
)

$connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
$processIds = @($connections | Select-Object -ExpandProperty OwningProcess -Unique)

foreach ($processId in $processIds) {
  Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
  Write-Output "Stopped process on port ${Port}: $processId"
}

$lockPath = Join-Path $PSScriptRoot "..\\.next\\dev\\lock"

if (Test-Path $lockPath) {
  Remove-Item $lockPath -Force
  Write-Output "Removed lock file: $lockPath"
} else {
  Write-Output "No lock file found: $lockPath"
}
