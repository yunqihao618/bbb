"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Mail, Lock, Eye, EyeOff, Phone, QrCode, Loader2, UserPlus, LogIn } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "login" | "register"
  onModeChange: (mode: "login" | "register") => void
  onLoginSuccess?: (user: any) => void
}

interface LoginFormData {
  email: string
  password: string
  phone: string
  verificationCode: string
  rememberMe: boolean
  loginMethod: 'password' | 'code'
}

interface RegisterFormData {
  email: string
  phone: string
  password: string
  confirmPassword: string
  verificationCode: string
  agreeTerms: boolean
  agreeMarketing: boolean
}

export function AuthDialog({ open, onOpenChange, mode, onModeChange, onLoginSuccess }: AuthDialogProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [wechatQRCode, setWechatQRCode] = useState<string | null>(null)
  const [loadingQRCode, setLoadingQRCode] = useState(false)
  const [activeTab, setActiveTab] = useState("wechat")

  const [loginFormData, setLoginFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    phone: "",
    verificationCode: "",
    rememberMe: false,
    loginMethod: 'code'
  })

  const [registerFormData, setRegisterFormData] = useState<RegisterFormData>({
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    verificationCode: "",
    agreeTerms: false,
    agreeMarketing: false,
  })

  // 倒计时效果
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  // 获取微信二维码
  const getWeChatQRCode = async () => {
    setLoadingQRCode(true)
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/auth/wechat/qrcode/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const data = await response.json()
      if (response.ok) {
        setWechatQRCode(data.qr_code_url)
      } else {
        toast({
          title: "获取二维码失败",
          description: data.message || "请稍后重试",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "网络错误",
        description: "请检查网络连接",
        variant: "destructive",
      })
    } finally {
      setLoadingQRCode(false)
    }
  }

  // 发送手机验证码
  const sendPhoneCode = async (type: 'login' | 'register') => {
    const phone = type === 'login' ? loginFormData.phone : registerFormData.phone
    if (!phone) {
      toast({
        title: "请输入手机号",
        variant: "destructive",
      })
      return
    }

    setSendingCode(true)
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/auth/send-code/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phone,
          code_type: type === 'login' ? 'phone_login' : 'phone_register'
        }),
      })
      
      const data = await response.json()
      if (response.ok) {
        toast({
          title: "验证码已发送",
          description: "请查收短信验证码",
        })
        setCountdown(60)
      } else {
        toast({
          title: "发送失败",
          description: data.message || "请稍后重试",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "网络错误",
        description: "请检查网络连接",
        variant: "destructive",
      })
    } finally {
      setSendingCode(false)
    }
  }

  // 手机验证码登录
  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (loginFormData.loginMethod === 'password') {
      if (!loginFormData.phone || !loginFormData.password) {
        toast({
          title: "请填写手机号和密码",
          variant: "destructive",
        })
        return
      }
    } else {
      if (!loginFormData.phone || !loginFormData.verificationCode) {
        toast({
          title: "请填写手机号和验证码",
          variant: "destructive",
        })
        return
      }
    }

    setLoading(true)
    try {
      const requestBody = loginFormData.loginMethod === 'password' 
        ? {
            phone: loginFormData.phone,
            password: loginFormData.password,
            login_type: 'phone_password'
          }
        : {
            phone: loginFormData.phone,
            verification_code: loginFormData.verificationCode,
            login_type: 'phone'
          }

      const response = await fetch('http://127.0.0.1:8000/api/v1/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })
      
      const data = await response.json()
      if (response.ok) {
        toast({
          title: "登录成功",
          description: "欢迎回来！",
        })
        
        // 保存token
        localStorage.setItem('access_token', data.tokens.access)
        localStorage.setItem('refresh_token', data.tokens.refresh)
        
        // 调用成功回调
        onLoginSuccess?.(data.user)
        onOpenChange(false)
      } else {
        toast({
          title: "登录失败",
          description: data.message || (loginFormData.loginMethod === 'password' ? "请检查手机号和密码" : "请检查手机号和验证码"),
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "网络错误",
        description: "请检查网络连接",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // 手机号注册
  const handlePhoneRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!registerFormData.phone || !registerFormData.password || !registerFormData.confirmPassword || !registerFormData.verificationCode) {
      toast({
        title: "请填写所有必填字段",
        variant: "destructive",
      })
      return
    }

    if (registerFormData.password !== registerFormData.confirmPassword) {
      toast({
        title: "两次输入的密码不一致",
        variant: "destructive",
      })
      return
    }

    if (!registerFormData.agreeTerms) {
      toast({
        title: "请同意用户协议",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/auth/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: `${registerFormData.phone}@temp.writepro.com`, // 使用手机号生成临时邮箱
          name: registerFormData.phone, // 使用手机号作为默认用户名
          phone: registerFormData.phone,
          password: registerFormData.password,
          confirm_password: registerFormData.confirmPassword,
          verification_code: registerFormData.verificationCode,
          user_type: 'individual'
        }),
      })
      
      const data = await response.json()
      if (response.ok) {
        toast({
          title: "注册成功",
          description: "欢迎加入WritePro！",
        })
        
        // 保存token
        localStorage.setItem('access_token', data.tokens.access)
        localStorage.setItem('refresh_token', data.tokens.refresh)
        
        // 调用成功回调
        onLoginSuccess?.(data.user)
        onOpenChange(false)
      } else {
        toast({
          title: "注册失败",
          description: data.message || "请检查填写信息",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "网络错误",
        description: "请检查网络连接",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // 重置表单
  const resetForms = () => {
    setLoginFormData({
      email: "",
      password: "",
      phone: "",
      verificationCode: "",
      rememberMe: false,
      loginMethod: 'code'
    })
    setRegisterFormData({
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      verificationCode: "",
      agreeTerms: false,
      agreeMarketing: false,
    })
    setShowPassword(false)
    setShowConfirmPassword(false)
    setCountdown(0)
    setWechatQRCode(null)
    setActiveTab("wechat")
  }

  // 当弹窗打开时获取微信二维码
  useEffect(() => {
    if (open && mode === "login") {
      getWeChatQRCode()
    }
    if (!open) {
      resetForms()
    }
  }, [open, mode])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white border-0 shadow-2xl">
        <DialogHeader className="text-center border-b border-gray-100 pb-4">
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            {mode === "login" ? "登录账户" : "创建账户"}
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            {mode === "login" ? "欢迎回来，请登录您的账户" : "注册WritePro开始您的专业服务"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          {mode === "login" ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                <TabsTrigger value="wechat" className="text-sm">微信扫码</TabsTrigger>
                <TabsTrigger value="phone" className="text-sm">手机登录</TabsTrigger>
              </TabsList>

              <TabsContent value="wechat" className="space-y-3 mt-4">
                <div className="text-center space-y-3">
                  <div className="flex justify-center">
                    <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                      {loadingQRCode ? (
                        <div className="w-40 h-40 flex items-center justify-center">
                          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                        </div>
                      ) : wechatQRCode ? (
                        <img src={wechatQRCode} alt="微信登录二维码" className="w-40 h-40" />
                      ) : (
                        <div className="w-40 h-40 bg-gray-100 rounded-lg flex items-center justify-center">
                          <QrCode className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">请使用微信扫描二维码登录</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={getWeChatQRCode}
                      disabled={loadingQRCode}
                      className="text-orange-600 border-orange-200 hover:bg-orange-50"
                    >
                      {loadingQRCode ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <QrCode className="h-4 w-4 mr-2" />
                      )}
                      刷新二维码
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="phone" className="space-y-3 mt-4">
                <form onSubmit={handlePhoneLogin} className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="login-phone" className="text-sm font-medium text-gray-700">
                      手机号码
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="login-phone"
                        type="tel"
                        placeholder="请输入手机号"
                        value={loginFormData.phone}
                        onChange={(e) => setLoginFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="pl-10 border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      登录方式
                    </Label>
                    <div className="flex space-x-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="loginMethod"
                          value="code"
                          checked={loginFormData.loginMethod === 'code'}
                          onChange={(e) => setLoginFormData(prev => ({ ...prev, loginMethod: e.target.value as 'password' | 'code' }))}
                          className="text-orange-500 focus:ring-orange-400"
                        />
                        <span className="text-sm text-gray-700">验证码</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="loginMethod"
                          value="password"
                          checked={loginFormData.loginMethod === 'password'}
                          onChange={(e) => setLoginFormData(prev => ({ ...prev, loginMethod: e.target.value as 'password' | 'code' }))}
                          className="text-orange-500 focus:ring-orange-400"
                        />
                        <span className="text-sm text-gray-700">密码</span>
                      </label>
                    </div>
                  </div>

                  {loginFormData.loginMethod === 'code' ? (
                    <div className="space-y-2">
                      <Label htmlFor="login-code" className="text-sm font-medium text-gray-700">
                        验证码
                      </Label>
                      <div className="flex space-x-2">
                        <Input
                          id="login-code"
                          type="text"
                          placeholder="请输入验证码"
                          value={loginFormData.verificationCode}
                          onChange={(e) => setLoginFormData(prev => ({ ...prev, verificationCode: e.target.value }))}
                          className="border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                          required
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => sendPhoneCode('login')}
                          disabled={sendingCode || countdown > 0}
                          className="whitespace-nowrap border-orange-200 text-orange-600 hover:bg-orange-50"
                        >
                          {sendingCode ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : countdown > 0 ? (
                            `${countdown}s`
                          ) : (
                            "发送验证码"
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-sm font-medium text-gray-700">
                        密码
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="请输入密码"
                          value={loginFormData.password}
                          onChange={(e) => setLoginFormData(prev => ({ ...prev, password: e.target.value }))}
                          className="pl-10 pr-10 border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={loginFormData.rememberMe}
                      onCheckedChange={(checked) => setLoginFormData(prev => ({ ...prev, rememberMe: !!checked }))}
                      className="border-orange-300"
                    />
                    <Label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                      记住我
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3"
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        登录中...
                      </>
                    ) : (
                      <>
                        <LogIn className="h-4 w-4 mr-2" />
                        登录
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          ) : (
            // 注册表单
            <form onSubmit={handlePhoneRegister} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="register-phone" className="text-sm font-medium text-gray-700">
                  手机号码
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="register-phone"
                    type="tel"
                    placeholder="请输入手机号"
                    value={registerFormData.phone}
                    onChange={(e) => setRegisterFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="pl-10 border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-code" className="text-sm font-medium text-gray-700">
                  验证码
                </Label>
                <div className="flex space-x-2">
                  <Input
                    id="register-code"
                    type="text"
                    placeholder="请输入验证码"
                    value={registerFormData.verificationCode}
                    onChange={(e) => setRegisterFormData(prev => ({ ...prev, verificationCode: e.target.value }))}
                    className="border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => sendPhoneCode('register')}
                    disabled={sendingCode || countdown > 0}
                    className="whitespace-nowrap border-orange-200 text-orange-600 hover:bg-orange-50"
                  >
                    {sendingCode ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : countdown > 0 ? (
                      `${countdown}s`
                    ) : (
                      "发送验证码"
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password" className="text-sm font-medium text-gray-700">
                  密码
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="请设置密码（至少8位）"
                    value={registerFormData.password}
                    onChange={(e) => setRegisterFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="pl-10 pr-10 border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">
                  确认密码
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="请再次输入密码"
                    value={registerFormData.confirmPassword}
                    onChange={(e) => setRegisterFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="pl-10 pr-10 border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agree-terms"
                  checked={registerFormData.agreeTerms}
                  onCheckedChange={(checked) => setRegisterFormData(prev => ({ ...prev, agreeTerms: !!checked }))}
                  className="border-orange-300 mt-1"
                  required
                />
                <Label htmlFor="agree-terms" className="text-sm text-gray-600 cursor-pointer leading-relaxed">
                  我已阅读并同意
                  <button type="button" className="text-orange-600 hover:underline mx-1">
                    《服务条款》
                  </button>
                  和
                  <button type="button" className="text-orange-600 hover:underline mx-1">
                    《隐私政策》
                  </button>
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3"
                size="lg"
                disabled={loading || !registerFormData.agreeTerms}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    注册中...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    创建账户
                  </>
                )}
              </Button>
            </form>
          )}

          <div className="relative">
            <Separator className="bg-gray-200" />
            <div className="absolute inset-0 flex justify-center">
              <span className="bg-white px-4 text-sm text-gray-500">或</span>
            </div>
          </div>

          <div className="text-center">
            <span className="text-sm text-gray-600">{mode === "login" ? "还没有账户？" : "已有账户？"}</span>
            <button
              onClick={() => onModeChange(mode === "login" ? "register" : "login")}
              className="text-sm text-orange-600 hover:text-orange-700 font-medium ml-1"
            >
              {mode === "login" ? "立即注册" : "立即登录"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}