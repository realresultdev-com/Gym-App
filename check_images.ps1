Add-Type -AssemblyName System.Drawing
$files = Get-ChildItem -Filter "screenshot_*.png"
foreach ($f in $files) {
    $img = [System.Drawing.Image]::FromFile($f.FullName)
    Write-Host "$($f.Name): $($img.Width) x $($img.Height) ($([math]::Round($f.Length / 1MB, 2)) MB)"
    $img.Dispose()
}

