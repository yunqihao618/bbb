/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用standalone模式，用于Docker部署
  output: 'standalone',
  
  // 环境变量配置
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    NEXT_PUBLIC_AIGC_URL: process.env.NEXT_PUBLIC_AIGC_URL || 'http://localhost:8001',
  },
  
  // 图片优化配置
  images: {
    domains: ['localhost', 'your-domain.com'],
    unoptimized: true, // 在Docker中禁用图片优化
  },
  
  // 实验性功能
  experimental: {
    // 启用服务器组件
    serverComponentsExternalPackages: [],
  },
  
  // 重写规则
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://backend:8000'}/api/:path*`,
      },
      {
        source: '/aigc/:path*',
        destination: `${process.env.NEXT_PUBLIC_AIGC_URL || 'http://aigc-service:8001'}/:path*`,
      },
    ];
  },
  
  // 头部配置
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // 压缩配置
  compress: true,
  
  // 生产环境优化
  swcMinify: true,
  
  // 静态文件缓存
  generateEtags: true,
  
  // 禁用X-Powered-By头
  poweredByHeader: false,
};

export default nextConfig;