Add-Type -AssemblyName System.Drawing

# 1. GENERATE FEATURE GRAPHIC (1024 x 500)
$featWidth = 1024
$featHeight = 500
$featBmp = New-Object System.Drawing.Bitmap($featWidth, $featHeight)
$gFeat = [System.Drawing.Graphics]::FromImage($featBmp)
$gFeat.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$gFeat.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gFeat.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

# Draw base gym background if exists
$gymImgPath = "C:\Users\kavin\Desktop\gym app\apps\web\public\partner-gym.jpg"
if (Test-Path $gymImgPath) {
    $gymImg = [System.Drawing.Image]::FromFile($gymImgPath)
    $gFeat.DrawImage($gymImg, 0, 0, $featWidth, $featHeight)
    $gymImg.Dispose()
} else {
    $darkBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 23, 42))
    $gFeat.FillRectangle($darkBrush, 0, 0, $featWidth, $featHeight)
}

# Dark gradient overlay for high readability and contrast
$rectFeat = New-Object System.Drawing.Rectangle(0, 0, $featWidth, $featHeight)
$gradBrushFeat = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point(0, 0)),
    (New-Object System.Drawing.Point($featWidth, 0)),
    [System.Drawing.Color]::FromArgb(245, 10, 15, 26),
    [System.Drawing.Color]::FromArgb(160, 15, 23, 42)
)
$gFeat.FillRectangle($gradBrushFeat, $rectFeat)

# Subtle orange glow in corner
$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$path.AddEllipse(-100, -100, 500, 500)
$pbg = New-Object System.Drawing.Drawing2D.PathGradientBrush($path)
$pbg.CenterColor = [System.Drawing.Color]::FromArgb(60, 255, 90, 54)
$pbg.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 255, 90, 54))
$gFeat.FillPath($pbg, $path)

# Draw Brand Header
$orangeBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 90, 54))
$whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$subBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(203, 213, 225))
$tagBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(254, 215, 170))

# Mini category tag
$catFont = New-Object System.Drawing.Font("Arial", 13, [System.Drawing.FontStyle]::Bold)
$gFeat.DrawString("OFFICIAL FITNESS & GYM PARTNER APP", $catFont, $orangeBrush, 80, 85)

# Main Title: REAL FIT
$titleFont = New-Object System.Drawing.Font("Arial", 64, [System.Drawing.FontStyle]::Bold)
$gFeat.DrawString("REAL", $titleFont, $whiteBrush, 80, 115)
$gFeat.DrawString("FIT", $titleFont, $orangeBrush, 280, 115)

# Subtitle
$subFont = New-Object System.Drawing.Font("Arial", 22, [System.Drawing.FontStyle]::Bold)
$gFeat.DrawString("Train Smarter. Real Results.", $subFont, $subBrush, 80, 205)

# Feature Badges
$badgeFont = New-Object System.Drawing.Font("Arial", 14, [System.Drawing.FontStyle]::Bold)
$badgeBgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(220, 30, 41, 59))
$badgeBorderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(71, 85, 105), 2)

$badges = @(
    "10 Foundational Exercises",
    "Partner Gym Check-In",
    "Workout & Rep Tracker"
)

$bx = 80
foreach ($b in $badges) {
    $rect = New-Object System.Drawing.Rectangle($bx, 280, 260, 48)
    $gFeat.FillRectangle($badgeBgBrush, $rect)
    $gFeat.DrawRectangle($badgeBorderPen, $rect)
    $gFeat.DrawString($b, $badgeFont, $whiteBrush, ($bx + 16), 294)
    $bx += 280
}

# Footer call to action
$ctaFont = New-Object System.Drawing.Font("Arial", 13, [System.Drawing.FontStyle]::Bold)
$gFeat.DrawString("NOW AVAILABLE ON GOOGLE PLAY", $ctaFont, $tagBrush, 80, 390)

# Save Feature Graphic
$featOut = "C:\Users\kavin\Desktop\gym app\real_fit_feature_graphic_1024x500.png"
$featBmp.Save($featOut, [System.Drawing.Imaging.ImageFormat]::Png)
$gFeat.Dispose()
$featBmp.Dispose()
Write-Output "Generated Feature Graphic at: $featOut"


# 2. GENERATE APP ICON (512 x 512)
$iconSize = 512
$iconBmp = New-Object System.Drawing.Bitmap($iconSize, $iconSize)
$gIcon = [System.Drawing.Graphics]::FromImage($iconBmp)
$gIcon.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$gIcon.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gIcon.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

# Background fill
$bgIconBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 23, 42))
$gIcon.FillRectangle($bgIconBrush, 0, 0, $iconSize, $iconSize)

# Subtle center radial glow
$iconPath = New-Object System.Drawing.Drawing2D.GraphicsPath
$iconPath.AddEllipse(56, 56, 400, 400)
$pbgIcon = New-Object System.Drawing.Drawing2D.PathGradientBrush($iconPath)
$pbgIcon.CenterColor = [System.Drawing.Color]::FromArgb(80, 255, 90, 54)
$pbgIcon.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 15, 23, 42))
$gIcon.FillPath($pbgIcon, $iconPath)

# Stylized Emblem Hexagon / Dumbbell
$hexBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 90, 54))
$hexPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 120, 80), 4)

# Draw central bold emblem box
$emblemRect = New-Object System.Drawing.Rectangle(136, 100, 240, 240)
$gIcon.FillRectangle($hexBrush, $emblemRect)

# Inner contrast cutout / shape
$cutoutBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 23, 42))
$gIcon.FillRectangle($cutoutBrush, 176, 140, 70, 70)
$gIcon.FillRectangle($cutoutBrush, 266, 230, 70, 70)

# "RF" Monogram in emblem
$rfFont = New-Object System.Drawing.Font("Arial", 76, [System.Drawing.FontStyle]::Bold)
$gIcon.DrawString("R", $rfFont, $whiteBrush, 160, 130)
$gIcon.DrawString("F", $rfFont, $whiteBrush, 245, 190)

# Text "REAL FIT" below emblem
$brandFont = New-Object System.Drawing.Font("Arial", 36, [System.Drawing.FontStyle]::Bold)
$gIcon.DrawString("REAL FIT", $brandFont, $whiteBrush, 150, 390)

# Save App Icon
$iconOut = "C:\Users\kavin\Desktop\gym app\real_fit_app_icon_512x512.png"
$iconBmp.Save($iconOut, [System.Drawing.Imaging.ImageFormat]::Png)
$gIcon.Dispose()
$iconBmp.Dispose()
Write-Output "Generated App Icon at: $iconOut"

