#!/usr/bin/env python
"""初始化数据脚本"""
import os
import django

# 设置Django环境
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'writepro_backend.settings')
django.setup()

from payments.models import RechargePackage

def create_recharge_packages():
    """创建充值套餐"""
    packages = [
        {
            'name': '体验套餐',
            'amount': 10.00,
            'credits': 1000,
            'bonus_credits': 0,
            'is_popular': False,
            'sort_order': 1
        },
        {
            'name': '基础套餐',
            'amount': 30.00,
            'credits': 3000,
            'bonus_credits': 200,
            'is_popular': False,
            'sort_order': 2
        },
        {
            'name': '标准套餐',
            'amount': 50.00,
            'credits': 5000,
            'bonus_credits': 500,
            'is_popular': True,
            'sort_order': 3
        },
        {
            'name': '专业套餐',
            'amount': 100.00,
            'credits': 10000,
            'bonus_credits': 1500,
            'is_popular': False,
            'sort_order': 4
        },
        {
            'name': '企业套餐',
            'amount': 200.00,
            'credits': 20000,
            'bonus_credits': 4000,
            'is_popular': False,
            'sort_order': 5
        },
        {
            'name': '旗舰套餐',
            'amount': 500.00,
            'credits': 50000,
            'bonus_credits': 15000,
            'is_popular': False,
            'sort_order': 6
        }
    ]
    
    for package_data in packages:
        package, created = RechargePackage.objects.get_or_create(
            name=package_data['name'],
            defaults=package_data
        )
        if created:
            print(f"创建充值套餐: {package.name}")
        else:
            print(f"充值套餐已存在: {package.name}")

if __name__ == '__main__':
    print("开始初始化数据...")
    create_recharge_packages()
    print("数据初始化完成!")