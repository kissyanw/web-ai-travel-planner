# Docker 镜像构建和推送到阿里云镜像仓库脚本 (PowerShell)
# 使用方法: .\build-and-push.ps1 [tag]

param(
    [string]$Tag = "latest",
    [string]$Namespace = "travel-planner-wy",
    [string]$ImageName = "web-ai-travel-planner",
    [string]$Registry = "crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com"
)

$FullImageName = "${Registry}/${Namespace}/${ImageName}"

Write-Host "Starting Docker image build and push to Aliyun Container Registry" -ForegroundColor Green
Write-Host "Image name: ${FullImageName}:${Tag}" -ForegroundColor Yellow
Write-Host ""

# Check if Docker is installed
try {
    $dockerVersion = docker --version
    Write-Host "Docker installed: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Docker not installed, please install Docker first" -ForegroundColor Red
    exit 1
}

# Check if Docker is running
try {
    docker info 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Docker is not running, please start Docker Desktop" -ForegroundColor Red
        exit 1
    }
    Write-Host "Docker is running" -ForegroundColor Green
} catch {
    Write-Host "Error: Docker is not running, please start Docker Desktop" -ForegroundColor Red
    exit 1
}

# Check login status
Write-Host "Checking Aliyun Container Registry login status..." -ForegroundColor Yellow
$loginStatus = docker info 2>&1 | Select-String -Pattern $Registry
if (-not $loginStatus) {
    Write-Host "Not logged in to Aliyun Container Registry, please login first" -ForegroundColor Yellow
    Write-Host "Login command: docker login ${Registry}" -ForegroundColor Yellow
    Write-Host ""
    $login = Read-Host "Login now? (y/n)"
    if ($login -eq "y" -or $login -eq "Y") {
        docker login $Registry
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Login failed" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "Operation cancelled" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Already logged in to Aliyun Container Registry" -ForegroundColor Green
}

Write-Host ""

# 读取 .env 文件（如果存在）
$buildArgs = @()
if (Test-Path ".env") {
    Write-Host "📄 从 .env 文件读取环境变量..." -ForegroundColor Green
    $envContent = Get-Content ".env" | Where-Object { $_ -notmatch "^\s*#" -and $_ -match "=" }
    foreach ($line in $envContent) {
        if ($line -match "^\s*([^=]+)=(.*)$") {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            if ($key -match "^(NEXT_PUBLIC_SUPABASE_URL|NEXT_PUBLIC_SUPABASE_ANON_KEY|NEXT_PUBLIC_AMAP_KEY|NEXT_PUBLIC_LLM_API_KEY|NEXT_PUBLIC_LLM_API_URL|NEXT_PUBLIC_LLM_MODEL)$") {
                $buildArgs += "--build-arg"
                $buildArgs += "${key}=${value}"
            }
        }
    }
} else {
    Write-Host "⚠️  警告: .env 文件不存在，将使用默认值构建" -ForegroundColor Yellow
    Write-Host "   建议: 创建 .env 文件并配置环境变量" -ForegroundColor Yellow
}

Write-Host ""

# 构建 Docker 镜像
Write-Host "🔨 开始构建 Docker 镜像..." -ForegroundColor Green
Write-Host "镜像完整名称: ${FullImageName}:${Tag}" -ForegroundColor Cyan
Write-Host ""

$buildCommand = @(
    "build"
) + $buildArgs + @(
    "--tag", "${ImageName}:${Tag}",
    "--tag", "${ImageName}:latest",
    "--tag", "${FullImageName}:${Tag}",
    "--tag", "${FullImageName}:latest",
    "."
)

docker $buildCommand

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker 镜像构建失败" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Docker 镜像构建完成" -ForegroundColor Green
Write-Host ""

# 推送镜像到阿里云镜像仓库
Write-Host "📤 开始推送镜像到阿里云镜像仓库..." -ForegroundColor Green
docker push "${FullImageName}:${Tag}"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 镜像推送失败" -ForegroundColor Red
    exit 1
}

docker push "${FullImageName}:latest"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 镜像推送失败" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ 镜像推送完成！" -ForegroundColor Green
Write-Host ""
Write-Host "📦 镜像信息:" -ForegroundColor Green
Write-Host "   完整镜像名称: ${FullImageName}:${Tag}" -ForegroundColor Cyan
Write-Host "   Latest 标签: ${FullImageName}:latest" -ForegroundColor Cyan
Write-Host ""
Write-Host "📥 拉取镜像命令:" -ForegroundColor Green
Write-Host "   docker pull ${FullImageName}:${Tag}" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 运行镜像命令:" -ForegroundColor Green
Write-Host "   docker run -d \`" -ForegroundColor Cyan
Write-Host "     --name web-ai-travel-planner \`" -ForegroundColor Cyan
Write-Host "     -p 3000:3000 \`" -ForegroundColor Cyan
Write-Host "     -e NEXT_PUBLIC_SUPABASE_URL=your_supabase_url \`" -ForegroundColor Cyan
Write-Host "     -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key \`" -ForegroundColor Cyan
Write-Host "     -e NEXT_PUBLIC_LLM_API_KEY=your_llm_api_key \`" -ForegroundColor Cyan
Write-Host "     ${FullImageName}:${Tag}" -ForegroundColor Cyan
Write-Host ""

