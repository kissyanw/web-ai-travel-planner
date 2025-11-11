#!/bin/bash

# ============================================
# 推送最新镜像到阿里云仓库
# ============================================

REGISTRY="crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com"
NAMESPACE="travel-planner-wy"
IMAGE_NAME="web-ai-travel-planner"
TAG="latest"
FULL_IMAGE="${REGISTRY}/${NAMESPACE}/${IMAGE_NAME}:${TAG}"

echo ""
echo "============================================"
echo "  推送最新镜像到阿里云仓库"
echo "============================================"
echo ""
echo "镜像地址: ${FULL_IMAGE}"
echo "镜像ID: b34fc98976c0"
echo ""

# 检查镜像是否存在
if ! docker images | grep -q "b34fc98976c0"; then
    echo "[错误] 镜像不存在，请先构建镜像"
    exit 1
fi

echo "[成功] 镜像已找到"
echo ""

echo "============================================"
echo "  步骤 1: 登录阿里云镜像仓库"
echo "============================================"
echo ""
echo "请执行以下命令登录:"
echo "  docker login --username=wangyannju ${REGISTRY}"
echo ""
read -p "登录完成后，按 Enter 继续推送镜像..."

echo ""
echo "============================================"
echo "  步骤 2: 推送镜像"
echo "============================================"
echo ""
echo "正在推送镜像到阿里云仓库..."
echo "这可能需要几分钟，请耐心等待..."
echo ""

docker push ${FULL_IMAGE}
if [ $? -ne 0 ]; then
    echo ""
    echo "[错误] 推送失败"
    echo ""
    echo "可能的原因:"
    echo "  1. 未登录或登录已过期"
    echo "  2. 网络连接问题"
    echo "  3. 镜像仓库权限问题"
    echo ""
    echo "请检查后重试"
    exit 1
fi

echo ""
echo "============================================"
echo "  推送成功！"
echo "============================================"
echo ""
echo "镜像已成功推送到阿里云仓库"
echo "镜像地址: ${FULL_IMAGE}"
echo "镜像ID: b34fc98976c0"
echo ""
echo "拉取镜像命令:"
echo "  docker pull ${FULL_IMAGE}"
echo ""
echo "运行镜像命令:"
echo "  docker run -d --name web-ai-travel-planner -p 3000:3000 ${FULL_IMAGE}"
echo ""
echo "============================================"
echo ""

