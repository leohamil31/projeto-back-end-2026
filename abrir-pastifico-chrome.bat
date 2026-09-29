@echo off
setlocal
cd /d "%~dp0"
set "CHROME=C:\Program Files\Google\Chrome\Application\chrome.exe"

if not exist "%CHROME%" (
  echo Google Chrome nao foi encontrado.
  pause
  exit /b 1
)

netstat -ano | findstr /r /c:":3000 .*LISTENING" >nul
if errorlevel 1 (
  start "Pastifico API" /min cmd /c "npm.cmd run dev"
  for /l %%i in (1,1,20) do (
    powershell.exe -NoProfile -Command "try { Invoke-WebRequest -Uri 'http://localhost:3000/api/health' -UseBasicParsing -TimeoutSec 1 | Out-Null; exit 0 } catch { exit 1 }"
    if not errorlevel 1 goto abrir
    timeout /t 1 /nobreak >nul
  )
  echo O servidor nao iniciou na porta 3000.
  pause
  exit /b 1
)

:abrir
start "Pastifico" "%CHROME%" --new-window "http://localhost:3000/" "http://localhost:3000/kitchen-dashboard"
endlocal
