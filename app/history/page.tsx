'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  FileText,
  Download,
  Eye,
  Search,
  Filter,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  ArrowLeft,
  MoreHorizontal,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface HistoryItem {
  id: string
  order_number: string
  status: "pending" | "paid" | "processing" | "completed" | "cancelled" | "refunded"
  total_amount: number
  created_at: string
  updated_at: string
  document?: {
    id: string
    original_file: string
    status: string
    word_count?: number
  }
}

// 状态映射
const statusMap = {
  pending: { label: "待支付", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  paid: { label: "已支付", color: "bg-blue-100 text-blue-700 border-blue-200" },
  processing: { label: "处理中", color: "bg-blue-100 text-blue-700 border-blue-200" },
  completed: { label: "已完成", color: "bg-green-100 text-green-700 border-green-200" },
  cancelled: { label: "已取消", color: "bg-gray-100 text-gray-700 border-gray-200" },
  refunded: { label: "已退款", color: "bg-red-100 text-red-700 border-red-200" },
}

export default function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [orders, setOrders] = useState<HistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // 获取订单列表
  const fetchOrders = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }
      
      const token = localStorage.getItem('access_token')
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch('/api/v1/orders/', {
        method: 'GET',
        headers,
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('请先登录')
        }
        const errorData = await response.json()
        throw new Error(errorData.detail || '获取订单列表失败')
      }

      const data = await response.json()
      setOrders(data.results || data || [])
      setError(null)
    } catch (err: any) {
      console.error('获取订单列表错误:', err)
      setError(err.message || '加载订单列表时发生错误')
      if (err.message === '请先登录') {
        // 可以在这里重定向到登录页面
        window.location.href = '/auth/login'
      }
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // 页面加载时获取订单
  useEffect(() => {
    fetchOrders()
  }, [])

  // 定时刷新处理中的订单状态
  useEffect(() => {
    const hasProcessingOrders = orders.some(order => order.status === 'processing')
    
    if (hasProcessingOrders) {
      const interval = setInterval(() => {
        fetchOrders(true) // 静默刷新
      }, 30000) // 每30秒刷新一次

      return () => clearInterval(interval)
    }
  }, [orders])

  const getStatusBadge = (status: string) => {
    const statusInfo = statusMap[status as keyof typeof statusMap] || {
      label: status,
      color: "bg-gray-100 text-gray-700 border-gray-200"
    }

    const IconComponent = {
      completed: CheckCircle,
      processing: Clock,
      paid: Clock,
      pending: Clock,
      cancelled: XCircle,
      refunded: XCircle,
    }[status] || Clock

    return (
      <Badge className={statusInfo.color}>
        <IconComponent className="w-3 h-3 mr-1" />
        {statusInfo.label}
      </Badge>
    )
  }

  const filteredOrders = orders.filter((order) => {
    const fileName = order.document?.original_file || order.order_number
    const matchesSearch = fileName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleRefresh = () => {
    fetchOrders(true)
    toast.success('订单列表已刷新')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getFileName = (order: HistoryItem) => {
    if (order.document?.original_file) {
      // 从文件路径中提取文件名
      const parts = order.document.original_file.split('/')
      return parts[parts.length - 1]
    }
    return `订单 ${order.order_number}`
  }

  if (isLoading && !isRefreshing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-500" />
          <p className="text-gray-600">加载订单列表中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">加载失败</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button onClick={() => fetchOrders()} className="bg-orange-500 hover:bg-orange-600">
              重试
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header */}
      <header className="border-b border-orange-200/50 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  返回首页
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-bold text-gray-900">处理历史</h1>
              {isRefreshing && (
                <RefreshCw className="h-4 w-4 animate-spin text-orange-500" />
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                刷新
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                导出记录
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="搜索订单号或文件名..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-orange-200 focus:border-orange-400"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-orange-200 focus:border-orange-400">
                  <SelectValue placeholder="状态筛选" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="pending">待支付</SelectItem>
                  <SelectItem value="paid">已支付</SelectItem>
                  <SelectItem value="processing">处理中</SelectItem>
                  <SelectItem value="completed">已完成</SelectItem>
                  <SelectItem value="cancelled">已取消</SelectItem>
                  <SelectItem value="refunded">已退款</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center text-sm text-gray-500">
                共 {filteredOrders.length} 条记录
              </div>
              <Button variant="outline" className="border-orange-200 hover:bg-orange-50">
                <Filter className="h-4 w-4 mr-2" />
                高级筛选
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card
              key={order.id}
              className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow"
            >
              <CardContent className="p-6">
                <div className="grid lg:grid-cols-12 gap-4 items-center">
                  {/* File Info */}
                  <div className="lg:col-span-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 truncate">{getFileName(order)}</h3>
                        <p className="text-sm text-gray-500">订单号: {order.order_number}</p>
                        <p className="text-xs text-gray-400">ID: {order.id}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status & Time */}
                  <div className="lg:col-span-2">
                    <div className="space-y-1">
                      {getStatusBadge(order.status)}
                      <div className="text-xs text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(order.created_at)}
                        </div>
                        {order.status === 'completed' && (
                          <div className="text-green-600 mt-1">
                            完成: {formatDate(order.updated_at)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Document Info */}
                  <div className="lg:col-span-2">
                    <div className="text-sm">
                      <div className="text-gray-600">文档状态</div>
                      <div className="font-medium text-gray-900">
                        {order.document?.status || '无文档'}
                      </div>
                      {order.document?.word_count && (
                        <div className="text-xs text-gray-500">
                          {order.document.word_count.toLocaleString()} 字
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="lg:col-span-2">
                    <div className="text-sm">
                      <div className="text-gray-600">订单金额</div>
                      <div className="text-orange-600 font-semibold text-lg">
                        ¥{parseFloat(order.total_amount.toString()).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="lg:col-span-2">
                    <div className="flex items-center space-x-2">
                      {order.status === "completed" && (
                        <>
                          <Link href={`/paper/${order.order_number}`}>
                            <Button size="sm" variant="outline" className="border-orange-200 hover:bg-orange-50">
                              <Eye className="h-4 w-4 mr-1" />
                              查看
                            </Button>
                          </Link>
                          <Button size="sm" variant="outline" className="border-orange-200 hover:bg-orange-50">
                            <Download className="h-4 w-4 mr-1" />
                            下载
                          </Button>
                        </>
                      )}
                      {(order.status === "processing" || order.status === "paid") && (
                        <Link href={`/paper/${order.order_number}`}>
                          <Button size="sm" variant="outline" className="border-blue-200 hover:bg-blue-50">
                            <Clock className="h-4 w-4 mr-1" />
                            查看进度
                          </Button>
                        </Link>
                      )}
                      {order.status === "pending" && (
                        <Button size="sm" variant="outline" className="border-yellow-200 hover:bg-yellow-50">
                          去支付
                        </Button>
                      )}
                      <Button size="sm" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredOrders.length === 0 && !isLoading && (
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm || statusFilter !== 'all' ? '没有找到匹配的订单' : '暂无处理记录'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || statusFilter !== 'all' 
                  ? '请尝试调整搜索条件或筛选器' 
                  : '您还没有提交过任何文档处理请求'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Link href="/">
                  <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                    开始使用服务
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}

        {/* Pagination - 可以后续添加 */}
        {filteredOrders.length > 0 && (
          <div className="flex justify-center mt-8">
            <div className="text-sm text-gray-500">
              显示 {filteredOrders.length} 条记录
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
