"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Inter } from "next/font/google"
import { MainNav } from "@/components/main-nav"
import { AuthDialog } from "@/components/auth-dialog"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, CheckCircle, Coins, CreditCard, QrCode } from "lucide-react"

const inter = Inter({ subsets: ["latin"] })

interface UserType {
  id: string
  name: string
  email: string
  avatar: string
  points: number
}

interface RechargePackage {
  id: number
  name: string
  amount: string
  credits: number
  bonus_credits: number
}

interface Props {
  children: React.ReactNode
}

export default function ClientLayout({ children }: Props) {
  const [user, setUser] = useState<UserType | null>(null)
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const [rechargeOpen, setRechargeOpen] = useState(false)
  const [rechargeStep, setRechargeStep] = useState<"select" | "payment" | "success">("select")

  const [rechargePackages, setRechargePackages] = useState<RechargePackage[]>([])
  const [selectedPackage, setSelectedPackage] = useState<RechargePackage | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // 充值金额选项
  const rechargeOptions = [
    { points: 1000, price: 10, bonus: 0 },
    { points: 3000, price: 30, bonus: 200 },
    { points: 5000, price: 50, bonus: 500 },
    { points: 10000, price: 100, bonus: 1500 },
    { points: 20000, price: 200, bonus: 4000 },
    { points: 50000, price: 500, bonus: 15000 },
  ]

  const handleAuthOpen = (mode: "login" | "register") => {
    setAuthMode(mode)
    setAuthOpen(true)
  }

  // 获取用户信息
  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) return
      
      const response = await fetch('http://127.0.0.1:8000/api/v1/auth/user-info/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const userData = await response.json()
        const user: UserType = {
          id: userData.id || "1",
          name: userData.name || "用户",
          email: userData.email || "",
          avatar: userData.avatar || "/placeholder.svg?height=40&width=40",
          points: userData.credits || 0,
        }
        setUser(user)
      } else if (response.status === 401) {
        // Token过期，清除本地存储
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        setUser(null)
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }

  // 检查登录状态
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      fetchUserInfo()
    }
  }, [])

  const handleLoginSuccess = (userData: any) => {
    // 登录成功后重新获取用户信息以确保数据最新
    fetchUserInfo()
  }

  // 提供给子组件的积分刷新函数
  const refreshUserInfo = () => {
    fetchUserInfo()
  }

  // 将刷新函数暴露到全局，供其他页面使用
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).refreshUserInfo = refreshUserInfo
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).refreshUserInfo
      }
    }
  }, [])

  // 获取充值套餐
  const fetchRechargePackages = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('access_token')
      if (!token) {
        toast({
          title: "请先登录",
          description: "请登录后再进行充值操作",
          variant: "destructive",
        })
        setRechargePackages([])
        return
      }

      const response = await fetch('http://127.0.0.1:8000/api/v1/payments/api/packages/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        // 处理分页格式的数据
        if (data && Array.isArray(data.results)) {
          setRechargePackages(data.results)
        } else if (Array.isArray(data)) {
          // 兼容直接返回数组的情况
          setRechargePackages(data)
        } else {
          console.error('API返回的数据格式不正确:', data)
          setRechargePackages([])
          toast({
            title: "数据格式错误",
            description: "充值套餐数据格式不正确",
            variant: "destructive",
          })
        }
      } else {
        setRechargePackages([])
        toast({
          title: "获取充值套餐失败",
          description: `错误代码: ${response.status}`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('获取充值套餐失败:', error)
      setRechargePackages([])
      toast({
        title: "获取充值套餐失败",
        description: "网络错误，请稍后重试",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRechargeOpen = () => {
    setRechargeStep("select")
    setRechargeOpen(true)
    fetchRechargePackages()
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
    toast({
      title: "已退出登录",
      description: "感谢使用WritePro",
      duration: 2000,
    })
  }

  const handleRecharge = () => {
    if (!selectedPackage) {
      toast({
        title: "请选择充值套餐",
        description: "请先选择要充值的套餐",
        variant: "destructive",
      })
      return
    }

    setRechargeStep("payment")
  }

  const handleRechargePayment = async () => {
    if (!selectedPackage) return

    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        toast({
          title: "请先登录",
          description: "请登录后再进行充值操作",
          variant: "destructive",
        })
        return
      }

      // 调用后端充值API
      const response = await fetch('http://127.0.0.1:8000/api/v1/payments/api/payments/create_recharge_order/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          package_id: selectedPackage.id,
          payment_method: 'alipay' // 模拟支付宝支付
        })
      })

      if (response.ok) {
        const orderResult = await response.json()
        console.log('订单创建成功:', orderResult)
        
        // 模拟支付延迟，然后调用支付成功接口
        setTimeout(async () => {
          try {
            // 调用模拟支付成功接口
            const paymentResponse = await fetch(`http://127.0.0.1:8000/api/v1/payments/api/payments/${orderResult.payment_id}/mock_payment_success/`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            })
            
            if (paymentResponse.ok) {
              const paymentResult = await paymentResponse.json()
              console.log('支付成功:', paymentResult)
              
              setRechargeStep("success")
              
              // 充值成功后重新获取用户信息以更新积分
              fetchUserInfo()
              
              toast({
                title: "充值成功",
                description: `成功充值 ${paymentResult.credits_earned || selectedPackage.credits} 积分`,
                duration: 3000,
              })
            } else {
              const errorData = await paymentResponse.json()
              toast({
                title: "支付失败",
                description: errorData.error || "支付过程中出现错误",
                variant: "destructive",
              })
            }
          } catch (error) {
            console.error('支付失败:', error)
            toast({
              title: "支付失败",
              description: "支付过程中出现网络错误",
              variant: "destructive",
            })
          }
        }, 3000)
      } else {
        const errorData = await response.json()
        toast({
          title: "充值失败",
          description: errorData.detail || "充值过程中出现错误",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('充值失败:', error)
      toast({
        title: "充值失败",
        description: "网络错误，请稍后重试",
        variant: "destructive",
      })
    }
  }

  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <MainNav user={user} onAuthOpen={handleAuthOpen} onRechargeOpen={handleRechargeOpen} onLogout={handleLogout} onRefreshUserInfo={refreshUserInfo} />
        <main className="pb-safe">{children}</main>
        <Toaster />

        {/* Auth Dialog */}
        <AuthDialog
          open={authOpen}
          onOpenChange={setAuthOpen}
          mode={authMode}
          onModeChange={setAuthMode}
          onLoginSuccess={handleLoginSuccess}
        />

        {/* Recharge Dialog */}
        <Dialog open={rechargeOpen} onOpenChange={(open) => {
          setRechargeOpen(open)
          if (!open) {
            // 重置状态
            setRechargeStep("select")
            setSelectedPackage(null)
            setRechargePackages([])
            setLoading(false)
          }
        }}>
          <DialogContent className="max-w-sm bg-white border-0 shadow-2xl">
            {rechargeStep === "select" ? (
              <>
                <DialogHeader className="text-center border-b border-gray-100 pb-4">
                  <DialogTitle className="text-xl font-bold text-gray-900 flex items-center justify-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                      <Coins className="h-4 w-4 text-white" />
                    </div>
                    积分充值
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 mt-2">
                    选择充值金额，积分可用于抵扣服务费用
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="text-gray-500">加载中...</div>
                    </div>
                  ) : rechargePackages.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-gray-500">暂无充值套餐</div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {rechargePackages.map((pkg) => (
                        <div
                          key={pkg.id}
                          className={`border rounded-lg p-3 cursor-pointer transition-all ${
                            selectedPackage?.id === pkg.id
                              ? "border-orange-400 bg-orange-50"
                              : "border-gray-200 hover:border-orange-200"
                          }`}
                          onClick={() => setSelectedPackage(pkg)}
                        >
                          <div className="text-center">
                            <div className="text-sm font-bold text-orange-600 mb-1">
                              {pkg.credits >= 1000 ? `${pkg.credits / 1000}k` : pkg.credits}积分
                            </div>
                            <div className="text-xs text-gray-600 mb-1">¥{pkg.amount}</div>
                            {pkg.bonus_credits > 0 && (
                              <Badge className="bg-red-100 text-red-700 border-red-200 text-xs px-1 py-0">
                                送{pkg.bonus_credits >= 1000 ? `${pkg.bonus_credits / 1000}k` : pkg.bonus_credits}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-3 border border-orange-200">
                    <h4 className="font-semibold text-gray-900 mb-2 text-xs">积分说明</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• 1积分 = 0.01元，可抵扣服务费用</li>
                      <li>• 积分永久有效，充值越多送越多</li>
                    </ul>
                  </div>

                  <Button
                    onClick={handleRecharge}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold"
                    size="lg"
                  >
                    确认充值
                  </Button>
                </div>
              </>
            ) : rechargeStep === "payment" ? (
              <>
                <DialogHeader className="text-center border-b border-gray-100 pb-4">
                  <DialogTitle className="text-xl font-bold text-gray-900 flex items-center justify-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-white" />
                    </div>
                    支付充值
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                  {/* 充值详情 */}
                  {selectedPackage && (
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-3 border border-orange-200">
                      <h4 className="font-semibold text-gray-900 mb-2 text-sm">充值详情</h4>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600">充值积分：</span>
                          <span className="font-medium">{selectedPackage.credits.toLocaleString()}积分</span>
                        </div>
                        {selectedPackage.bonus_credits > 0 && (
                          <div className="flex justify-between text-red-600">
                            <span>赠送积分：</span>
                            <span className="font-medium">
                              +{selectedPackage.bonus_credits.toLocaleString()}积分
                            </span>
                          </div>
                        )}
                        <div className="border-t border-orange-200 pt-1 mt-2">
                          <div className="flex justify-between text-sm font-bold text-orange-600">
                            <span>支付金额：</span>
                            <span>¥{selectedPackage.amount}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 二维码 */}
                  <div className="text-center">
                    <div className="inline-block p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                      <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                        <QrCode className="h-16 w-16 text-gray-400" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">请使用微信或支付宝扫码支付</p>
                    <p className="text-xs text-gray-500 mt-1">支付完成后积分将自动到账</p>
                  </div>

                  {/* 模拟支付按钮 */}
                  <Button
                    onClick={handleRechargePayment}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold text-sm"
                  >
                    模拟支付完成
                  </Button>
                </div>
              </>
            ) : (
              <>
                <DialogHeader className="text-center border-b border-gray-100 pb-4">
                  <DialogTitle className="text-xl font-bold text-green-600 flex items-center justify-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    充值成功
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2 text-center">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">积分充值成功！</h4>
                    {selectedPackage && (
                      <p className="text-gray-600 text-xs mb-3">
                        您已成功充值 {selectedPackage.credits.toLocaleString()} 积分
                        {selectedPackage.bonus_credits > 0 &&
                          `，额外获得 ${selectedPackage.bonus_credits.toLocaleString()} 赠送积分`}
                      </p>
                    )}
                    <div className="text-lg font-bold text-orange-600">当前积分：{user?.points.toLocaleString()}</div>
                  </div>

                  <div className="space-y-2">
                    <Button
                      onClick={() => setRechargeOpen(false)}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold text-sm"
                    >
                      继续使用服务
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => setRechargeOpen(false)}
                      className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 text-sm"
                    >
                      关闭
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </body>
    </html>
  )
}
