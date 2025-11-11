# 🚀 立即开始 - 构建和推送 Docker 镜像

## 📋 你的配置信息

已为你配置好以下信息：

- **Registry**: `crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com`
- **VPC地址**: `crpi-d5cvf2641cviwpw5-vpc.cn-hangzhou.personal.cr.aliyuncs.com`
- **用户名**: `wangyannju`
- **命名空间**: `travel-planner-wy`
- **镜像名称**: `web-ai-travel-planner`
- **完整镜像**: `crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com/travel-planner-wy/web-ai-travel-planner:latest`

## ⚡ 快速开始（3步完成）

### 步骤 1: 登录阿里云镜像仓库

打开命令提示符或 PowerShell，执行：

```bash
docker login --username=wangyannju crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com
```

输入你的密码（开通服务时设置的密码）。

### 步骤 2: 构建镜像

```bash
docker build -t web-ai-travel-planner:latest -t crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com/travel-planner-wy/web-ai-travel-planner:latest .
```

### 步骤 3: 推送镜像

```bash
docker push crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com/travel-planner-wy/web-ai-travel-planner:latest
```

## 🎯 使用脚本（推荐）

### 方式一：使用立即构建脚本

1. **先手动登录**（在另一个终端）：
   ```bash
   docker login --username=wangyannju crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com
   ```

2. **运行构建脚本**：
   ```cmd
   立即构建.bat
   ```

### 方式二：使用完整脚本

1. **先手动登录**：
   ```bash
   docker login --username=wangyannju crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com
   ```

2. **运行脚本**：
   ```cmd
   build-push-aliyun.bat
   ```

## 📝 完整命令（复制粘贴）

```bash
# 1. 登录
docker login --username=wangyannju crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com

# 2. 构建镜像
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
2. 进入个人版容器镜像服务
3. 查看命名空间 `travel-planner-wy`
4. 查看镜像仓库 `web-ai-travel-planner`
5. 确认镜像版本 `latest` 已存在

## 🎉 使用镜像

### 拉取镜像

```bash
docker pull crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com/travel-planner-wy/web-ai-travel-planner:latest
```

### 运行镜像

```bash
docker run -d \
  --name web-ai-travel-planner \
  -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_supabase_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key \
  -e NEXT_PUBLIC_LLM_API_KEY=your_llm_api_key \
  crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com/travel-planner-wy/web-ai-travel-planner:latest
```

## ⚠️ 重要提示

1. **Docker Desktop 必须运行**
2. **先登录再构建**: 登录命令需要手动输入密码
3. **网络连接**: 确保可以访问 Docker Hub 和阿里云服务
4. **构建时间**: 首次构建可能需要 5-10 分钟

## 🔧 故障排查

### Docker 未运行

**错误**: `error during connect: The system cannot find the file specified`

**解决**: 启动 Docker Desktop 应用程序

### 网络问题

**错误**: `failed to fetch anonymous token` 或连接超时

**解决**: 
1. 检查网络连接
2. 配置 Docker 镜像加速器
3. 使用代理（如果需要）

### 登录失败

**错误**: `unauthorized` 或 `authentication required`

**解决**: 
1. 检查用户名：`wangyannju`
2. 检查密码是否正确
3. 在访问凭证页面重置密码

## 📚 更多文档

- **详细指南**: 查看 `ALIYUN_PERSONAL_REGISTRY.md`
- **构建说明**: 查看 `BUILD_INSTRUCTIONS.md`
- **完整命令**: 查看 `完整命令.txt`

## 🎊 开始构建

现在就运行以下命令开始构建：

```bash
# 1. 登录（手动输入密码）
docker login --username=wangyannju crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com

# 2. 构建和推送（或运行脚本）
立即构建.bat
```

祝构建顺利！🚀

