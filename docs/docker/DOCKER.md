# Docker 部署指南

本文档介绍如何使用 Docker 部署 AI 旅行规划助手应用。

## 快速开始

### 方式一：使用 Docker Compose（推荐）

1. **创建环境变量文件**

   创建 `.env` 文件（或复制 `env.example` 并重命名）：

   ```bash
   cp env.example .env
   ```

   编辑 `.env` 文件，填入必要的配置：

   ```env
   # 必需配置
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_LLM_API_KEY=your_llm_api_key

   # 可选配置
   NEXT_PUBLIC_AMAP_KEY=your_amap_key
   NEXT_PUBLIC_LLM_API_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
   NEXT_PUBLIC_LLM_MODEL=qwen-plus
   ```

2. **构建并启动容器**

   ```bash
   docker-compose up -d
   ```

3. **查看日志**

   ```bash
   docker-compose logs -f
   ```

4. **访问应用**

   打开浏览器访问：http://localhost:3000

5. **停止容器**

   ```bash
   docker-compose down
   ```

### 方式二：直接使用 Docker

1. **构建镜像**

   ```bash
   docker build -t web-ai-travel-planner:latest .
   ```

2. **运行容器**

   ```bash
   docker run -d \
     --name web-ai-travel-planner \
     -p 3000:3000 \
     -e NEXT_PUBLIC_SUPABASE_URL=your_supabase_url \
     -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key \
     -e NEXT_PUBLIC_LLM_API_KEY=your_llm_api_key \
     -e NEXT_PUBLIC_LLM_API_URL=https://dashscope.aliyuncs.com/compatible-mode/v1 \
     -e NEXT_PUBLIC_LLM_MODEL=qwen-plus \
     -e NEXT_PUBLIC_AMAP_KEY=your_amap_key \
     --restart unless-stopped \
     web-ai-travel-planner:latest
   ```

3. **查看日志**

   ```bash
   docker logs -f web-ai-travel-planner
   ```

4. **停止容器**

   ```bash
   docker stop web-ai-travel-planner
   docker rm web-ai-travel-planner
   ```

## 使用预构建的 Docker 镜像

如果你已经从 Docker Hub 或其他镜像仓库获取了预构建的镜像，可以直接运行：

```bash
docker pull your-registry/web-ai-travel-planner:latest

docker run -d \
  --name web-ai-travel-planner \
  -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_supabase_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key \
  -e NEXT_PUBLIC_LLM_API_KEY=your_llm_api_key \
  your-registry/web-ai-travel-planner:latest
```

## 环境变量说明

### 必需的环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | `eyJhbGci...` |
| `NEXT_PUBLIC_LLM_API_KEY` | LLM API 密钥 | `sk-xxx` |

### 可选的环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `NEXT_PUBLIC_AMAP_KEY` | 高德地图 API Key | - |
| `NEXT_PUBLIC_LLM_API_URL` | LLM API URL | `https://dashscope.aliyuncs.com/compatible-mode/v1` |
| `NEXT_PUBLIC_LLM_MODEL` | LLM 模型名称 | `qwen-plus` |
| `NEXT_PUBLIC_XFYUN_APP_ID` | 科大讯飞 App ID | - |
| `NEXT_PUBLIC_XFYUN_API_KEY` | 科大讯飞 API Key | - |
| `NEXT_PUBLIC_XFYUN_API_SECRET` | 科大讯飞 API Secret | - |
| `NEXT_PUBLIC_UNSPLASH_ACCESS_KEY` | Unsplash API Key | - |
| `NEXT_PUBLIC_PEXELS_API_KEY` | Pexels API Key | - |
| `NEXT_PUBLIC_GOOGLE_API_KEY` | Google API Key | - |
| `NEXT_PUBLIC_GOOGLE_SEARCH_ENGINE_ID` | Google 搜索引擎 ID | - |
| `NEXT_PUBLIC_BING_API_KEY` | Bing API Key | - |

## 数据库初始化

在首次运行前，需要在 Supabase 中初始化数据库表结构：

1. 登录 Supabase Dashboard
2. 进入 SQL Editor
3. 执行 `supabase/migrations/001_initial_schema.sql` 中的 SQL 语句
4. 执行 `supabase/migrations/002_add_activity_images.sql` 中的 SQL 语句

## 健康检查

容器包含健康检查功能，可以通过以下命令查看容器健康状态：

```bash
docker ps
```

健康检查端点：http://localhost:3000/api/health

## 故障排查

### 容器无法启动

1. **检查日志**

   ```bash
   docker logs web-ai-travel-planner
   ```

2. **检查环境变量**

   确保所有必需的环境变量都已设置：

   ```bash
   docker exec web-ai-travel-planner env | grep NEXT_PUBLIC
   ```

3. **检查端口占用**

   ```bash
   # Linux/Mac
   lsof -i :3000
   
   # Windows
   netstat -ano | findstr :3000
   ```

### 应用无法访问

1. **检查容器状态**

   ```bash
   docker ps -a
   ```

2. **检查端口映射**

   确保端口映射正确：`-p 3000:3000`

3. **检查防火墙**

   确保防火墙允许 3000 端口访问

### 构建失败

1. **检查 Dockerfile**

   确保 Dockerfile 语法正确

2. **清理构建缓存**

   ```bash
   docker system prune -a
   ```

3. **检查网络连接**

   确保可以访问 Docker Hub 和 npm  registry

## 生产环境部署建议

### 1. 使用反向代理

建议在生产环境中使用 Nginx 或 Traefik 作为反向代理：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 2. 使用 HTTPS

配置 SSL 证书，使用 HTTPS 访问应用。

### 3. 资源限制

为容器设置资源限制：

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### 4. 日志管理

配置日志驱动和日志轮转：

```yaml
services:
  app:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### 5. 数据持久化

如果需要持久化数据，可以挂载卷：

```yaml
services:
  app:
    volumes:
      - ./data:/app/data
```

## 更新应用

### 使用 Docker Compose

```bash
# 停止容器
docker-compose down

# 拉取最新代码（如果使用 Git）
git pull

# 重新构建镜像
docker-compose build

# 启动容器
docker-compose up -d
```

### 使用 Docker

```bash
# 停止并删除旧容器
docker stop web-ai-travel-planner
docker rm web-ai-travel-planner

# 构建新镜像
docker build -t web-ai-travel-planner:latest .

# 运行新容器
docker run -d \
  --name web-ai-travel-planner \
  -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_supabase_url \
  ... \
  web-ai-travel-planner:latest
```

## 备份和恢复

### 备份数据库

由于应用使用 Supabase 作为数据库，数据备份需要在 Supabase Dashboard 中进行。

### 备份配置

备份环境变量文件：

```bash
cp .env .env.backup
```

## 安全建议

1. **不要将 `.env` 文件提交到 Git**
2. **使用强密码和 API 密钥**
3. **定期更新依赖和镜像**
4. **使用 HTTPS**
5. **限制容器资源使用**
6. **定期检查日志**

## 支持

如有问题，请提交 Issue 或联系开发者。

