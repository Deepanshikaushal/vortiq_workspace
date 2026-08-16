@echo off
title VortiQ Studio - Production High-Availability Launcher
cd /d "%~dp0"
echo Starting VortiQ Studio Permanent Server & Watchdog...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-permanent-server.ps1"
pause
