@echo off
REM Quick build and push script for Windows
REM Namespace: travel-planner-wy
REM Image: web-ai-travel-planner

setlocal enabledelayedexpansion

set REGISTRY=crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com
set NAMESPACE=travel-planner-wy
set IMAGE_NAME=web-ai-travel-planner
set TAG=latest
set FULL_IMAGE_NAME=%REGISTRY%/%NAMESPACE%/%IMAGE_NAME%
set USERNAME=wangyannju

echo ========================================
echo Docker Build and Push to Aliyun ACR
echo ========================================
echo Registry: %REGISTRY%
echo Namespace: %NAMESPACE%
echo Image: %IMAGE_NAME%
echo Tag: %TAG%
echo Full Image: %FULL_IMAGE_NAME%:%TAG%
echo ========================================
echo.

REM Check Docker
docker --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker is not installed!
    echo Please install Docker Desktop first.
    pause
    exit /b 1
)

REM Check Docker is running
docker ps >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker is not running!
    echo Please start Docker Desktop first.
    pause
    exit /b 1
)

echo [INFO] Docker is running
echo.

REM Build image
echo [STEP 1] Building Docker image...
echo.
docker build -t %IMAGE_NAME%:%TAG% -t %FULL_IMAGE_NAME%:%TAG% .

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Build failed!
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Image built successfully!
echo.

REM Push image
echo [STEP 2] Pushing image to Aliyun ACR...
echo.
echo Please make sure you are logged in to Aliyun ACR:
echo   docker login --username=%USERNAME% %REGISTRY%
echo.
set /p PUSH="Push image now? (y/n): "
if /i not "!PUSH!"=="y" (
    echo [INFO] Push cancelled
    echo.
    echo To push manually, run:
    echo   docker push %FULL_IMAGE_NAME%:%TAG%
    pause
    exit /b 0
)

docker push %FULL_IMAGE_NAME%:%TAG%

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Push failed!
    echo Please check:
    echo   1. You are logged in: docker login %REGISTRY%
    echo   2. Namespace exists: %NAMESPACE%
    echo   3. You have permission to push
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Image pushed successfully!
echo.
echo ========================================
echo Image Information
echo ========================================
echo Full image: %FULL_IMAGE_NAME%:%TAG%
echo.
echo To pull the image:
echo   docker pull %FULL_IMAGE_NAME%:%TAG%
echo.
echo To run the image:
echo   docker run -d --name web-ai-travel-planner -p 3000:3000 %FULL_IMAGE_NAME%:%TAG%
echo ========================================
echo.

pause
endlocal

