@echo off
REM Docker Build and Push to Aliyun Personal Container Registry
REM Registry: crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com
REM Namespace: travel-planner-wy
REM Image: web-ai-travel-planner
REM Username: wangyannju

setlocal enabledelayedexpansion

set REGISTRY=crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com
set NAMESPACE=travel-planner-wy
set IMAGE_NAME=web-ai-travel-planner
set TAG=latest
set USERNAME=wangyannju
set FULL_IMAGE=%REGISTRY%/%NAMESPACE%/%IMAGE_NAME%:%TAG%

echo ============================================
echo    Aliyun Personal Container Registry
echo    Docker Build and Push Tool
echo ============================================
echo.
echo Configuration:
echo   Registry: %REGISTRY%
echo   Namespace: %NAMESPACE%
echo   Image: %IMAGE_NAME%
echo   Tag: %TAG%
echo   Username: %USERNAME%
echo   Full Image: %FULL_IMAGE%
echo.
echo ============================================
echo.

REM Check Docker
echo [Step 1/5] Checking Docker...
docker --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker is not installed!
    echo Please install Docker Desktop first
    pause
    exit /b 1
)
echo [SUCCESS] Docker is installed
echo.

REM Check Docker is running
echo [Step 2/5] Checking Docker status...
docker ps >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker is not running!
    echo Please start Docker Desktop
    echo.
    echo Wait for Docker to start, then run this script again
    pause
    exit /b 1
)
echo [SUCCESS] Docker is running
echo.

REM Check login status
echo [Step 3/5] Checking login status...
echo.
echo Login command:
echo   docker login --username=%USERNAME% %REGISTRY%
echo.
set /p LOGIN="Do you want to login now? (y/n): "
if /i "!LOGIN!"=="y" (
    echo.
    echo Logging in...
    docker login --username=%USERNAME% %REGISTRY%
    if !ERRORLEVEL! NEQ 0 (
        echo [ERROR] Login failed!
        echo Please check your username and password
        pause
        exit /b 1
    )
    echo [SUCCESS] Login successful
) else (
    echo [INFO] Login skipped
    echo You can login later: docker login --username=%USERNAME% %REGISTRY%
)
echo.

REM Build image
echo [Step 4/5] Building Docker image...
echo This may take a few minutes, please wait...
echo.
docker build -t %IMAGE_NAME%:%TAG% -t %FULL_IMAGE% .

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Build failed!
    echo Please check the error message and try again
    pause
    exit /b 1
)
echo.
echo [SUCCESS] Image built successfully!
echo.

REM Push image
echo [Step 5/5] Pushing image to Aliyun...
echo.
set /p PUSH="Do you want to push the image now? (y/n): "
if /i not "!PUSH!"=="y" (
    echo.
    echo [INFO] Push cancelled
    echo You can push later:
    echo   docker push %FULL_IMAGE%
    pause
    exit /b 0
)

echo.
echo Pushing image to %REGISTRY%...
echo.
docker push %FULL_IMAGE%

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Push failed!
    echo.
    echo Possible reasons:
    echo   1. Not logged in
    echo      Solution: docker login --username=%USERNAME% %REGISTRY%
    echo.
    echo   2. Namespace does not exist
    echo      Solution: Create namespace %NAMESPACE% in Aliyun console
    echo.
    echo   3. Permission denied
    echo      Solution: Check your account permissions
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================
echo    Build and Push Completed!
echo ============================================
echo.
echo Image Information:
echo   Full Image: %FULL_IMAGE%
echo.
echo Commands:
echo   Pull image:
echo     docker pull %FULL_IMAGE%
echo.
echo   Run image:
echo     docker run -d --name web-ai-travel-planner -p 3000:3000 %FULL_IMAGE%
echo.
echo   View images:
echo     docker images ^| findstr web-ai-travel-planner
echo.
echo ============================================
echo.

pause
endlocal
