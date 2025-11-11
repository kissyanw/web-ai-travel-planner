# 📖 用户使用指南

## 🚀 快速开始

### 方式一：一键启动脚本（推荐）

#### Windows

```cmd
快速开始.bat
```

#### Linux/Mac

```bash
chmod +x 快速开始.sh
./快速开始.sh
```

### 方式二：Docker 命令

```bash
# 1. 拉取镜像
docker pull crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com/travel-planner-wy/web-ai-travel-planner:latest

# 2. 运行容器
docker run -d \
  --name web-ai-travel-planner \
  -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_supabase_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key \
  -e NEXT_PUBLIC_LLM_API_KEY=your_llm_api_key \
  crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com/travel-planner-wy/web-ai-travel-planner:latest

# 3. 访问应用
# 打开浏览器访问 http://localhost:3000
```

### 方式三：Docker Compose

1. **复制示例文件**
   ```bash
   cp docker-compose.example.yml docker-compose.yml
   cp .env.example .env
   ```

2. **编辑 `.env` 文件**，填入你的配置信息

3. **启动服务**
   ```bash
   docker-compose up -d
   ```

## 📋 配置说明

### 必需配置

- **NEXT_PUBLIC_SUPABASE_URL**: Supabase 项目 URL
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Supabase 匿名密钥
- **NEXT_PUBLIC_LLM_API_KEY**: LLM API 密钥（阿里云通义千问）

### 可选配置

- **NEXT_PUBLIC_AMAP_KEY**: 高德地图 API Key（用于地图功能）
- **NEXT_PUBLIC_LLM_API_URL**: LLM API 地址（默认: `https://dashscope.aliyuncs.com/compatible-mode/v1`）
- **NEXT_PUBLIC_LLM_MODEL**: LLM 模型名称（默认: `qwen-plus`）

## 🔍 常用命令

```bash
# 查看容器状态
docker ps | grep web-ai-travel-planner

# 查看日志
docker logs -f web-ai-travel-planner

# 停止容器
docker stop web-ai-travel-planner

# 启动容器
docker start web-ai-travel-planner

# 重启容器
docker restart web-ai-travel-planner

# 删除容器
docker rm -f web-ai-travel-planner
```

## 🐛 故障排查

### 容器无法启动

```bash
# 查看日志
docker logs web-ai-travel-planner

# 检查环境变量
docker exec web-ai-travel-planner env | grep NEXT_PUBLIC
```

### 无法访问应用

```bash
# 检查容器状态
docker ps

# 检查端口映射
docker port web-ai-travel-planner

# 检查健康状态
curl http://localhost:3000/api/health
```

### 镜像拉取失败

```bash
# 登录阿里云镜像仓库
docker login --username=your_username crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com

# 重新拉取
docker pull crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com/travel-planner-wy/web-ai-travel-planner:latest
```

## 📚 更多信息

- **详细文档**: 查看 `用户使用指南.md`
- **Docker 文档**: 查看 `DOCKER.md`
- **问题反馈**: 提交 Issue 或联系支持

---

**祝你使用愉快！** 🎉

