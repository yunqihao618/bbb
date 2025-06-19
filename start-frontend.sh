#!/bin/bash

# 启动前端开发服务器
echo "正在启动前端开发服务器..."

# 确保在正确的目录中
cd "$(dirname "$0")"
echo "当前工作目录: $(pwd)"

# 检查Next.js应用文件是否存在
if [ ! -f "package.json" ]; then
    echo "错误: 未找到package.json文件"
    echo "当前目录内容:"
    ls -la
    exit 1
fi

if [ ! -d "app" ]; then
    echo "错误: 未找到app目录"
    echo "当前目录内容:"
    ls -la
    exit 1
fi

echo "找到Next.js应用文件，继续启动..."

# 清理缓存和依赖
echo "正在清理缓存..."
rm -rf node_modules
rm -rf .next
rm -rf .next/cache

# 清理npm缓存
npm cache clean --force

# 安装依赖
echo "正在安装依赖..."
npm install

# 验证Next.js安装
echo "验证Next.js安装..."
npx next --version

# 启动开发服务器
echo "启动开发服务器..."
npm run dev