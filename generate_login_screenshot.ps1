Add-Type -AssemblyName System.Drawing

$width = 1080
$height = 2400

$bmp = New-Object System.Drawing.Bitmap($width, $height)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

# 1. Outer Showcase Background (Dark Modern Studio)
$bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point(0, 0)),
    (New-Object System.Drawing.Point(0, $height)),
    [System.Drawing.Color]::FromArgb(10, 15, 26),
    [System.Drawing.Color]::FromArgb(24, 30, 48)
)
$g.FillRectangle($bgBrush, 0, 0, $width, $height)

# Top Orange/Crimson Glow
$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$path.AddEllipse(140, -100, 800, 600)
$pbg = New-Object System.Drawing.Drawing2D.PathGradientBrush($path)
$pbg.CenterColor = [System.Drawing.Color]::FromArgb(85, 255, 90, 54)
$pbg.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 10, 15, 26))
$g.FillPath($pbg, $path)

# Top Tag & Header
$orangeBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 90, 54))
$whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$subBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(148, 163, 184))

$tagFont = New-Object System.Drawing.Font("Arial", 16, [System.Drawing.FontStyle]::Bold)
$g.DrawString("MULTI-ROLE ENTERPRISE ACCESS", $tagFont, $orangeBrush, 70, 120)

$titleFont = New-Object System.Drawing.Font("Arial", 46, [System.Drawing.FontStyle]::Bold)
$g.DrawString("Secure Member & Partner Portal", $titleFont, $whiteBrush, 70, 165)

$subFont = New-Object System.Drawing.Font("Arial", 22, [System.Drawing.FontStyle]::Regular)
$g.DrawString("Instant 1-click role switching for Members, Owners & Coaches", $subFont, $subBrush, 70, 245)

# 2. Phone Mockup Frame
$phoneX = 90
$phoneY = 350
$phoneW = 900
$phoneH = 1980

# Phone Shadow
$shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(120, 0, 0, 0))
$g.FillRectangle($shadowBrush, ($phoneX + 14), ($phoneY + 28), $phoneW, $phoneH)

# Phone Screen Body (Dark Slate)
$phoneBodyBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 23, 42))
$g.FillRectangle($phoneBodyBrush, $phoneX, $phoneY, $phoneW, $phoneH)

# Gym Background inside Phone with dark slate overlay
$gymImgPath = "C:\Users\kavin\Desktop\gym app\apps\web\public\partner-gym.jpg"
if (Test-Path $gymImgPath) {
    $gymImg = [System.Drawing.Image]::FromFile($gymImgPath)
    $g.DrawImage($gymImg, $phoneX, $phoneY, $phoneW, $phoneH)
    $gymImg.Dispose()
    
    $darkOverlay = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(215, 15, 23, 42))
    $g.FillRectangle($darkOverlay, $phoneX, $phoneY, $phoneW, $phoneH)
}

# 3. Phone Status Bar
$statusFont = New-Object System.Drawing.Font("Arial", 16, [System.Drawing.FontStyle]::Bold)
$statusBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(203, 213, 225))
$g.DrawString("09:41", $statusFont, $statusBrush, ($phoneX + 50), ($phoneY + 30))
$g.DrawString("5G  100%", $statusFont, $statusBrush, ($phoneX + $phoneW - 150), ($phoneY + 30))

# 4. Central Enterprise Login Card inside Phone
$cardX = $phoneX + 50
$cardY = $phoneY + 100
$cardW = $phoneW - 100
$cardH = $phoneH - 180

$cardBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(240, 30, 41, 59))
$cardPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(51, 65, 85), 2)

$g.FillRectangle($cardBrush, $cardX, $cardY, $cardW, $cardH)
$g.DrawRectangle($cardPen, $cardX, $cardY, $cardW, $cardH)

# Official RF Logo inside Card
$logoPath = "C:\Users\kavin\Desktop\gym app\apps\web\public\real-fit-logo.png"
if (Test-Path $logoPath) {
    $logoImg = [System.Drawing.Image]::FromFile($logoPath)
    $g.DrawImage($logoImg, ($cardX + ($cardW / 2) - 45), ($cardY + 45), 90, 90)
    $logoImg.Dispose()
}

# Real Fit Title
$cardTitleFont = New-Object System.Drawing.Font("Arial", 32, [System.Drawing.FontStyle]::Bold)
$g.DrawString("REAL FIT", $cardTitleFont, $whiteBrush, ($cardX + ($cardW / 2) - 80), ($cardY + 145))

$cardSubFont = New-Object System.Drawing.Font("Arial", 14, [System.Drawing.FontStyle]::Bold)
$grayBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(148, 163, 184))
$g.DrawString("ENTERPRISE ACCESS PLATFORM", $cardSubFont, $orangeBrush, ($cardX + ($cardW / 2) - 135), ($cardY + 190))

# Role Tabs (Member | Partner & Owner | Trainer)
$tabY = $cardY + 240
$tabW = ($cardW - 40) / 3

# Tab 1: Member (Active)
$activeTabBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 90, 54))
$g.FillRectangle($activeTabBrush, ($cardX + 20), $tabY, $tabW, 55)
$tabFont = New-Object System.Drawing.Font("Arial", 15, [System.Drawing.FontStyle]::Bold)
$g.DrawString("MEMBER", $tabFont, $whiteBrush, ($cardX + 45), ($tabY + 18))

# Tab 2: Partner / Owner
$inactiveTabBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 23, 42))
$g.FillRectangle($inactiveTabBrush, ($cardX + 20 + $tabW + 5), $tabY, $tabW, 55)
$g.DrawString("OWNER", $tabFont, $grayBrush, ($cardX + 20 + $tabW + 35), ($tabY + 18))

# Tab 3: Trainer
$g.FillRectangle($inactiveTabBrush, ($cardX + 20 + ($tabW * 2) + 10), $tabY, $tabW, 55)
$g.DrawString("COACH", $tabFont, $grayBrush, ($cardX + 20 + ($tabW * 2) + 35), ($tabY + 18))

# Active Tagline
$roleBadgeFont = New-Object System.Drawing.Font("Arial", 14, [System.Drawing.FontStyle]::Bold)
$emeraldBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(52, 211, 153))
$g.DrawString("PRO ATHLETE PASS ACTIVE", $roleBadgeFont, $emeraldBrush, ($cardX + 30), ($tabY + 80))

# Email Input Field
$inputY1 = $tabY + 130
$inputBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 23, 42))
$inputPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(71, 85, 105), 2)
$labelFont = New-Object System.Drawing.Font("Arial", 13, [System.Drawing.FontStyle]::Bold)

$g.DrawString("WORK EMAIL", $labelFont, $grayBrush, ($cardX + 30), ($inputY1 - 25))
$g.FillRectangle($inputBg, ($cardX + 30), $inputY1, ($cardW - 60), 65)
$g.DrawRectangle($inputPen, ($cardX + 30), $inputY1, ($cardW - 60), 65)
$valFont = New-Object System.Drawing.Font("Arial", 18, [System.Drawing.FontStyle]::Regular)
$g.DrawString("member@gym.com", $valFont, $whiteBrush, ($cardX + 45), ($inputY1 + 20))

# Password Input Field
$inputY2 = $inputY1 + 115
$g.DrawString("PASSWORD", $labelFont, $grayBrush, ($cardX + 30), ($inputY2 - 25))
$g.FillRectangle($inputBg, ($cardX + 30), $inputY2, ($cardW - 60), 65)
$g.DrawRectangle($inputPen, ($cardX + 30), $inputY2, ($cardW - 60), 65)
$g.DrawString("••••••••••••", $valFont, $whiteBrush, ($cardX + 45), ($inputY2 + 22))

# Sign In Action Button
$btnY = $inputY2 + 105
$btnH = 75
$btnBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point(($cardX + 30), $btnY)),
    (New-Object System.Drawing.Point(($cardX + $cardW - 30), $btnY)),
    [System.Drawing.Color]::FromArgb(255, 90, 54),
    [System.Drawing.Color]::FromArgb(220, 38, 38)
)
$g.FillRectangle($btnBrush, ($cardX + 30), $btnY, ($cardW - 60), $btnH)
$btnFont = New-Object System.Drawing.Font("Arial", 22, [System.Drawing.FontStyle]::Bold)
$btnText = "Sign In to Member Portal ->"
$g.DrawString($btnText, $btnFont, $whiteBrush, ($cardX + 150), ($btnY + 23))

# Instant 1-Click Demo Profiles Section (For Play Store Reviewers)
$demoY = $btnY + 115
$demoHeaderFont = New-Object System.Drawing.Font("Arial", 14, [System.Drawing.FontStyle]::Bold)
$g.DrawString("INSTANT 1-CLICK DEMO PROFILES (REVIEWER READY)", $demoHeaderFont, $grayBrush, ($cardX + 30), $demoY)

# Demo Card 1: Martin (Member)
$dY1 = $demoY + 35
$g.FillRectangle($inputBg, ($cardX + 30), $dY1, ($cardW - 60), 75)
$g.DrawRectangle($inputPen, ($cardX + 30), $dY1, ($cardW - 60), 75)
$g.DrawString("Martin Vance - Pro Member", $tabFont, $whiteBrush, ($cardX + 50), ($dY1 + 16))
$g.DrawString("member@gym.com  |  Full Workout & Tracker Access", $labelFont, $grayBrush, ($cardX + 50), ($dY1 + 42))

# Demo Card 2: Sarah (Partner Owner)
$dY2 = $dY1 + 90
$g.FillRectangle($inputBg, ($cardX + 30), $dY2, ($cardW - 60), 75)
$g.DrawRectangle($inputPen, ($cardX + 30), $dY2, ($cardW - 60), 75)
$g.DrawString("Sarah Connor - Gym Partner & Owner", $tabFont, $whiteBrush, ($cardX + 50), ($dY2 + 16))
$g.DrawString("admin@gym.com  |  Live QR Scans & Roster Management", $labelFont, $grayBrush, ($cardX + 50), ($dY2 + 42))

# Demo Card 3: Alex (Trainer)
$dY3 = $dY2 + 90
$g.FillRectangle($inputBg, ($cardX + 30), $dY3, ($cardW - 60), 75)
$g.DrawRectangle($inputPen, ($cardX + 30), $dY3, ($cardW - 60), 75)
$g.DrawString("Alex Hunter - Senior Strength Coach", $tabFont, $whiteBrush, ($cardX + 50), ($dY3 + 16))
$g.DrawString("trainer@gym.com  |  Program Designer & Technique Coach", $labelFont, $grayBrush, ($cardX + 50), ($dY3 + 42))

# 256-Bit TLS Encryption Footer Badge
$tlsY = $cardY + $cardH - 55
$tlsFont = New-Object System.Drawing.Font("Arial", 14, [System.Drawing.FontStyle]::Bold)
$g.DrawString("[TLS 256-BIT] End-to-End Encrypted Cloudflare Identity Network", $tlsFont, $emeraldBrush, ($cardX + 80), $tlsY)

# Outer Phone Border
$phoneBorderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(51, 65, 85), 6)
$g.DrawRectangle($phoneBorderPen, $phoneX, $phoneY, $phoneW, $phoneH)

# Save
$outPath = "C:\Users\kavin\Desktop\gym app\screenshot_5_enterprise_login_1080x2400.png"
$bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()
Write-Output "Successfully saved: $outPath"
