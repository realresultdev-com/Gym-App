Add-Type -AssemblyName System.Drawing

$width = 1080
$height = 2400

function Create-BaseScreenshot($topTag, $mainTitle, $subTitle, $tagColor) {
    $bmp = New-Object System.Drawing.Bitmap($width, $height)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    # Background gradient
    $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.Point(0, 0)),
        (New-Object System.Drawing.Point(0, $height)),
        [System.Drawing.Color]::FromArgb(10, 15, 26),
        [System.Drawing.Color]::FromArgb(24, 30, 48)
    )
    $g.FillRectangle($bgBrush, 0, 0, $width, $height)

    # Top ambient glowing circle
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddEllipse(140, -100, 800, 600)
    $pbg = New-Object System.Drawing.Drawing2D.PathGradientBrush($path)
    $pbg.CenterColor = [System.Drawing.Color]::FromArgb(70, $tagColor.R, $tagColor.G, $tagColor.B)
    $pbg.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 10, 15, 26))
    $g.FillPath($pbg, $path)

    # Top Tag
    $tagFont = New-Object System.Drawing.Font("Arial", 16, [System.Drawing.FontStyle]::Bold)
    $tagBrush = New-Object System.Drawing.SolidBrush($tagColor)
    $g.DrawString($topTag, $tagFont, $tagBrush, 70, 130)

    # Main Title
    $titleFont = New-Object System.Drawing.Font("Arial", 46, [System.Drawing.FontStyle]::Bold)
    $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $g.DrawString($mainTitle, $titleFont, $whiteBrush, 70, 180)

    # Subtitle
    $subFont = New-Object System.Drawing.Font("Arial", 22, [System.Drawing.FontStyle]::Regular)
    $subBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(148, 163, 184))
    $g.DrawString($subTitle, $subFont, $subBrush, 70, 260)

    # Phone Mockup Outer Frame
    $phoneX = 90
    $phoneY = 370
    $phoneW = 900
    $phoneH = 1950

    # Phone Shadow
    $shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(90, 0, 0, 0))
    $g.FillRectangle($shadowBrush, ($phoneX + 10), ($phoneY + 20), $phoneW, $phoneH)

    # Phone Body (Light clean card look)
    $phoneBodyBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(248, 250, 252))
    $g.FillRectangle($phoneBodyBrush, $phoneX, $phoneY, $phoneW, $phoneH)

    # Phone Border
    $phoneBorderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(51, 65, 85), 6)
    $g.DrawRectangle($phoneBorderPen, $phoneX, $phoneY, $phoneW, $phoneH)

    # Status Bar
    $statusFont = New-Object System.Drawing.Font("Arial", 15, [System.Drawing.FontStyle]::Bold)
    $darkText = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 23, 42))
    $g.DrawString("9:41", $statusFont, $darkText, ($phoneX + 40), ($phoneY + 25))
    $g.DrawString("5G  100%", $statusFont, $darkText, ($phoneX + $phoneW - 140), ($phoneY + 25))

    return @{ Bitmap = $bmp; Graphics = $g; PhoneX = $phoneX; PhoneY = $phoneY; PhoneW = $phoneW }
}

$orange = [System.Drawing.Color]::FromArgb(255, 90, 54)
$cyan = [System.Drawing.Color]::FromArgb(56, 189, 248)
$emerald = [System.Drawing.Color]::FromArgb(16, 185, 129)
$amber = [System.Drawing.Color]::FromArgb(245, 158, 11)
$tagFont = New-Object System.Drawing.Font("Arial", 16, [System.Drawing.FontStyle]::Bold)


# ==========================================
# SCREENSHOT 1: WORKOUTS
# ==========================================
$s1 = Create-BaseScreenshot "DISCOVER PROGRAMS" "Tailored Workouts for Every Goal" "Full-body power, high-intensity intervals and flow sessions" $orange
$g = $s1.Graphics
$px = $s1.PhoneX
$py = $s1.PhoneY

# Header
$hdrFont = New-Object System.Drawing.Font("Arial", 38, [System.Drawing.FontStyle]::Bold)
$darkBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 23, 42))
$g.DrawString("Workouts", $hdrFont, $darkBrush, ($px + 45), ($py + 80))

# Category Filter Pills
$pillBgActive = New-Object System.Drawing.SolidBrush($orange)
$pillBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(241, 245, 249))
$pillFont = New-Object System.Drawing.Font("Arial", 14, [System.Drawing.FontStyle]::Bold)
$whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$pillMuted = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(71, 85, 105))

$g.FillRectangle($pillBgActive, ($px + 45), ($py + 155), 110, 50)
$g.DrawString("ALL", $pillFont, $whiteBrush, ($px + 82), ($py + 170))

$g.FillRectangle($pillBg, ($px + 170), ($py + 155), 180, 50)
$g.DrawString("STRENGTH", $pillFont, $pillMuted, ($px + 205), ($py + 170))

$g.FillRectangle($pillBg, ($px + 365), ($py + 155), 130, 50)
$g.DrawString("HIIT", $pillFont, $pillMuted, ($px + 410), ($py + 170))

$g.FillRectangle($pillBg, ($px + 510), ($py + 155), 170, 50)
$g.DrawString("MOBILITY", $pillFont, $pillMuted, ($px + 545), ($py + 170))

# Card 1: Full Body Power
$cardTagFont = New-Object System.Drawing.Font("Arial", 14, [System.Drawing.FontStyle]::Bold)
$cardTitleFont = New-Object System.Drawing.Font("Arial", 30, [System.Drawing.FontStyle]::Bold)
$cardMetaFont = New-Object System.Drawing.Font("Arial", 16, [System.Drawing.FontStyle]::Bold)

$card1ImgPath = "C:\Users\kavin\Desktop\gym app\apps\web\public\workouts\full-body-power.jpg"
if (Test-Path $card1ImgPath) {
    $img1 = [System.Drawing.Image]::FromFile($card1ImgPath)
    $g.DrawImage($img1, ($px + 45), ($py + 235), 810, 480)
    $img1.Dispose()
    
    $overlayBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(160, 0, 0, 0))
    $g.FillRectangle($overlayBrush, ($px + 45), ($py + 540), 810, 175)
    
    $g.DrawString("ADVANCED STRENGTH", $cardTagFont, $pillBgActive, ($px + 75), ($py + 560))
    $g.DrawString("Full Body Power", $cardTitleFont, $whiteBrush, ($px + 75), ($py + 590))
    $g.DrawString("Time: 45 MIN   |   Energy: 520 KCAL", $cardMetaFont, $whiteBrush, ($px + 75), ($py + 650))
}

# Card 2: Burn and Sweat
$card2ImgPath = "C:\Users\kavin\Desktop\gym app\apps\web\public\workouts\burn-and-sweat.jpg"
if (Test-Path $card2ImgPath) {
    $img2 = [System.Drawing.Image]::FromFile($card2ImgPath)
    $g.DrawImage($img2, ($px + 45), ($py + 745), 810, 480)
    $img2.Dispose()

    $overlayBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(160, 0, 0, 0))
    $g.FillRectangle($overlayBrush, ($px + 45), ($py + 1050), 810, 175)
    $g.DrawString("INTERMEDIATE HIIT", $cardTagFont, $pillBgActive, ($px + 75), ($py + 1070))
    $g.DrawString("Burn and Sweat", $cardTitleFont, $whiteBrush, ($px + 75), ($py + 1100))
    $g.DrawString("Time: 20 MIN   |   Energy: 310 KCAL", $cardMetaFont, $whiteBrush, ($px + 75), ($py + 1160))
}

# Card 3: Morning Flow
$card3ImgPath = "C:\Users\kavin\Desktop\gym app\apps\web\public\workouts\morning-flow.jpg"
if (Test-Path $card3ImgPath) {
    $img3 = [System.Drawing.Image]::FromFile($card3ImgPath)
    $g.DrawImage($img3, ($px + 45), ($py + 1255), 810, 480)
    $img3.Dispose()

    $overlayBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(160, 0, 0, 0))
    $g.FillRectangle($overlayBrush, ($px + 45), ($py + 1560), 810, 175)
    $g.DrawString("BEGINNER FLOW", $cardTagFont, $pillBgActive, ($px + 75), ($py + 1580))
    $g.DrawString("Morning Mobility Flow", $cardTitleFont, $whiteBrush, ($px + 75), ($py + 1610))
    $g.DrawString("Time: 15 MIN   |   Energy: 120 KCAL", $cardMetaFont, $whiteBrush, ($px + 75), ($py + 1670))
}

# Bottom Tab Bar
$tabBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$g.FillRectangle($tabBg, ($px + 5), ($py + 1800), 890, 140)
$tabFont = New-Object System.Drawing.Font("Arial", 13, [System.Drawing.FontStyle]::Bold)
$g.DrawString("TODAY", $tabFont, $pillMuted, ($px + 70), ($py + 1860))
$g.DrawString("WORKOUTS", $tabFont, $pillBgActive, ($px + 230), ($py + 1860))
$g.DrawString("PROGRESS", $tabFont, $pillMuted, ($px + 430), ($py + 1860))
$g.DrawString("HISTORY", $tabFont, $pillMuted, ($px + 610), ($py + 1860))
$g.DrawString("PROFILE", $tabFont, $pillMuted, ($px + 760), ($py + 1860))

$out1 = "C:\Users\kavin\Desktop\gym app\screenshot_1_workouts_1080x2400.png"
$s1.Bitmap.Save($out1, [System.Drawing.Imaging.ImageFormat]::Png)
$s1.Bitmap.Dispose()
$g.Dispose()
Write-Output "Saved: $out1"


# ==========================================
# SCREENSHOT 2: EXERCISE GUIDE
# ==========================================
$s2 = Create-BaseScreenshot "ANATOMY AND FORM" "Master Every Exercise with Perfect Form" "Step-by-step setup, execution and return instructions" $cyan
$g = $s2.Graphics
$px = $s2.PhoneX
$py = $s2.PhoneY

# Breadcrumb
$bcFont = New-Object System.Drawing.Font("Arial", 16, [System.Drawing.FontStyle]::Bold)
$cyanBrush = New-Object System.Drawing.SolidBrush($cyan)
$g.DrawString("EXERCISE 3 OF 10 - PUSH SPLIT", $bcFont, $cyanBrush, ($px + 45), ($py + 85))

# Exercise Title
$g.DrawString("Machine Chest Press", $hdrFont, $darkBrush, ($px + 45), ($py + 120))

# Target sets badge
$targetBadgeBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(254, 243, 199))
$targetTextBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(180, 83, 9))
$g.FillRectangle($targetBadgeBrush, ($px + 45), ($py + 185), 280, 48)
$targetFont = New-Object System.Drawing.Font("Arial", 14, [System.Drawing.FontStyle]::Bold)
$g.DrawString("TARGET: 3 SETS x 12 REPS", $targetFont, $targetTextBrush, ($px + 60), ($py + 200))

# Exercise Visual
$cpImgPath = "C:\Users\kavin\Desktop\gym app\apps\web\public\exercises\chest-press-start.jpg"
if (Test-Path $cpImgPath) {
    $imgCp = [System.Drawing.Image]::FromFile($cpImgPath)
    $g.DrawImage($imgCp, ($px + 45), ($py + 260), 810, 680)
    $imgCp.Dispose()
}

# 3 Step Instruction Pills
$stepBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(241, 245, 249))
$stepActiveBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 23, 42))

$g.FillRectangle($stepActiveBg, ($px + 45), ($py + 970), 250, 52)
$g.DrawString("1. SETUP", $pillFont, $whiteBrush, ($px + 120), ($py + 985))

$g.FillRectangle($stepBg, ($px + 325), ($py + 970), 250, 52)
$g.DrawString("2. EXECUTION", $pillFont, $pillMuted, ($px + 380), ($py + 985))

$g.FillRectangle($stepBg, ($px + 605), ($py + 970), 250, 52)
$g.DrawString("3. RETURN", $pillFont, $pillMuted, ($px + 680), ($py + 985))

# Detailed Technique Guide Card
$guideCardBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$g.FillRectangle($guideCardBg, ($px + 45), ($py + 1055), 810, 680)
$cardBorder = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(226, 232, 240), 2)
$g.DrawRectangle($cardBorder, ($px + 45), ($py + 1055), 810, 680)

$guideTitleFont = New-Object System.Drawing.Font("Arial", 22, [System.Drawing.FontStyle]::Bold)
$g.DrawString("Key Setup Points:", $guideTitleFont, $darkBrush, ($px + 75), ($py + 1085))

$bodyFont = New-Object System.Drawing.Font("Arial", 16, [System.Drawing.FontStyle]::Regular)
$bulletBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(51, 65, 85))

$g.DrawString("- Adjust seat height so handles align with mid-chest level.", $bodyFont, $bulletBrush, ($px + 75), ($py + 1140))
$g.DrawString("- Plant feet firmly flat on the floor shoulder-width apart.", $bodyFont, $bulletBrush, ($px + 75), ($py + 1190))
$g.DrawString("- Keep your shoulder blades retracted and chest proud.", $bodyFont, $bulletBrush, ($px + 75), ($py + 1240))
$g.DrawString("- Inhale and brace core before pressing forward smoothly.", $bodyFont, $bulletBrush, ($px + 75), ($py + 1290))

# Next exercise preview
$nextCardBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(248, 250, 252))
$g.FillRectangle($nextCardBg, ($px + 75), ($py + 1370), 750, 310)
$g.DrawString("Up Next in This Split:", $guideTitleFont, $darkBrush, ($px + 100), ($py + 1400))
$g.DrawString("4. Lat Pulldown (Back & Lats) - 3 sets x 10 reps", $bodyFont, $pillMuted, ($px + 100), ($py + 1450))
$g.DrawString("5. Seated Cable Row (Mid-Back) - 3 sets x 10 reps", $bodyFont, $pillMuted, ($px + 100), ($py + 1500))
$g.DrawString("6. Dumbbell Biceps Curl (Arms) - 3 sets x 12 reps", $bodyFont, $pillMuted, ($px + 100), ($py + 1550))

# Action Button
$logBtnBg = New-Object System.Drawing.SolidBrush($orange)
$g.FillRectangle($logBtnBg, ($px + 45), ($py + 1770), 810, 90)
$logBtnFont = New-Object System.Drawing.Font("Arial", 22, [System.Drawing.FontStyle]::Bold)
$g.DrawString("Start Tracking Sets ->", $logBtnFont, $whiteBrush, ($px + 290), ($py + 1800))

$out2 = "C:\Users\kavin\Desktop\gym app\screenshot_2_exercise_guide_1080x2400.png"
$s2.Bitmap.Save($out2, [System.Drawing.Imaging.ImageFormat]::Png)
$s2.Bitmap.Dispose()
$g.Dispose()
Write-Output "Saved: $out2"


# ==========================================
# SCREENSHOT 3: WORKOUT & SET TRACKER
# ==========================================
$s3 = Create-BaseScreenshot "EFFORTLESS LOGGING" "Track Sets, Reps and Weights" "Log workout volume and hit your personal bests" $amber
$g = $s3.Graphics
$px = $s3.PhoneX
$py = $s3.PhoneY

# Header
$g.DrawString("Active Workout", $hdrFont, $darkBrush, ($px + 45), ($py + 80))

# Active Exercise Card
$activeExCard = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 23, 42))
$g.FillRectangle($activeExCard, ($px + 45), ($py + 160), 810, 160)
$activeTitleFont = New-Object System.Drawing.Font("Arial", 26, [System.Drawing.FontStyle]::Bold)
$g.DrawString("Machine Chest Press", $activeTitleFont, $whiteBrush, ($px + 75), ($py + 190))
$activeSubFont = New-Object System.Drawing.Font("Arial", 16, [System.Drawing.FontStyle]::Regular)
$activeSubBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(148, 163, 184))
$g.DrawString("Target: 3 sets x 12 reps - Rest timer: 60s", $activeSubFont, $activeSubBrush, ($px + 75), ($py + 240))

# Sets Table Header
$thFont = New-Object System.Drawing.Font("Arial", 14, [System.Drawing.FontStyle]::Bold)
$g.DrawString("SET", $thFont, $pillMuted, ($px + 75), ($py + 360))
$g.DrawString("PREVIOUS", $thFont, $pillMuted, ($px + 220), ($py + 360))
$g.DrawString("WEIGHT (KG)", $thFont, $pillMuted, ($px + 420), ($py + 360))
$g.DrawString("REPS", $thFont, $pillMuted, ($px + 640), ($py + 360))
$g.DrawString("STATUS", $thFont, $pillMuted, ($px + 760), ($py + 360))

# Set Rows
$rowDoneBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(236, 253, 245))
$checkBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(16, 185, 129))
$rowFont = New-Object System.Drawing.Font("Arial", 18, [System.Drawing.FontStyle]::Bold)

# Row 1
$g.FillRectangle($rowDoneBrush, ($px + 45), ($py + 400), 810, 90)
$g.DrawRectangle($cardBorder, ($px + 45), ($py + 400), 810, 90)
$g.DrawString("1", $rowFont, $darkBrush, ($px + 85), ($py + 430))
$g.DrawString("40 kg x 12", $bodyFont, $pillMuted, ($px + 220), ($py + 433))
$g.DrawString("45 kg", $rowFont, $darkBrush, ($px + 450), ($py + 430))
$g.DrawString("12", $rowFont, $darkBrush, ($px + 655), ($py + 430))
$g.DrawString("DONE", $rowFont, $checkBrush, ($px + 760), ($py + 430))

# Row 2
$g.FillRectangle($rowDoneBrush, ($px + 45), ($py + 510), 810, 90)
$g.DrawRectangle($cardBorder, ($px + 45), ($py + 510), 810, 90)
$g.DrawString("2", $rowFont, $darkBrush, ($px + 85), ($py + 540))
$g.DrawString("45 kg x 10", $bodyFont, $pillMuted, ($px + 220), ($py + 543))
$g.DrawString("50 kg", $rowFont, $darkBrush, ($px + 450), ($py + 540))
$g.DrawString("10", $rowFont, $darkBrush, ($px + 655), ($py + 540))
$g.DrawString("DONE", $rowFont, $checkBrush, ($px + 760), ($py + 540))

# Row 3 (Active)
$rowActiveBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 247, 237))
$activeBorder = New-Object System.Drawing.Pen($orange, 3)
$g.FillRectangle($rowActiveBrush, ($px + 45), ($py + 620), 810, 90)
$g.DrawRectangle($activeBorder, ($px + 45), ($py + 620), 810, 90)
$g.DrawString("3", $rowFont, $darkBrush, ($px + 85), ($py + 650))
$g.DrawString("50 kg x 8", $bodyFont, $pillMuted, ($px + 220), ($py + 653))
$g.DrawString("55 kg", $rowFont, $darkBrush, ($px + 450), ($py + 650))
$g.DrawString("8", $rowFont, $darkBrush, ($px + 655), ($py + 650))
$g.DrawString("LOG", $rowFont, $pillBgActive, ($px + 760), ($py + 650))

# Rest Timer Component
$timerBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(248, 250, 252))
$g.FillRectangle($timerBg, ($px + 45), ($py + 750), 810, 240)
$g.DrawRectangle($cardBorder, ($px + 45), ($py + 750), 810, 240)
$g.DrawString("REST TIMER", $thFont, $pillBgActive, ($px + 380), ($py + 780))
$timerFont = New-Object System.Drawing.Font("Arial", 50, [System.Drawing.FontStyle]::Bold)
$g.DrawString("00:45", $timerFont, $darkBrush, ($px + 355), ($py + 820))
$g.DrawString("+30 SEC   |   SKIP REST", $tagFont, $pillMuted, ($px + 330), ($py + 910))

# Next exercise in queue
$g.DrawString("Workout Overview:", $guideTitleFont, $darkBrush, ($px + 45), ($py + 1030))
$g.FillRectangle($guideCardBg, ($px + 45), ($py + 1080), 810, 650)
$g.DrawRectangle($cardBorder, ($px + 45), ($py + 1080), 810, 650)

$statTitleFont = New-Object System.Drawing.Font("Arial", 28, [System.Drawing.FontStyle]::Bold)
$g.DrawString("Total Volume: 4,820 kg", $statTitleFont, $darkBrush, ($px + 85), ($py + 1120))
$g.DrawString("Time Elapsed: 32 mins", $statTitleFont, $darkBrush, ($px + 85), ($py + 1180))
$g.DrawString("Exercises Completed: 2 of 5", $statTitleFont, $darkBrush, ($px + 85), ($py + 1240))

# Big Finish Workout Button
$g.FillRectangle($logBtnBg, ($px + 45), ($py + 1770), 810, 90)
$g.DrawString("Finish and Save Workout ->", $logBtnFont, $whiteBrush, ($px + 260), ($py + 1800))

$out3 = "C:\Users\kavin\Desktop\gym app\screenshot_3_tracker_1080x2400.png"
$s3.Bitmap.Save($out3, [System.Drawing.Imaging.ImageFormat]::Png)
$s3.Bitmap.Dispose()
$g.Dispose()
Write-Output "Saved: $out3"


# ==========================================
# SCREENSHOT 4: PARTNER GYM NETWORK
# ==========================================
$s4 = Create-BaseScreenshot "GYM ACCESS" "Seamless Gym Partner Check-Ins" "Instant mobile access to verified Real Fit partner gyms" $emerald
$g = $s4.Graphics
$px = $s4.PhoneX
$py = $s4.PhoneY

# Gym background preview
$gymCardImg = "C:\Users\kavin\Desktop\gym app\apps\web\public\partner-gym.jpg"
if (Test-Path $gymCardImg) {
    $gImg = [System.Drawing.Image]::FromFile($gymCardImg)
    $g.DrawImage($gImg, ($px + 45), ($py + 80), 810, 560)
    $gImg.Dispose()
}

# Partner Gym Details
$gCardBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$g.FillRectangle($gCardBg, ($px + 45), ($py + 660), 810, 1050)
$g.DrawRectangle($cardBorder, ($px + 45), ($py + 660), 810, 1050)

$gymTagFont = New-Object System.Drawing.Font("Arial", 14, [System.Drawing.FontStyle]::Bold)
$gymTagBrush = New-Object System.Drawing.SolidBrush($emerald)
$g.DrawString("VERIFIED PARTNER GYM", $gymTagFont, $gymTagBrush, ($px + 85), ($py + 700))

$gymNameFont = New-Object System.Drawing.Font("Arial", 32, [System.Drawing.FontStyle]::Bold)
$g.DrawString("FitPulse Elite Fitness Studio", $gymNameFont, $darkBrush, ($px + 85), ($py + 735))

$g.DrawString("Indiranagar 100ft Rd, Bangalore - Open Until 10:00 PM", $bodyFont, $pillMuted, ($px + 85), ($py + 790))

# Membership Badge
$passBadge = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(209, 250, 229))
$passText = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(6, 95, 70))
$g.FillRectangle($passBadge, ($px + 85), ($py + 840), 320, 55)
$g.DrawString("ACTIVE ALL-ACCESS PASS", $pillFont, $passText, ($px + 115), ($py + 858))

# Check In QR Card
$qrBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(248, 250, 252))
$g.FillRectangle($qrBg, ($px + 85), ($py + 930), 730, 480)
$g.DrawRectangle($cardBorder, ($px + 85), ($py + 930), 730, 480)

$qrTitleFont = New-Object System.Drawing.Font("Arial", 22, [System.Drawing.FontStyle]::Bold)
$g.DrawString("Contactless Member Check-In", $qrTitleFont, $darkBrush, ($px + 180), ($py + 970))
$g.DrawString("Show this badge or tap at turnstile", $bodyFont, $pillMuted, ($px + 230), ($py + 1010))

# QR Code placeholder box
$qrBox = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 23, 42))
$g.FillRectangle($qrBox, ($px + 285), ($py + 1070), 240, 240)
$qrCodeFont = New-Object System.Drawing.Font("Arial", 16, [System.Drawing.FontStyle]::Bold)
$g.DrawString("SCAN QR", $qrCodeFont, $whiteBrush, ($px + 360), ($py + 1180))

# Status pill
$g.DrawString("Status: CLEARED AND PAID", $tagFont, $gymTagBrush, ($px + 290), ($py + 1340))

# Gym Owner / Partner Section
$ownerBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 247, 237))
$g.FillRectangle($ownerBg, ($px + 85), ($py + 1440), 730, 220)
$ownerBorder = New-Object System.Drawing.Pen($orange, 2)
$g.DrawRectangle($ownerBorder, ($px + 85), ($py + 1440), 730, 220)

$g.DrawString("Are you a Gym Owner?", $guideTitleFont, $darkBrush, ($px + 120), ($py + 1470))
$g.DrawString("Partner with Real Fit to manage members, automate check-ins, and grow revenue.", $bodyFont, $bulletBrush, ($px + 120), ($py + 1520))
$g.DrawString("Zero onboarding fee - Instant bank payouts", $tagFont, $pillBgActive, ($px + 120), ($py + 1580))

# Bottom Button
$g.FillRectangle($logBtnBg, ($px + 45), ($py + 1770), 810, 90)
$g.DrawString("Tap for Express Check-In ->", $logBtnFont, $whiteBrush, ($px + 260), ($py + 1800))

$out4 = "C:\Users\kavin\Desktop\gym app\screenshot_4_partner_gym_1080x2400.png"
$s4.Bitmap.Save($out4, [System.Drawing.Imaging.ImageFormat]::Png)
$s4.Bitmap.Dispose()
$g.Dispose()
Write-Output "Saved: $out4"
