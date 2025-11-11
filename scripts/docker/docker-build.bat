@echo off
REM Docker 镜像构建脚本 (Windows)
REM 使用方法: docker-build.bat [tag]

setlocal enabledelayedexpansion

set TAG=%1
if "%TAG%"=="" set TAG=latest
set IMAGE_NAME=web-ai-travel-planner

echo 🚀 开始构建 Docker 镜像: %IMAGE_NAME%:%TAG%

REM 检查 .env 文件是否存在
if not exist .env (
    echo ⚠️  警告: .env 文件不存在，将使用默认值构建
    echo    建议: 创建 .env 文件并配置环境变量
)

REM 构建 Docker 镜像
REM 注意: Windows 环境下，从 .env 文件读取环境变量需要在 PowerShell 中处理
docker build ^
    --tag %IMAGE_NAME%:%TAG% ^
    --tag %IMAGE_NAME%:latest ^
    .

if %ERRORLEVEL% EQU 0 (
    echo ✅ Docker 镜像构建完成: %IMAGE_NAME%:%TAG%
    echo.
    echo 📦 运行镜像:
    echo    docker run -d -p 3000:3000 --env-file .env %IMAGE_NAME%:%TAG%
    echo.
    echo 📋 或使用 docker-compose:
    echo    docker-compose up -d
) else (
    echo ❌ Docker 镜像构建失败
    exit /b 1
)

endlocal

