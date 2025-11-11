# Docker 镜像构建和推送指南

本指南介绍如何将项目打包成 Docker 镜像并推送到阿里云镜像仓库。

## 快速开始

### 方式一：使用一键脚本（推荐）

#### Linux/Mac

```bash
# 1. 编辑脚本，修改命名空间
vim docker-build-push.sh
# 将 NAMESPACE 改为你的阿里云镜像仓库命名空间

# 2. 添加执行权限
chmod +x docker-build-push.sh

# 3. 运行脚本
./docker-build-push.sh latest your-namespace
```

#### Windows

```cmd
REM 1. 编辑脚本，修改命名空间
REM 编辑 docker-build-push.bat，将 NAMESPACE 改为你的命名空间

REM 2. 运行脚本
docker-build-push.bat latest your-namespace
```

### 方式二：手动步骤

#### 1. 登录阿里云镜像仓库

```bash
docker login registry.cn-hangzhou.aliyuncs.com
```

输入你的阿里云账号和 Docker 登录密码。

#### 2. 构建镜像

```bash
docker build -t web-ai-travel-planner:latest .
```

#### 3. 标记镜像

```bash
docker tag web-ai-travel-planner:latest \
  registry.cn-hangzhou.aliyuncs.com/your-namespace/web-ai-travel-planner:latest
```

#### 4. 推送镜像

```bash
docker push registry.cn-hangzhou.aliyuncs.com/your-namespace/web-ai-travel-planner:latest
```

## 完整示例

假设你的阿里云镜像仓库配置如下：

- **地域**：华东1（杭州）
- **命名空间**：`travel-planner`
- **镜像名称**：`web-ai-travel-planner`
- **标签**：`latest`

### 步骤

```bash
# 1. 登录阿里云镜像仓库
docker login registry.cn-hangzhou.aliyuncs.com

# 2. 构建镜像
docker build -t web-ai-travel-planner:latest .

# 3. 标记镜像
docker tag web-ai-travel-planner:latest \
  registry.cn-hangzhou.aliyuncs.com/travel-planner/web-ai-travel-planner:latest

# 4. 推送镜像
docker push registry.cn-hangzhou.aliyuncs.com/travel-planner/web-ai-travel-planner:latest
```

### 验证

```bash
# 查看本地镜像
docker images | grep web-ai-travel-planner

# 拉取镜像测试
docker pull registry.cn-hangzhou.aliyuncs.com/travel-planner/web-ai-travel-planner:latest
```

## 使用推送的镜像

### 拉取镜像

```bash
docker pull registry.cn-hangzhou.aliyuncs.com/travel-planner/web-ai-travel-planner:latest
```

### 运行容器

```bash
docker run -d \
  --name web-ai-travel-planner \
  -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_supabase_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key \
  -e NEXT_PUBLIC_LLM_API_KEY=your_llm_api_key \
  registry.cn-hangzhou.aliyuncs.com/travel-planner/web-ai-travel-planner:latest
```

## 配置说明

### 必需配置

在构建镜像前，确保已配置：

1. **阿里云镜像仓库**
   - 创建命名空间
   - 创建镜像仓库
   - 获取登录凭证

2. **环境变量**（可选，可在运行时配置）
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_LLM_API_KEY`

### 构建参数

Dockerfile 支持以下构建参数：

- `NEXT_PUBLIC_SUPABASE_URL`：Supabase 项目 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`：Supabase 匿名密钥
- `NEXT_PUBLIC_AMAP_KEY`：高德地图 API Key
- `NEXT_PUBLIC_LLM_API_KEY`：LLM API 密钥
- `NEXT_PUBLIC_LLM_API_URL`：LLM API URL
- `NEXT_PUBLIC_LLM_MODEL`：LLM 模型名称

### 使用构建参数

```bash
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=your_url \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \
  --build-arg NEXT_PUBLIC_LLM_API_KEY=your_api_key \
  -t web-ai-travel-planner:latest .
```

## 使用 GitHub Actions 自动构建

项目已配置 GitHub Actions 工作流，可以自动构建和推送镜像。

### 配置 GitHub Secrets

在 GitHub 仓库设置中添加以下 Secrets：

1. `ALIYUN_REGISTRY_USERNAME`：阿里云账号用户名
2. `ALIYUN_REGISTRY_PASSWORD`：阿里云 Docker 登录密码
3. `ALIYUN_REGISTRY_NAMESPACE`：镜像仓库命名空间
4. `ALIYUN_REGISTRY_NAME`（可选）：镜像名称，默认为 `web-ai-travel-planner`

### 触发构建

当代码推送到 `main` 或 `master` 分支时，GitHub Actions 会自动：

1. 构建 Docker 镜像
2. 推送到阿里云镜像仓库
3. 使用分支名和 SHA 作为标签

## 不同地域的 Registry 地址

根据你选择的地域，使用对应的 Registry 地址：

| 地域 | Registry 地址 |
|------|---------------|
| 华东1（杭州） | `registry.cn-hangzhou.aliyuncs.com` |
| 华东2（上海） | `registry.cn-shanghai.aliyuncs.com` |
| 华北1（青岛） | `registry.cn-qingdao.aliyuncs.com` |
| 华北2（北京） | `registry.cn-beijing.aliyuncs.com` |
| 华南1（深圳） | `registry.cn-shenzhen.aliyuncs.com` |

## 常见问题

### Q: 如何获取阿里云 Docker 登录密码？

A: 在阿里云容器镜像服务控制台的「访问凭证」页面设置。

### Q: 推送镜像时提示「unauthorized」？

A: 请检查：
1. 是否已登录：`docker login registry.cn-hangzhou.aliyuncs.com`
2. 用户名和密码是否正确
3. 是否有该命名空间的权限

### Q: 如何删除镜像？

A: 在阿里云控制台的镜像仓库管理页面删除。

### Q: 如何设置镜像为公开？

A: 在创建镜像仓库时选择「公开」，或后续在仓库设置中修改。

## 更多信息

- **详细文档**：参见 [ALIYUN_REGISTRY.md](./ALIYUN_REGISTRY.md)
- **快速指南**：参见 [build-and-push.md](./build-and-push.md)
- **Docker 部署**：参见 [DOCKER.md](./DOCKER.md)

## 支持

如有问题，请提交 Issue 或联系开发者。

