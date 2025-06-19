"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Mail, Lock, Eye, EyeOff, ArrowLeft, Phone, QrCode, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface LoginFormData {
  email: string
  password: string
  phone: string
  verificationCode: string
  rememberMe: boolean
}

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [wechatQRCode, setWechatQRCode] = useState<string | null>(null)
  const [loadingQRCode, setLoadingQRCode] = useState(false)
  const [phoneLoginType, setPhoneLoginType] = useState<'code' | 'password'>('password')
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    phone: "",
    verificationCode: "",
    rememberMe: false
  })

  // 倒计时效果
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleInputChange = (field: keyof LoginFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // 邮箱密码登录
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email || !formData.password) {
      toast.error("请填写邮箱和密码")
      return
    }

    setLoading(true)
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          login_type: 'email'
        })
      })

      const data = await response.json()

      if (response.ok) {
        // 保存token
        localStorage.setItem('access_token', data.tokens.access)
        localStorage.setItem('refresh_token', data.tokens.refresh)
        
        if (formData.rememberMe) {
          localStorage.setItem('remember_me', 'true')
        }

        toast.success("登录成功")
        router.push('/')
      } else {
        toast.error(data.error || "登录失败")
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error("网络错误，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  // 发送手机验证码
  const sendPhoneCode = async () => {
    if (!formData.phone) {
      toast.error("请输入手机号")
      return
    }

    setSendingCode(true)
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/auth/send-phone-code/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: formData.phone,
          code_type: 'phone_login'
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("验证码发送成功")
        setCountdown(60)
      } else {
        toast.error(data.error || "发送失败")
      }
    } catch (error) {
      console.error('Send code error:', error)
      toast.error("网络错误，请稍后重试")
    } finally {
      setSendingCode(false)
    }
  }

  // 手机验证码登录
  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.phone || !formData.verificationCode) {
      toast.error("请填写手机号和验证码")
      return
    }

    setLoading(true)
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: formData.phone,
          verification_code: formData.verificationCode,
          login_type: 'phone'
        })
      })

      const data = await response.json()

      if (response.ok) {
        // 保存token
        localStorage.setItem('access_token', data.tokens.access)
        localStorage.setItem('refresh_token', data.tokens.refresh)
        
        toast.success("登录成功")
        router.push('/')
      } else {
        toast.error(data.error || "登录失败")
      }
    } catch (error) {
      console.error('Phone login error:', error)
      toast.error("网络错误，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  // 手机号密码登录
  const handlePhonePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.phone || !formData.password) {
      toast.error("请填写手机号和密码")
      return
    }

    setLoading(true)
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: formData.phone,
          password: formData.password,
          login_type: 'phone_password'
        })
      })

      const data = await response.json()

      if (response.ok) {
        // 保存token
        localStorage.setItem('access_token', data.tokens.access)
        localStorage.setItem('refresh_token', data.tokens.refresh)
        
        if (formData.rememberMe) {
          localStorage.setItem('remember_me', 'true')
        }

        toast.success("登录成功")
        router.push('/')
      } else {
        toast.error(data.error || "登录失败")
      }
    } catch (error) {
      console.error('Phone password login error:', error)
      toast.error("网络错误，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  // 获取微信登录二维码
  const getWeChatQRCode = async () => {
    setLoadingQRCode(true)
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/auth/wechat/qrcode/')
      const data = await response.json()

      if (response.ok) {
        setWechatQRCode(data.qr_code)
      } else {
        toast.error("获取二维码失败")
      }
    } catch (error) {
      console.error('Get QR code error:', error)
      toast.error("网络错误，请稍后重试")
    } finally {
      setLoadingQRCode(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回首页
            </Button>
          </Link>
        </div>

        {/* Login Card */}
        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">欢迎回来</CardTitle>
            <CardDescription className="text-gray-600">登录您的 WritePro 账户</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="wechat" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="wechat" className="flex items-center gap-1">
                  <QrCode className="w-4 h-4" />
                  微信登录
                </TabsTrigger>
                <TabsTrigger value="phone" className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  手机登录
                </TabsTrigger>
              </TabsList>

              {/* 微信扫码登录 */}
              <TabsContent value="wechat" className="space-y-4">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-48 h-48 border-2 border-orange-200 rounded-lg flex items-center justify-center bg-orange-50">
                    {loadingQRCode ? (
                      <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-orange-500" />
                        <p className="text-sm text-gray-500">生成二维码中...</p>
                      </div>
                    ) : wechatQRCode ? (
                      <img 
                        src={wechatQRCode} 
                        alt="微信登录二维码" 
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-center">
                        <QrCode className="w-12 h-12 mx-auto mb-2 text-orange-400" />
                        <p className="text-sm text-gray-500 mb-4">点击获取微信登录二维码</p>
                        <Button 
                          onClick={getWeChatQRCode}
                          variant="outline"
                          size="sm"
                          className="border-orange-200 text-orange-600 hover:bg-orange-50"
                        >
                          获取二维码
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {wechatQRCode && (
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">请使用微信扫描二维码登录</p>
                      <Button 
                        onClick={getWeChatQRCode}
                        variant="outline"
                        size="sm"
                        className="border-orange-200 text-orange-600 hover:bg-orange-50"
                      >
                        刷新二维码
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* 手机登录 */}
              <TabsContent value="phone" className="space-y-4">
                {/* 登录方式选择 */}
                <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setPhoneLoginType('code')}
                    className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                      phoneLoginType === 'code'
                        ? 'bg-white text-orange-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    验证码登录
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhoneLoginType('password')}
                    className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                      phoneLoginType === 'password'
                        ? 'bg-white text-orange-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    密码登录
                  </button>
                </div>

                {/* 验证码登录表单 */}
                {phoneLoginType === 'code' && (
                  <form onSubmit={handlePhoneLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                        手机号
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="请输入您的手机号"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="pl-10 border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="verificationCode" className="text-sm font-medium text-gray-700">
                        验证码
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="verificationCode"
                          type="text"
                          placeholder="请输入验证码"
                          value={formData.verificationCode}
                          onChange={(e) => handleInputChange('verificationCode', e.target.value)}
                          className="flex-1 border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                          required
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={sendPhoneCode}
                          disabled={sendingCode || countdown > 0}
                          className="whitespace-nowrap border-orange-200 text-orange-600 hover:bg-orange-50"
                        >
                          {sendingCode ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : countdown > 0 ? (
                            `${countdown}s`
                          ) : (
                            '发送验证码'
                          )}
                        </Button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3"
                      size="lg"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          登录中...
                        </>
                      ) : (
                        '登录'
                      )}
                    </Button>
                  </form>
                )}

                {/* 密码登录表单 */}
                {phoneLoginType === 'password' && (
                  <form onSubmit={handlePhonePasswordLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone-password" className="text-sm font-medium text-gray-700">
                        手机号
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="phone-password"
                          type="tel"
                          placeholder="请输入您的手机号"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="pl-10 border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password-phone" className="text-sm font-medium text-gray-700">
                        密码
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="password-phone"
                          type={showPassword ? "text" : "password"}
                          placeholder="请输入您的密码"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          className="pl-10 pr-10 border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="remember-phone"
                          checked={formData.rememberMe}
                          onCheckedChange={(checked) => handleInputChange('rememberMe', checked)}
                          className="border-orange-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                        />
                        <Label htmlFor="remember-phone" className="text-sm text-gray-600">
                          记住我
                        </Label>
                      </div>
                      <Link href="/auth/forgot-password" className="text-sm text-orange-600 hover:text-orange-700">
                        忘记密码？
                      </Link>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3"
                      size="lg"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          登录中...
                        </>
                      ) : (
                        '登录'
                      )}
                    </Button>
                  </form>
                )}
              </TabsContent>

              {/* 微信扫码登录 */}
              <TabsContent value="wechat" className="space-y-4">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-48 h-48 border-2 border-orange-200 rounded-lg flex items-center justify-center bg-orange-50">
                    {loadingQRCode ? (
                      <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-orange-500" />
                        <p className="text-sm text-gray-500">生成二维码中...</p>
                      </div>
                    ) : wechatQRCode ? (
                      <img 
                        src={wechatQRCode} 
                        alt="微信登录二维码" 
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-center">
                        <QrCode className="w-12 h-12 mx-auto mb-2 text-orange-400" />
                        <p className="text-sm text-gray-500 mb-4">点击获取微信登录二维码</p>
                        <Button 
                          onClick={getWeChatQRCode}
                          variant="outline"
                          size="sm"
                          className="border-orange-200 text-orange-600 hover:bg-orange-50"
                        >
                          获取二维码
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {wechatQRCode && (
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">请使用微信扫描二维码登录</p>
                      <Button 
                        onClick={getWeChatQRCode}
                        variant="outline"
                        size="sm"
                        className="border-orange-200 text-orange-600 hover:bg-orange-50"
                      >
                        刷新二维码
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {/* Sign Up Link */}
            <div className="text-center">
              <span className="text-sm text-gray-600">还没有账户？</span>
              <Link href="/auth/register" className="text-sm text-orange-600 hover:text-orange-700 font-medium ml-1">
                立即注册
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-gray-500">
          <p>
            登录即表示您同意我们的{" "}
            <Link href="/terms" className="text-orange-600 hover:underline">
              服务条款
            </Link>{" "}
            和{" "}
            <Link href="/privacy" className="text-orange-600 hover:underline">
              隐私政策
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
