<#
.SYNOPSIS
  The weekly live model-drift run on the operator's machine (uat/drift/README.md).

.DESCRIPTION
  Runs the lab bench on the real engines through tools/model-drift.cjs --live. That writes one record to
  uat/drift/<YYYY-MM-DD>-<n>.json, rewrites uat/drift/DRIFT.md, and exits 1 when the hints, the page read or the
  lesson pick drifted. This spends real model calls: Ollama vision, and claude-cli (or codex) for text. That is why
  it runs here and never in a gate or in CI (.ai/memory/0007).

  CI only watches what is committed: .github/workflows/model-drift.yml goes red when the newest record alerted or is
  older than 21 days. So commit the record and DRIFT.md after a run. This script never commits or pushes.

  -Register creates (or replaces) a weekly Windows Scheduled Task that runs this script on Monday at 06:30 without
  -Register. Only the operator runs it, once; nothing registers it on its own. Each scheduled run's output is appended
  to artifacts/model-drift.log (gitignored), and the task's Last Run Result shows the exit code (0 clean, 1 drift,
  2 refused or crashed).

.EXAMPLE
  ./scripts/model-drift.ps1              # one live run now
  ./scripts/model-drift.ps1 -Register    # schedule it weekly
#>
param(
  [switch]$Register,
  [string]$TaskName = 'firetv model drift',
  [string]$At = '06:30'
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot

if ($Register) {
  $self = Join-Path $PSScriptRoot 'model-drift.ps1'
  $action = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$self`"" -WorkingDirectory $root
  $trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday -At $At
  $settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Hours 2)
  Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Force | Out-Null
  Write-Host "Registered '$TaskName': every Monday at $At, runs $self. Remove it with Unregister-ScheduledTask -TaskName '$TaskName'."
  exit 0
}

Set-Location $root
$log = Join-Path $root 'artifacts\model-drift.log'
New-Item -ItemType Directory -Force (Split-Path -Parent $log) | Out-Null
$env:MODEL_DRIFT_ALLOW_LIVE = '1'
try {
  "==== $(Get-Date -Format o) model drift (live)" | Out-File -FilePath $log -Append -Encoding utf8
  & node tools/model-drift.cjs --live 2>&1 | Tee-Object -FilePath $log -Append
  $code = $LASTEXITCODE
} finally {
  Remove-Item Env:MODEL_DRIFT_ALLOW_LIVE -ErrorAction SilentlyContinue
}
if ($code -eq 0) { Write-Host 'No drift. Commit the new uat/drift record and DRIFT.md.' }
elseif ($code -eq 1) { Write-Warning 'DRIFT: see uat/drift/DRIFT.md. Commit the record anyway: the alert is the trace.' }
else { Write-Warning "The run did not complete (exit $code); see $log." }
exit $code
