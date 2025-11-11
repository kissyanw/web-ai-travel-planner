@echo off
REM Docker 镜像构建和推送到阿里云镜像仓库脚本 (Windows)
REM 使用方法: docker-build-push.bat [tag] [registry-namespace]

setlocal enabledelayedexpansion

set TAG=%1
if "%TAG%"=="" set TAG=latest
set REGISTRY=crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com
set NAMESPACE=%2
if "%NAMESPACE%"=="" set NAMESPACE=travel-planner-wy
set IMAGE_NAME=web-ai-travel-planner
set FULL_IMAGE_NAME=%REGISTRY%/%NAMESPACE%/%IMAGE_NAME%

echo 🚀 开始构建 Docker 镜像并推送到阿里云镜像仓库
echo 镜像名称: %FULL_IMAGE_NAME%:%TAG%
echo.

REM 检查 Docker 是否安装
docker --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 错误: Docker 未安装，请先安装 Docker
    exit /b 1
)

REM 检查是否已登录阿里云镜像仓库
echo 📋 检查阿里云镜像仓库登录状态...
docker info | findstr /C:"%REGISTRY%" >nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  未检测到阿里云镜像仓库登录，请先登录
    echo 登录命令: docker login %REGISTRY%
    echo.
    set /p LOGIN="是否现在登录？(y/n): "
    if /i "!LOGIN!"=="y" (
        docker login %REGISTRY%
    ) else (
        echo ❌ 取消操作
        exit /b 1
    )
)

REM 检查 .env 文件是否存在
set BUILD_ARGS=
if exist .env (
    echo 📄 从 .env 文件读取环境变量...
    REM 读取环境变量（简化版本，如果需要完整支持，可以使用 PowerShell）
    for /f "tokens=1,* delims==" %%a in (.env) do (
        set "line=%%a"
        if not "!line:~0,1!"=="#" (
            set "var_name=%%a"
            set "var_value=%%b"
            if defined var_name (
                if "!var_name!"=="NEXT_PUBLIC_SUPABASE_URL" set NEXT_PUBLIC_SUPABASE_URL=!var_value!
                if "!var_name!"=="NEXT_PUBLIC_SUPABASE_ANON_KEY" set NEXT_PUBLIC_SUPABASE_ANON_KEY=!var_value!
                if "!var_name!"=="NEXT_PUBLIC_AMAP_KEY" set NEXT_PUBLIC_AMAP_KEY=!var_value!
                if "!var_name!"=="NEXT_PUBLIC_LLM_API_KEY" set NEXT_PUBLIC_LLM_API_KEY=!var_value!
                if "!var_name!"=="NEXT_PUBLIC_LLM_API_URL" set NEXT_PUBLIC_LLM_API_URL=!var_value!
                if "!var_name!"=="NEXT_PUBLIC_LLM_MODEL" set NEXT_PUBLIC_LLM_MODEL=!var_value!
            )
        )
    )
    if defined NEXT_PUBLIC_SUPABASE_URL set BUILD_ARGS=!BUILD_ARGS! --build-arg NEXT_PUBLIC_SUPABASE_URL=!NEXT_PUBLIC_SUPABASE_URL!
    if defined NEXT_PUBLIC_SUPABASE_ANON_KEY set BUILD_ARGS=!BUILD_ARGS! --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=!NEXT_PUBLIC_SUPABASE_ANON_KEY!
    if defined NEXT_PUBLIC_AMAP_KEY set BUILD_ARGS=!BUILD_ARGS! --build-arg NEXT_PUBLIC_AMAP_KEY=!NEXT_PUBLIC_AMAP_KEY!
    if defined NEXT_PUBLIC_LLM_API_KEY set BUILD_ARGS=!BUILD_ARGS! --build-arg NEXT_PUBLIC_LLM_API_KEY=!NEXT_PUBLIC_LLM_API_KEY!
    if defined NEXT_PUBLIC_LLM_API_URL set BUILD_ARGS=!BUILD_ARGS! --build-arg NEXT_PUBLIC_LLM_API_URL=!NEXT_PUBLIC_LLM_API_URL!
    if defined NEXT_PUBLIC_LLM_MODEL set BUILD_ARGS=!BUILD_ARGS! --build-arg NEXT_PUBLIC_LLM_MODEL=!NEXT_PUBLIC_LLM_MODEL!
) else (
    echo ⚠️  警告: .env 文件不存在，将使用默认值构建
    echo    建议: 创建 .env 文件并配置环境变量
    echo.
)

REM 构建 Docker 镜像
echo 🔨 开始构建 Docker 镜像...
echo 镜像完整名称: %FULL_IMAGE_NAME%:%TAG%
echo.
docker build !BUILD_ARGS! ^
    --tag %IMAGE_NAME%:%TAG% ^
    --tag %IMAGE_NAME%:latest ^
    --tag %FULL_IMAGE_NAME%:%TAG% ^
    --tag %FULL_IMAGE_NAME%:latest ^
    .

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker 镜像构建失败
    exit /b 1
)

echo ✅ Docker 镜像构建完成
echo.

REM 推送镜像到阿里云镜像仓库
echo 📤 开始推送镜像到阿里云镜像仓库...
docker push %FULL_IMAGE_NAME%:%TAG%
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 镜像推送失败
    exit /b 1
)

docker push %FULL_IMAGE_NAME%:latest
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 镜像推送失败
    exit /b 1
)

echo.
echo ✅ 镜像推送完成！
echo.
echo 📦 镜像信息:
echo    完整镜像名称: %FULL_IMAGE_NAME%:%TAG%
echo    Latest 标签: %FULL_IMAGE_NAME%:latest
echo.
echo 📥 拉取镜像命令:
echo    docker pull %FULL_IMAGE_NAME%:%TAG%
echo.
echo 🚀 运行镜像命令:
echo    docker run -d --name web-ai-travel-planner -p 3000:3000 %FULL_IMAGE_NAME%:%TAG%
echo.

endlocal

