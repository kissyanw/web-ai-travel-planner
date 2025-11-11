# 快速构建和推送指南

## 一键构建和推送到阿里云镜像仓库

### 前提条件

1. 已安装 Docker
2. 已创建阿里云镜像仓库
3. 已获取命名空间和登录凭证

### 步骤

#### 1. 登录阿里云镜像仓库

```bash
docker login registry.cn-hangzhou.aliyuncs.com
```

#### 2. 修改脚本配置

编辑 `docker-build-push.sh`（Linux/Mac）或 `docker-build-push.bat`（Windows），修改命名空间：

```bash
NAMESPACE="your-namespace"  # 替换为你的命名空间
```

#### 3. 运行脚本

**Linux/Mac:**
```bash
chmod +x docker-build-push.sh
./docker-build-push.sh latest your-namespace
```

**Windows:**
```cmd
docker-build-push.bat latest your-namespace
```

### 手动步骤

如果脚本不可用，可以手动执行：

```bash
# 1. 登录
docker login registry.cn-hangzhou.aliyuncs.com

# 2. 构建
docker build -t web-ai-travel-planner:latest .

# 3. 标记
docker tag web-ai-travel-planner:latest \
  registry.cn-hangzhou.aliyuncs.com/your-namespace/web-ai-travel-planner:latest

# 4. 推送
docker push registry.cn-hangzhou.aliyuncs.com/your-namespace/web-ai-travel-planner:latest
```

### 验证

```bash
# 查看镜像
docker images | grep web-ai-travel-planner

# 拉取测试
docker pull registry.cn-hangzhou.aliyuncs.com/your-namespace/web-ai-travel-planner:latest
```

### 使用镜像

```bash
docker run -d \
  --name web-ai-travel-planner \
  -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_supabase_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key \
  -e NEXT_PUBLIC_LLM_API_KEY=your_llm_api_key \
  registry.cn-hangzhou.aliyuncs.com/your-namespace/web-ai-travel-planner:latest
```

## 更多信息

- 详细文档：参见 [ALIYUN_REGISTRY.md](./ALIYUN_REGISTRY.md)
- 构建指南：参见 [README_DOCKER_BUILD.md](./README_DOCKER_BUILD.md)

