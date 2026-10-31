Add-Type -AssemblyName System.Drawing

$width = 1080
$height = 2400

$bmp = New-Object System.Drawing.Bitmap($width, $height)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

# 1. Outer Background (Dark modern showcase gradient)
$bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point(0, 0)),
    (New-Object System.Drawing.Point(0, $height)),
    [System.Drawing.Color]::FromArgb(10, 15, 26),
    [System.Drawing.Color]::FromArgb(24, 30, 48)
)
$g.FillRectangle($bgBrush, 0, 0, $width, $height)

# Top ambient orange glow
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
$g.DrawString("PARTNER PLATFORM", $tagFont, $orangeBrush, 70, 120)

$titleFont = New-Object System.Drawing.Font("Arial", 46, [System.Drawing.FontStyle]::Bold)
$g.DrawString("Run Your Gym. Smarter.", $titleFont, $whiteBrush, 70, 165)

$subFont = New-Object System.Drawing.Font("Arial", 22, [System.Drawing.FontStyle]::Regular)
$g.DrawString("Automate check-ins, manage members & grow revenue", $subFont, $subBrush, 70, 245)

# 2. Phone Mockup Frame
$phoneX = 90
$phoneY = 350
$phoneW = 900
$phoneH = 1980

# Phone Drop Shadow
$shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(100, 0, 0, 0))
$g.FillRectangle($shadowBrush, ($phoneX + 12), ($phoneY + 24), $phoneW, $phoneH)

# Phone Screen Body (Pure White)
$phoneBodyBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$g.FillRectangle($phoneBodyBrush, $phoneX, $phoneY, $phoneW, $phoneH)

# 3. Top Gym Photo Hero inside Phone (Takes ~56% of phone height)
$gymHeroH = 1120
$gymImgPath = "C:\Users\kavin\Desktop\gym app\apps\web\public\partner-gym.jpg"
if (Test-Path $gymImgPath) {
    $gymImg = [System.Drawing.Image]::FromFile($gymImgPath)
    $g.DrawImage($gymImg, $phoneX, $phoneY, $phoneW, $gymHeroH)
    $gymImg.Dispose()
}

# Smooth Gradient Overlay fading gym image to pure white
$gradRect = New-Object System.Drawing.Rectangle($phoneX, ($phoneY + 450), $phoneW, ($gymHeroH - 450))
$gradBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point($phoneX, ($phoneY + 450))),
    (New-Object System.Drawing.Point($phoneX, ($phoneY + $gymHeroH))),
    [System.Drawing.Color]::FromArgb(0, 255, 255, 255),
    [System.Drawing.Color]::FromArgb(255, 255, 255, 255)
)
$g.FillRectangle($gradBrush, $gradRect)

# 4. Top Status Bar & Header inside Phone
$statusFont = New-Object System.Drawing.Font("Arial", 16, [System.Drawing.FontStyle]::Bold)
$darkText = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 23, 42))
$g.DrawString("09:41", $statusFont, $darkText, ($phoneX + 50), ($phoneY + 30))
$g.DrawString("5G  100%", $statusFont, $darkText, ($phoneX + $phoneW - 150), ($phoneY + 30))

# Logo Header: Hexagon Icon + REAL FIT
$logoBgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 23, 42))
$g.FillRectangle($logoBgBrush, ($phoneX + 50), ($phoneY + 80), 60, 60)

# Hexagon lines in logo
$logoPen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, 3)
$g.DrawRectangle($logoPen, ($phoneX + 62), ($phoneY + 92), 36, 36)

$brandFont = New-Object System.Drawing.Font("Arial", 28, [System.Drawing.FontStyle]::Bold)
$g.DrawString("REAL FIT", $brandFont, $darkText, ($phoneX + 125), ($phoneY + 92))

# 5. Bottom Content Section
$contentY = $phoneY + 1140

# Partner Tag
$tagInnerFont = New-Object System.Drawing.Font("Arial", 16, [System.Drawing.FontStyle]::Bold)
$g.DrawString("PARTNER WITH REAL FIT!", $tagInnerFont, $orangeBrush, ($phoneX + 60), $contentY)

# Title: Run Your Gym. Smarter.
$screenTitleFont = New-Object System.Drawing.Font("Arial", 46, [System.Drawing.FontStyle]::Bold)
$g.DrawString("Run Your Gym.", $screenTitleFont, $darkText, ($phoneX + 60), ($contentY + 40))
$g.DrawString("Smarter.", $screenTitleFont, $darkText, ($phoneX + 60), ($contentY + 105))

# Hand-drawn curved orange brush underline under "Smarter."
$brushPen1 = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 90, 54), 8)
$brushPen2 = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 138, 101), 5)
$brushPen1.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$brushPen1.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$brushPen2.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$brushPen2.EndCap = [System.Drawing.Drawing2D.LineCap]::Round

$g.DrawBezier($brushPen1, 
    ($phoneX + 65), ($contentY + 175),
    ($phoneX + 130), ($contentY + 185),
    ($phoneX + 220), ($contentY + 175),
    ($phoneX + 280), ($contentY + 180)
)
$g.DrawBezier($brushPen2, 
    ($phoneX + 75), ($contentY + 182),
    ($phoneX + 140), ($contentY + 190),
    ($phoneX + 210), ($contentY + 182),
    ($phoneX + 270), ($contentY + 186)
)

# Subtitle paragraph
$descFont = New-Object System.Drawing.Font("Arial", 20, [System.Drawing.FontStyle]::Regular)
$descBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(100, 116, 139))
$descRect = New-Object System.Drawing.RectangleF(($phoneX + 60), ($contentY + 210), 780, 130)
$g.DrawString("Manage members, track performance, and grow your gym - all from one powerful dashboard.", $descFont, $descBrush, $descRect)

# Carousel Dots (3 centered dots: black, gray, gray)
$dotY = $contentY + 360
$dotCenterX = $phoneX + ($phoneW / 2)

$dotActiveBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 23, 42))
$dotInactiveBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(203, 213, 225))

$g.FillEllipse($dotActiveBrush, ($dotCenterX - 35), $dotY, 16, 16)
$g.FillEllipse($dotInactiveBrush, ($dotCenterX - 8), $dotY, 16, 16)
$g.FillEllipse($dotInactiveBrush, ($dotCenterX + 20), $dotY, 16, 16)

# Big Orange "Continue" Pill Button
$btnY = $contentY + 410
$btnW = 780
$btnH = 100
$btnX = $phoneX + 60

$btnBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 90, 54))

# Draw smooth rounded pill button
$btnPath = New-Object System.Drawing.Drawing2D.GraphicsPath
$btnPath.AddArc($btnX, $btnY, $btnH, $btnH, 90, 180)
$btnPath.AddArc(($btnX + $btnW - $btnH), $btnY, $btnH, $btnH, 270, 180)
$btnPath.CloseFigure()
$g.FillPath($btnBrush, $btnPath)

$btnFont = New-Object System.Drawing.Font("Arial", 26, [System.Drawing.FontStyle]::Bold)
$btnText = "Continue"
$btnTextSize = $g.MeasureString($btnText, $btnFont)
$btnTextX = $btnX + (($btnW - $btnTextSize.Width) / 2)
$btnTextY = $btnY + (($btnH - $btnTextSize.Height) / 2)
$g.DrawString($btnText, $btnFont, $whiteBrush, $btnTextX, $btnTextY)

# Outer Phone Border
$phoneBorderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(51, 65, 85), 6)
$g.DrawRectangle($phoneBorderPen, $phoneX, $phoneY, $phoneW, $phoneH)

# Save
$outPath = "C:\Users\kavin\Desktop\gym app\screenshot_partner_onboarding_1080x2400.png"
$bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()
Write-Output "Successfully saved: $outPath"

