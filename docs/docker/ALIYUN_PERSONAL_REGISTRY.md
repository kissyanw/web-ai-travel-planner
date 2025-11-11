# 阿里云个人版容器镜像服务使用指南

## 配置信息

- **Registry地址**: `crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com`
- **VPC地址**: `crpi-d5cvf2641cviwpw5-vpc.cn-hangzhou.personal.cr.aliyuncs.com`
- **用户名**: `wangyannju`
- **命名空间**: `travel-planner-wy`
- **镜像名称**: `web-ai-travel-planner`
- **完整镜像地址**: `crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com/travel-planner-wy/web-ai-travel-planner:latest`

## 快速开始

### 1. 登录阿里云镜像仓库

```bash
docker login --username=wangyannju crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com
```

输入开通服务时设置的密码。

### 2. 构建镜像

```bash
docker build -t web-ai-travel-planner:latest .
```

### 3. 标记镜像

```bash
docker tag web-ai-travel-planner:latest crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com/travel-planner-wy/web-ai-travel-planner:latest
```

### 4. 推送镜像

```bash
docker push crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com/travel-planner-wy/web-ai-travel-planner:latest
```

## 一键构建和推送

### 使用脚本（推荐）

运行 `build-push-aliyun.bat`：

```cmd
build-push-aliyun.bat
```

或使用 `一键构建.bat`：

```cmd
一键构建.bat
```

### 完整命令序列

```bash
# 1. 登录
docker login --username=wangyannju crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com

# 2. 构建并标记
docker build -t web-ai-travel-planner:latest -t crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com/travel-planner-wy/web-ai-travel-planner:latest .

# 3. 推送
docker push crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com/travel-planner-wy/web-ai-travel-planner:latest
```

## 使用 VPC 地址（ECS 内网）

如果你在阿里云 ECS 上，可以使用 VPC 地址加速推送：

```bash
# 登录（使用 VPC 地址）
docker login --username=wangyannju crpi-d5cvf2641cviwpw5-vpc.cn-hangzhou.personal.cr.aliyuncs.com

# 标记镜像（使用 VPC 地址）
docker tag web-ai-travel-planner:latest crpi-d5cvf2641cviwpw5-vpc.cn-hangzhou.personal.cr.aliyuncs.com/travel-planner-wy/web-ai-travel-planner:latest

# 推送镜像（使用 VPC 地址）
docker push crpi-d5cvf2641cviwpw5-vpc.cn-hangzhou.personal.cr.aliyuncs.com/travel-planner-wy/web-ai-travel-planner:latest
```

## 拉取镜像

```bash
docker pull crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com/travel-planner-wy/web-ai-travel-planner:latest
```

## 运行镜像

```bash
docker run -d \
  --name web-ai-travel-planner \
  -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_supabase_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key \
  -e NEXT_PUBLIC_LLM_API_KEY=your_llm_api_key \
  crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com/travel-planner-wy/web-ai-travel-planner:latest
```

## 验证

### 查看本地镜像

```bash
docker images | findstr web-ai-travel-planner
```

### 查看推送的镜像

1. 登录 [阿里云容器镜像服务控制台](https://cr.console.aliyun.com/)
2. 进入个人版容器镜像服务
3. 查看命名空间 `travel-planner-wy`
4. 查看镜像仓库 `web-ai-travel-planner`
5. 确认镜像版本已存在

## 注意事项

1. **登录凭证**: 
   - 用户名为阿里云账号全名：`wangyannju`
   - 密码为开通服务时设置的密码
   - 可以在访问凭证页面修改密码

2. **RAM 用户限制**: 
   - 使用 RAM 用户（子账号）登录时，不支持企业别名带有英文半角句号（.）

3. **VPC 网络**: 
   - 如果在 VPC 网络中，使用 VPC 地址可以加速推送
   - VPC 地址不会消耗公网流量

4. **镜像版本号**: 
   - 可以使用 `latest`、`v1.0.0` 等标签
   - 建议使用语义化版本号

## 故障排查

### 登录失败

**错误**: `unauthorized` 或 `authentication required`

**解决**: 
1. 检查用户名是否正确：`wangyannju`
2. 检查密码是否正确
3. 在访问凭证页面重置密码
4. 重新登录

### 推送失败

**错误**: `denied` 或 `unauthorized`

**解决**: 
1. 确认已登录：`docker login --username=wangyannju crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com`
2. 检查命名空间是否存在：`travel-planner-wy`
3. 检查镜像名称是否正确：`web-ai-travel-planner`
4. 确认有推送权限

### 网络问题

**错误**: 连接超时或网络错误

**解决**: 
1. 检查网络连接
2. 如果在 ECS 上，尝试使用 VPC 地址
3. 检查防火墙设置

## 更多信息

- 详细文档：参见 [ALIYUN_REGISTRY.md](./ALIYUN_REGISTRY.md)
- 构建指南：参见 [BUILD_INSTRUCTIONS.md](./BUILD_INSTRUCTIONS.md)

## 支持

如有问题，请查看阿里云容器镜像服务文档或提交 Issue。

