@echo off
REM ============================================
REM 使用镜像加速器构建 Docker 镜像
REM ============================================

set REGISTRY=crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com
set NAMESPACE=travel-planner-wy
set IMAGE_NAME=web-ai-travel-planner
set TAG=latest
set FULL_IMAGE=%REGISTRY%/%NAMESPACE%/%IMAGE_NAME%:%TAG%

echo.
echo ============================================
echo   使用镜像加速器构建 Docker 镜像
echo ============================================
echo.
echo 完整镜像: %FULL_IMAGE%
echo.
echo ============================================
echo 步骤 1: 配置 Docker 镜像加速器
echo ============================================
echo.
echo 请先配置 Docker 镜像加速器:
echo   1. 打开 Docker Desktop
echo   2. 进入 Settings - Docker Engine
echo   3. 添加以下配置:
echo.
echo {
echo   "registry-mirrors": [
echo     "https://docker.mirrors.ustc.edu.cn",
echo     "https://hub-mirror.c.163.com",
echo     "https://mirror.baidubce.com"
echo   ]
echo }
echo.
echo   4. 点击 Apply ^& Restart
echo   5. 等待 Docker 重启
echo.
echo 配置完成后，按任意键继续...
pause >nul
echo.

echo ============================================
echo 步骤 2: 测试拉取基础镜像
echo ============================================
echo.
echo 正在测试拉取 node:18-alpine 镜像...
docker pull node:18-alpine
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [错误] 无法拉取基础镜像
    echo.
    echo 请检查:
    echo   1. 是否已配置镜像加速器
    echo   2. 网络连接是否正常
    echo   3. 是否需要使用 VPN
    echo.
    echo 查看详细说明: 快速修复网络问题.md
    pause
    exit /b 1
)
echo [成功] 基础镜像拉取成功
echo.

echo ============================================
echo 步骤 3: 构建 Docker 镜像
echo ============================================
echo.
echo 正在构建镜像，这可能需要几分钟...
docker build -t %IMAGE_NAME%:%TAG% -t %FULL_IMAGE% .
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [错误] 构建失败
    pause
    exit /b 1
)
echo [成功] 镜像构建完成
echo.

echo ============================================
echo 步骤 4: 登录并推送镜像
echo ============================================
echo.
echo 请先登录阿里云镜像仓库:
echo   docker login --username=wangyannju %REGISTRY%
echo.
set /p PUSH="是否现在推送镜像？(y/n): "
if /i not "%PUSH%"=="y" (
    echo 已取消推送
    pause
    exit /b 0
)

echo.
echo 正在推送镜像...
docker push %FULL_IMAGE%
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [错误] 推送失败
    echo 请检查是否已登录
    pause
    exit /b 1
)
echo [成功] 镜像推送完成
echo.

echo ============================================
echo 完成！
echo ============================================
echo 镜像地址: %FULL_IMAGE%
echo ============================================
echo.

pause

