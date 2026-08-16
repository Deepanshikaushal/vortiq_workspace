# ==============================================================================
# VortiQ Studio - Permanent High-Availability Server & Watchdog Launcher
# Prevents Windows sleep, auto-heals crashed processes, maintains live tunnel.
# ==============================================================================

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  🚀 VORTIQ STUDIO - HIGH AVAILABILITY PRODUCTION SERVER" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan

# 1. Prevent Windows from going to sleep while this script is running
try {
    Add-Type -TypeDefinition @"
    using System;
    using System.Runtime.InteropServices;
    public class SystemPower {
        [DllImport("kernel32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        public static extern uint SetThreadExecutionState(uint esFlags);
        public const uint ES_CONTINUOUS = 0x80000000;
        public const uint ES_SYSTEM_REQUIRED = 0x00000001;
        public const uint ES_DISPLAY_REQUIRED = 0x00000002;
    }
"@
    [SystemPower]::SetThreadExecutionState([SystemPower]::ES_CONTINUOUS -bor [SystemPower]::ES_SYSTEM_REQUIRED -bor [SystemPower]::ES_DISPLAY_REQUIRED) | Out-Null
    Write-Host "[+] Sleep-prevention lock active: Your PC will not sleep during the interview." -ForegroundColor Green
} catch {
    Write-Host "[-] Notice: Sleep lock initialization skipped." -ForegroundColor Yellow
}

$jarPath = "backend\target\vortiq-backend-0.0.1-SNAPSHOT.jar"
$cloudflaredPath = "cloudflared.exe"

# 2. Verify files exist
if (-not (Test-Path $jarPath)) {
    Write-Host "[!] Building production JAR package..." -ForegroundColor Yellow
    cd backend
    mvn clean package -DskipTests
    cd ..
}

if (-not (Test-Path $cloudflaredPath)) {
    Write-Host "[!] Downloading cloudflared..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe" -OutFile $cloudflaredPath -UseBasicParsing
}

Write-Host "[+] Starting backend and tunnel monitoring loop..." -ForegroundColor Cyan
Write-Host "[+] Press Ctrl + C to stop." -ForegroundColor Gray
Write-Host "--------------------------------------------------------" -ForegroundColor DarkGray

$javaProcess = $null
$tunnelProcess = $null

function Start-Backend {
    Write-Host "[+] Launching VortiQ Spring Boot Backend (Port 8080)..." -ForegroundColor Yellow
    $pinfo = New-Object System.Diagnostics.ProcessStartInfo
    $pinfo.FileName = "java"
    $pinfo.Arguments = "-jar $jarPath"
    $pinfo.UseShellExecute = $false
    $pinfo.RedirectStandardOutput = $true
    $pinfo.RedirectStandardError = $true
    $pinfo.CreateNoWindow = $true
    return [System.Diagnostics.Process]::Start($pinfo)
}

function Start-Tunnel {
    Write-Host "[+] Launching Cloudflare Live Tunnel..." -ForegroundColor Yellow
    $logFile = "tunnel.log"
    if (Test-Path $logFile) { Remove-Item $logFile -Force -ErrorAction SilentlyContinue }

    $pinfo = New-Object System.Diagnostics.ProcessStartInfo
    $pinfo.FileName = (Resolve-Path $cloudflaredPath).Path
    $pinfo.Arguments = "tunnel --url http://localhost:8080 --logfile tunnel.log"
    $pinfo.UseShellExecute = $false
    $pinfo.CreateNoWindow = $true
    $proc = [System.Diagnostics.Process]::Start($pinfo)

    # Wait up to 15 seconds to extract the dynamic URL
    $liveUrl = $null
    $attempts = 0
    Write-Host "[+] Generating dynamic live website link..." -ForegroundColor Yellow
    while (-not $liveUrl -and $attempts -lt 30) {
        Start-Sleep -Milliseconds 500
        $attempts++
        if (Test-Path $logFile) {
            $content = Get-Content $logFile -Raw -ErrorAction SilentlyContinue
            if ($content -match '(https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com)') {
                $liveUrl = $matches[1]
            }
        }
    }

    if ($liveUrl) {
        Set-Content -Path "LATEST_LIVE_URL.txt" -Value $liveUrl
        Write-Host "`n========================================================" -ForegroundColor Green
        Write-Host " 🌐 DYNAMIC LIVE WEBSITE LINK (Publicly Accessible):" -ForegroundColor Cyan
        Write-Host " 👉 $liveUrl" -ForegroundColor Yellow
        Write-Host "========================================================`n" -ForegroundColor Green
        
        try {
            Set-Clipboard -Value $liveUrl -ErrorAction SilentlyContinue
            Write-Host "[+] Link copied to clipboard!" -ForegroundColor Green
        } catch {}

        # Auto-open the dynamic URL in default browser
        Start-Process $liveUrl
    } else {
        Write-Host "[!] Cloudflare Tunnel started. Check tunnel.log for URL." -ForegroundColor Yellow
    }

    return $proc
}

# Initial checks
$isPort8080Active = Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue

if (-not $isPort8080Active) {
    $javaProcess = Start-Backend
    Start-Sleep -Seconds 4
} else {
    Write-Host "[+] Backend is already running on http://localhost:8080" -ForegroundColor Green
}

$isTunnelRunning = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
if (-not $isTunnelRunning) {
    $tunnelProcess = Start-Tunnel
} else {
    Write-Host "[+] Cloudflare Tunnel is already active." -ForegroundColor Green
    if (Test-Path "LATEST_LIVE_URL.txt") {
        $existingUrl = Get-Content "LATEST_LIVE_URL.txt" -Raw
        Write-Host " Current Live URL: $existingUrl" -ForegroundColor Yellow
    }
}

Write-Host "`n========================================================" -ForegroundColor Green
Write-Host " ✅ SYSTEM IS FULLY OPERATIONAL AND PROTECTED" -ForegroundColor Green
Write-Host " Local:  http://localhost:8080" -ForegroundColor Cyan
Write-Host " Watchdog is actively monitoring health every 5 seconds..." -ForegroundColor DarkGray
Write-Host "========================================================`n" -ForegroundColor Green

# 3. Continuous Watchdog Loop
while ($true) {
    Start-Sleep -Seconds 5

    # Check Backend
    $backendAlive = $false
    try {
        $res = Invoke-WebRequest -Uri "http://localhost:8080/actuator/health" -UseBasicParsing -TimeoutSec 3 -ErrorAction SilentlyContinue
        if ($res.StatusCode -eq 200) {
            $backendAlive = $true
        }
    } catch {
        $backendAlive = $false
    }

    if (-not $backendAlive) {
        Write-Host "[!] Backend health check failed! Auto-restarting backend..." -ForegroundColor Red
        if ($javaProcess -and -not $javaProcess.HasExited) {
            $javaProcess.Kill()
        }
        $javaProcess = Start-Backend
    }

    # Check Cloudflared
    $tunnelAlive = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
    if (-not $tunnelAlive) {
        Write-Host "[!] Cloudflare Tunnel disconnected! Auto-restarting tunnel..." -ForegroundColor Red
        $tunnelProcess = Start-Tunnel
    }
}
