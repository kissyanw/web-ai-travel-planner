# 🛠️ 脚本目录

## 📦 Docker 脚本

位于 `docker/` 目录：

### 构建脚本
- `docker-build.bat` / `docker-build.sh` - 构建Docker镜像
- `build-with-mirror.bat` - 使用镜像加速器构建

### 推送脚本
- `docker-build-push.bat` / `docker-build-push.sh` - 构建并推送镜像
- `build-push-aliyun.bat` - 推送到阿里云
- `立即推送.bat` - 快速推送最新镜像
- `构建推送.bat` - 构建和推送脚本

### 工具脚本
- `解决网络问题.bat` - 网络问题解决指南

## 🔨 构建脚本

位于 `build/` 目录：

- `一键构建.bat` - 一键构建脚本
- `quick-build.bat` - 快速构建脚本
- `立即构建.bat` - 立即构建脚本
- `构建命令.bat` - 构建命令脚本
- `执行构建.bat` - 执行构建脚本
- `最终命令.bat` - 最终命令脚本
- `build-and-push.ps1` - PowerShell构建和推送脚本

## 📖 使用说明

### Windows

```cmd
# 构建镜像
scripts\docker\docker-build.bat

# 构建并推送
scripts\docker\构建推送.bat

# 快速推送
scripts\docker\立即推送.bat
```

### Linux/Mac

```bash
# 构建镜像
chmod +x scripts/docker/docker-build.sh
./scripts/docker/docker-build.sh

# 构建并推送
chmod +x scripts/docker/docker-build-push.sh
./scripts/docker/docker-build-push.sh
```

---

**详细文档请查看 [docs/](../docs/) 目录**


