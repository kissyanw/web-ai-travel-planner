# 一键构建和推送指南

## 配置信息

- **Registry**: `crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com`
- **VPC地址**: `crpi-d5cvf2641cviwpw5-vpc.cn-hangzhou.personal.cr.aliyuncs.com`
- **用户名**: `wangyannju`
- **命名空间**: `travel-planner-wy`
- **镜像名称**: `web-ai-travel-planner`
- **完整镜像**: `crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com/travel-planner-wy/web-ai-travel-planner:latest`

## 快速开始

### 方式一：使用脚本（推荐）

运行 `立即构建.bat`：

```cmd
立即构建.bat
```

### 方式二：手动执行命令

```bash
# 1. 登录
docker login --username=wangyannju crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com

# 2. 构建镜像
docker build -t web-ai-travel-planner:latest -t crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com/travel-planner-wy/web-ai-travel-planner:latest .

# 3. 推送镜像
docker push crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com/travel-planner-wy/web-ai-travel-planner:latest
```

## 完整命令

所有命令已保存在 `完整命令.txt` 文件中，可以直接复制使用。

## 注意事项

1. **Docker Desktop 必须运行**
2. **需要先登录**: `docker login --username=wangyannju crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com`
3. **网络连接**: 确保可以访问 Docker Hub 和阿里云服务
4. **构建时间**: 首次构建可能需要 5-10 分钟

## 网络问题

如果遇到网络问题无法拉取 Docker Hub 镜像，可以：

1. **使用镜像加速器**: 在 Docker Desktop 设置中配置镜像加速器
2. **使用代理**: 配置网络代理
3. **手动拉取**: 先手动拉取基础镜像 `docker pull node:18-alpine`

## 更多信息

- 详细文档：参见 `ALIYUN_PERSONAL_REGISTRY.md`
- 构建指南：参见 `BUILD_INSTRUCTIONS.md`

