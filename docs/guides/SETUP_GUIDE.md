# 本地运行配置指南

本指南将帮助你完成项目的本地配置，确保应用能够正常运行。

## 第一步：安装依赖

如果你还没有安装依赖，请运行：

```powershell
npm install
```

## 第二步：配置 Supabase（必需）

Supabase 用于用户认证和数据存储，这是运行应用的**必需步骤**。

### 2.1 创建 Supabase 项目

1. **访问 Supabase**
   - 打开：https://supabase.com
   - 如果没有账户，点击 "Start your project" 注册

2. **创建新项目**
   - 登录后点击 "New Project"
   - 填写项目信息：
     - **Name**: 项目名称（任意）
     - **Database Password**: 设置数据库密码（请保存好）
     - **Region**: 选择离你最近的区域（如 `Southeast Asia (Singapore)`）
   - 点击 "Create new project"
   - 等待项目初始化完成（约2-3分钟）

### 2.2 获取 Supabase 配置信息

1. **进入项目设置**
   - 在项目 Dashboard 左侧菜单，点击 "Settings"（齿轮图标）
   - 点击 "API"

2. **复制配置信息**
   - **Project URL**: 在 "Project URL" 部分复制（类似 `https://xxxxx.supabase.co`）
   - **anon public key**: 在 "Project API keys" 部分，找到 `anon` `public` 的 key，点击眼睛图标显示并复制

### 2.3 配置方式（选择其一）

#### 方式一：环境变量文件（推荐用于开发）

1. **创建 `.env.local` 文件**
   - 在项目根目录创建 `.env.local` 文件（注意：文件名以点开头）
   - Windows 用户可以用命令创建：
     ```powershell
     New-Item -Path .env.local -ItemType File
     ```

2. **添加配置**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **保存文件**
   - 确保文件已保存

#### 方式二：应用内设置页面（推荐用于首次体验）

1. **启动应用**
   ```powershell
   npm run dev
   ```

2. **访问设置页面**
   - 打开浏览器访问：http://localhost:3000
   - 如果显示配置提示，点击 "前往设置页面"
   - 或直接访问：http://localhost:3000/settings

3. **填写配置**
   - 在 "Supabase配置" 部分填写：
     - **Supabase URL**: 你的 Project URL
     - **Supabase Anon Key**: 你的 anon public key
   - 点击 "保存配置"

### 2.4 设置数据库表结构

1. **打开 SQL Editor**
   - 在 Supabase Dashboard 左侧菜单，点击 "SQL Editor"

2. **执行迁移脚本**
   - 点击 "New query"
   - 复制项目中的 `supabase/migrations/001_initial_schema.sql` 文件内容
   - 粘贴到 SQL Editor 中
   - 点击 "Run" 或按 `Ctrl+Enter` 执行

3. **验证创建成功**
   - 在左侧菜单点击 "Table Editor"
   - 应该能看到两个表：
     - `travel_plans`
     - `expenses`

## 第三步：配置其他 API（可选）

以下API是可选的，但启用后可以使用对应功能：

### 3.1 高德地图 API（推荐）

用于显示地图和景点位置。

1. **申请 API Key**
   - 访问：https://console.amap.com/dev/key/app
   - 注册/登录高德开放平台
   - 创建新应用，选择 "Web端(JS API)"
   - 获取 Key

2. **配置**
   - 在 `.env.local` 添加：
     ```env
     NEXT_PUBLIC_AMAP_KEY=你的高德地图Key
     ```
   - 或在设置页面配置

### 3.2 大语言模型 API（必需用于AI功能）

用于生成旅行计划和预算分析。

#### 选项A：阿里云通义千问（推荐）

1. **申请 API Key**
   - 访问：https://dashscope.aliyuncs.com/
   - 登录阿里云账户
   - 创建 API Key

2. **配置**
   - 在 `.env.local` 添加：
     ```env
     NEXT_PUBLIC_LLM_API_KEY=你的阿里云API Key
     NEXT_PUBLIC_LLM_API_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
     NEXT_PUBLIC_LLM_MODEL=qwen-plus
     ```
   - 或在设置页面配置

#### 选项B：OpenAI

1. **申请 API Key**
   - 访问：https://platform.openai.com/
   - 创建账户并获取 API Key

2. **配置**
   - 在 `.env.local` 添加：
     ```env
     NEXT_PUBLIC_LLM_API_KEY=sk-你的OpenAI Key
     NEXT_PUBLIC_LLM_API_URL=https://api.openai.com/v1/chat/completions
     NEXT_PUBLIC_LLM_MODEL=gpt-3.5-turbo
     ```

### 3.3 科大讯飞语音识别（可选）

如果不配置，将使用浏览器原生语音识别（Chrome/Edge支持）。

1. **申请 API**
   - 访问：https://www.xfyun.cn/
   - 注册并创建应用
   - 获取 App ID、API Key 和 API Secret

2. **配置**
   - 在设置页面配置即可（不建议写入环境变量）

## 第四步：启动应用

完成以上配置后，启动开发服务器：

```powershell
npm run dev
```

打开浏览器访问：http://localhost:3000

## 配置检查清单

使用前请确认：

- [ ] 已安装 Node.js 和 npm
- [ ] 已运行 `npm install`
- [ ] 已创建 Supabase 项目
- [ ] 已配置 Supabase URL 和 Anon Key（环境变量或设置页面）
- [ ] 已执行数据库迁移脚本
- [ ] （可选）已配置高德地图 API Key
- [ ] （可选）已配置 LLM API Key（需要用于AI功能）
- [ ] 应用可以正常启动

## 常见问题

### Q: Supabase 配置后还是提示需要配置？

**解决方案**：
1. 如果使用环境变量，确保：
   - 文件名是 `.env.local`（不是 `.env`）
   - 变量名正确（`NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY`）
   - 值没有多余的空格或引号
2. 重启开发服务器（`Ctrl+C` 停止，然后重新运行 `npm run dev`）
3. 清除浏览器缓存

### Q: 数据库迁移失败？

**解决方案**：
1. 检查 SQL 语法是否正确
2. 确保在正确的项目中执行
3. 查看 Supabase Dashboard 中的错误信息

### Q: AI 功能不工作？

**解决方案**：
1. 检查 LLM API Key 是否正确
2. 检查网络连接（某些API可能需要科学上网）
3. 查看浏览器控制台的错误信息

### Q: 地图不显示？

**解决方案**：
1. 检查高德地图 API Key 是否正确
2. 检查 API Key 的权限设置（需要启用 Web 服务 API）
3. 查看浏览器控制台的错误信息

## 快速参考

### `.env.local` 完整示例

```env
# Supabase（必需）
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 高德地图（可选）
NEXT_PUBLIC_AMAP_KEY=你的高德地图Key

# 大语言模型（必需用于AI功能）
NEXT_PUBLIC_LLM_API_KEY=你的API Key
NEXT_PUBLIC_LLM_API_URL=https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
NEXT_PUBLIC_LLM_MODEL=qwen-plus
```

### 最小配置

如果要快速体验，最小配置只需要：
1. Supabase URL 和 Key（必需）
2. LLM API Key（用于AI功能）

其他功能可以在后续使用过程中逐步配置。

## 下一步

配置完成后，可以：
1. 访问 http://localhost:3000 开始使用
2. 注册一个账户
3. 创建第一个旅行计划
4. 查看 [README.md](./README.md) 了解详细功能

---

**提示**：如果遇到问题，请查看：
- 浏览器控制台的错误信息（F12打开开发者工具）
- 终端中的错误日志
- 项目的 [README.md](./README.md)

