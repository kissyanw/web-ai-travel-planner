# AI旅行规划助手

一个基于Web的智能旅行规划应用，通过AI理解用户需求，自动生成详细的旅行路线和建议，并提供实时旅行辅助。

## 功能特性

### 1. 智能行程规划
- **语音/文字输入**：支持语音输入和文字输入两种方式
- **AI自动生成**：根据目的地、日期、预算、同行人数、旅行偏好等信息，自动生成个性化旅行路线
- **详细信息**：包括交通、住宿、景点、餐厅等详细信息
- **地图可视化**：在地图上直观展示行程路线和景点位置

### 2. 费用预算与管理
- **AI预算分析**：智能分析旅行预算执行情况
- **费用记录**：支持语音和手动记录旅行开销
- **实时监控**：实时显示总支出和剩余预算
- **优化建议**：AI提供预算优化建议

### 3. 用户管理与数据存储
- **注册登录系统**：用户账户管理
- **云端同步**：旅行计划、偏好设置、费用记录等数据云端同步
- **多设备访问**：支持多设备查看和修改

## 技术栈

### 前端
- **Next.js 14**：React框架，支持服务端渲染
- **TypeScript**：类型安全
- **Tailwind CSS**：样式框架
- **Lucide React**：图标库

### 后端服务
- **Supabase**：数据库和用户认证
  - PostgreSQL数据库
  - 用户认证系统
  - Row Level Security (RLS)

### 第三方API集成
- **语音识别**：
  - 科大讯飞语音识别API（可选）
  - 浏览器原生语音识别（Chrome/Edge）
- **地图服务**：高德地图API
- **AI模型**：支持阿里云通义千问、OpenAI等大语言模型

## 项目结构

```
web-ai-travel-planner/
├── src/
│   ├── app/                 # Next.js App Router页面
│   │   ├── auth/           # 登录注册页面
│   │   ├── dashboard/      # 主面板
│   │   ├── plan/          # 旅行计划页面
│   │   │   ├── new/       # 创建新计划
│   │   │   └── [id]/      # 计划详情
│   │   ├── settings/      # 设置页面
│   │   ├── api/           # API路由
│   │   └── layout.tsx     # 根布局
│   ├── components/        # React组件
│   │   ├── VoiceInput.tsx    # 语音输入组件
│   │   ├── MapView.tsx       # 地图视图组件
│   │   └── providers.tsx     # 上下文提供者
│   ├── hooks/             # 自定义Hooks
│   │   └── useAuth.ts     # 认证Hook
│   └── lib/               # 工具函数
│       ├── supabase.ts    # Supabase客户端
│       ├── config.ts      # 配置管理
│       ├── ai.ts          # AI相关功能
│       └── speech.ts      # 语音识别
├── supabase/
│   └── migrations/        # 数据库迁移
├── .github/
│   └── workflows/         # GitHub Actions
├── Dockerfile             # Docker镜像构建文件
├── docker-compose.yml     # Docker Compose配置
└── README.md             # 本文档
```

## 快速开始

### 前置要求

- Node.js 18+ 
- npm 或 yarn
- Docker（可选，用于容器化部署）
- Supabase账户（用于数据库和认证）

> **Windows 用户**：如果你是 Windows 系统且没有安装 Node.js，请先查看 [Windows 安装指南](./INSTALL_WINDOWS.md) 了解详细安装步骤。

### 本地开发

> **📘 详细配置指南**：如果你是第一次运行此项目，请先查看 [本地运行配置指南](./SETUP_GUIDE.md)，该指南包含完整的步骤说明和常见问题解答。

1. **克隆仓库**
   ```bash
   git clone <your-repo-url>
   cd web-ai-travel-planner
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置 Supabase（必需）**
   
   Supabase 用于用户认证和数据存储，必须配置才能运行应用。
   
   - 创建 Supabase 项目：https://supabase.com
   - 获取 Project URL 和 anon public key
   - 配置方式（选择其一）：
     - **环境变量**：创建 `.env.local` 文件
     - **应用设置**：访问 `/settings` 页面配置
   
   📝 详细步骤请参考 [SETUP_GUIDE.md](./SETUP_GUIDE.md)

4. **设置数据库表结构**
   
   在 Supabase Dashboard 的 SQL Editor 中执行 `supabase/migrations/001_initial_schema.sql` 中的SQL语句。

5. **配置其他 API（可选）**
   
   创建 `.env.local` 文件（或在设置页面配置）：
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_AMAP_KEY=your_amap_key          # 可选，用于地图功能
   NEXT_PUBLIC_LLM_API_KEY=your_llm_api_key     # 必需，用于AI功能
   NEXT_PUBLIC_LLM_API_URL=https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
   NEXT_PUBLIC_LLM_MODEL=qwen-plus
   ```

6. **启动开发服务器**
   ```bash
   npm run dev
   ```

   访问 http://localhost:3000

### Docker部署

#### 方式一：使用docker-compose

1. **配置环境变量**
   
   创建 `.env` 文件：
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_AMAP_KEY=your_amap_key
   NEXT_PUBLIC_LLM_API_KEY=your_llm_api_key
   NEXT_PUBLIC_LLM_API_URL=https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
   NEXT_PUBLIC_LLM_MODEL=qwen-plus
   ```

2. **构建并运行**
   ```bash
   docker-compose up -d
   ```

#### 方式二：直接使用Docker

1. **构建镜像**
   ```bash
   docker build -t web-ai-travel-planner .
   ```

2. **运行容器**
   ```bash
   docker run -p 3000:3000 \
     -e NEXT_PUBLIC_SUPABASE_URL=your_supabase_url \
     -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key \
     -e NEXT_PUBLIC_AMAP_KEY=your_amap_key \
     -e NEXT_PUBLIC_LLM_API_KEY=your_llm_api_key \
     -e NEXT_PUBLIC_LLM_API_URL=https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation \
     web-ai-travel-planner
   ```

### 使用阿里云容器镜像仓库

项目已配置GitHub Actions自动构建Docker镜像并推送到阿里云容器镜像仓库。

#### 配置GitHub Secrets

在GitHub仓库设置中添加以下Secrets：

- `ALIYUN_REGISTRY_USERNAME`：阿里云容器镜像仓库用户名
- `ALIYUN_REGISTRY_PASSWORD`：阿里云容器镜像仓库密码
- `ALIYUN_REGISTRY_NAME`（可选）：镜像名称，默认为 `web-ai-travel-planner`

#### 拉取镜像

```bash
docker pull registry.cn-hangzhou.aliyuncs.com/web-ai-travel-planner:main
```

#### 运行镜像

```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_supabase_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key \
  -e NEXT_PUBLIC_AMAP_KEY=your_amap_key \
  -e NEXT_PUBLIC_LLM_API_KEY=your_llm_api_key \
  -e NEXT_PUBLIC_LLM_API_URL=https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation \
  registry.cn-hangzhou.aliyuncs.com/web-ai-travel-planner:main
```

## API密钥配置

### Supabase配置

1. 访问 https://supabase.com 注册账户
2. 创建新项目
3. 在项目设置中获取URL和Anon Key

### 高德地图API Key

1. 访问 https://console.amap.com/dev/key/app
2. 注册并创建应用
3. 获取Web服务API Key

### 科大讯飞API（可选）

1. 访问 https://www.xfyun.cn/
2. 注册并创建应用
3. 获取App ID、API Key和API Secret

### 大语言模型API

#### 阿里云通义千问（推荐）

使用阿里云百炼平台API Key：

1. **API Key**：在阿里云百炼平台获取
2. **Base URL**：
   - 国内：`https://dashscope.aliyuncs.com/compatible-mode/v1`
   - 新加坡地域：`https://dashscope-intl.aliyuncs.com/compatible-mode/v1`
   - 代码会自动添加 `/chat/completions` 路径
3. **模型**：`qwen-plus` 或 `qwen-turbo`

**配置示例**：
```
NEXT_PUBLIC_LLM_API_KEY=sk-your-api-key-here
NEXT_PUBLIC_LLM_API_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
NEXT_PUBLIC_LLM_MODEL=qwen-plus
```

**注意**：
- 可以配置基础URL（`/compatible-mode/v1`），代码会自动添加 `/chat/completions`
- 也可以直接配置完整URL：`https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions`
- 代码会自动检测并修正URL格式

#### OpenAI（备选）

1. 访问 https://platform.openai.com/
2. 创建API Key
3. API URL：`https://api.openai.com/v1/chat/completions`
4. 模型：`gpt-3.5-turbo` 或 `gpt-4`

## 使用说明

### 创建旅行计划

1. 登录后，点击"创建新计划"
2. 可以使用语音输入或表单填写：
   - **语音输入**：点击"开始语音输入"按钮，说出你的需求，例如："我想去日本，5天，预算1万元，喜欢美食和动漫，带孩子"
   - **表单填写**：手动填写目的地、天数、预算、同行人数等信息
3. 选择旅行偏好（美食、自然风光、历史文化等）
4. 点击"生成旅行计划"，AI将自动生成详细的行程

### 查看行程

1. 在主面板可以看到所有旅行计划
2. 点击计划卡片查看详细信息
3. 地图上会显示所有景点的位置
4. 可以切换查看不同天的行程

### 记录费用

1. 在计划详情页面，可以使用语音或手动记录费用
2. 点击活动旁边的"记录费用"按钮
3. 查看总支出和剩余预算
4. 点击"AI预算分析"获取智能建议

### 设置API密钥

1. 点击右上角设置图标
2. 填写各种API密钥
3. 点击"保存配置"
4. 配置会保存在浏览器本地

## 数据库结构

### travel_plans表

存储用户的旅行计划：

- `id`: 计划ID
- `user_id`: 用户ID
- `destination`: 目的地
- `days`: 天数
- `budget`: 预算
- `travelers`: 同行人数
- `preferences`: 旅行偏好数组
- `itinerary`: 行程详情（JSONB）
- `estimated_cost`: 预估费用
- `created_at`: 创建时间
- `updated_at`: 更新时间

### expenses表

存储费用记录：

- `id`: 费用ID
- `plan_id`: 计划ID
- `user_id`: 用户ID
- `activity_id`: 活动ID
- `activity_name`: 活动名称
- `amount`: 金额
- `description`: 描述
- `created_at`: 创建时间

## 开发说明

### 项目特点

- ✅ 完全类型安全（TypeScript）
- ✅ 响应式设计，支持移动端
- ✅ 安全的API密钥管理（不存储在代码中）
- ✅ Row Level Security确保数据安全
- ✅ Docker容器化部署
- ✅ CI/CD自动构建

### 代码规范

- 使用TypeScript进行类型检查
- 遵循ESLint规则
- 组件化开发
- 使用Next.js App Router

## 常见问题

### Q: 语音识别不工作？
A: 请确保使用Chrome或Edge浏览器，并允许浏览器访问麦克风权限。如果配置了科大讯飞API，请检查配置是否正确。

### Q: 地图不显示？
A: 请确保已在高德地图控制台创建应用并获取API Key，然后在设置页面配置。

### Q: AI生成计划失败？
A: 请检查LLM API Key是否正确，API URL是否正确，网络是否正常。建议使用阿里云通义千问API。

### Q: 如何重置数据库？
A: 在Supabase Dashboard中删除相关表，然后重新执行迁移SQL。

## 许可证

本项目为课程作业项目。

## 联系方式

如有问题，请提交Issue或联系开发者。

---

**注意**：本项目中的所有API密钥都应该通过环境变量或设置页面配置，**不要**直接写在代码中或提交到GitHub。

## GitHub仓库

GitHub Repository: https://github.com/your-username/web-ai-travel-planner

## Docker镜像

阿里云镜像仓库地址：
```
registry.cn-hangzhou.aliyuncs.com/web-ai-travel-planner:main
```

拉取命令：
```bash
docker pull registry.cn-hangzhou.aliyuncs.com/web-ai-travel-planner:main
```