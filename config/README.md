# ⚙️ 配置文件目录

## 📝 配置文件

### 环境变量配置

- `env.example` - 环境变量配置示例文件

**使用方法：**

1. 复制示例文件：
   ```bash
   cp env.example .env.local
   ```

2. 编辑 `.env.local` 文件，填入你的配置

3. 配置说明：
   - `NEXT_PUBLIC_SUPABASE_URL` - Supabase项目URL（必需）
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase匿名密钥（必需）
   - `NEXT_PUBLIC_LLM_API_KEY` - LLM API密钥（必需）
   - `NEXT_PUBLIC_AMAP_KEY` - 高德地图API Key（可选）
   - `NEXT_PUBLIC_LLM_API_URL` - LLM API地址（可选）
   - `NEXT_PUBLIC_LLM_MODEL` - LLM模型名称（可选）

## 🚀 快速开始脚本

### Windows

- `快速开始.bat` - Windows快速开始脚本

**使用方法：**
```cmd
config\快速开始.bat
```

### Linux/Mac

- `快速开始.sh` - Linux/Mac快速开始脚本

**使用方法：**
```bash
chmod +x config/快速开始.sh
./config/快速开始.sh
```

## 📚 相关文档

- [用户使用指南](../docs/guides/用户使用指南.md)
- [快速开始](../docs/guides/QUICK_START.md)
- [设置指南](../docs/guides/SETUP_GUIDE.md)

---

**查看 [README.md](../README.md) 获取项目概述**


