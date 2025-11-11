#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
整理项目结构 - 将文档和脚本移动到合适的目录
"""

import os
import shutil
from pathlib import Path

# 定义移动规则
MOVES = {
    # Docker文档 -> docs/docker/
    "docs/docker/": [
        "ALIYUN_PERSONAL_REGISTRY.md",
        "ALIYUN_REGISTRY.md",
        "DOCKER.md",
        "DOCKER_BUILD_SUMMARY.md",
        "DOCKER_MIRROR_SETUP.md",
        "QUICKSTART_DOCKER.md",
        "README_DOCKER_BUILD.md",
        "BUILD_INSTRUCTIONS.md",
        "build-and-push.md",
        "QUICK_BUILD_PUSH.md",
        "README_BUILD.md",
        "RUN_BUILD.md",
        "推送镜像说明.md",
        "推送命令.txt",
        "完整命令.txt",
        "快速开始.txt",
        "复制这个配置.txt",
        "构建成功.md",
        "镜像验证报告.md",
        "docker-compose.example.yml",
        "docker-compose.yml",
        "Dockerfile.cn",
        "Dockerfile.mirror",
        "DOCKER_CONFIG_FIXED.json",
        "docker-daemon.json",
    ],
    # 用户指南 -> docs/guides/
    "docs/guides/": [
        "QUICK_START.md",
        "README_用户指南.md",
        "README_立即开始.md",
        "用户使用指南.md",
        "本地访问指南.md",
        "START_HERE.md",
        "INSTALL_WINDOWS.md",
        "SETUP_GUIDE.md",
    ],
    # 问题排查 -> docs/troubleshooting/
    "docs/troubleshooting/": [
        "网络问题解决方案.md",
        "快速修复网络问题.md",
        "配置Docker镜像加速器.md",
        "问题修复说明.md",
        "修复完成.md",
        "DEBUG_IMAGES.md",
    ],
    # Docker脚本 -> scripts/docker/
    "scripts/docker/": [
        "docker-build-push.bat",
        "docker-build-push.sh",
        "docker-build.bat",
        "docker-build.sh",
        "build-push-aliyun.bat",
        "build-with-mirror.bat",
        "立即推送.bat",
        "构建推送.bat",
        "构建并推送镜像.bat",
        "推送最新镜像.bat",
        "推送最新镜像.sh",
        "解决网络问题.bat",
    ],
    # 构建脚本 -> scripts/build/
    "scripts/build/": [
        "一键构建.bat",
        "quick-build.bat",
        "立即构建.bat",
        "构建命令.bat",
        "执行构建.bat",
        "最终命令.bat",
        "build-and-push.ps1",
    ],
    # 配置文件 -> config/
    "config/": [
        "快速开始.bat",
        "快速开始.sh",
        "env.example",
    ],
}

def move_files():
    """移动文件到指定目录"""
    moved = 0
    skipped = 0
    errors = []
    
    for target_dir, files in MOVES.items():
        # 创建目标目录
        os.makedirs(target_dir, exist_ok=True)
        
        for file in files:
            src = Path(file)
            dst = Path(target_dir) / file
            
            if src.exists():
                try:
                    if dst.exists():
                        print(f"跳过: {file} (目标已存在)")
                        skipped += 1
                    else:
                        shutil.move(str(src), str(dst))
                        print(f"移动: {file} -> {target_dir}")
                        moved += 1
                except Exception as e:
                    errors.append(f"{file}: {e}")
                    print(f"错误: {file} - {e}")
            else:
                print(f"未找到: {file}")
                skipped += 1
    
    print(f"\n完成! 移动: {moved}, 跳过: {skipped}, 错误: {len(errors)}")
    if errors:
        print("\n错误列表:")
        for error in errors:
            print(f"  - {error}")

if __name__ == "__main__":
    move_files()


