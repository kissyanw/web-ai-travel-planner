#!/bin/bash

# Docker 镜像构建和推送到阿里云镜像仓库脚本
# 使用方法: ./docker-build-push.sh [tag] [registry-namespace]

set -e

# 默认配置
TAG=${1:-latest}
REGISTRY="crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com"
NAMESPACE=${2:-"travel-planner-wy"}  # 阿里云镜像仓库命名空间
IMAGE_NAME="web-ai-travel-planner"
FULL_IMAGE_NAME="${REGISTRY}/${NAMESPACE}/${IMAGE_NAME}"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 开始构建 Docker 镜像并推送到阿里云镜像仓库${NC}"
echo -e "${YELLOW}镜像名称: ${FULL_IMAGE_NAME}:${TAG}${NC}"
echo ""

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ 错误: Docker 未安装，请先安装 Docker${NC}"
    exit 1
fi

# 检查是否已登录阿里云镜像仓库
echo -e "${YELLOW}📋 检查阿里云镜像仓库登录状态...${NC}"
if ! docker info | grep -q "${REGISTRY}"; then
    echo -e "${YELLOW}⚠️  未检测到阿里云镜像仓库登录，请先登录${NC}"
    echo -e "${YELLOW}登录命令: docker login ${REGISTRY}${NC}"
    echo ""
    read -p "是否现在登录？(y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker login ${REGISTRY}
    else
        echo -e "${RED}❌ 取消操作${NC}"
        exit 1
    fi
fi

# 检查 .env 文件是否存在
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  警告: .env 文件不存在，将使用默认值构建${NC}"
    echo -e "${YELLOW}   建议: 创建 .env 文件并配置环境变量${NC}"
    echo ""
fi

# 从 .env 文件读取环境变量（如果存在）
if [ -f .env ]; then
    echo -e "${GREEN}📄 从 .env 文件读取环境变量...${NC}"
    export $(cat .env | grep -v '^#' | xargs)
fi

# 构建 Docker 镜像
echo -e "${GREEN}🔨 开始构建 Docker 镜像...${NC}"
docker build \
    --build-arg NEXT_PUBLIC_SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-}" \
    --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}" \
    --build-arg NEXT_PUBLIC_AMAP_KEY="${NEXT_PUBLIC_AMAP_KEY:-}" \
    --build-arg NEXT_PUBLIC_LLM_API_KEY="${NEXT_PUBLIC_LLM_API_KEY:-}" \
    --build-arg NEXT_PUBLIC_LLM_API_URL="${NEXT_PUBLIC_LLM_API_URL:-https://dashscope.aliyuncs.com/compatible-mode/v1}" \
    --build-arg NEXT_PUBLIC_LLM_MODEL="${NEXT_PUBLIC_LLM_MODEL:-qwen-plus}" \
    -t "${IMAGE_NAME}:${TAG}" \
    -t "${IMAGE_NAME}:latest" \
    -t "${FULL_IMAGE_NAME}:${TAG}" \
    -t "${FULL_IMAGE_NAME}:latest" \
    .

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Docker 镜像构建失败${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker 镜像构建完成${NC}"
echo ""

# 推送镜像到阿里云镜像仓库
echo -e "${GREEN}📤 开始推送镜像到阿里云镜像仓库...${NC}"
docker push "${FULL_IMAGE_NAME}:${TAG}"
docker push "${FULL_IMAGE_NAME}:latest"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 镜像推送失败${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ 镜像推送完成！${NC}"
echo ""
echo -e "${GREEN}📦 镜像信息:${NC}"
echo -e "   完整镜像名称: ${FULL_IMAGE_NAME}:${TAG}"
echo -e "   Latest 标签: ${FULL_IMAGE_NAME}:latest"
echo ""
echo -e "${GREEN}📥 拉取镜像命令:${NC}"
echo -e "   docker pull ${FULL_IMAGE_NAME}:${TAG}"
echo ""
echo -e "${GREEN}🚀 运行镜像命令:${NC}"
echo -e "   docker run -d \\"
echo -e "     --name web-ai-travel-planner \\"
echo -e "     -p 3000:3000 \\"
echo -e "     -e NEXT_PUBLIC_SUPABASE_URL=your_supabase_url \\"
echo -e "     -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key \\"
echo -e "     -e NEXT_PUBLIC_LLM_API_KEY=your_llm_api_key \\"
echo -e "     ${FULL_IMAGE_NAME}:${TAG}"
echo ""

