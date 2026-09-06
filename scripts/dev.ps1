<#
.SYNOPSIS
  One-command development cycle for the Fire TV telestrator PoC on Windows.

.DESCRIPTION
  Stages, in the order they should fail:
    unit   - JVM tests for the platform-independent core (seconds, no device)
    build  - assemble the debug APK
    boot   - start the Android TV emulator and wait for it
    deploy - install, launch via the leanback intent, forward the pen port
    live   - drive the real companion PWA in a real browser and assert on TV pixels

.EXAMPLE
  ./scripts/dev.ps1                 # full cycle
  ./scripts/dev.ps1 -Stage live     # just re-run the live UI test
  ./scripts/dev.ps1 -Headless:$false  # show the emulator window
#>
param(
  [ValidateSet('all', 'unit', 'build', 'boot', 'deploy', 'live')]
  [string]$Stage = 'all',
  [switch]$Headless = $true,
  [string]$Avd = 'firetv_poc'
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$sdk = 'C:\Users\kazda\scoop\apps\android-clt\current'
$adb = "$sdk\platform-tools\adb.exe"
$env:JAVA_HOME = 'C:\Program Files\Android\Android Studio\jbr'
$env:ANDROID_HOME = $sdk
$pkg = 'dev.telestrator.tv'
$run = { param($name) $Stage -eq 'all' -or $Stage -eq $name }

# adb writes progress to stderr even on success ("daemon not running; starting now", pull stats).
# Under ErrorActionPreference=Stop that becomes a terminating NativeCommandError, and redirecting
# with 2>&1 makes it worse in PowerShell 5.1 - every stderr line comes back as an ErrorRecord.
# So: drop to Continue for the duration of the call and judge the result by the exit code alone.
function Adb {
  $prev = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  try {
    $out = & $adb @args
    return [pscustomobject]@{ Output = ($out | Out-String).Trim(); Code = $LASTEXITCODE }
  } finally {
    $ErrorActionPreference = $prev
  }
}

function Step($msg) { Write-Host "`n=== $msg ===" -ForegroundColor Cyan }

if (& $run 'unit') {
  Step 'unit tests (core, JVM only)'
  & .\gradlew.bat :core:test --console=plain
  if ($LASTEXITCODE) { throw 'core tests failed' }
}

if (& $run 'build') {
  Step 'assemble debug APK'
  & .\gradlew.bat :tv-app:assembleDebug --console=plain
  if ($LASTEXITCODE) { throw 'build failed' }
}

if (& $run 'boot') {
  Step 'emulator'
  $devices = (Adb devices).Output
  if ($devices -notmatch 'emulator-\d+\s+device') {
    $emuArgs = @('-avd', $Avd, '-no-snapshot-save', '-no-boot-anim')
    if ($Headless) { $emuArgs += '-no-window' }
    Start-Process -FilePath "$sdk\emulator\emulator.exe" -ArgumentList $emuArgs
    (Adb wait-for-device) | Out-Null
    while ((Adb shell getprop sys.boot_completed).Output -ne '1') { Start-Sleep -Seconds 2 }
  }
  Write-Host "device ready: $((Adb shell getprop ro.product.model).Output)"
}

if (& $run 'deploy') {
  Step 'install + launch'
  $install = Adb install -r -t "tv-app\build\outputs\apk\debug\tv-app-debug.apk"
  if ($install.Code) { throw "install failed: $($install.Output)" }
  (Adb shell am force-stop $pkg) | Out-Null
  # Launch the way a Fire TV launcher would, not with an explicit component. The redirect runs
  # inside the device shell so monkey's chatter never reaches PowerShell as an error record.
  $launch = Adb shell "monkey -p $pkg -c android.intent.category.LEANBACK_LAUNCHER 1 >/dev/null 2>&1"
  if ($launch.Code) { throw "launch failed: $($launch.Output)" }
  (Adb forward tcp:8765 tcp:8765) | Out-Null
  Start-Sleep -Seconds 5

  $ok = $false
  foreach ($i in 1..10) {
    try {
      $h = Invoke-WebRequest 'http://127.0.0.1:8765/health' -UseBasicParsing -TimeoutSec 3
      Write-Host "health: $($h.Content)"
      $ok = $true; break
    } catch { Start-Sleep -Seconds 2 }
  }
  if (-not $ok) { throw 'pen server never came up - check: adb logcat -s PenServer' }
}

if (& $run 'live') {
  Step 'live UI test (real browser -> real TV)'
  Push-Location tools
  try {
    if (-not (Test-Path node_modules)) { npm install --no-audit --no-fund | Out-Null }
    node live-ui-test.mjs --out ..\artifacts
    if ($LASTEXITCODE) { throw 'live UI test failed' }
  } finally { Pop-Location }
}

Write-Host "`nDone." -ForegroundColor Green
