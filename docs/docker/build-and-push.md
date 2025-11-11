# 快速构建和推送指南

## 一键构建和推送

### Linux/Mac 用户

```bash
# 1. 修改脚本中的命名空间
# 编辑 docker-build-push.sh，将 NAMESPACE 改为你的命名空间

# 2. 添加执行权限
chmod +x docker-build-push.sh

# 3. 运行脚本
./docker-build-push.sh latest your-namespace
```

### Windows 用户

```cmd
REM 1. 修改脚本中的命名空间
REM 编辑 docker-build-push.bat，将 NAMESPACE 改为你的命名空间

REM 2. 运行脚本
docker-build-push.bat latest your-namespace
```

## 手动步骤

### 1. 登录阿里云镜像仓库

```bash
docker login registry.cn-hangzhou.aliyuncs.com
```

### 2. 构建镜像

```bash
docker build -t web-ai-travel-planner:latest .
```

### 3. 标记镜像

```bash
docker tag web-ai-travel-planner:latest \
  registry.cn-hangzhou.aliyuncs.com/your-namespace/web-ai-travel-planner:latest
```

### 4. 推送镜像

```bash
docker push registry.cn-hangzhou.aliyuncs.com/your-namespace/web-ai-travel-planner:latest
```

## 验证

### 查看镜像

```bash
docker images | grep web-ai-travel-planner
```

### 拉取镜像测试

```bash
docker pull registry.cn-hangzhou.aliyuncs.com/your-namespace/web-ai-travel-planner:latest
```

## 完整示例

假设你的命名空间是 `travel-planner`，地域是 `华东1（杭州）`：

```bash
# 1. 登录
docker login registry.cn-hangzhou.aliyuncs.com

# 2. 构建
docker build -t web-ai-travel-planner:latest .

# 3. 标记
docker tag web-ai-travel-planner:latest \
  registry.cn-hangzhou.aliyuncs.com/travel-planner/web-ai-travel-planner:latest

# 4. 推送
docker push registry.cn-hangzhou.aliyuncs.com/travel-planner/web-ai-travel-planner:latest
```

## 使用推送的镜像

```bash
docker run -d \
  --name web-ai-travel-planner \
  -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_supabase_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key \
  -e NEXT_PUBLIC_LLM_API_KEY=your_llm_api_key \
  registry.cn-hangzhou.aliyuncs.com/travel-planner/web-ai-travel-planner:latest
```

## 更多信息

详细文档请参见 [ALIYUN_REGISTRY.md](./ALIYUN_REGISTRY.md)

