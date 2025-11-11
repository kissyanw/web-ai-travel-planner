# 🚀 立即开始 - 构建和推送 Docker 镜像

## ✅ 已配置信息

- **Registry**: `crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com`
- **命名空间**: `travel-planner-wy`
- **镜像名称**: `web-ai-travel-planner`
- **用户名**: `wangyannju`
- **完整镜像**: `crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com/travel-planner-wy/web-ai-travel-planner:latest`

## 🎯 三步完成

### 步骤 1: 登录（手动）

打开命令提示符，执行：

```bash
docker login --username=wangyannju crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com
```

输入密码后继续。

### 步骤 2: 构建镜像

```bash
docker build -t web-ai-travel-planner:latest -t crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com/travel-planner-wy/web-ai-travel-planner:latest .
```

### 步骤 3: 推送镜像

```bash
docker push crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com/travel-planner-wy/web-ai-travel-planner:latest
```

## 📝 或使用脚本

运行 `构建推送.bat`：

```cmd
构建推送.bat
```

脚本会自动检查 Docker 状态，提示你登录，然后构建和推送镜像。

## ⚠️ 网络问题

如果遇到无法从 Docker Hub 拉取镜像的问题：

1. **配置镜像加速器**（推荐）
   - 打开 Docker Desktop 设置
   - 进入 "Docker Engine"
   - 添加镜像加速器配置
   - 参见 `网络问题解决方案.md`

2. **使用代理**
   - 配置网络代理
   - 或在 Docker Desktop 中配置代理

3. **手动拉取基础镜像**
   ```bash
   docker pull node:18-alpine
   ```

## 📚 更多信息

- 详细文档：`ALIYUN_PERSONAL_REGISTRY.md`
- 网络问题：`网络问题解决方案.md`
- 完整命令：`完整命令.txt`

## 🎉 完成后的操作

镜像推送成功后，你可以：

1. 在阿里云控制台查看镜像
2. 拉取镜像：`docker pull crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com/travel-planner-wy/web-ai-travel-planner:latest`
3. 运行镜像：`docker run -d --name web-ai-travel-planner -p 3000:3000 crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com/travel-planner-wy/web-ai-travel-planner:latest`

---

**现在就开始构建吧！** 🚀

