@echo off
title Silaomarket on line - Servidor Local
echo ========================================================
echo   Iniciando Silaomarket on line (Servidor Local)
echo ========================================================
echo.
cd /d "%~dp0"
echo Abriendo navegador en http://localhost:3000 ...
start http://localhost:3000
echo Iniciando servidor en el puerto 3000...
npm run dev
pause
