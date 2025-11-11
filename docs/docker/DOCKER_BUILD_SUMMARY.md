# Docker 镜像构建和推送 - 快速参考

## 📋 完成的工作

已为你创建了完整的 Docker 镜像构建和推送方案：

### ✅ 创建的脚本

1. **docker-build-push.sh** - Linux/Mac 一键构建和推送脚本
2. **docker-build-push.bat** - Windows 一键构建和推送脚本
3. **.github/workflows/docker-build.yml** - GitHub Actions 自动构建工作流（已更新）

### ✅ 创建的文档

1. **ALIYUN_REGISTRY.md** - 阿里云镜像仓库详细使用指南
2. **README_DOCKER_BUILD.md** - Docker 镜像构建和推送完整指南
3. **QUICK_BUILD_PUSH.md** - 快速构建和推送指南
4. **build-and-push.md** - 快速参考

## 🚀 快速开始

### 方式一：使用脚本（推荐）

#### Linux/Mac

```bash
# 1. 编辑脚本，修改命名空间
vim docker-build-push.sh
# 将 NAMESPACE 改为你的阿里云镜像仓库命名空间

# 2. 添加执行权限
chmod +x docker-build-push.sh

# 3. 登录阿里云镜像仓库
docker login registry.cn-hangzhou.aliyuncs.com

# 4. 运行脚本
./docker-build-push.sh latest your-namespace
```

#### Windows

```cmd
REM 1. 编辑脚本，修改命名空间
REM 编辑 docker-build-push.bat

REM 2. 登录阿里云镜像仓库
docker login registry.cn-hangzhou.aliyuncs.com

REM 3. 运行脚本
docker-build-push.bat latest your-namespace
```

### 方式二：手动执行

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

## 📝 前置要求

### 1. 创建阿里云镜像仓库

1. 登录 [阿里云容器镜像服务控制台](https://cr.console.aliyun.com/)
2. 创建命名空间（例如：`travel-planner`）
3. 创建镜像仓库（例如：`web-ai-travel-planner`）
4. 获取登录凭证

### 2. 配置 Docker 登录

```bash
docker login registry.cn-hangzhou.aliyuncs.com
```

## 🔧 配置说明

### 脚本配置

在运行脚本前，需要修改脚本中的配置：

**docker-build-push.sh (Linux/Mac):**
```bash
REGISTRY="registry.cn-hangzhou.aliyuncs.com"  # 根据你的地域修改
NAMESPACE="your-namespace"  # 替换为你的命名空间
```

**docker-build-push.bat (Windows):**
```bat
set REGISTRY=registry.cn-hangzhou.aliyuncs.com
set NAMESPACE=your-namespace
```

### GitHub Actions 配置

如果使用 GitHub Actions 自动构建，需要配置以下 Secrets：

1. `ALIYUN_REGISTRY_USERNAME` - 阿里云账号用户名
2. `ALIYUN_REGISTRY_PASSWORD` - 阿里云 Docker 登录密码
3. `ALIYUN_REGISTRY_NAMESPACE` - 镜像仓库命名空间
4. `ALIYUN_REGISTRY_NAME` - 镜像名称（可选）

## 📚 文档导航

- **快速开始**：查看 [QUICK_BUILD_PUSH.md](./QUICK_BUILD_PUSH.md)
- **详细指南**：查看 [ALIYUN_REGISTRY.md](./ALIYUN_REGISTRY.md)
- **完整文档**：查看 [README_DOCKER_BUILD.md](./README_DOCKER_BUILD.md)

## 🎯 下一步

1. **创建阿里云镜像仓库**
   - 登录阿里云控制台
   - 创建命名空间和镜像仓库

2. **配置脚本**
   - 修改脚本中的命名空间
   - 确认 Registry 地址

3. **构建和推送**
   - 运行脚本或手动执行命令
   - 验证镜像是否推送成功

4. **使用镜像**
   - 拉取镜像
   - 运行容器
   - 测试应用

## ❓ 常见问题

### Q: 如何获取命名空间？

A: 在阿里云容器镜像服务控制台创建命名空间后，命名空间名称就是你的命名空间。

### Q: 如何获取登录凭证？

A: 在阿里云容器镜像服务控制台的「访问凭证」页面设置 Docker 登录密码。

### Q: 推送失败怎么办？

A: 检查：
1. 是否已登录：`docker login registry.cn-hangzhou.aliyuncs.com`
2. 命名空间是否正确
3. 是否有该命名空间的权限

## 📞 支持

如有问题，请查看详细文档或提交 Issue。

