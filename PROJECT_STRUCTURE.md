# 📁 项目结构说明

## 🗂️ 目录结构

```
web-ai-travel-planner/
├── src/                          # 源代码目录
│   ├── app/                     # Next.js App Router页面
│   │   ├── api/                 # API路由
│   │   ├── auth/                # 认证页面
│   │   ├── dashboard/           # 仪表盘页面
│   │   ├── plan/                # 旅行计划页面
│   │   └── settings/            # 设置页面
│   ├── components/              # React组件
│   │   ├── MapView.tsx          # 地图组件
│   │   ├── VoiceInput.tsx       # 语音输入组件
│   │   └── providers.tsx        # 上下文提供者
│   ├── hooks/                   # 自定义Hooks
│   │   └── useAuth.ts           # 认证Hook
│   ├── lib/                     # 工具库
│   │   ├── ai.ts                # AI相关功能
│   │   ├── config.ts            # 配置管理
│   │   ├── images.ts            # 图片处理
│   │   ├── speech.ts            # 语音识别
│   │   └── supabase.ts          # Supabase客户端
│   └── types/                   # TypeScript类型定义
│       ├── amap.d.ts            # 高德地图类型
│       └── speech.d.ts          # 语音识别类型
│
├── docs/                         # 文档目录
│   ├── docker/                  # Docker相关文档
│   │   ├── DOCKER.md            # Docker使用指南
│   │   ├── BUILD_INSTRUCTIONS.md # 构建说明
│   │   ├── ALIYUN_REGISTRY.md   # 阿里云镜像仓库
│   │   └── ...                  # 其他Docker文档
│   ├── guides/                  # 用户指南
│   │   ├── QUICK_START.md       # 快速开始
│   │   ├── 用户使用指南.md      # 用户使用指南
│   │   └── ...                  # 其他用户指南
│   ├── troubleshooting/         # 问题排查
│   │   ├── 网络问题解决方案.md  # 网络问题解决
│   │   └── ...                  # 其他问题排查文档
│   └── README.md                # 文档索引
│
├── scripts/                      # 脚本目录
│   ├── docker/                  # Docker脚本
│   │   ├── docker-build.bat     # 构建脚本(Windows)
│   │   ├── docker-build.sh      # 构建脚本(Linux/Mac)
│   │   ├── docker-build-push.bat # 构建并推送(Windows)
│   │   ├── docker-build-push.sh  # 构建并推送(Linux/Mac)
│   │   └── ...                  # 其他Docker脚本
│   ├── build/                   # 构建脚本
│   │   ├── 一键构建.bat         # 一键构建
│   │   └── ...                  # 其他构建脚本
│   └── README.md                # 脚本说明
│
├── config/                       # 配置文件
│   ├── env.example              # 环境变量示例
│   ├── 快速开始.bat             # 快速开始脚本(Windows)
│   ├── 快速开始.sh              # 快速开始脚本(Linux/Mac)
│   └── README.md                # 配置说明
│
├── supabase/                     # Supabase迁移文件
│   └── migrations/              # 数据库迁移
│       ├── 001_initial_schema.sql
│       └── 002_add_activity_images.sql
│
├── Dockerfile                    # Docker构建文件
├── docker-compose.yml            # Docker Compose配置
├── package.json                  # 项目依赖
├── next.config.js                # Next.js配置
├── tsconfig.json                 # TypeScript配置
├── tailwind.config.js            # Tailwind CSS配置
└── README.md                     # 项目说明
```

## 📚 文档说明

### 用户指南 (`docs/guides/`)

- [快速开始](docs/guides/QUICK_START.md) - 3步快速使用镜像
- [用户使用指南](docs/guides/用户使用指南.md) - 详细使用文档
- [立即开始](docs/guides/README_立即开始.md) - 快速开始指南
- [Windows安装指南](docs/guides/INSTALL_WINDOWS.md) - Windows安装说明
- [设置指南](docs/guides/SETUP_GUIDE.md) - 项目设置指南

### Docker文档 (`docs/docker/`)

- [Docker使用指南](docs/docker/DOCKER.md) - Docker完整文档
- [构建说明](docs/docker/BUILD_INSTRUCTIONS.md) - 构建说明
- [阿里云镜像仓库](docs/docker/ALIYUN_REGISTRY.md) - 阿里云镜像仓库使用
- [快速开始Docker](docs/docker/QUICKSTART_DOCKER.md) - Docker快速开始

### 问题排查 (`docs/troubleshooting/`)

- [网络问题解决方案](docs/troubleshooting/网络问题解决方案.md) - 网络问题解决
- [快速修复网络问题](docs/troubleshooting/快速修复网络问题.md) - 快速修复网络问题
- [配置Docker镜像加速器](docs/troubleshooting/配置Docker镜像加速器.md) - 配置镜像加速器

## 🛠️ 脚本说明

### Docker脚本 (`scripts/docker/`)

- `docker-build.bat` / `docker-build.sh` - 构建Docker镜像
- `docker-build-push.bat` / `docker-build-push.sh` - 构建并推送镜像
- `立即推送.bat` - 快速推送最新镜像
- `构建推送.bat` - 构建和推送脚本

### 构建脚本 (`scripts/build/`)

- `一键构建.bat` - 一键构建脚本
- `quick-build.bat` - 快速构建脚本
- `立即构建.bat` - 立即构建脚本

## ⚙️ 配置文件

### 环境变量 (`config/env.example`)

复制 `config/env.example` 为 `.env.local` 并填入你的配置。

### 快速开始脚本 (`config/`)

- `快速开始.bat` - Windows快速开始脚本
- `快速开始.sh` - Linux/Mac快速开始脚本

## 📖 快速导航

- **用户**: 查看 [docs/guides/](docs/guides/) 目录
- **开发者**: 查看 [README.md](README.md) 和源代码
- **Docker**: 查看 [docs/docker/](docs/docker/) 目录
- **问题排查**: 查看 [docs/troubleshooting/](docs/troubleshooting/) 目录
- **脚本**: 查看 [scripts/](scripts/) 目录

---

**详细文档请查看 [docs/README.md](docs/README.md)**


