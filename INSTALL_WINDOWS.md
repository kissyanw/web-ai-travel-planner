# Windows 系统安装指南

本指南将帮助你在 Windows 系统上安装运行本项目所需的所有工具。

## 需要安装的工具

### 必需工具

1. **Node.js** (版本 18 或更高)
   - 这是运行 Next.js 项目的基础运行环境
   - 包含了 npm (Node Package Manager)

2. **Git** (可选，但推荐)
   - 用于克隆 GitHub 仓库
   - 如果直接下载 ZIP 文件可以跳过

### 可选工具

3. **Docker Desktop** (可选)
   - 如果你想使用 Docker 方式运行项目
   - 适合不想配置 Node.js 环境的用户

## 安装步骤

### 步骤 1: 安装 Node.js

#### 方法一：官方安装包（推荐）

1. **访问 Node.js 官网**
   - 打开浏览器，访问：https://nodejs.org/
   - 网站会自动检测你的系统，推荐下载 **LTS (长期支持)** 版本

2. **下载安装包**
   - 点击绿色的 "LTS" 按钮下载 Windows 安装包（.msi 文件）

3. **运行安装程序**
   - 双击下载的 `.msi` 文件
   - 按照安装向导操作：
     - 点击 "Next" 接受许可协议
     - 选择安装路径（默认即可）
     - **重要**：确保勾选 "Automatically install the necessary tools" 选项
     - 点击 "Install" 开始安装
     - 安装完成后点击 "Finish"

4. **验证安装**
   打开 PowerShell 或命令提示符（CMD），运行：
   ```powershell
   node --version
   npm --version
   ```
   应该显示版本号，例如：
   ```
   v20.10.0
   10.2.3
   ```

#### 方法二：使用 Chocolatey（适合高级用户）

如果你已经安装了 Chocolatey 包管理器：

```powershell
choco install nodejs-lts
```

#### 方法三：使用 winget（Windows 11 或 Windows 10 1809+）

```powershell
winget install OpenJS.NodeJS.LTS
```

### 步骤 2: 安装 Git（可选但推荐）

1. **访问 Git 官网**
   - 打开：https://git-scm.com/download/win
   - 下载 Windows 版本的 Git

2. **运行安装程序**
   - 双击下载的安装程序
   - 按照默认设置安装即可
   - 安装完成后重启终端

3. **验证安装**
   ```powershell
   git --version
   ```

### 步骤 3: 安装 Docker Desktop（可选）

如果你想使用 Docker 方式运行：

1. **访问 Docker Desktop 官网**
   - 打开：https://www.docker.com/products/docker-desktop/
   - 点击 "Download for Windows"

2. **系统要求**
   - Windows 10 64-bit: Pro, Enterprise, or Education (Build 19041 或更高)
   - Windows 11 64-bit: Home 或 Pro 版本
   - 启用 WSL 2 (Windows Subsystem for Linux 2)

3. **安装步骤**
   - 下载并运行安装程序
   - 按照安装向导完成安装
   - 安装完成后需要重启电脑
   - 重启后启动 Docker Desktop，等待初始化完成

4. **验证安装**
   ```powershell
   docker --version
   docker-compose --version
   ```

## 安装完成后的操作

### 1. 克隆或下载项目

#### 使用 Git（推荐）：
```powershell
git clone <your-repo-url>
cd web-ai-travel-planner
```

#### 或下载 ZIP 文件：
- 在 GitHub 页面点击 "Code" -> "Download ZIP"
- 解压到任意目录

### 2. 安装项目依赖

打开 PowerShell 或命令提示符，进入项目目录：

```powershell
cd C:\Users\27885\web-ai-travel-planner
npm install
```

这可能需要几分钟时间，取决于网络速度。

### 3. 配置环境变量

1. **复制示例文件**
   - 在项目根目录创建 `.env.local` 文件
   - 参考 `.env.example`（如果存在）或按照 README.md 中的说明填写

2. **基本配置示例**：
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_AMAP_KEY=your-amap-key
   NEXT_PUBLIC_LLM_API_KEY=your-llm-api-key
   ```

   **注意**：首次使用也可以不配置这些，在应用内的设置页面配置（会保存在浏览器本地）。

### 4. 运行开发服务器

```powershell
npm run dev
```

打开浏览器访问：http://localhost:3000

## 常见问题

### Q: 安装 Node.js 后，命令行提示找不到命令？

**解决方案**：
1. 关闭并重新打开 PowerShell 或命令提示符
2. 检查环境变量 PATH 是否包含 Node.js 路径（通常是 `C:\Program Files\nodejs\`）
3. 如果还是不行，可能需要重启电脑

### Q: npm install 很慢或失败？

**解决方案**：
1. 使用国内镜像源（淘宝镜像）：
   ```powershell
   npm config set registry https://registry.npmmirror.com
   ```
2. 或者使用 cnpm：
   ```powershell
   npm install -g cnpm --registry=https://registry.npmmirror.com
   cnpm install
   ```

### Q: 端口 3000 被占用？

**解决方案**：
1. 更改端口（在 package.json 中修改）：
   ```json
   "dev": "next dev -p 3001"
   ```
2. 或者关闭占用 3000 端口的程序

### Q: Docker Desktop 无法启动？

**解决方案**：
1. 确保已启用虚拟化（在 BIOS 中）
2. 启用 WSL 2：
   ```powershell
   wsl --install
   ```
3. 重启电脑后再次尝试

## 推荐的工具

### 代码编辑器
- **Visual Studio Code** (推荐): https://code.visualstudio.com/
- **WebStorm**: JetBrains 的 IDE

### 终端工具
- **Windows Terminal**: Microsoft Store 免费下载
- **PowerShell**: Windows 自带

## 快速检查清单

安装完成后，运行以下命令验证所有工具是否安装成功：

```powershell
# 检查 Node.js
node --version

# 检查 npm
npm --version

# 检查 Git（如果安装了）
git --version

# 检查 Docker（如果安装了）
docker --version

# 进入项目目录并安装依赖
cd web-ai-travel-planner
npm install

# 启动开发服务器
npm run dev
```

如果所有命令都能正常执行，说明环境配置成功！

## 下一步

安装完成后，请查看 [README.md](./README.md) 了解如何配置和运行项目。

---

**提示**：如果你遇到任何问题，可以：
1. 查看项目的 README.md 文档
2. 检查 Node.js 官方文档：https://nodejs.org/docs/
3. 查看 Next.js 官方文档：https://nextjs.org/docs

