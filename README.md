# AI旅行规划助手

一个基于Web的智能旅行规划应用，通过AI理解用户需求，自动生成详细的旅行路线和建议，并提供实时旅行辅助。

## 功能特性

- 🤖 **AI智能规划**：根据目的地、预算、偏好等信息，自动生成个性化旅行路线
- 🎤 **语音输入**：支持语音输入和文字输入两种方式创建计划
- 🗺️ **地图可视化**：在地图上直观展示行程路线和景点位置
- 💰 **费用管理**：支持记录旅行开销，AI提供预算分析和优化建议
- ☁️ **云端同步**：数据云端存储，支持多设备访问

## 技术栈

- **前端**：Next.js 14 + TypeScript + Tailwind CSS
- **后端**：Supabase (PostgreSQL + 用户认证)
- **AI模型**：阿里云通义千问 / OpenAI
- **地图服务**：高德地图API
- **语音识别**：浏览器原生 / 科大讯飞API

## 快速开始

### 使用 Docker 镜像（推荐）

#### 1. 拉取镜像

```bash
docker pull crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com/travel-planner-wy/web-ai-travel-planner:latest
```

#### 2. 运行容器

```bash
docker run -d \
  --name web-ai-travel-planner \
  -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_supabase_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key \
  -e NEXT_PUBLIC_LLM_API_KEY=your_llm_api_key \
  crpi-d5cvf2641cviwpw5.cn-hangzhou.personal.cr.aliyuncs.com/travel-planner-wy/web-ai-travel-planner:latest
```

#### 3. 访问应用

打开浏览器访问：http://localhost:3000

### 配置说明

运行前需要配置以下环境变量：

- `NEXT_PUBLIC_SUPABASE_URL`：Supabase项目URL（必需）
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`：Supabase匿名密钥（必需）
- `NEXT_PUBLIC_LLM_API_KEY`：AI模型API密钥（必需，用于生成旅行计划）
- `NEXT_PUBLIC_AMAP_KEY`：高德地图API Key（可选，用于地图功能）
- `NEXT_PUBLIC_LLM_API_URL`：AI模型API地址（可选，默认使用阿里云通义千问）
- `NEXT_PUBLIC_LLM_MODEL`：AI模型名称（可选，默认：qwen-plus）

**提示**：也可以在应用启动后，访问 `/settings` 页面进行配置。

### 本地开发

1. **克隆仓库**
   ```bash
   git clone https://github.com/kissyanw/web-ai-travel-planner.git
   cd web-ai-travel-planner
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境变量**
   
   创建 `.env.local` 文件：
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_LLM_API_KEY=your_llm_api_key
   NEXT_PUBLIC_AMAP_KEY=your_amap_key
   NEXT_PUBLIC_LLM_API_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
   NEXT_PUBLIC_LLM_MODEL=qwen-plus
   ```

4. **设置数据库**
   
   在 Supabase Dashboard 的 SQL Editor 中执行 `supabase/migrations/001_initial_schema.sql` 中的SQL语句。

5. **启动开发服务器**
   ```bash
   npm run dev
   ```
   
   访问 http://localhost:3000

## 使用说明

1. **注册/登录**：首次使用需要注册账户
2. **创建计划**：点击"创建新计划"，可以使用语音或文字输入需求
3. **查看行程**：在主面板查看所有计划，点击查看详细信息
4. **记录费用**：在计划详情页面记录旅行开销
5. **配置API**：在设置页面配置各种API密钥

## 获取 API 密钥

- **Supabase**：访问 https://supabase.com 创建项目
- **阿里云通义千问**：访问 https://dashscope.console.aliyun.com/ 获取API Key
- **高德地图**：访问 https://console.amap.com/dev/key/app 获取API Key

## GitHub 仓库

**项目地址**：https://github.com/kissyanw/web-ai-travel-planner

## 许可证

本项目为课程作业项目。

---

**注意**：所有API密钥应通过环境变量或设置页面配置，不要直接写在代码中或提交到GitHub。
