'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, CreditCard, Gift, Star, Zap } from 'lucide-react'
import { toast } from 'sonner'

interface RechargePackage {
  id: number
  name: string
  amount: number
  credits: number
  bonus_credits: number
  is_popular: boolean
  sort_order: number
}

interface PaymentOrder {
  payment_id: number
  amount: number
  transaction_id: string
  package: {
    name: string
    credits: number
    bonus_credits: number
  }
}

export default function RechargePage() {
  const [packages, setPackages] = useState<RechargePackage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPackage, setSelectedPackage] = useState<RechargePackage | null>(null)
  const [paymentOrder, setPaymentOrder] = useState<PaymentOrder | null>(null)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [paymentProgress, setPaymentProgress] = useState(0)
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'failed'>('pending')
  const [userCredits, setUserCredits] = useState(0)

  // 获取充值套餐
  const fetchPackages = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        console.error('未找到访问令牌')
        toast.error('请先登录')
        setLoading(false)
        return
      }

      const response = await fetch('http://127.0.0.1:8000/api/v1/payments/api/packages/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('充值套餐数据:', data)
        setPackages(data.results || data)
      } else {
        console.error('API响应错误:', response.status, response.statusText)
        toast.error(`获取充值套餐失败: ${response.status}`)
      }
    } catch (error) {
      console.error('获取充值套餐失败:', error)
      toast.error('获取充值套餐失败')
    } finally {
      setLoading(false)
    }
  }

  // 获取用户积分
  const fetchUserCredits = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/auth/user-info/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setUserCredits(data.credits || 0)
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }

  // 创建充值订单
  const createRechargeOrder = async (packageId: number) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/payments/api/payments/create_recharge_order/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          package_id: packageId,
          payment_method: 'mock'
        })
      })
      
      if (response.ok) {
        const order = await response.json()
        setPaymentOrder(order)
        setShowPaymentDialog(true)
        setPaymentStatus('pending')
        setPaymentProgress(0)
      } else {
        toast.error('创建订单失败')
      }
    } catch (error) {
      console.error('创建订单失败:', error)
      toast.error('创建订单失败')
    }
  }

  // 模拟支付
  const mockPayment = async () => {
    if (!paymentOrder) return
    
    setPaymentStatus('processing')
    setPaymentProgress(0)
    
    // 模拟支付进度
    const progressInterval = setInterval(() => {
      setPaymentProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 300)
    
    // 3秒后调用支付成功接口
    setTimeout(async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/v1/payments/api/payments/${paymentOrder.payment_id}/mock_payment_success/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        })
        
        if (response.ok) {
          const result = await response.json()
          setPaymentProgress(100)
          setPaymentStatus('success')
          toast.success('充值成功！')
          
          // 更新用户积分
          fetchUserCredits()
          
          // 刷新全局用户信息
          if (typeof window !== 'undefined' && (window as any).refreshUserInfo) {
            (window as any).refreshUserInfo()
          }
          
          // 2秒后关闭对话框
          setTimeout(() => {
            setShowPaymentDialog(false)
            setPaymentOrder(null)
          }, 2000)
        } else {
          setPaymentStatus('failed')
          toast.error('支付失败')
        }
      } catch (error) {
        console.error('支付失败:', error)
        setPaymentStatus('failed')
        toast.error('支付失败')
      }
    }, 3000)
  }

  useEffect(() => {
    fetchPackages()
    fetchUserCredits()
  }, [])

  const formatCredits = (credits: number) => {
    return credits.toLocaleString()
  }

  const calculateBonusPercentage = (credits: number, bonus: number) => {
    if (credits === 0) return 0
    return Math.round((bonus / credits) * 100)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 页面头部 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-4">
          积分充值
        </h1>
        <p className="text-gray-600 mb-6">
          选择合适的充值套餐，获得更多积分来使用AIGC服务
        </p>
        
        {/* 当前积分显示 */}
        <Card className="max-w-md mx-auto mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <Zap className="h-5 w-5 text-orange-500" />
              <span className="text-sm text-gray-600">当前积分</span>
              <span className="text-2xl font-bold text-orange-600">
                {formatCredits(userCredits)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 充值套餐 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        {packages.map((pkg) => (
          <Card 
            key={pkg.id} 
            className={`relative transition-all duration-200 hover:shadow-lg cursor-pointer ${
              pkg.is_popular 
                ? 'ring-2 ring-orange-500 shadow-lg transform scale-105' 
                : 'hover:ring-1 hover:ring-orange-200'
            }`}
            onClick={() => setSelectedPackage(pkg)}
          >
            {pkg.is_popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1">
                  <Star className="h-3 w-3 mr-1" />
                  热门推荐
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-lg font-bold">{pkg.name}</CardTitle>
              <div className="text-3xl font-bold text-orange-600">
                ¥{pkg.amount}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {formatCredits(pkg.credits)} 积分
                </div>
                {pkg.bonus_credits > 0 && (
                  <div className="flex items-center justify-center space-x-1 text-sm text-green-600">
                    <Gift className="h-4 w-4" />
                    <span>赠送 {formatCredits(pkg.bonus_credits)} 积分</span>
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div className="text-center space-y-1">
                <div className="text-sm text-gray-600">
                  总计获得: <span className="font-semibold text-orange-600">
                    {formatCredits(pkg.credits + pkg.bonus_credits)} 积分
                  </span>
                </div>
                {pkg.bonus_credits > 0 && (
                  <div className="text-xs text-green-600">
                    额外赠送 {calculateBonusPercentage(pkg.credits, pkg.bonus_credits)}%
                  </div>
                )}
              </div>
              
              <Button 
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                onClick={(e) => {
                  e.stopPropagation()
                  createRechargeOrder(pkg.id)
                }}
              >
                立即充值
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 支付对话框 */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-orange-500" />
              <span>确认支付</span>
            </DialogTitle>
            <DialogDescription>
              请确认您的充值信息
            </DialogDescription>
          </DialogHeader>
          
          {paymentOrder && (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">套餐名称:</span>
                      <span className="font-semibold">{paymentOrder.package.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">支付金额:</span>
                      <span className="font-semibold text-orange-600">¥{paymentOrder.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">获得积分:</span>
                      <span className="font-semibold">{formatCredits(paymentOrder.package.credits)}</span>
                    </div>
                    {paymentOrder.package.bonus_credits > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">赠送积分:</span>
                        <span className="font-semibold text-green-600">
                          {formatCredits(paymentOrder.package.bonus_credits)}
                        </span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-lg">
                      <span className="font-semibold">总计积分:</span>
                      <span className="font-bold text-orange-600">
                        {formatCredits(paymentOrder.package.credits + paymentOrder.package.bonus_credits)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {paymentStatus === 'pending' && (
                <Button 
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                  onClick={mockPayment}
                >
                  确认支付
                </Button>
              )}
              
              {paymentStatus === 'processing' && (
                <div className="space-y-3">
                  <div className="text-center text-gray-600">正在处理支付...</div>
                  <Progress value={paymentProgress} className="w-full" />
                  <div className="text-center text-sm text-gray-500">
                    {paymentProgress < 90 ? '正在连接支付服务...' : '正在确认支付结果...'}
                  </div>
                </div>
              )}
              
              {paymentStatus === 'success' && (
                <div className="text-center space-y-3">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                  <div className="text-lg font-semibold text-green-600">支付成功！</div>
                  <div className="text-sm text-gray-600">积分已充值到您的账户</div>
                </div>
              )}
              
              {paymentStatus === 'failed' && (
                <div className="text-center space-y-3">
                  <div className="text-lg font-semibold text-red-600">支付失败</div>
                  <div className="text-sm text-gray-600">请重试或联系客服</div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowPaymentDialog(false)}
                  >
                    关闭
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* 说明信息 */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-lg">充值说明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-600">
          <div>• 积分可用于AIGC文档处理服务，按字数消耗</div>
          <div>• 充值后积分立即到账，永久有效</div>
          <div>• 支持多种支付方式，安全便捷</div>
          <div>• 如有问题，请联系客服获得帮助</div>
          <div className="text-orange-600 font-medium">• 当前为测试环境，支付将在3秒后自动成功</div>
        </CardContent>
      </Card>
    </div>
  )
}
