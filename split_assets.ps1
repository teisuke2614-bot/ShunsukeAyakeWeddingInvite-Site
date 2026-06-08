[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\user\.gemini\antigravity\brain\2c98e08f-bf03-42d9-a892-16f09fd85eb4\media__1779858436694.png"
$outDir = Join-Path $PSScriptRoot "assets"

if (!(Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir -Force | Out-Null
}

$img = [System.Drawing.Bitmap]::new($srcPath)
$w = $img.Width
$h = $img.Height

Write-Host "Image size: $w x $h"

# The image layout has 4 sections, each containing a 6x6 grid
# Section coordinates identified from the image
$sections = @(
    @{ xs=3;   ys=18;  xe=507;  ye=335; startNum=1  },
    @{ xs=520; ys=18;  xe=1020; ye=335; startNum=37 },
    @{ xs=3;   ys=348; xe=507;  ye=675; startNum=73 },
    @{ xs=520; ys=348; xe=1020; ye=675; startNum=109 }
)

$count = 0

foreach ($sec in $sections) {
    $secW = $sec.xe - $sec.xs
    $secH = $sec.ye - $sec.ys
    $cellW = [math]::Floor($secW / 6)
    $cellH = [math]::Floor($secH / 6)
    
    for ($row = 0; $row -lt 6; $row++) {
        for ($col = 0; $col -lt 6; $col++) {
            $num = $sec.startNum + ($row * 6) + $col
            $numStr = "{0:D3}" -f $num
            
            $x = $sec.xs + ($col * $cellW)
            $y = $sec.ys + ($row * $cellH)
            
            $padX = 1
            $padY = 1
            $cropX = $x + $padX
            $cropY = $y + $padY
            $cropW = $cellW - ($padX * 2)
            $cropH = $cellH - ($padY * 2)
            
            if ($cropX + $cropW -gt $w) { $cropW = $w - $cropX }
            if ($cropY + $cropH -gt $h) { $cropH = $h - $cropY }
            if ($cropW -le 0 -or $cropH -le 0) { continue }
            
            $rect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)
            
            $bmp = New-Object System.Drawing.Bitmap($cropW, $cropH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
            $g = [System.Drawing.Graphics]::FromImage($bmp)
            $g.Clear([System.Drawing.Color]::Transparent)
            $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            
            $destRect = New-Object System.Drawing.Rectangle(0, 0, $cropW, $cropH)
            $g.DrawImage($img, $destRect, $rect, [System.Drawing.GraphicsUnit]::Pixel)
            $g.Dispose()
            
            # Step 1: Make white/near-white background transparent
            # Step 2: Clear the number label area in top-left corner
            # The label occupies roughly the first 16x9 pixels as gray text on white bg
            $labelW = [math]::Min(16, $bmp.Width)
            $labelH = [math]::Min(9, $bmp.Height)
            
            for ($px = 0; $px -lt $bmp.Width; $px++) {
                for ($py = 0; $py -lt $bmp.Height; $py++) {
                    $pixel = $bmp.GetPixel($px, $py)
                    $brightness = ($pixel.R + $pixel.G + $pixel.B) / 3
                    
                    # Make white/near-white transparent
                    if ($brightness -gt 242) {
                        $bmp.SetPixel($px, $py, [System.Drawing.Color]::Transparent)
                    }
                    # In the label area, also remove gray text (label numbers)
                    elseif ($px -lt $labelW -and $py -lt $labelH) {
                        # Label text is gray - remove anything that's not clearly a content pixel
                        # Content pixels tend to be colorful or very dark, labels are neutral gray
                        $isGray = [math]::Abs($pixel.R - $pixel.G) -lt 10 -and [math]::Abs($pixel.G - $pixel.B) -lt 10
                        if ($isGray -and $brightness -gt 100) {
                            $bmp.SetPixel($px, $py, [System.Drawing.Color]::Transparent)
                        }
                    }
                }
            }
            
            $outPath = Join-Path $outDir "$numStr.png"
            $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
            $bmp.Dispose()
            
            $count++
            if ($count % 20 -eq 0) {
                Write-Host "Progress: $count / 144"
            }
        }
    }
}

$img.Dispose()
Write-Host "Done! Total files saved: $count"
Write-Host "Output directory: $outDir"
