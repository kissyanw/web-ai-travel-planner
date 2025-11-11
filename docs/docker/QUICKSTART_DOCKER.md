# Docker 快速开始指南

本指南帮助你快速使用 Docker 部署 AI 旅行规划助手。

## 方式一：使用预构建镜像（推荐）

### 1. 拉取镜像

```bash
docker pull your-registry/web-ai-travel-planner:latest
```

### 2. 运行容器

```bash
docker run -d \
  --name web-ai-travel-planner \
  -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_supabase_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key \
  -e NEXT_PUBLIC_LLM_API_KEY=your_llm_api_key \
  your-registry/web-ai-travel-planner:latest
```

### 3. 访问应用

打开浏览器访问：http://localhost:3000

**注意**：首次使用需要在设置页面配置 API 密钥（如果构建时未设置）。

## 方式二：使用 Docker Compose（最简单）

### 1. 创建环境变量文件

创建 `.env` 文件：

```bash
cp env.example .env
```

编辑 `.env` 文件，填入你的配置：

```env
# 必需配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_LLM_API_KEY=your_llm_api_key

# 可选配置
NEXT_PUBLIC_AMAP_KEY=your_amap_key
NEXT_PUBLIC_LLM_API_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
NEXT_PUBLIC_LLM_MODEL=qwen-plus
```

### 2. 启动服务

```bash
docker-compose up -d
```

### 3. 查看日志

```bash
docker-compose logs -f
```

### 4. 访问应用

打开浏览器访问：http://localhost:3000

### 5. 停止服务

```bash
docker-compose down
```

## 方式三：自己构建镜像

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd web-ai-travel-planner
```

### 2. 创建环境变量文件

```bash
cp env.example .env
# 编辑 .env 文件，填入你的配置
```

### 3. 构建镜像

**Linux/Mac:**

```bash
chmod +x docker-build.sh
./docker-build.sh
```

**Windows:**

```bash
docker-build.bat
```

**或直接使用 Docker:**

```bash
docker build -t web-ai-travel-planner:latest .
```

### 4. 运行容器

```bash
docker run -d \
  --name web-ai-travel-planner \
  -p 3000:3000 \
  --env-file .env \
  web-ai-travel-planner:latest
```

## 配置说明

### 必需配置

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 项目 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase 匿名密钥
- `NEXT_PUBLIC_LLM_API_KEY`: LLM API 密钥

### 可选配置

- `NEXT_PUBLIC_AMAP_KEY`: 高德地图 API Key（用于地图功能）
- `NEXT_PUBLIC_LLM_API_URL`: LLM API URL（默认：阿里云通义千问）
- `NEXT_PUBLIC_LLM_MODEL`: LLM 模型名称（默认：qwen-plus）

### 运行时配置

应用支持通过 Web 界面配置 API 密钥：

1. 访问 http://localhost:3000/settings
2. 填写 API 密钥
3. 点击"保存配置"

配置会保存在浏览器本地存储中。

## 数据库初始化

在首次使用前，需要在 Supabase 中初始化数据库：

1. 登录 Supabase Dashboard
2. 进入 SQL Editor
3. 执行 `supabase/migrations/001_initial_schema.sql`
4. 执行 `supabase/migrations/002_add_activity_images.sql`

## 健康检查

容器包含健康检查功能：

```bash
# 查看容器状态
docker ps

# 查看健康检查日志
docker inspect web-ai-travel-planner | grep -A 10 Health
```

健康检查端点：http://localhost:3000/api/health

## 故障排查

### 容器无法启动

```bash
# 查看日志
docker logs web-ai-travel-planner

# 检查环境变量
docker exec web-ai-travel-planner env | grep NEXT_PUBLIC
```

### 应用无法访问

1. 检查容器是否运行：`docker ps`
2. 检查端口映射：确保 `-p 3000:3000` 正确
3. 检查防火墙：确保 3000 端口开放

### API 功能不工作

1. 检查 API 密钥是否正确配置
2. 查看浏览器控制台错误信息
3. 访问设置页面重新配置 API 密钥

## 更新应用

```bash
# 停止容器
docker stop web-ai-travel-planner
docker rm web-ai-travel-planner

# 拉取最新镜像
docker pull your-registry/web-ai-travel-planner:latest

# 运行新容器
docker run -d \
  --name web-ai-travel-planner \
  -p 3000:3000 \
  --env-file .env \
  your-registry/web-ai-travel-planner:latest
```

## 更多信息

- 详细文档：参见 [DOCKER.md](./DOCKER.md)
- 配置指南：参见 [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- 环境变量说明：参见 [env.example](./env.example)

