# 🚀 Docker 镜像加速器配置指南

## 问题

无法从 Docker Hub 拉取镜像，错误信息：
```
ERROR: failed to fetch anonymous token: Get "https://auth.docker.io/token...
wsarecv: An existing connection was forcibly closed by the remote host.
```

## 解决方案：配置 Docker 镜像加速器

### 步骤 1: 打开 Docker Desktop 设置

1. 右键点击系统托盘中的 Docker 图标
2. 选择 **"Settings"** 或 **"设置"**

### 步骤 2: 进入 Docker Engine

1. 点击左侧菜单中的 **"Docker Engine"** 或 **"Docker 引擎"**
2. 你会看到一个 JSON 配置编辑器

### 步骤 3: 添加镜像加速器配置

在 JSON 配置中添加 `registry-mirrors` 字段：

```json
{
  "builder": {
    "gc": {
      "defaultKeepStorage": "20GB",
      "enabled": true
    }
  },
  "experimental": false,
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com",
    "https://mirror.baidubce.com"
  ]
}
```

**注意**: 如果配置文件中已有其他内容，只需添加 `registry-mirrors` 字段即可。

### 步骤 4: 应用并重启

1. 点击右上角的 **"Apply & Restart"** 或 **"应用并重启"**
2. 等待 Docker 重启完成（通常需要 30 秒到 1 分钟）

### 步骤 5: 验证配置

打开 PowerShell 或命令提示符，运行：

```bash
docker info | findstr -i "registry mirror"
```

如果看到镜像加速器地址，说明配置成功。

### 步骤 6: 测试拉取镜像

```bash
docker pull node:18-alpine
```

如果能够成功拉取，说明配置生效。

## 使用阿里云专属加速器（推荐）

如果你有阿里云账号，可以使用专属加速器，速度更快：

### 获取专属加速器地址

1. 登录 [阿里云容器镜像服务控制台](https://cr.console.aliyuncs.com/)
2. 进入 **"镜像加速器"**
3. 复制你的专属加速器地址（格式类似：`https://xxxxx.mirror.aliyuncs.com`）

### 配置专属加速器

在 Docker Engine 配置中添加：

```json
{
  "registry-mirrors": [
    "https://xxxxx.mirror.aliyuncs.com"
  ]
}
```

## 常用的镜像加速器地址

### 国内镜像加速器

- **中科大镜像**: `https://docker.mirrors.ustc.edu.cn`
- **网易镜像**: `https://hub-mirror.c.163.com`
- **百度云镜像**: `https://mirror.baidubce.com`
- **阿里云镜像**: `https://your-accelerator.mirror.aliyuncs.com` (需要阿里云账号)

### 配置多个镜像加速器

可以同时配置多个镜像加速器，Docker 会按顺序尝试：

```json
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com",
    "https://mirror.baidubce.com"
  ]
}
```

## 配置完成后的操作

### 1. 测试拉取基础镜像

```bash
docker pull node:18-alpine
```

### 2. 构建项目镜像

```bash
docker build -t web-ai-travel-planner:latest .
```

### 3. 登录并推送镜像

```bash
# 登录
docker login --username=wangyannju crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com

# 构建并标记
docker build -t web-ai-travel-planner:latest -t crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com/travel-planner-wy/web-ai-travel-planner:latest .

# 推送
docker push crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com/travel-planner-wy/web-ai-travel-planner:latest
```

## 故障排查

### 问题 1: 配置后仍然无法拉取镜像

**解决方案**:
1. 检查 JSON 配置格式是否正确
2. 确保镜像加速器地址正确
3. 尝试使用不同的镜像加速器
4. 检查网络连接

### 问题 2: Docker 重启失败

**解决方案**:
1. 检查 JSON 配置语法是否正确
2. 移除可能有问题的配置
3. 重启 Docker Desktop

### 问题 3: 镜像加速器速度慢

**解决方案**:
1. 使用阿里云专属加速器
2. 尝试不同的镜像加速器
3. 检查网络连接速度

## 验证配置是否生效

运行以下命令查看 Docker 信息：

```bash
docker info
```

在输出中查找 `Registry Mirrors` 部分，应该能看到你配置的镜像加速器地址。

## 下一步

配置完成后，继续执行构建和推送：

1. 运行 `build-with-mirror.bat` 脚本
2. 或手动执行构建命令
3. 查看 `README_立即开始.md` 获取完整指南

---

**配置镜像加速器后，网络问题应该就能解决了！** 🎉

