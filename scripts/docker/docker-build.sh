#!/bin/bash

# Docker 镜像构建脚本
# 使用方法: ./docker-build.sh [tag]

set -e

# 默认标签
TAG=${1:-latest}
IMAGE_NAME="web-ai-travel-planner"

echo "🚀 开始构建 Docker 镜像: ${IMAGE_NAME}:${TAG}"

# 检查 .env 文件是否存在
if [ ! -f .env ]; then
    echo "⚠️  警告: .env 文件不存在，将使用默认值构建"
    echo "   建议: 创建 .env 文件并配置环境变量"
fi

# 从 .env 文件读取环境变量（如果存在）
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# 构建 Docker 镜像
docker build \
    --build-arg NEXT_PUBLIC_SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-}" \
    --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}" \
    --build-arg NEXT_PUBLIC_AMAP_KEY="${NEXT_PUBLIC_AMAP_KEY:-}" \
    --build-arg NEXT_PUBLIC_LLM_API_KEY="${NEXT_PUBLIC_LLM_API_KEY:-}" \
    --build-arg NEXT_PUBLIC_LLM_API_URL="${NEXT_PUBLIC_LLM_API_URL:-https://dashscope.aliyuncs.com/compatible-mode/v1}" \
    --build-arg NEXT_PUBLIC_LLM_MODEL="${NEXT_PUBLIC_LLM_MODEL:-qwen-plus}" \
    -t "${IMAGE_NAME}:${TAG}" \
    -t "${IMAGE_NAME}:latest" \
    .

echo "✅ Docker 镜像构建完成: ${IMAGE_NAME}:${TAG}"
echo ""
echo "📦 运行镜像:"
echo "   docker run -d -p 3000:3000 --env-file .env ${IMAGE_NAME}:${TAG}"
echo ""
echo "📋 或使用 docker-compose:"
echo "   docker-compose up -d"

