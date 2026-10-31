Add-Type -AssemblyName System.Drawing

$logoPath = "C:\Users\kavin\Desktop\gym app\apps\mobile\assets\images\real-fit-logo.png"
if (-not (Test-Path $logoPath)) {
    Write-Error "Logo not found at $logoPath"
    exit 1
}

# ==========================================
# 1. APP ICON (512 x 512)
# ==========================================
$iconSize = 512
$iconBmp = New-Object System.Drawing.Bitmap($iconSize, $iconSize)
$gIcon = [System.Drawing.Graphics]::FromImage($iconBmp)
$gIcon.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$gIcon.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

# Sleek Dark Matte Midnight Slate background
$bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 23, 42))
$gIcon.FillRectangle($bgBrush, 0, 0, $iconSize, $iconSize)

# Subtle warm red radial ambient glow behind the logo
$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$path.AddEllipse(56, 56, 400, 400)
$pbg = New-Object System.Drawing.Drawing2D.PathGradientBrush($path)
$pbg.CenterColor = [System.Drawing.Color]::FromArgb(90, 220, 38, 38)
$pbg.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 15, 23, 42))
$gIcon.FillPath($pbg, $path)

# Draw Official 3D RF Logo in center (360 x 360)
$logoImg = [System.Drawing.Image]::FromFile($logoPath)
$logoSize = 360
$logoX = ($iconSize - $logoSize) / 2
$logoY = ($iconSize - $logoSize) / 2 - 10
$gIcon.DrawImage($logoImg, $logoX, $logoY, $logoSize, $logoSize)

# Clean text "REAL FIT" at bottom
$brandFont = New-Object System.Drawing.Font("Arial", 28, [System.Drawing.FontStyle]::Bold)
$whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$text = "REAL FIT"
$textSize = $gIcon.MeasureString($text, $brandFont)
$textX = ($iconSize - $textSize.Width) / 2
$gIcon.DrawString($text, $brandFont, $whiteBrush, $textX, 440)

$iconOut = "C:\Users\kavin\Desktop\gym app\real_fit_app_icon_512x512.png"
$iconBmp.Save($iconOut, [System.Drawing.Imaging.ImageFormat]::Png)
$iconBmp.Save("C:\Users\kavin\Desktop\gym app\apps\mobile\assets\images\icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$gIcon.Dispose()
$iconBmp.Dispose()
Write-Output "Generated App Icon: $iconOut"


# ==========================================
# 2. FEATURE GRAPHIC (1024 x 500)
# ==========================================
$featW = 1024
$featH = 500
$featBmp = New-Object System.Drawing.Bitmap($featW, $featH)
$gFeat = [System.Drawing.Graphics]::FromImage($featBmp)
$gFeat.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$gFeat.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

# Background gym photo
$gymImgPath = "C:\Users\kavin\Desktop\gym app\apps\web\public\partner-gym.jpg"
if (Test-Path $gymImgPath) {
    $gymImg = [System.Drawing.Image]::FromFile($gymImgPath)
    $gFeat.DrawImage($gymImg, 0, 0, $featW, $featH)
    $gymImg.Dispose()
}

# Dark cinematic gradient
$gradRect = New-Object System.Drawing.Rectangle(0, 0, $featW, $featH)
$gradBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point(0, 0)),
    (New-Object System.Drawing.Point($featW, 0)),
    [System.Drawing.Color]::FromArgb(248, 10, 15, 26),
    [System.Drawing.Color]::FromArgb(150, 15, 23, 42)
)
$gFeat.FillRectangle($gradBrush, $gradRect)

# Draw Official 3D Logo on Left
$featLogoSize = 210
$gFeat.DrawImage($logoImg, 70, 110, $featLogoSize, $featLogoSize)

# Brand Typography & Tagline
$crimsonBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(239, 68, 68))
$subBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(203, 213, 225))
$tagBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(254, 202, 202))

$tagFont = New-Object System.Drawing.Font("Arial", 14, [System.Drawing.FontStyle]::Bold)
$gFeat.DrawString("OFFICIAL FITNESS & GYM PARTNER NETWORK", $tagFont, $crimsonBrush, 320, 115)

$titleFont = New-Object System.Drawing.Font("Arial", 56, [System.Drawing.FontStyle]::Bold)
$gFeat.DrawString("REAL", $titleFont, $whiteBrush, 315, 145)
$gFeat.DrawString("FIT", $titleFont, $crimsonBrush, 490, 145)

$subFont = New-Object System.Drawing.Font("Arial", 22, [System.Drawing.FontStyle]::Bold)
$gFeat.DrawString("Train Smarter. Real Results.", $subFont, $subBrush, 320, 230)

# Feature Badges
$badgeFont = New-Object System.Drawing.Font("Arial", 13, [System.Drawing.FontStyle]::Bold)
$badgeBgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(220, 30, 41, 59))
$badgeBorderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(71, 85, 105), 2)

$badges = @(
    "10 Foundational Exercises",
    "Partner Gym Check-In",
    "Workout & Rep Tracker"
)

$bx = 320
foreach ($b in $badges) {
    $rect = New-Object System.Drawing.Rectangle($bx, 285, 215, 46)
    $gFeat.FillRectangle($badgeBgBrush, $rect)
    $gFeat.DrawRectangle($badgeBorderPen, $rect)
    $gFeat.DrawString($b, $badgeFont, $whiteBrush, ($bx + 12), 299)
    $bx += 230
}

$ctaFont = New-Object System.Drawing.Font("Arial", 13, [System.Drawing.FontStyle]::Bold)
$gFeat.DrawString("NOW AVAILABLE ON GOOGLE PLAY", $ctaFont, $tagBrush, 320, 380)

$featOut = "C:\Users\kavin\Desktop\gym app\real_fit_feature_graphic_1024x500.png"
$featBmp.Save($featOut, [System.Drawing.Imaging.ImageFormat]::Png)
$gFeat.Dispose()
$featBmp.Dispose()
Write-Output "Generated Feature Graphic: $featOut"


# ==========================================
# 3. PARTNER ONBOARDING SCREENSHOT (1080 x 2400)
# ==========================================
$phoneW = 1080
$phoneH = 2400
$scrBmp = New-Object System.Drawing.Bitmap($phoneW, $phoneH)
$gScr = [System.Drawing.Graphics]::FromImage($scrBmp)
$gScr.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$gScr.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

# Outer Background
$scrBgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point(0, 0)),
    (New-Object System.Drawing.Point(0, $phoneH)),
    [System.Drawing.Color]::FromArgb(10, 15, 26),
    [System.Drawing.Color]::FromArgb(24, 30, 48)
)
$gScr.FillRectangle($scrBgBrush, 0, 0, $phoneW, $phoneH)

# Header Tag & Title
$tagScFont = New-Object System.Drawing.Font("Arial", 16, [System.Drawing.FontStyle]::Bold)
$gScr.DrawString("PARTNER PLATFORM", $tagScFont, $crimsonBrush, 70, 120)

$titleScFont = New-Object System.Drawing.Font("Arial", 46, [System.Drawing.FontStyle]::Bold)
$gScr.DrawString("Run Your Gym. Smarter.", $titleScFont, $whiteBrush, 70, 165)

$subScFont = New-Object System.Drawing.Font("Arial", 22, [System.Drawing.FontStyle]::Regular)
$gScr.DrawString("Automate check-ins, manage members & grow revenue", $subScFont, $subBrush, 70, 245)

# Phone Mockup Outer Frame
$px = 90
$py = 350
$pw = 900
$ph = 1980

# Drop Shadow
$shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(100, 0, 0, 0))
$gScr.FillRectangle($shadowBrush, ($px + 12), ($py + 24), $pw, $ph)

# Phone Screen Body (Pure White)
$phoneBodyBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$gScr.FillRectangle($phoneBodyBrush, $px, $py, $pw, $ph)

# Top Gym Photo Hero
$heroH = 1120
if (Test-Path $gymImgPath) {
    $gymImg = [System.Drawing.Image]::FromFile($gymImgPath)
    $gScr.DrawImage($gymImg, $px, $py, $pw, $heroH)
    $gymImg.Dispose()
}

# Fade to white gradient
$gradRectSc = New-Object System.Drawing.Rectangle($px, ($py + 450), $pw, ($heroH - 450))
$gradBrushSc = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point($px, ($py + 450))),
    (New-Object System.Drawing.Point($px, ($py + $heroH))),
    [System.Drawing.Color]::FromArgb(0, 255, 255, 255),
    [System.Drawing.Color]::FromArgb(255, 255, 255, 255)
)
$gScr.FillRectangle($gradBrushSc, $gradRectSc)

# Status Bar
$statusFont = New-Object System.Drawing.Font("Arial", 16, [System.Drawing.FontStyle]::Bold)
$darkText = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 23, 42))
$gScr.DrawString("09:41", $statusFont, $darkText, ($px + 50), ($py + 30))
$gScr.DrawString("5G  100%", $statusFont, $darkText, ($px + $pw - 150), ($py + 30))

# Top Brand Header inside Phone: OFFICIAL 3D LOGO + REAL FIT
$gScr.DrawImage($logoImg, ($px + 50), ($py + 75), 68, 68)

$brandFontSc = New-Object System.Drawing.Font("Arial", 30, [System.Drawing.FontStyle]::Bold)
$gScr.DrawString("REAL FIT", $brandFontSc, $darkText, ($px + 130), ($py + 90))

# Bottom Content
$contentY = $py + 1140
$gScr.DrawString("PARTNER WITH REAL FIT!", $tagScFont, $crimsonBrush, ($px + 60), $contentY)

$gScr.DrawString("Run Your Gym.", $titleScFont, $darkText, ($px + 60), ($contentY + 40))
$gScr.DrawString("Smarter.", $titleScFont, $darkText, ($px + 60), ($contentY + 105))

# Brush Underline
$brushPen1 = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(239, 68, 68), 8)
$brushPen2 = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(252, 165, 165), 5)
$brushPen1.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$brushPen1.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$brushPen2.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$brushPen2.EndCap = [System.Drawing.Drawing2D.LineCap]::Round

$gScr.DrawBezier($brushPen1, 
    ($px + 65), ($contentY + 175),
    ($px + 130), ($contentY + 185),
    ($px + 220), ($contentY + 175),
    ($px + 280), ($contentY + 180)
)
$gScr.DrawBezier($brushPen2, 
    ($px + 75), ($contentY + 182),
    ($px + 140), ($contentY + 190),
    ($px + 210), ($contentY + 182),
    ($px + 270), ($contentY + 186)
)

# Description text
$descFont = New-Object System.Drawing.Font("Arial", 20, [System.Drawing.FontStyle]::Regular)
$descBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(100, 116, 139))
$descRect = New-Object System.Drawing.RectangleF(($px + 60), ($contentY + 210), 780, 130)
$gScr.DrawString("Manage members, track performance, and grow your gym - all from one powerful dashboard.", $descFont, $descBrush, $descRect)

# Dots
$dotY = $contentY + 360
$dotCenterX = $px + ($pw / 2)
$dotActiveBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 23, 42))
$dotInactiveBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(203, 213, 225))

$gScr.FillEllipse($dotActiveBrush, ($dotCenterX - 35), $dotY, 16, 16)
$gScr.FillEllipse($dotInactiveBrush, ($dotCenterX - 8), $dotY, 16, 16)
$gScr.FillEllipse($dotInactiveBrush, ($dotCenterX + 20), $dotY, 16, 16)

# Continue Button (Pill)
$btnY = $contentY + 410
$btnW = 780
$btnH = 100
$btnX = $px + 60

$btnBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(239, 68, 68))
$btnPath = New-Object System.Drawing.Drawing2D.GraphicsPath
$btnPath.AddArc($btnX, $btnY, $btnH, $btnH, 90, 180)
$btnPath.AddArc(($btnX + $btnW - $btnH), $btnY, $btnH, $btnH, 270, 180)
$btnPath.CloseFigure()
$gScr.FillPath($btnBrush, $btnPath)

$btnFont = New-Object System.Drawing.Font("Arial", 26, [System.Drawing.FontStyle]::Bold)
$btnText = "Continue"
$btnTextSize = $gScr.MeasureString($btnText, $btnFont)
$btnTextX = $btnX + (($btnW - $btnTextSize.Width) / 2)
$btnTextY = $btnY + (($btnH - $btnTextSize.Height) / 2)
$gScr.DrawString($btnText, $btnFont, $whiteBrush, $btnTextX, $btnTextY)

# Phone Border
$phoneBorderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(51, 65, 85), 6)
$gScr.DrawRectangle($phoneBorderPen, $px, $py, $pw, $ph)

$scrOut = "C:\Users\kavin\Desktop\gym app\screenshot_partner_onboarding_1080x2400.png"
$scrBmp.Save($scrOut, [System.Drawing.Imaging.ImageFormat]::Png)
$gScr.Dispose()
$scrBmp.Dispose()
Write-Output "Generated Onboarding Screenshot: $scrOut"

# Cleanup
$logoImg.Dispose()
