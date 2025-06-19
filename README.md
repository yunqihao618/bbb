# WritePro - AIGC检测率降低服务

一个基于前后端分离架构的AIGC检测率降低服务平台，前端使用Next.js，后端使用Django REST Framework。

## 项目结构

```
writepro/
├── frontend/                 # Next.js前端
│   ├── app/                 # 页面和组件
│   ├── components/          # UI组件
│   ├── hooks/              # React Hooks
│   └── lib/                # 工具函数
├── backend/                 # Django后端
│   ├── writepro_backend/   # Django项目配置
│   ├── accounts/           # 用户管理
│   ├── documents/          # 文档管理
│   ├── orders/             # 订单管理
│   └── payments/           # 支付管理
└── README.md
```

## 功能特性

### 用户功能
- ✅ 用户注册/登录（邮箱、手机号、微信扫码）
- ✅ 验证码发送（邮箱/短信）
- ✅ 用户资料管理
- ✅ 积分系统

### 文档处理
- ✅ 文档上传（支持PDF、Word、TXT等格式）
- ✅ AIGC检测率降低处理
- ✅ 处理进度跟踪
- ✅ 处理结果下载

### 订单系统
- ✅ 订单创建和管理
- ✅ 订单状态跟踪
- ✅ 支付集成

### 支付系统
- ✅ 积分充值
- ✅ 充值套餐管理
- ✅ 支付记录
- ✅ 模拟支付

## 技术栈

### 前端
- **框架**: Next.js 15 + React 18
- **样式**: Tailwind CSS + shadcn/ui
- **状态管理**: React Hooks
- **HTTP客户端**: Fetch API
- **表单处理**: React Hook Form
- **通知**: Sonner

### 后端
- **框架**: Django 4.2 + Django REST Framework
- **数据库**: SQLite (开发) / PostgreSQL (生产)
- **认证**: Token Authentication
- **异步任务**: Celery + Redis
- **文件处理**: python-docx, PyPDF2
- **API文档**: DRF自动生成

## 快速开始

### 环境要求
- Node.js 18+
- Python 3.8+
- Redis (用于Celery)

### 1. 克隆项目
```bash
git clone <repository-url>
cd writepro
```

### 2. 启动后端

```bash
cd backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，配置必要的环境变量

# 数据库迁移
python manage.py makemigrations
python manage.py migrate

# 创建超级用户
python manage.py createsuperuser

# 初始化数据
python init_data.py

# 启动开发服务器
python manage.py runserver
```

### 3. 启动前端

```bash
# 在新终端中
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 4. 启动Celery (可选)

```bash
# 在新终端中
cd backend

# 启动Celery worker
celery -A writepro_backend worker --loglevel=info

# 启动Celery beat (定时任务)
celery -A writepro_backend beat --loglevel=info
```

## 访问地址

- **前端**: http://localhost:3000
- **后端API**: http://localhost:8000
- **Django管理后台**: http://localhost:8000/admin

## API文档

### 认证相关
- `POST /api/v1/auth/register/` - 用户注册
- `POST /api/v1/auth/login/` - 用户登录
- `POST /api/v1/auth/send-code/` - 发送验证码
- `GET /api/v1/auth/user-info/` - 获取用户信息

### 文档管理
- `POST /api/v1/documents/upload/` - 上传文档
- `GET /api/v1/documents/list/` - 获取文档列表
- `GET /api/v1/documents/<id>/` - 获取文档详情
- `GET /api/v1/documents/<id>/download/` - 下载文档

### 订单管理
- `POST /api/v1/orders/` - 创建订单
- `GET /api/v1/orders/list/` - 获取订单列表
- `GET /api/v1/orders/<order_number>/` - 获取订单详情
- `POST /api/v1/orders/<order_number>/pay/` - 支付订单

### 支付系统
- `GET /api/v1/payments/api/packages/` - 获取充值套餐
- `POST /api/v1/payments/api/payments/create_recharge_order/` - 创建充值订单
- `GET /api/v1/payments/api/recharges/` - 获取充值记录

## 部署

### 生产环境配置

1. **环境变量配置**
```bash
# .env
SECRET_KEY=your-production-secret-key
DEBUG=False
DATABASE_URL=postgresql://user:password@localhost/writepro
REDIS_URL=redis://localhost:6379/0
AIGC_SERVICE_URL=http://85.208.9.40:5001
```

2. **数据库配置**
```bash
# 安装PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# 创建数据库
sudo -u postgres createdb writepro
```

3. **使用Docker部署**
```bash
# 构建镜像
docker build -t writepro-backend ./backend
docker build -t writepro-frontend ./frontend

# 运行容器
docker-compose up -d
```

## 开发指南

### 代码规范
- 前端使用ESLint + Prettier
- 后端使用Black + isort
- 提交前请运行代码格式化

### 测试
```bash
# 后端测试
cd backend
python manage.py test

# 前端测试
cd frontend
npm run test
```

### 贡献指南
1. Fork项目
2. 创建功能分支
3. 提交更改
4. 创建Pull Request

## 常见问题

### Q: AIGC服务连接失败
A: 请检查`AIGC_SERVICE_URL`配置是否正确，确保服务地址可访问。

### Q: 文件上传失败
A: 检查文件大小是否超过限制（50MB），文件格式是否支持。

### Q: 验证码收不到
A: 开发环境下验证码会输出到控制台，生产环境需要配置邮件/短信服务。

## 许可证

MIT License

## 联系方式

如有问题请提交Issue或联系开发团队。