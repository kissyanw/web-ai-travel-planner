# 阿里云镜像仓库使用指南

本文档介绍如何将 Docker 镜像构建并推送到阿里云容器镜像服务（ACR）。

## 前置要求

1. **阿里云账号**：拥有阿里云账号
2. **容器镜像服务**：已开通阿里云容器镜像服务
3. **命名空间**：已创建镜像仓库命名空间
4. **Docker**：已安装 Docker

## 步骤一：创建阿里云镜像仓库

### 1. 登录阿里云控制台

访问 [阿里云容器镜像服务控制台](https://cr.console.aliyun.com/)

### 2. 创建命名空间

1. 进入「命名空间」页面
2. 点击「创建命名空间」
3. 填写命名空间名称（例如：`travel-planner`）
4. 选择地域（建议选择 `华东1（杭州）`）
5. 点击「确定」

### 3. 创建镜像仓库

1. 进入「镜像仓库」页面
2. 点击「创建镜像仓库」
3. 选择命名空间
4. 填写仓库名称（例如：`web-ai-travel-planner`）
5. 选择仓库类型：`私有` 或 `公开`
6. 点击「下一步」→「创建镜像仓库」

## 步骤二：配置 Docker 登录

### 1. 获取登录凭证

1. 在阿里云控制台，进入「访问凭证」页面
2. 设置 Docker 登录密码（如果未设置）
3. 记录以下信息：
   - **Registry 地址**：`registry.cn-hangzhou.aliyuncs.com`（根据你选择的地域）
   - **用户名**：你的阿里云账号
   - **密码**：你设置的 Docker 登录密码

### 2. 登录 Docker

```bash
docker login registry.cn-hangzhou.aliyuncs.com
```

输入用户名和密码完成登录。

**Windows 用户**：
```cmd
docker login registry.cn-hangzhou.aliyuncs.com
```

## 步骤三：构建和推送镜像

### 方式一：使用脚本（推荐）

#### Linux/Mac

1. **修改脚本配置**

   编辑 `docker-build-push.sh`，修改以下变量：

   ```bash
   REGISTRY="registry.cn-hangzhou.aliyuncs.com"  # 根据你的地域修改
   NAMESPACE="your-namespace"  # 替换为你的命名空间
   ```

2. **运行脚本**

   ```bash
   chmod +x docker-build-push.sh
   ./docker-build-push.sh [tag] [namespace]
   ```

   例如：
   ```bash
   ./docker-build-push.sh latest travel-planner
   ```

#### Windows

1. **修改脚本配置**

   编辑 `docker-build-push.bat`，修改以下变量：

   ```bat
   set REGISTRY=registry.cn-hangzhou.aliyuncs.com
   set NAMESPACE=your-namespace
   ```

2. **运行脚本**

   ```cmd
   docker-build-push.bat [tag] [namespace]
   ```

   例如：
   ```cmd
   docker-build-push.bat latest travel-planner
   ```

### 方式二：手动构建和推送

#### 1. 构建镜像

```bash
docker build -t web-ai-travel-planner:latest .
```

#### 2. 标记镜像

```bash
docker tag web-ai-travel-planner:latest \
  registry.cn-hangzhou.aliyuncs.com/your-namespace/web-ai-travel-planner:latest
```

#### 3. 推送镜像

```bash
docker push registry.cn-hangzhou.aliyuncs.com/your-namespace/web-ai-travel-planner:latest
```

### 方式三：使用 Docker Compose

更新 `docker-compose.yml`，添加镜像配置：

```yaml
services:
  app:
    image: registry.cn-hangzhou.aliyuncs.com/your-namespace/web-ai-travel-planner:latest
    # ... 其他配置
```

然后构建和推送：

```bash
docker-compose build
docker-compose push
```

## 步骤四：验证镜像

### 1. 在阿里云控制台查看

1. 进入「镜像仓库」页面
2. 找到你的镜像仓库
3. 点击进入，查看镜像版本

### 2. 拉取镜像测试

```bash
docker pull registry.cn-hangzhou.aliyuncs.com/your-namespace/web-ai-travel-planner:latest
```

### 3. 运行镜像

```bash
docker run -d \
  --name web-ai-travel-planner \
  -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_supabase_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key \
  -e NEXT_PUBLIC_LLM_API_KEY=your_llm_api_key \
  registry.cn-hangzhou.aliyuncs.com/your-namespace/web-ai-travel-planner:latest
```

## 使用 GitHub Actions 自动构建和推送

项目已配置 GitHub Actions 工作流，可以自动构建和推送镜像。

### 1. 配置 GitHub Secrets

在 GitHub 仓库设置中添加以下 Secrets：

1. 进入仓库「Settings」→「Secrets and variables」→「Actions」
2. 点击「New repository secret」
3. 添加以下 Secrets：

   - `ALIYUN_REGISTRY_USERNAME`：阿里云账号用户名
   - `ALIYUN_REGISTRY_PASSWORD`：阿里云 Docker 登录密码
   - `ALIYUN_REGISTRY_NAME`（可选）：镜像仓库名称，默认为 `web-ai-travel-planner`

### 2. 触发自动构建

当代码推送到 `main` 或 `master` 分支时，GitHub Actions 会自动：

1. 构建 Docker 镜像
2. 推送到阿里云镜像仓库
3. 使用分支名和 SHA 作为标签

### 3. 查看构建状态

1. 进入 GitHub 仓库「Actions」页面
2. 查看「Build and Push Docker Image」工作流
3. 查看构建日志

## 镜像标签策略

建议使用以下标签策略：

- `latest`：最新版本
- `v1.0.0`：语义化版本号
- `main`：主分支构建
- `main-abc1234`：带 SHA 的构建

## 不同地域的 Registry 地址

根据你选择的地域，使用对应的 Registry 地址：

| 地域 | Registry 地址 |
|------|---------------|
| 华东1（杭州） | `registry.cn-hangzhou.aliyuncs.com` |
| 华东2（上海） | `registry.cn-shanghai.aliyuncs.com` |
| 华北1（青岛） | `registry.cn-qingdao.aliyuncs.com` |
| 华北2（北京） | `registry.cn-beijing.aliyuncs.com` |
| 华北3（张家口） | `registry.cn-zhangjiakou.aliyuncs.com` |
| 华南1（深圳） | `registry.cn-shenzhen.aliyuncs.com` |
| 中国（香港） | `registry.cn-hongkong.aliyuncs.com` |
| 美国（硅谷） | `registry.us-west-1.aliyuncs.com` |
| 美国（弗吉尼亚） | `registry.us-east-1.aliyuncs.com` |
| 新加坡 | `registry.ap-southeast-1.aliyuncs.com` |
| 澳大利亚（悉尼） | `registry.ap-southeast-2.aliyuncs.com` |
| 马来西亚（吉隆坡） | `registry.ap-southeast-3.aliyuncs.com` |
| 印度尼西亚（雅加达） | `registry.ap-southeast-5.aliyuncs.com` |
| 日本（东京） | `registry.ap-northeast-1.aliyuncs.com` |
| 印度（孟买） | `registry.ap-south-1.aliyuncs.com` |
| 德国（法兰克福） | `registry.eu-central-1.aliyuncs.com` |
| 英国（伦敦） | `registry.eu-west-1.aliyuncs.com` |
| 阿联酋（迪拜） | `registry.me-east-1.aliyuncs.com` |

## 常见问题

### Q: 推送镜像时提示「unauthorized」？

A: 请检查：
1. 是否已登录：`docker login registry.cn-hangzhou.aliyuncs.com`
2. 用户名和密码是否正确
3. 是否有该命名空间的权限

### Q: 如何删除镜像？

A: 在阿里云控制台：
1. 进入「镜像仓库」页面
2. 找到你的镜像仓库
3. 点击「管理」
4. 选择要删除的镜像版本
5. 点击「删除」

### Q: 如何设置镜像为公开？

A: 在创建镜像仓库时选择「公开」，或后续在仓库设置中修改。

### Q: 如何加速镜像拉取？

A: 使用阿里云容器镜像服务的加速地址，或配置镜像加速器。

## 参考文档

- [阿里云容器镜像服务文档](https://help.aliyun.com/product/60716.html)
- [Docker 官方文档](https://docs.docker.com/)
- [GitHub Actions 文档](https://docs.github.com/en/actions)

## 支持

如有问题，请提交 Issue 或联系开发者。

