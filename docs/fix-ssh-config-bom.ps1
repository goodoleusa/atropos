# Fix SSH config BOM (Byte Order Mark) - run this in PowerShell on Windows
# The BOM causes: "Bad configuration option: host" error
# Usage: Right-click -> Run with PowerShell, or: powershell -ExecutionPolicy Bypass -File fix-ssh-config-bom.ps1

$configPath = "$env:USERPROFILE\.ssh\config"

if (-not (Test-Path $configPath)) {
    Write-Host "SSH config not found at: $configPath" -ForegroundColor Red
    exit 1
}

# Read raw bytes
$bytes = [System.IO.File]::ReadAllBytes($configPath)

# UTF-8 BOM is: EF BB BF
$bom = [byte[]](0xEF, 0xBB, 0xBF)
$hasBom = ($bytes.Length -ge 3) -and 
          ($bytes[0] -eq $bom[0]) -and 
          ($bytes[1] -eq $bom[1]) -and 
          ($bytes[2] -eq $bom[2])

if (-not $hasBom) {
    Write-Host "No BOM found. Config is already fine." -ForegroundColor Green
    exit 0
}

# Strip BOM - keep bytes 3 onwards
$cleanBytes = $bytes[3..($bytes.Length - 1)]

# Backup
$backupPath = "$configPath.bak.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Copy-Item $configPath $backupPath -Force
Write-Host "Backup saved to: $backupPath"

# Write without BOM
[System.IO.File]::WriteAllBytes($configPath, $cleanBytes)

Write-Host "BOM removed. SSH config fixed." -ForegroundColor Green
Write-Host "Try: git push" -ForegroundColor Cyan
