@echo off
setlocal
cd /d "%~dp0"
echo Starting Cat Bodhi local sprite service...
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found. Please install Node.js first.
  pause
  exit /b 1
)
npm run dev:ai
pause
