#!/bin/bash

# 启动前端开发服务器
echo "正在启动前端开发服务器..."

# 清理缓存和依赖
echo "正在清理缓存..."
rm -rf node_modules
rm -rf .next

# 安装依赖
echo "正在安装依赖..."
npm install

# 启动开发服务器
npm run dev