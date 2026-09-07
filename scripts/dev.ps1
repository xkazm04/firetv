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

  -Device points the whole cycle at a real Fire TV Stick over Wi-Fi instead of the emulator.
  On hardware the pen port is deliberately NOT adb-forwarded: the tools reach the Stick at its
  own address so the traffic crosses real Wi-Fi, which is the only way the latency numbers mean
  anything (see docs/POC-FINDINGS.md).

.EXAMPLE
  ./scripts/dev.ps1                        # full cycle on the emulator
  ./scripts/dev.ps1 -Device 10.0.0.142     # full cycle on a real Stick
  ./scripts/dev.ps1 -Device 10.0.0.142 -Stage live   # re-run just the live UI test on hardware
  ./scripts/dev.ps1 -Stage live            # just re-run the live UI test
  ./scripts/dev.ps1 -Headless:$false       # show the emulator window
#>
param(
  [ValidateSet('all', 'unit', 'build', 'boot', 'deploy', 'live')]
  [string]$Stage = 'all',
  [switch]$Headless = $true,
  [string]$Avd = 'firetv_poc',
  # A Fire TV Stick's IP, with or without the adb port: "10.0.0.142" or "10.0.0.142:5555".
  # Omit to use the emulator.
  [string]$Device = $env:TV_DEVICE
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

# Two addresses, two purposes: $serial is how adb selects the device, $tvHost is where the pen
# server answers. On the emulator both collapse onto the adb tunnel; on hardware they do not.
$onHardware = [bool]$Device
if ($onHardware) {
  $ip = $Device.Split(':')[0]
  $serial = if ($Device.Contains(':')) { $Device } else { "${ip}:5555" }
  $deviceArgs = @('-s', $serial)
  $tvHost = "${ip}:8765"
} else {
  $deviceArgs = @()
  $tvHost = '127.0.0.1:8765'
}

# adb writes progress to stderr even on success ("daemon not running; starting now", pull stats).
# Under ErrorActionPreference=Stop that becomes a terminating NativeCommandError, and redirecting
# with 2>&1 makes it worse in PowerShell 5.1 - every stderr line comes back as an ErrorRecord.
# So: drop to Continue for the duration of the call and judge the result by the exit code alone.
function Adb {
  $prev = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  try {
    $out = & $adb @deviceArgs @args
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
  if ($onHardware) {
    Step "connect to Fire TV Stick at $serial"
    # adb connect is idempotent; a Stick that is already attached just says so.
    $prev = $ErrorActionPreference; $ErrorActionPreference = 'Continue'
    $connect = (& $adb connect $serial | Out-String).Trim()
    $ErrorActionPreference = $prev
    Write-Host $connect
    if ($connect -match 'unable to connect|failed') {
      throw "cannot reach $serial - check the Stick is awake, on the same network, and that " +
            "Settings > My Fire TV > Developer options > ADB debugging is on"
    }
    (Adb wait-for-device) | Out-Null
    $model = (Adb shell getprop ro.product.model).Output
    $fireos = (Adb shell getprop ro.build.version.fireos).Output
    Write-Host "device ready: $model (Fire OS $fireos)"
  } else {
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
  # Only tunnel on the emulator. Forwarding to a Stick would work and would quietly destroy the
  # measurement: every tool would reach the TV over loopback instead of the Wi-Fi under test.
  if (-not $onHardware) { (Adb forward tcp:8765 tcp:8765) | Out-Null }
  Start-Sleep -Seconds 5

  $ok = $false
  foreach ($i in 1..10) {
    try {
      $h = Invoke-WebRequest "http://$tvHost/health" -UseBasicParsing -TimeoutSec 3
      Write-Host "health: $($h.Content)"
      $ok = $true; break
    } catch { Start-Sleep -Seconds 2 }
  }
  if (-not $ok) {
    throw "pen server never answered at $tvHost - check: adb $deviceArgs logcat -s Telestrator:I"
  }
}

if (& $run 'live') {
  Step 'live UI test (real browser -> real TV)'
  Push-Location tools
  # tools/device.mjs reads these; without them every tool defaults to the emulator's adb tunnel.
  $env:ADB = $adb
  $env:ADB_SERIAL = if ($onHardware) { $serial } else { '' }
  $env:TV_HOST = $tvHost
  try {
    if (-not (Test-Path node_modules)) { npm install --no-audit --no-fund | Out-Null }
    # Judge node by its exit code alone. Anything it prints to stderr - a Playwright warning, a
    # tool's own diagnostic - would otherwise terminate this script as a NativeCommandError.
    $prev = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try { node live-ui-test.mjs --out ..\artifacts } finally { $ErrorActionPreference = $prev }
    if ($LASTEXITCODE) { throw 'live UI test failed' }
  } finally { Pop-Location }
}

Write-Host "`nDone." -ForegroundColor Green
if ($onHardware) {
  Write-Host "TV at http://$tvHost - open it on a phone to draw by hand." -ForegroundColor Green
  Write-Host "Probes:  node tools/latency-probe.mjs --host $tvHost --seconds 6" -ForegroundColor DarkGray
}
