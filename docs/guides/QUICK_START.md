# ⚡ 快速开始 - 3步使用镜像

## 📦 镜像信息

```
crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com/travel-planner-wy/web-ai-travel-planner:latest
```

## 🚀 方式一：一键启动脚本（最简单）

### Windows 用户

1. 下载 `快速开始.bat`
2. 双击运行
3. 按提示输入配置信息
4. 完成！

### Linux/Mac 用户

```bash
chmod +x 快速开始.sh
./快速开始.sh
```

## 🚀 方式二：Docker 命令（推荐）

### 步骤 1: 拉取镜像

```bash
docker pull crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com/travel-planner-wy/web-ai-travel-planner:latest
```

### 步骤 2: 运行容器

```bash
docker run -d \
  --name web-ai-travel-planner \
  -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_supabase_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key \
  -e NEXT_PUBLIC_LLM_API_KEY=your_llm_api_key \
  crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com/travel-planner-wy/web-ai-travel-planner:latest
```

### 步骤 3: 访问应用

打开浏览器访问：**http://localhost:3000**

## 🚀 方式三：Docker Compose

1. **复制配置文件**
   ```bash
   cp docker-compose.example.yml docker-compose.yml
   cp .env.example .env
   ```

2. **编辑 `.env` 文件**，填入你的配置

3. **启动服务**
   ```bash
   docker-compose up -d
   ```

## 📋 必需配置

| 配置项 | 说明 | 获取方式 |
|--------|------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | [Supabase 控制台](https://supabase.com/) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | [Supabase 控制台](https://supabase.com/) |
| `NEXT_PUBLIC_LLM_API_KEY` | LLM API 密钥 | [阿里云通义千问](https://dashscope.console.aliyun.com/) |

## ✅ 验证安装

```bash
# 查看容器状态
docker ps | grep web-ai-travel-planner

# 查看日志
docker logs -f web-ai-travel-planner

# 检查健康状态
curl http://localhost:3000/api/health
```

## 📚 更多文档

- **详细指南**: 查看 `用户使用指南.md`
- **快速参考**: 查看 `README_用户指南.md`
- **故障排查**: 查看 `用户使用指南.md` 中的故障排查章节

## 🎯 常用命令

```bash
# 查看日志
docker logs -f web-ai-travel-planner

# 停止容器
docker stop web-ai-travel-planner

# 启动容器
docker start web-ai-travel-planner

# 重启容器
docker restart web-ai-travel-planner

# 删除容器
docker rm -f web-ai-travel-planner
```

---

**3步即可开始使用！** 🎉

