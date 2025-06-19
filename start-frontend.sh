#!/bin/bash

# 启动前端开发服务器
echo "正在启动前端开发服务器..."

# 检查是否安装了依赖
if [ ! -d "node_modules" ]; then
    echo "正在安装依赖..."
    npm install
fi

# 启动开发服务器
npm run dev