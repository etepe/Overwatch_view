@echo off
title OVERWATCH Launcher
color 0B

echo.
echo   ========================================
echo     OVERWATCH - Geopolitical Intelligence
echo   ========================================
echo.

:: Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo   [!] Docker is not running.
    echo   [!] Please install and start Docker Desktop first:
    echo       https://www.docker.com/products/docker-desktop/
    echo.
    pause
    exit /b 1
)

echo   [OK] Docker is running.
echo.

:: Stop and remove existing container if running
docker stop overwatch >nul 2>&1
docker rm overwatch >nul 2>&1

:: Build the image
echo   [..] Building Overwatch image (this may take a minute)...
echo.
docker build -t overwatch .
if %errorlevel% neq 0 (
    echo.
    echo   [!] Build failed. Check the errors above.
    pause
    exit /b 1
)

echo.
echo   [OK] Build complete.
echo.

:: Run the container
echo   [..] Starting container on port 8080...
docker run -d -p 8080:80 --name overwatch overwatch
if %errorlevel% neq 0 (
    echo.
    echo   [!] Failed to start container.
    echo   [!] Port 8080 may be in use. Try closing other apps.
    pause
    exit /b 1
)

echo.
echo   ========================================
echo     OVERWATCH is running!
echo     Open: http://localhost:8080
echo   ========================================
echo.

:: Open browser
timeout /t 2 >nul
start http://localhost:8080

echo   Press any key to STOP the server...
pause >nul

:: Cleanup
echo.
echo   [..] Stopping Overwatch...
docker stop overwatch >nul 2>&1
docker rm overwatch >nul 2>&1
echo   [OK] Stopped. Goodbye.
timeout /t 2 >nul
