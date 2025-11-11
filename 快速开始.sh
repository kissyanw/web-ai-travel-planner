#!/bin/bash

# Web AI Travel Planner 快速启动脚本

echo "============================================"
echo "  Web AI Travel Planner - 快速启动"
echo "============================================"
echo ""

# 镜像地址
IMAGE="crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com/travel-planner-wy/web-ai-travel-planner:latest"
CONTAINER_NAME="web-ai-travel-planner"

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ 错误: Docker 未安装，请先安装 Docker"
    exit 1
fi

# 检查 Docker 是否运行
if ! docker info &> /dev/null; then
    echo "❌ 错误: Docker 未运行，请启动 Docker"
    exit 1
fi

echo "✅ Docker 环境检查通过"
echo ""

# 检查镜像是否存在
if ! docker images | grep -q "travel-planner-wy/web-ai-travel-planner"; then
    echo "📥 拉取镜像..."
    docker pull $IMAGE
    if [ $? -ne 0 ]; then
        echo "❌ 镜像拉取失败"
        exit 1
    fi
    echo "✅ 镜像拉取成功"
else
    echo "✅ 镜像已存在"
fi

echo ""

# 检查容器是否已存在
if docker ps -a | grep -q $CONTAINER_NAME; then
    echo "⚠️  容器已存在，正在删除..."
    docker rm -f $CONTAINER_NAME
fi

echo ""

# 提示输入环境变量
echo "请输入配置信息："
echo ""

read -p "Supabase URL: " SUPABASE_URL
read -p "Supabase Anon Key: " SUPABASE_ANON_KEY
read -p "LLM API Key: " LLM_API_KEY
read -p "高德地图 API Key (可选，直接回车跳过): " AMAP_KEY

echo ""
echo "🚀 启动容器..."
echo ""

# 构建运行命令
CMD="docker run -d --name $CONTAINER_NAME -p 3000:3000"
CMD="$CMD -e NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL"
CMD="$CMD -e NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY"
CMD="$CMD -e NEXT_PUBLIC_LLM_API_KEY=$LLM_API_KEY"

if [ ! -z "$AMAP_KEY" ]; then
    CMD="$CMD -e NEXT_PUBLIC_AMAP_KEY=$AMAP_KEY"
fi

CMD="$CMD $IMAGE"

# 执行命令
eval $CMD

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 容器启动成功！"
    echo ""
    echo "============================================"
    echo "  应用信息"
    echo "============================================"
    echo "容器名称: $CONTAINER_NAME"
    echo "访问地址: http://localhost:3000"
    echo ""
    echo "常用命令:"
    echo "  查看日志: docker logs -f $CONTAINER_NAME"
    echo "  停止容器: docker stop $CONTAINER_NAME"
    echo "  启动容器: docker start $CONTAINER_NAME"
    echo "  删除容器: docker rm -f $CONTAINER_NAME"
    echo "============================================"
else
    echo "❌ 容器启动失败"
    exit 1
fi

