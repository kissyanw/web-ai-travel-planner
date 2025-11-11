# 构建和推送 Docker 镜像 - 使用说明

## 📋 配置信息

已为你配置好以下信息：

- **Registry地址**: `crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com`
- **VPC地址**: `crpi-d5cvf2641cviwpw5-vpc.cn-hangzhou.personal.cr.aliyuncs.com`
- **用户名**: `wangyannju`
- **命名空间**: `travel-planner-wy`
- **仓库名称**: `web-ai-travel-planner`
- **完整镜像名称**: `crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com/travel-planner-wy/web-ai-travel-planner:latest`

## 🚀 快速开始

### 步骤 1: 启动 Docker Desktop

1. 打开 Docker Desktop 应用程序
2. 等待 Docker 完全启动（状态栏显示 "Docker Desktop is running"）

### 步骤 2: 登录阿里云镜像仓库

打开命令提示符或 PowerShell，执行：

```bash
docker login --username=wangyannju crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com
```

输入你的：
- **用户名**: `wangyannju`（阿里云账号全名）
- **密码**: 开通服务时设置的密码（可在访问凭证页面修改）

### 步骤 3: 运行构建脚本

#### 方式一：使用快速构建脚本（推荐）

```cmd
quick-build.bat
```

#### 方式二：使用完整脚本

```cmd
docker-build-push.bat
```

#### 方式三：手动执行命令

```bash
# 1. 登录
docker login --username=wangyannju crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com

# 2. 构建镜像
docker build -t web-ai-travel-planner:latest .

# 3. 标记镜像
docker tag web-ai-travel-planner:latest crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com/travel-planner-wy/web-ai-travel-planner:latest

# 4. 推送镜像
docker push crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com/travel-planner-wy/web-ai-travel-planner:latest
```

## 📝 完整命令序列

如果你想一次性执行所有命令，可以使用以下命令：

```bash
# 1. 登录
docker login --username=wangyannju crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com

# 2. 构建并标记镜像
docker build -t web-ai-travel-planner:latest -t crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com/travel-planner-wy/web-ai-travel-planner:latest .

# 3. 推送镜像
docker push crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com/travel-planner-wy/web-ai-travel-planner:latest
```

## ✅ 验证

### 查看本地镜像

```bash
docker images | findstr web-ai-travel-planner
```

### 查看推送的镜像

1. 登录 [阿里云容器镜像服务控制台](https://cr.console.aliyun.com/)
2. 进入命名空间 `travel-planner-wy`
3. 查看镜像仓库 `web-ai-travel-planner`
4. 确认镜像版本 `latest` 已存在

### 拉取镜像测试

```bash
docker pull crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com/travel-planner-wy/web-ai-travel-planner:latest
```

## 🎯 使用推送的镜像

```bash
docker run -d \
  --name web-ai-travel-planner \
  -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_supabase_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key \
  -e NEXT_PUBLIC_LLM_API_KEY=your_llm_api_key \
  crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com/travel-planner-wy/web-ai-travel-planner:latest
```

## ⚠️ 注意事项

1. **Docker Desktop 必须运行**: 确保 Docker Desktop 已启动
2. **登录凭证**: 需要先登录阿里云镜像仓库
3. **网络连接**: 确保网络连接正常
4. **构建时间**: 首次构建可能需要 5-10 分钟，请耐心等待
5. **命名空间权限**: 确保你有 `travel-planner-wy` 命名空间的推送权限

## 🔧 故障排查

### Docker 未运行

**错误**: `error during connect: The system cannot find the file specified`

**解决**: 启动 Docker Desktop 应用程序

### 登录失败

**错误**: `unauthorized` 或 `authentication required`

**解决**: 
1. 检查用户名是否正确：`wangyannju`
2. 检查密码是否正确（开通服务时设置的密码）
3. 在访问凭证页面修改密码
4. 重新登录：`docker login --username=wangyannju crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com`

### 推送失败 - 命名空间不存在

**错误**: `repository name must be lowercase` 或 `namespace not found`

**解决**: 
1. 登录阿里云控制台
2. 创建命名空间 `travel-planner-wy`
3. 创建镜像仓库 `web-ai-travel-planner`

### 推送失败 - 权限不足

**错误**: `denied` 或 `unauthorized`

**解决**: 
1. 检查是否有该命名空间的权限
2. 联系管理员授予权限
3. 确认使用的是正确的阿里云账号

## 📞 需要帮助？

如果遇到问题，请：

1. 查看详细文档：`ALIYUN_REGISTRY.md`
2. 检查 Docker 日志：`docker logs <container-id>`
3. 查看阿里云控制台的错误信息
4. 提交 Issue 或联系支持

## 🎉 成功后的下一步

镜像推送成功后，你可以：

1. **分享镜像**: 将镜像地址分享给团队成员
2. **部署应用**: 在服务器上拉取并运行镜像
3. **CI/CD**: 配置自动构建和部署流程
4. **版本管理**: 使用标签管理不同版本

---

**祝你构建顺利！** 🚀

