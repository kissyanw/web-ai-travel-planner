# 一键构建和推送 Docker 镜像

## 配置信息

- **命名空间**: `travel-planner-wy`
- **仓库名称**: `web-ai-travel-planner`
- **完整镜像名称**: `registry.cn-hangzhou.aliyuncs.com/travel-planner-wy/web-ai-travel-planner:latest`

## 运行步骤

### 1. 启动 Docker Desktop

确保 Docker Desktop 已启动并运行。

### 2. 登录阿里云镜像仓库

```bash
docker login registry.cn-hangzhou.aliyuncs.com
```

输入你的阿里云账号和 Docker 登录密码。

### 3. 运行构建脚本

#### 方式一：使用 PowerShell 脚本（推荐）

```powershell
.\build-and-push.ps1
```

#### 方式二：使用批处理脚本

```cmd
docker-build-push.bat
```

#### 方式三：手动执行命令

```bash
# 构建镜像
docker build -t web-ai-travel-planner:latest .

# 标记镜像
docker tag web-ai-travel-planner:latest registry.cn-hangzhou.aliyuncs.com/travel-planner-wy/web-ai-travel-planner:latest

# 推送镜像
docker push registry.cn-hangzhou.aliyuncs.com/travel-planner-wy/web-ai-travel-planner:latest
```

## 验证

### 查看本地镜像

```bash
docker images | findstr web-ai-travel-planner
```

### 拉取镜像测试

```bash
docker pull registry.cn-hangzhou.aliyuncs.com/travel-planner-wy/web-ai-travel-planner:latest
```

### 在阿里云控制台查看

1. 登录 [阿里云容器镜像服务控制台](https://cr.console.aliyun.com/)
2. 进入命名空间 `travel-planner-wy`
3. 查看镜像仓库 `web-ai-travel-planner`
4. 确认镜像已推送成功

## 使用镜像

```bash
docker run -d \
  --name web-ai-travel-planner \
  -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_supabase_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key \
  -e NEXT_PUBLIC_LLM_API_KEY=your_llm_api_key \
  registry.cn-hangzhou.aliyuncs.com/travel-planner-wy/web-ai-travel-planner:latest
```

## 注意事项

1. **Docker Desktop 必须运行**：确保 Docker Desktop 已启动
2. **登录凭证**：需要先登录阿里云镜像仓库
3. **网络连接**：确保网络连接正常，可以访问阿里云服务
4. **构建时间**：首次构建可能需要较长时间，请耐心等待

## 故障排查

### Docker 未运行

**错误信息**: `error during connect: The system cannot find the file specified`

**解决方法**: 启动 Docker Desktop

### 登录失败

**错误信息**: `unauthorized` 或 `authentication required`

**解决方法**: 
1. 检查用户名和密码是否正确
2. 确认已在阿里云控制台设置 Docker 登录密码
3. 重新登录：`docker login registry.cn-hangzhou.aliyuncs.com`

### 推送失败

**错误信息**: `denied` 或 `unauthorized`

**解决方法**:
1. 检查命名空间是否存在
2. 确认有该命名空间的权限
3. 检查镜像名称是否正确

## 联系支持

如有问题，请查看详细文档或提交 Issue。

