@echo off
title FigCraft Live Control Mode
echo ========================================================
echo  Launching FigCraft with AI Live Control (Port 8765)
echo  Automation Root: C:\Users\Rey Cannavaro\asterisk
echo ========================================================
start "" "C:\Program Files\ArtCraft\FigCraft\figcraft.exe" --control 8765 --automation-write-root "C:\Users\Rey Cannavaro\asterisk"
timeout /t 2 /nobreak >nul
exit

