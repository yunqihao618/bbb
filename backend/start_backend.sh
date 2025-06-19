#!/bin/bash

# 启动后端服务脚本

echo "正在启动WritePro后端服务..."

# 检查是否在虚拟环境中
if [[ "$VIRTUAL_ENV" == "" ]]; then
    echo "警告: 未检测到虚拟环境，建议使用虚拟环境"
fi

# 安装依赖
echo "安装Python依赖..."
pip install -r requirements.txt

# 数据库迁移
echo "执行数据库迁移..."
python manage.py makemigrations
python manage.py migrate

# 创建超级用户（如果不存在）
echo "检查超级用户..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(is_superuser=True).exists():
    User.objects.create_superuser('admin', 'admin@writepro.com', 'admin123')
    print('超级用户已创建: admin/admin123')
else:
    print('超级用户已存在')
"

# 初始化数据
echo "初始化基础数据..."
python init_data.py

# 收集静态文件
echo "收集静态文件..."
python manage.py collectstatic --noinput

# 启动开发服务器
echo "启动开发服务器..."
python manage.py runserver 0.0.0.0:8000