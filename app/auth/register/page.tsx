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
import { Shield, User, Mail, Phone, Lock, Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface RegisterFormData {
  name: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  verificationCode: string
  agreeTerms: boolean
  agreeMarketing: boolean
}

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)
  const [countdown, setCountdown] = useState(0)
  
  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    verificationCode: "",
    agreeTerms: false,
    agreeMarketing: false,
  })

  // 验证状态
  const [validationErrors, setValidationErrors] = useState<{
    phone?: string
    password?: string
    confirmPassword?: string
  }>({})

  // 表单错误状态
  const [errors, setErrors] = useState<{
    phone?: string
    email?: string
    password?: string
    confirmPassword?: string
    verificationCode?: string
    name?: string
  }>({})

  // 手机号验证
  const validatePhone = (phone: string) => {
    if (!phone) return ""
    // 支持多种格式：11位数字、带86前缀、带+86前缀
    const cleanPhone = phone.replace(/[\s-]/g, '')
    const phoneRegex = /^(\+?86)?1[3-9]\d{9}$/
    if (!phoneRegex.test(cleanPhone)) {
      return "请输入正确的手机号码格式"
    }
    return ""
  }

  // 密码强度验证
  const validatePassword = (password: string) => {
    if (!password) return ""
    if (password.length < 8) {
      return "密码至少需要8位字符"
    }
    if (!/[a-zA-Z]/.test(password)) {
      return "密码必须包含字母"
    }
    if (!/\d/.test(password)) {
      return "密码必须包含数字"
    }
    if (/^\d+$/.test(password)) {
      return "密码不能只包含数字"
    }
    
    // 检查常见密码
    const commonPasswords = ['12345678', '123456789', 'password', 'qwerty', '11111111', '88888888', 'abcd1234']
    if (commonPasswords.includes(password.toLowerCase())) {
      return "密码过于常见，请选择更安全的密码"
    }
    
    return ""
  }

  // 确认密码验证
  const validateConfirmPassword = (confirmPassword: string, password: string) => {
    if (!confirmPassword) return ""
    if (confirmPassword !== password) {
      return "两次输入的密码不一致"
    }
    return ""
  }

  // 倒计时效果
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleInputChange = (field: keyof RegisterFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    
    // 实时验证
    if (field === 'phone' && typeof value === 'string') {
      const phoneError = validatePhone(value)
      setValidationErrors(prev => ({ ...prev, phone: phoneError }))
    }
    
    if (field === 'password' && typeof value === 'string') {
      const passwordError = validatePassword(value)
      setValidationErrors(prev => ({ ...prev, password: passwordError }))
      
      // 如果确认密码已经输入，重新验证确认密码
      if (formData.confirmPassword) {
        const confirmError = validateConfirmPassword(formData.confirmPassword, value)
        setValidationErrors(prev => ({ ...prev, confirmPassword: confirmError }))
      }
    }
    
    if (field === 'confirmPassword' && typeof value === 'string') {
      const confirmError = validateConfirmPassword(value, formData.password)
      setValidationErrors(prev => ({ ...prev, confirmPassword: confirmError }))
    }
  }

  // 发送邮箱验证码
  const sendEmailCode = async () => {
    if (!formData.email) {
      toast.error("请输入邮箱")
      return
    }

    setSendingCode(true)
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/auth/send-email-code/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          code_type: 'email_register'
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
      console.error('Send email code error:', error)
      toast.error("网络错误，请稍后重试")
    } finally {
      setSendingCode(false)
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
          code_type: 'phone_register'
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
      console.error('Send phone code error:', error)
      toast.error("网络错误，请稍后重试")
    } finally {
      setSendingCode(false)
    }
  }

  // 邮箱注册
  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.verificationCode) {
      toast.error("请填写所有必填字段")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("两次输入的密码不一致")
      return
    }

    if (!formData.agreeTerms) {
      toast.error("请同意用户协议")
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
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirm_password: formData.confirmPassword,
          verification_code: formData.verificationCode
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("注册成功，请登录")
        router.push('/auth/login')
      } else {
        // 处理具体的字段错误 - 优化后的错误处理
        console.log('注册错误详情:', data) // 调试用
        
        if (data.phone) {
          setErrors(prev => ({ ...prev, phone: data.phone[0] }))
          toast.error(`手机号错误：${data.phone[0]}`)
        } else if (data.email) {
          setErrors(prev => ({ ...prev, email: data.email[0] }))
          toast.error(`邮箱错误：${data.email[0]}`)
        } else if (data.password) {
          setErrors(prev => ({ ...prev, password: data.password[0] }))
          toast.error(`密码错误：${data.password[0]}`)
        } else if (data.confirm_password) {
          setErrors(prev => ({ ...prev, confirmPassword: data.confirm_password[0] }))
          toast.error(`确认密码错误：${data.confirm_password[0]}`)
        } else if (data.verification_code) {
          setErrors(prev => ({ ...prev, verificationCode: data.verification_code[0] }))
          toast.error(`验证码错误：${data.verification_code[0]}`)
        } else if (data.name) {
          setErrors(prev => ({ ...prev, name: data.name[0] }))
          toast.error(`姓名错误：${data.name[0]}`)
        } else {
          // 显示所有错误信息
          const errorMessages: string[] = []
          Object.keys(data).forEach((key: string) => {
            if (Array.isArray(data[key])) {
              errorMessages.push(`${key}: ${data[key][0]}`)
            } else if (typeof data[key] === 'string') {
              errorMessages.push(data[key])
            }
          })
          const errorText = errorMessages.length > 0 ? errorMessages.join(', ') : "注册失败，请检查填写信息"
          toast.error(errorText)
        }
      }
    } catch (error) {
      console.error('Email register error:', error)
      toast.error("网络错误，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  // 手机注册
  const handlePhoneRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 执行所有验证
    const phoneError = validatePhone(formData.phone)
    const passwordError = validatePassword(formData.password)
    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.password)
    
    setValidationErrors({
      phone: phoneError,
      password: passwordError,
      confirmPassword: confirmPasswordError
    })
    
    // 检查是否有验证错误
    if (phoneError || passwordError || confirmPasswordError) {
      toast.error("请修正表单中的错误")
      return
    }
    
    if (!formData.name || !formData.phone || !formData.password || !formData.confirmPassword || !formData.verificationCode) {
      toast.error("请填写所有必填字段")
      return
    }

    if (!formData.agreeTerms) {
      toast.error("请同意用户协议")
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
          name: formData.name,
          phone: formData.phone,
          password: formData.password,
          confirm_password: formData.confirmPassword,
          verification_code: formData.verificationCode
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("注册成功，请登录")
        router.push('/auth/login')
      } else {
        // 处理具体的字段错误 - 优化后的错误处理
        console.log('注册错误详情:', data) // 调试用
        
        if (data.phone) {
          setErrors(prev => ({ ...prev, phone: data.phone[0] }))
          toast.error(`手机号错误：${data.phone[0]}`)
        } else if (data.email) {
          setErrors(prev => ({ ...prev, email: data.email[0] }))
          toast.error(`邮箱错误：${data.email[0]}`)
        } else if (data.password) {
          setErrors(prev => ({ ...prev, password: data.password[0] }))
          toast.error(`密码错误：${data.password[0]}`)
        } else if (data.confirm_password) {
          setErrors(prev => ({ ...prev, confirmPassword: data.confirm_password[0] }))
          toast.error(`确认密码错误：${data.confirm_password[0]}`)
        } else if (data.verification_code) {
          setErrors(prev => ({ ...prev, verificationCode: data.verification_code[0] }))
          toast.error(`验证码错误：${data.verification_code[0]}`)
        } else if (data.name) {
          setErrors(prev => ({ ...prev, name: data.name[0] }))
          toast.error(`姓名错误：${data.name[0]}`)
        } else {
          // 显示所有错误信息
          const errorMessages: string[] = []
          Object.keys(data).forEach((key: string) => {
            if (Array.isArray(data[key])) {
              errorMessages.push(`${key}: ${data[key][0]}`)
            } else if (typeof data[key] === 'string') {
              errorMessages.push(data[key])
            }
          })
          const errorText = errorMessages.length > 0 ? errorMessages.join(', ') : "注册失败，请检查填写信息"
          toast.error(errorText)
        }
      }
    } catch (error) {
      console.error('Phone register error:', error)
      toast.error("网络错误，请稍后重试")
    } finally {
      setLoading(false)
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

        {/* Register Card */}
        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">创建账户</CardTitle>
            <CardDescription className="text-gray-600">注册 WritePro 开始您的专业服务</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="phone" className="w-full">
              <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value="phone" className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700">
                  手机号注册
                </TabsTrigger>
              </TabsList>



              {/* 手机号注册 */}
              <TabsContent value="phone" className="space-y-4">
                <form onSubmit={handlePhoneRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                      手机号码
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="请输入您的手机号"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={`pl-10 border-orange-200 focus:border-orange-400 focus:ring-orange-400 ${
                          validationErrors.phone ? 'border-red-300 focus:border-red-400 focus:ring-red-400' : ''
                        }`}
                        required
                      />
                    </div>
                    {validationErrors.phone && (
                      <p className="text-sm text-red-600 mt-1">{validationErrors.phone}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneCode" className="text-sm font-medium text-gray-700">
                      验证码
                    </Label>
                    <div className="flex space-x-2">
                      <div className="relative flex-1">
                        <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="phoneCode"
                          type="text"
                          placeholder="请输入验证码"
                          value={formData.verificationCode}
                          onChange={(e) => handleInputChange('verificationCode', e.target.value)}
                          className="pl-10 border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                          required
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={sendPhoneCode}
                        disabled={countdown > 0 || !formData.phone || sendingCode}
                        className="border-orange-200 text-orange-600 hover:bg-orange-50 whitespace-nowrap"
                      >
                        {sendingCode ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            发送中...
                          </>
                        ) : countdown > 0 ? (
                          `${countdown}s`
                        ) : (
                          '发送验证码'
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                      姓名
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="请输入您的姓名"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="pl-10 border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      密码
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="请输入密码（至少8位，包含字母和数字）"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={`pl-10 pr-10 border-orange-200 focus:border-orange-400 focus:ring-orange-400 ${
                          validationErrors.password ? 'border-red-300 focus:border-red-400 focus:ring-red-400' : ''
                        }`}
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
                    {validationErrors.password && (
                        <p className="text-sm text-red-600 mt-1">{validationErrors.password}</p>
                      )}
                   </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                      确认密码
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="请再次输入密码"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className={`pl-10 pr-10 border-orange-200 focus:border-orange-400 focus:ring-orange-400 ${
                          validationErrors.confirmPassword ? 'border-red-300 focus:border-red-400 focus:ring-red-400' : ''
                        }`}
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
                     {validationErrors.confirmPassword && (
                        <p className="text-sm text-red-600 mt-1">{validationErrors.confirmPassword}</p>
                      )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={formData.agreeTerms}
                      onCheckedChange={(checked) => handleInputChange('agreeTerms', checked as boolean)}
                      className="border-orange-300"
                    />
                    <Label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
                      我已阅读并同意
                      <Link href="/terms" className="text-orange-600 hover:text-orange-700 mx-1">
                        服务条款
                      </Link>
                      和
                      <Link href="/privacy" className="text-orange-600 hover:text-orange-700 mx-1">
                        隐私政策
                      </Link>
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3"
                    size="lg"
                    disabled={loading || !formData.agreeTerms}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        注册中...
                      </>
                    ) : (
                      '注册账户'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="text-center text-sm text-gray-600">
              已有账户？{" "}
              <Link href="/auth/login" className="text-blue-600 hover:text-blue-500 font-medium">
                立即登录
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
