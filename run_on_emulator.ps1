$adb = "C:\Android\sdk\platform-tools\adb.exe"
$apk = "C:\Users\kavin\Desktop\gym app\apps\web\android\app\build\outputs\apk\debug\app-debug.apk"

Write-Host "Waiting for Android device to transition online..."
& $adb wait-for-device

Write-Host "Waiting for Android OS to finish booting..."
$booted = $false
for ($i = 0; $i -lt 40; $i++) {
    $res = & $adb shell getprop sys.boot_completed 2>&1
    if ($res -match "1") {
        $booted = $true
        break
    }
    Start-Sleep -Seconds 2
}

if (-not $booted) {
    Write-Host "Device took too long to report boot completion, attempting install anyway..."
} else {
    Write-Host "Android OS fully booted!"
}

Write-Host "Installing Real Fit APK: $apk..."
$installResult = & $adb install -r -d $apk 2>&1
Write-Host "Install output: $installResult"

Write-Host "Starting MainActivity..."
$launchResult = & $adb shell am start -n "com.realresultdev.realfit/com.realresultdev.realfit.MainActivity" 2>&1
Write-Host "Launch output: $launchResult"

Start-Sleep -Seconds 3

# Verify running process
$pkgRunning = & $adb shell pidof com.realresultdev.realfit 2>&1
Write-Host "Real Fit Process PID: $pkgRunning"

