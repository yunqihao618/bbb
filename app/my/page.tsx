"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  User,
  Wallet,
  CreditCard,
  History,
  Users,
  Settings,
  Bell,
  LogOut,
  ChevronRight,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Copy,
  Share2,
  Ticket,
  Crown,
  Calendar,
  Search,
  Filter,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  ArrowLeft,
} from "lucide-react"

export default function MyPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [showRechargeDialog, setShowRechargeDialog] = useState(false)
  const [rechargeAmount, setRechargeAmount] = useState("100")
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState(null)
  const [creditTransactions, setCreditTransactions] = useState([])
  const [rechargeRecords, setRechargeRecords] = useState([])
  const [error, setError] = useState(null)

  // 获取用户信息
  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        throw new Error('未登录')
      }

      const response = await fetch('http://127.0.0.1:8000/api/v1/auth/user-info/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('获取用户信息失败')
      }

      const data = await response.json()
      setUserData(data)
    } catch (error) {
      console.error('获取用户信息失败:', error)
      setError(error.message)
    }
  }

  // 获取积分交易记录
  const fetchCreditTransactions = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) return

      const response = await fetch('http://127.0.0.1:8000/api/v1/core/credit-transactions/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setCreditTransactions(data.results || data)
      }
    } catch (error) {
      console.error('获取积分交易记录失败:', error)
    }
  }

  // 获取充值记录
  const fetchRechargeRecords = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) return

      // 获取所有充值记录，设置page_size为100
      const response = await fetch('http://127.0.0.1:8000/api/v1/payments/api/recharges/history/?page_size=100', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setRechargeRecords(data.results || data)
      }
    } catch (error) {
      console.error('获取充值记录失败:', error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([
        fetchUserInfo(),
        fetchCreditTransactions(),
        fetchRechargeRecords()
      ])
      setLoading(false)
    }
    loadData()
  }, [])

  // 模拟用户数据（作为默认值）
  const defaultUserData = {
    name: "用户",
    avatar: "/placeholder.svg?height=80&width=80",
    email: "user@example.com",
    phone: "138****1234",
    credits: 0,
    memberLevel: "普通会员",
    memberExpiry: "2024-12-31",
    totalConsumption: 2356.0,
    totalRecharge: 3000.0,
    points: 1250,
    coupons: 3,
    referrals: 12,
    commission: 356.8,
  }

  // 获取当前用户数据（合并真实数据和默认数据）
  const currentUserData = userData ? {
    ...defaultUserData,
    ...userData,
    name: userData.name || defaultUserData.name,
    email: userData.email || defaultUserData.email,
    credits: userData.credits || 0,
  } : defaultUserData

  // 处理积分交易记录
  const transactions = creditTransactions.map(transaction => ({
    id: transaction.id,
    type: transaction.transaction_type,
    amount: transaction.amount,
    status: "completed",
    date: new Date(transaction.created_at).toLocaleString('zh-CN'),
    description: transaction.description,
    balance_before: transaction.balance_before,
    balance_after: transaction.balance_after,
    created_at: transaction.created_at,
  }))

  // 处理充值记录
  const rechargeTransactions = rechargeRecords.map(recharge => ({
    id: `recharge_${recharge.id}`,
    type: "recharge",
    amount: recharge.credits_earned + recharge.bonus_credits,
    payment_amount: recharge.payment_amount,
    status: "completed",
    date: new Date(recharge.created_at).toLocaleString('zh-CN'),
    description: `充值获得 ${recharge.credits_earned}积分${recharge.bonus_credits > 0 ? ` + ${recharge.bonus_credits}赠送积分` : ''}`,
    credits_earned: recharge.credits_earned,
    bonus_credits: recharge.bonus_credits,
    created_at: recharge.created_at,
  }))

  // 合并所有交易记录（积分交易记录 + 充值记录）
  const allTransactions = [...transactions, ...rechargeTransactions]
    .sort((a, b) => new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime())

  // 模拟推荐用户列表
  const referrals = [
    { id: "U001", name: "李四", date: "2024-01-10", consumption: 599, commission: 59.9, status: "active" },
    { id: "U002", name: "王五", date: "2024-01-12", consumption: 299, commission: 29.9, status: "active" },
    { id: "U003", name: "赵六", date: "2024-01-15", consumption: 0, commission: 0, status: "pending" },
    { id: "U004", name: "钱七", date: "2024-01-18", consumption: 399, commission: 39.9, status: "active" },
    { id: "U005", name: "孙八", date: "2024-01-20", consumption: 199, commission: 19.9, status: "active" },
  ]

  // 模拟分成记录
  const commissions = [
    { id: "C001", user: "李四", amount: 59.9, date: "2024-01-11", service: "学术论文优化", status: "completed" },
    { id: "C002", name: "王五", amount: 29.9, date: "2024-01-13", service: "商业文档处理", status: "completed" },
    { id: "C003", name: "钱七", amount: 39.9, date: "2024-01-19", service: "技术文档润色", status: "completed" },
    { id: "C004", name: "孙八", amount: 19.9, date: "2024-01-21", service: "创意内容改写", status: "completed" },
  ]

  // 模拟优惠券
  const coupons = [
    { id: "CP001", name: "新用户专享券", discount: 50, minSpend: 100, expiry: "2024-02-15", status: "active" },
    { id: "CP002", name: "会员专享券", discount: 100, minSpend: 300, expiry: "2024-02-28", status: "active" },
    { id: "CP003", name: "推荐奖励券", discount: 30, minSpend: 50, expiry: "2024-03-10", status: "active" },
  ]

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "recharge":
        return <ArrowUpRight className="h-4 w-4 text-green-500" />
      case "consume":
        return <ArrowDownRight className="h-4 w-4 text-red-500" />
      case "commission":
        return <ArrowUpRight className="h-4 w-4 text-blue-500" />
      default:
        return <History className="h-4 w-4 text-gray-500" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "recharge":
        return "text-green-600"
      case "consume":
        return "text-red-600"
      case "commission":
        return "text-blue-600"
      default:
        return "text-gray-600"
    }
  }

  const getReferralStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            已消费
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            未消费
          </Badge>
        )
      default:
        return null
    }
  }

  const copyReferralLink = () => {
    navigator.clipboard.writeText("https://writepro.com/ref?code=USER123")
    // 这里可以添加复制成功的提示
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header */}
      <header className="border-b border-orange-200/50 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12 sm:h-14 lg:h-16">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                  <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">返回首页</span>
                  <span className="sm:hidden">返回</span>
                </Button>
              </Link>
              <div className="h-4 sm:h-6 w-px bg-gray-300"></div>
              <h1 className="text-sm sm:text-xl font-bold text-gray-900">个人中心</h1>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-3">
              <Button variant="ghost" size="sm" className="text-gray-600 text-xs sm:text-sm p-1 sm:p-2">
                <Bell className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">消息</span>
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-600 text-xs sm:text-sm p-1 sm:p-2 hidden sm:flex">
                <Settings className="h-4 w-4 mr-2" />
                设置
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-600 text-xs sm:text-sm p-1 sm:p-2 hidden sm:flex">
                <LogOut className="h-4 w-4 mr-2" />
                退出
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl sticky top-8">
              <CardContent className="p-4 sm:p-6">
                {/* User Profile */}
                <div className="flex flex-col items-center text-center mb-4 sm:mb-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden mb-3">
                    <img
                      src={currentUserData.avatar || "/placeholder.svg"}
                      alt="User Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900">{currentUserData.name}</h2>
                  <div className="flex items-center mt-1">
                    <Badge className="bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 border-amber-300 text-xs">
                      <Crown className="w-2 h-2 sm:w-3 sm:h-3 mr-1 text-amber-600" />
                      {currentUserData.memberLevel}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">有效期至: {currentUserData.memberExpiry}</p>
                </div>

                {/* Navigation */}
                <nav className="space-y-1">
                  <Button
                    variant={activeTab === "overview" ? "secondary" : "ghost"}
                    className="w-full justify-start text-xs sm:text-sm"
                    onClick={() => setActiveTab("overview")}
                  >
                    <User className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    账户概览
                  </Button>
                  <Button
                    variant={activeTab === "wallet" ? "secondary" : "ghost"}
                    className="w-full justify-start text-xs sm:text-sm"
                    onClick={() => setActiveTab("wallet")}
                  >
                    <Wallet className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    账户管理
                  </Button>
                  <Button
                    variant={activeTab === "referrals" ? "secondary" : "ghost"}
                    className="w-full justify-start text-xs sm:text-sm"
                    onClick={() => setActiveTab("referrals")}
                  >
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    推广中心
                  </Button>
                  <Button
                    variant={activeTab === "coupons" ? "secondary" : "ghost"}
                    className="w-full justify-start text-xs sm:text-sm"
                    onClick={() => setActiveTab("coupons")}
                  >
                    <Ticket className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    优惠券
                  </Button>
                  <Button
                    variant={activeTab === "membership" ? "secondary" : "ghost"}
                    className="w-full justify-start text-xs sm:text-sm"
                    onClick={() => setActiveTab("membership")}
                  >
                    <Crown className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    会员权益
                  </Button>
                  <Button
                    variant={activeTab === "settings" ? "secondary" : "ghost"}
                    className="w-full justify-start text-xs sm:text-sm"
                    onClick={() => setActiveTab("settings")}
                  >
                    <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    账户设置
                  </Button>
                </nav>

                {/* Quick Stats */}
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-3">账户信息</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">积分余额</span>
                      <span className="text-xs font-medium text-orange-600">{currentUserData.credits}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">邮箱</span>
                      <span className="text-xs font-medium text-gray-900">{currentUserData.email}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">手机</span>
                      <span className="text-xs font-medium text-gray-900">{currentUserData.phone}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">交易记录</span>
                      <span className="text-xs font-medium text-gray-900">{transactions.length}条</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">充值记录</span>
                      <span className="text-xs font-medium text-green-600">{rechargeTransactions.length}次</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-6">
            {/* Account Overview */}
            {activeTab === "overview" && (
              <>
                {/* Balance Card */}
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                  <CardContent className="p-4 sm:p-6">
                    <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">积分余额</h3>
                        <div className="flex flex-col sm:flex-row sm:items-baseline">
                          <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                            {currentUserData.credits.toLocaleString()}
                          </span>
                          <span className="text-xs sm:text-sm text-gray-500 ml-2">积分</span>
                          <Link href="/recharge">
                            <Button
                              className="mt-2 sm:mt-0 sm:ml-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-xs sm:text-sm"
                            >
                              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                              充值
                            </Button>
                          </Link>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500 mt-2">
                          {rechargeTransactions.length > 0 
                            ? `上次充值: ${rechargeTransactions[0]?.date}` 
                            : '暂无充值记录'
                          }
                        </p>
                      </div>
                      <div className="flex flex-col justify-center">
                        <div className="grid grid-cols-2 gap-2 sm:gap-4">
                          <div className="text-center p-2 sm:p-3 bg-orange-50 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">消费记录</p>
                            <p className="text-sm sm:text-lg font-semibold text-gray-900">
                              {transactions.filter(t => t.amount < 0).length}次
                            </p>
                          </div>
                          <div className="text-center p-2 sm:p-3 bg-green-50 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">充值记录</p>
                            <p className="text-sm sm:text-lg font-semibold text-gray-900">
                              {rechargeTransactions.length}次
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
                  <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                    <CardContent className="p-3 sm:p-4 flex items-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                        <History className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">交易记录</p>
                        <p className="text-sm sm:text-lg font-semibold text-gray-900">{transactions.length}条</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                    <CardContent className="p-3 sm:p-4 flex items-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                        <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">充值记录</p>
                        <p className="text-sm sm:text-lg font-semibold text-gray-900">{rechargeTransactions.length}次</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                    <CardContent className="p-3 sm:p-4 flex items-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-100 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                        <Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">当前积分</p>
                        <p className="text-sm sm:text-lg font-semibold text-gray-900">{currentUserData.credits}</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                    <CardContent className="p-3 sm:p-4 flex items-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                        <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">会员等级</p>
                        <p className="text-sm sm:text-lg font-semibold text-gray-900">{currentUserData.memberLevel}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Transactions */}
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base sm:text-lg font-bold text-gray-900">最近交易</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-orange-600 text-xs sm:text-sm"
                        onClick={() => setActiveTab("wallet")}
                      >
                        查看全部
                        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-gray-100">
                      {transactions.slice(0, 3).map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-3 sm:p-4">
                          <div className="flex items-center">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-100 flex items-center justify-center mr-2 sm:mr-3">
                              {getTransactionIcon(transaction.type)}
                            </div>
                            <div>
                              <p className="text-xs sm:text-sm font-medium text-gray-900">{transaction.description}</p>
                              <p className="text-xs text-gray-500">{transaction.date}</p>
                            </div>
                          </div>
                          <div className={`text-xs sm:text-sm font-semibold ${getTransactionColor(transaction.type)}`}>
                            {transaction.amount > 0 ? "+" : ""}{transaction.amount}积分
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Referral Stats */}
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base sm:text-lg font-bold text-gray-900">推广数据</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-orange-600 text-xs sm:text-sm"
                        onClick={() => setActiveTab("referrals")}
                      >
                        推广中心
                        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                      <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">交易记录</p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900">{transactions.length}</p>
                      </div>
                      <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">充值记录</p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900">{rechargeTransactions.length}</p>
                      </div>
                      <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-green-50 to-teal-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">当前积分</p>
                        <p className="text-xl sm:text-2xl font-bold text-green-600">
                          {currentUserData.credits}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs sm:text-sm mb-2 sm:mb-0">
                        <p className="text-gray-600">我的推广链接</p>
                        <p className="text-xs text-gray-500 mt-1">分享给好友，获得10%消费分成</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={copyReferralLink} className="text-xs">
                          <Copy className="h-3 w-3 mr-1" />
                          复制
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs">
                          <Share2 className="h-3 w-3 mr-1" />
                          分享
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Wallet Management */}
            {activeTab === "wallet" && (
              <>
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-base sm:text-xl font-bold text-gray-900 flex items-center gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                        <Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      账户管理
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">管理您的账户余额、充值和消费记录</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                      <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 sm:p-6 border border-orange-100">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">当前积分</h3>
                        <div className="text-2xl sm:text-3xl font-bold text-orange-600 mb-4">
                          {currentUserData.credits}
                        </div>
                        <Button
                          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-xs sm:text-sm"
                          onClick={() => window.location.href = '/recharge'}
                        >
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          立即充值
                        </Button>
                      </div>
                      <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">账户统计</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xs sm:text-sm text-gray-600">交易记录</span>
                            <span className="text-xs sm:text-sm font-medium text-gray-900">
                              {transactions.length}条
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs sm:text-sm text-gray-600">充值记录</span>
                            <span className="text-xs sm:text-sm font-medium text-gray-900">
                              {rechargeTransactions.length}次
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs sm:text-sm text-gray-600">用户邮箱</span>
                            <span className="text-xs sm:text-sm font-medium text-green-600">
                              {currentUserData.email}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs sm:text-sm text-gray-600">会员等级</span>
                            <span className="text-xs sm:text-sm font-medium text-gray-900">{currentUserData.memberLevel}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Tabs defaultValue="all" className="w-full">
                      <TabsList className="grid w-full grid-cols-4 mb-4 sm:mb-6">
                        <TabsTrigger value="all" className="text-xs">
                          全部记录
                        </TabsTrigger>
                        <TabsTrigger value="recharge" className="text-xs">
                          充值记录
                        </TabsTrigger>
                        <TabsTrigger value="consume" className="text-xs">
                          消费记录
                        </TabsTrigger>
                        <TabsTrigger value="commission" className="text-xs">
                          分成收益
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="all" className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-2 sm:space-y-0">
                          <div className="flex items-center space-x-2">
                            <Input
                              placeholder="搜索交易记录..."
                              className="w-full sm:w-64 border-orange-200 focus:border-orange-400 text-xs sm:text-sm"
                            />
                            <Button variant="outline" className="border-orange-200 hover:bg-orange-50">
                              <Search className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Select>
                              <SelectTrigger className="w-[120px] sm:w-[180px] border-orange-200 focus:border-orange-400 text-xs sm:text-sm">
                                <SelectValue placeholder="交易类型" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">全部类型</SelectItem>
                                <SelectItem value="recharge">充值</SelectItem>
                                <SelectItem value="consume">消费</SelectItem>
                                <SelectItem value="commission">分成</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="outline"
                              className="border-orange-200 hover:bg-orange-50 text-xs sm:text-sm"
                            >
                              <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                              <span className="hidden sm:inline">筛选</span>
                            </Button>
                            <Button
                              variant="outline"
                              className="border-orange-200 hover:bg-orange-50 text-xs sm:text-sm"
                            >
                              <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                              <span className="hidden sm:inline">导出</span>
                            </Button>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    交易ID
                                  </th>
                                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    类型
                                  </th>
                                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    描述
                                  </th>
                                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    积分
                                  </th>
                                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    日期
                                  </th>
                                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    状态
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {allTransactions.map((transaction) => (
                                  <tr key={transaction.id} className="hover:bg-gray-50">
                                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                                      {transaction.id}
                                    </td>
                                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                                      <div className="flex items-center">
                                        <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-gray-100 flex items-center justify-center mr-1 sm:mr-2">
                                          {getTransactionIcon(transaction.type)}
                                        </div>
                                        <span className="text-xs sm:text-sm text-gray-900">
                                          {transaction.type === "recharge"
                                            ? "充值"
                                            : transaction.type === "consume"
                                              ? "消费"
                                              : "分成"}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                                      {transaction.description}
                                    </td>
                                    <td
                                      className={`px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium ${getTransactionColor(
                                        transaction.type,
                                      )}`}
                                    >
                                      {transaction.amount > 0 ? "+" : ""}{transaction.amount}积分
                                    </td>
                                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                                      {transaction.date}
                                    </td>
                                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                                      <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                                        <CheckCircle className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                                        成功
                                      </Badge>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 space-y-2 sm:space-y-0">
                          <div className="text-xs sm:text-sm text-gray-500">显示 1 - 5 共 24 条记录</div>
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <Button variant="outline" size="sm" disabled className="text-xs">
                              上一页
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-orange-500 text-white border-orange-500 text-xs"
                            >
                              1
                            </Button>
                            <Button variant="outline" size="sm" className="text-xs">
                              2
                            </Button>
                            <Button variant="outline" size="sm" className="text-xs">
                              3
                            </Button>
                            <Button variant="outline" size="sm" className="text-xs">
                              下一页
                            </Button>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="recharge">
                        <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    充值ID
                                  </th>
                                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    充值金额
                                  </th>
                                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    获得积分
                                  </th>
                                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    赠送积分
                                  </th>
                                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    充值时间
                                  </th>
                                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    状态
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {rechargeTransactions.length > 0 ? rechargeTransactions.map((recharge) => (
                                  <tr key={recharge.id} className="hover:bg-gray-50">
                                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                                      {recharge.id}
                                    </td>
                                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                                      ¥{recharge.amount}
                                    </td>
                                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-green-600 font-medium">
                                      +{recharge.credits_earned}积分
                                    </td>
                                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-orange-600 font-medium">
                                      +{recharge.bonus_credits}积分
                                    </td>
                                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                                      {new Date(recharge.created_at).toLocaleString()}
                                    </td>
                                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                                      <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                                        <CheckCircle className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                                        成功
                                      </Badge>
                                    </td>
                                  </tr>
                                )) : (
                                  <tr>
                                    <td colSpan={6} className="px-3 sm:px-6 py-8 text-center">
                                      <div className="flex flex-col items-center justify-center">
                                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                                          <CreditCard className="h-6 w-6 text-orange-600" />
                                        </div>
                                        <h3 className="text-base font-semibold text-gray-900 mb-2">暂无充值记录</h3>
                                        <p className="text-sm text-gray-600 mb-4">您还没有任何充值记录</p>
                                        <Button
                                          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-sm"
                                          onClick={() => window.location.href = '/recharge'}
                                        >
                                          <Plus className="h-4 w-4 mr-2" />
                                          立即充值
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="consume">
                        <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    交易ID
                                  </th>
                                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    类型
                                  </th>
                                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    描述
                                  </th>
                                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    积分
                                  </th>
                                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    日期
                                  </th>
                                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    状态
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {transactions.filter(t => t.amount < 0).length > 0 ? transactions.filter(t => t.amount < 0).map((transaction) => (
                                  <tr key={transaction.id} className="hover:bg-gray-50">
                                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                                      {transaction.id}
                                    </td>
                                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                                      <div className="flex items-center">
                                        <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-gray-100 flex items-center justify-center mr-1 sm:mr-2">
                                          {getTransactionIcon(transaction.type)}
                                        </div>
                                        <span className="text-xs sm:text-sm text-gray-900">
                                          消费
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                                      {transaction.description}
                                    </td>
                                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-red-600">
                                      {transaction.amount}积分
                                    </td>
                                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                                      {transaction.date}
                                    </td>
                                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                                      <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                                        <CheckCircle className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                                        成功
                                      </Badge>
                                    </td>
                                  </tr>
                                )) : (
                                  <tr>
                                    <td colSpan={6} className="px-3 sm:px-6 py-8 text-center">
                                      <div className="flex flex-col items-center justify-center">
                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                          <History className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <h3 className="text-base font-semibold text-gray-900 mb-2">暂无消费记录</h3>
                                        <p className="text-sm text-gray-600 mb-4">您还没有任何消费记录</p>
                                        <Link href="/upload">
                                          <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-sm">
                                            开始使用服务
                                          </Button>
                                        </Link>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="commission">
                        <div className="bg-white rounded-lg p-4 sm:p-6 text-center">
                          <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                            </div>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">分成收益</h3>
                            <p className="text-xs sm:text-sm text-gray-600 mb-6">查看您的所有推广分成收益记录</p>
                            <Button
                              className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-xs sm:text-sm"
                              onClick={() => setActiveTab("referrals")}
                            >
                              前往推广中心
                            </Button>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Referrals */}
            {activeTab === "referrals" && (
              <>
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-base sm:text-xl font-bold text-gray-900 flex items-center gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                        <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      推广中心
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">管理您的推广活动和分成收益</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    {/* Referral Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                      <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 sm:p-6 border border-orange-100 text-center">
                        <h3 className="text-xs font-medium text-gray-600 mb-2">交易记录</h3>
                        <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{transactions.length}</div>
                        <p className="text-xs text-gray-500">总交易次数</p>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 sm:p-6 border border-blue-100 text-center">
                        <h3 className="text-xs font-medium text-gray-600 mb-2">充值记录</h3>
                        <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">
                          {rechargeTransactions.length}
                        </div>
                        <p className="text-xs text-gray-500">总充值次数</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-4 sm:p-6 border border-green-100 text-center">
                        <h3 className="text-xs font-medium text-gray-600 mb-2">当前积分</h3>
                        <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">{currentUserData.credits}</div>
                        <p className="text-xs text-gray-500">可用积分余额</p>
                      </div>
                    </div>

                    {/* Referral Link */}
                    <Card className="mb-4 sm:mb-6 border border-orange-200 bg-orange-50/50">
                      <CardContent className="p-4 sm:p-6">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">我的专属推广链接</h3>
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-4">
                          <Input
                            value="https://writepro.com/ref?code=USER123"
                            readOnly
                            className="bg-white border-orange-200 text-xs sm:text-sm"
                          />
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              className="border-orange-200 hover:bg-orange-50 text-xs sm:text-sm"
                              onClick={copyReferralLink}
                            >
                              <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                              复制
                            </Button>
                            <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-xs sm:text-sm">
                              <Share2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                              分享
                            </Button>
                          </div>
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">
                          <p className="mb-2">
                            <span className="font-medium text-orange-600">推广奖励：</span>
                            您将获得被推荐用户首次消费金额的10%作为奖励
                          </p>
                          <p>
                            <span className="font-medium text-orange-600">长期收益：</span>
                            后续消费可持续获得5%的分成收益
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Tabs defaultValue="users" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6">
                        <TabsTrigger value="users" className="text-xs sm:text-sm">
                          推荐用户
                        </TabsTrigger>
                        <TabsTrigger value="earnings" className="text-xs sm:text-sm">
                          分成收益
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="users" className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-2 sm:space-y-0">
                          <div className="flex items-center space-x-2">
                            <Input
                              placeholder="搜索用户..."
                              className="w-full sm:w-64 border-orange-200 focus:border-orange-400 text-xs sm:text-sm"
                            />
                            <Button variant="outline" className="border-orange-200 hover:bg-orange-50">
                              <Search className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Select>
                              <SelectTrigger className="w-[120px] sm:w-[180px] border-orange-200 focus:border-orange-400 text-xs sm:text-sm">
                                <SelectValue placeholder="用户状态" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">全部状态</SelectItem>
                                <SelectItem value="active">已消费</SelectItem>
                                <SelectItem value="pending">未消费</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="outline"
                              className="border-orange-200 hover:bg-orange-50 text-xs sm:text-sm"
                            >
                              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                              <span className="hidden sm:inline">日期</span>
                            </Button>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    用户ID
                                  </th>
                                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    用户名
                                  </th>
                                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    注册日期
                                  </th>
                                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    消费积分
                                  </th>
                                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    分成积分
                                  </th>
                                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    状态
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {referrals.map((referral) => (
                                  <tr key={referral.id} className="hover:bg-gray-50">
                                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                                      {referral.id}
                                    </td>
                                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                                      {referral.name}
                                    </td>
                                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                                      {referral.date}
                                    </td>
                                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                                      {referral.consumption}积分
                                    </td>
                                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-green-600">
                                      {referral.commission}积分
                                    </td>
                                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                                      {getReferralStatusBadge(referral.status)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 space-y-2 sm:space-y-0">
                          <div className="text-xs sm:text-sm text-gray-500">显示 1 - 5 共 12 条记录</div>
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <Button variant="outline" size="sm" disabled className="text-xs">
                              上一页
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-orange-500 text-white border-orange-500 text-xs"
                            >
                              1
                            </Button>
                            <Button variant="outline" size="sm" className="text-xs">
                              2
                            </Button>
                            <Button variant="outline" size="sm" className="text-xs">
                              3
                            </Button>
                            <Button variant="outline" size="sm" className="text-xs">
                              下一页
                            </Button>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="earnings" className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-2 sm:space-y-0">
                          <div className="flex items-center space-x-2">
                            <Input
                              placeholder="搜索记录..."
                              className="w-full sm:w-64 border-orange-200 focus:border-orange-400 text-xs sm:text-sm"
                            />
                            <Button variant="outline" className="border-orange-200 hover:bg-orange-50">
                              <Search className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              className="border-orange-200 hover:bg-orange-50 text-xs sm:text-sm"
                            >
                              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                              <span className="hidden sm:inline">日期筛选</span>
                            </Button>
                            <Button
                              variant="outline"
                              className="border-orange-200 hover:bg-orange-50 text-xs sm:text-sm"
                            >
                              <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                              <span className="hidden sm:inline">导出</span>
                            </Button>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    记录ID
                                  </th>
                                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    用户
                                  </th>
                                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    服务类型
                                  </th>
                                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    分成积分
                                  </th>
                                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    日期
                                  </th>
                                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    状态
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {commissions.map((commission) => (
                                  <tr key={commission.id} className="hover:bg-gray-50">
                                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                                      {commission.id}
                                    </td>
                                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                                      {commission.user || commission.name}
                                    </td>
                                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                                      {commission.service}
                                    </td>
                                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-green-600">
                                      {commission.amount}积分
                                    </td>
                                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                                      {commission.date}
                                    </td>
                                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                                      <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                                        <CheckCircle className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                                        已到账
                                      </Badge>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 space-y-2 sm:space-y-0">
                          <div className="text-xs sm:text-sm text-gray-500">显示 1 - 4 共 8 条记录</div>
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <Button variant="outline" size="sm" disabled className="text-xs">
                              上一页
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-orange-500 text-white border-orange-500 text-xs"
                            >
                              1
                            </Button>
                            <Button variant="outline" size="sm" className="text-xs">
                              2
                            </Button>
                            <Button variant="outline" size="sm" disabled className="text-xs">
                              下一页
                            </Button>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>

                    {/* Withdrawal Section */}
                    <Card className="mt-4 sm:mt-6 border border-green-200 bg-green-50/50">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                          <div>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">分成收益提现</h3>
                            <p className="text-xs sm:text-sm text-gray-600 mb-2">
                              当前可提现金额: ¥{userData.commission.toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500">提现金额最低¥50，1-3个工作日到账</p>
                          </div>
                          <Button className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-xs sm:text-sm">
                            申请提现
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Coupons */}
            {activeTab === "coupons" && (
              <>
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-base sm:text-xl font-bold text-gray-900 flex items-center gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                        <Ticket className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      优惠券
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">管理您的优惠券和积分</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                      <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 sm:p-6 border border-orange-100">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">交易记录</h3>
                        <div className="text-2xl sm:text-3xl font-bold text-orange-600 mb-4">{transactions.length}条</div>
                        <p className="text-xs sm:text-sm text-gray-600">查看您的所有交易记录</p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 sm:p-6 border border-purple-100">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">我的积分</h3>
                        <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-4">{currentUserData.credits}</div>
                        <p className="text-xs sm:text-sm text-gray-600">积分可用于各种服务消费</p>
                      </div>
                    </div>

                    <Tabs defaultValue="available" className="w-full">
                      <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6">
                        <TabsTrigger value="available" className="text-xs sm:text-sm">
                          可用优惠券
                        </TabsTrigger>
                        <TabsTrigger value="used" className="text-xs sm:text-sm">
                          已使用
                        </TabsTrigger>
                        <TabsTrigger value="expired" className="text-xs sm:text-sm">
                          已过期
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="available" className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
                          {coupons.map((coupon) => (
                            <div
                              key={coupon.id}
                              className="bg-white rounded-lg border border-orange-200 overflow-hidden flex"
                            >
                              <div className="w-2 bg-gradient-to-b from-orange-400 to-red-400"></div>
                              <div className="p-3 sm:p-4 flex-1">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="text-sm sm:text-base font-semibold text-gray-900">{coupon.name}</h4>
                                    <p className="text-xs text-gray-500 mt-1">
                                      满{coupon.minSpend}元可用，有效期至{coupon.expiry}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-lg sm:text-xl font-bold text-orange-600">
                                      ¥{coupon.discount}
                                    </div>
                                    <Badge className="bg-orange-100 text-orange-700 border-orange-200 mt-1 text-xs">
                                      <CheckCircle className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                                      可用
                                    </Badge>
                                  </div>
                                </div>
                                <div className="mt-3 sm:mt-4 flex justify-end">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-orange-200 hover:bg-orange-50 text-orange-600 text-xs sm:text-sm"
                                  >
                                    立即使用
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="used">
                        <div className="bg-white rounded-lg p-4 sm:p-6 text-center">
                          <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                              <Ticket className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                            </div>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">暂无已使用优惠券</h3>
                            <p className="text-xs sm:text-sm text-gray-600 mb-6">您还没有使用过任何优惠券</p>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="expired">
                        <div className="bg-white rounded-lg p-4 sm:p-6 text-center">
                          <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                              <XCircle className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                            </div>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">暂无已过期优惠券</h3>
                            <p className="text-xs sm:text-sm text-gray-600 mb-6">您的优惠券都在有效期内</p>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>

                    {/* Points Exchange */}
                    <Card className="mt-4 sm:mt-6 border border-purple-200 bg-purple-50/50">
                      <CardContent className="p-4 sm:p-6">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">积分兑换</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                          <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 text-center">
                            <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-2">¥10优惠券</h4>
                            <p className="text-xs sm:text-sm text-gray-600 mb-3">无门槛使用</p>
                            <div className="text-purple-600 font-semibold mb-3 text-sm sm:text-base">200积分</div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-purple-200 hover:bg-purple-50 text-xs sm:text-sm"
                            >
                              立即兑换
                            </Button>
                          </div>
                          <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 text-center">
                            <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-2">¥30优惠券</h4>
                            <p className="text-xs sm:text-sm text-gray-600 mb-3">满100元可用</p>
                            <div className="text-purple-600 font-semibold mb-3 text-sm sm:text-base">500积分</div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-purple-200 hover:bg-purple-50 text-xs sm:text-sm"
                            >
                              立即兑换
                            </Button>
                          </div>
                          <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 text-center">
                            <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-2">¥50优惠券</h4>
                            <p className="text-xs sm:text-sm text-gray-600 mb-3">满200元可用</p>
                            <div className="text-purple-600 font-semibold mb-3 text-sm sm:text-base">1000积分</div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-purple-200 hover:bg-purple-50 text-xs sm:text-sm"
                            >
                              立即兑换
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Membership */}
            {activeTab === "membership" && (
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-base sm:text-xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                      <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    会员权益
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">享受专属会员特权和优惠</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="bg-white rounded-lg p-4 sm:p-6 text-center">
                    <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                        <Crown className="h-6 w-6 sm:h-8 sm:w-8 text-amber-600" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">会员权益</h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-6">更多会员特权正在开发中，敬请期待</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Settings */}
            {activeTab === "settings" && (
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-base sm:text-xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                      <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    账户设置
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">管理您的账户信息和偏好设置</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="bg-white rounded-lg p-4 sm:p-6 text-center">
                    <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Settings className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">账户设置</h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-6">设置功能正在开发中，敬请期待</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
