'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Calendar, CreditCard, Filter, Search, ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface RechargeRecord {
  id: number
  amount: number
  credits_received: number
  bonus_credits: number
  payment_method: string
  status: 'pending' | 'completed' | 'failed'
  transaction_id: string
  created_at: string
  package_name: string
}

interface PaginationInfo {
  count: number
  next: string | null
  previous: string | null
  page_size: number
  current_page: number
  total_pages: number
}

export default function RechargeHistoryPage() {
  const [records, setRecords] = useState<RechargeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<PaginationInfo>({
    count: 0,
    next: null,
    previous: null,
    page_size: 10,
    current_page: 1,
    total_pages: 1
  })
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    date_from: '',
    date_to: ''
  })

  // 获取充值记录
  const fetchRechargeRecords = async (page = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pagination.page_size.toString()
      })
      
      // 添加过滤条件
      if (filters.status) params.append('status', filters.status)
      if (filters.search) params.append('search', filters.search)
      if (filters.date_from) params.append('date_from', filters.date_from)
      if (filters.date_to) params.append('date_to', filters.date_to)
      
      const response = await fetch(`/api/payments/recharges/?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setRecords(data.results || [])
        setPagination({
          count: data.count || 0,
          next: data.next,
          previous: data.previous,
          page_size: data.page_size || 10,
          current_page: page,
          total_pages: Math.ceil((data.count || 0) / (data.page_size || 10))
        })
      } else {
        toast.error('获取充值记录失败')
      }
    } catch (error) {
      console.error('获取充值记录失败:', error)
      toast.error('获取充值记录失败')
    } finally {
      setLoading(false)
    }
  }

  // 处理过滤器变化
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  // 应用过滤器
  const applyFilters = () => {
    fetchRechargeRecords(1)
  }

  // 重置过滤器
  const resetFilters = () => {
    setFilters({
      status: '',
      search: '',
      date_from: '',
      date_to: ''
    })
    setTimeout(() => fetchRechargeRecords(1), 100)
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 格式化积分
  const formatCredits = (credits: number) => {
    return credits.toLocaleString()
  }

  // 获取状态显示
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            已完成
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            处理中
          </Badge>
        )
      case 'failed':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            失败
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary">
            {status}
          </Badge>
        )
    }
  }

  // 获取支付方式显示
  const getPaymentMethodDisplay = (method: string) => {
    switch (method) {
      case 'alipay':
        return '支付宝'
      case 'wechat':
        return '微信支付'
      case 'mock':
        return '模拟支付'
      default:
        return method
    }
  }

  useEffect(() => {
    fetchRechargeRecords()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 页面头部 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link href="/recharge">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回充值
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              充值记录
            </h1>
            <p className="text-gray-600 mt-2">
              查看您的历史充值记录和交易详情
            </p>
          </div>
        </div>
      </div>

      {/* 过滤器 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>筛选条件</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                状态
              </label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部状态</SelectItem>
                  <SelectItem value="completed">已完成</SelectItem>
                  <SelectItem value="pending">处理中</SelectItem>
                  <SelectItem value="failed">失败</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                搜索
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索交易ID或套餐名称"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                开始日期
              </label>
              <Input
                type="date"
                value={filters.date_from}
                onChange={(e) => handleFilterChange('date_from', e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                结束日期
              </label>
              <Input
                type="date"
                value={filters.date_to}
                onChange={(e) => handleFilterChange('date_to', e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex space-x-2 mt-4">
            <Button onClick={applyFilters} className="bg-orange-500 hover:bg-orange-600">
              应用筛选
            </Button>
            <Button variant="outline" onClick={resetFilters}>
              重置
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 充值记录表格 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>充值记录</span>
            </div>
            <div className="text-sm text-gray-600">
              共 {pagination.count} 条记录
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">加载中...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">暂无充值记录</p>
              <Link href="/recharge">
                <Button className="mt-4 bg-orange-500 hover:bg-orange-600">
                  立即充值
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>交易ID</TableHead>
                    <TableHead>套餐名称</TableHead>
                    <TableHead>支付金额</TableHead>
                    <TableHead>获得积分</TableHead>
                    <TableHead>赠送积分</TableHead>
                    <TableHead>支付方式</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>创建时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-mono text-sm">
                        {record.transaction_id}
                      </TableCell>
                      <TableCell className="font-medium">
                        {record.package_name}
                      </TableCell>
                      <TableCell className="font-semibold text-orange-600">
                        ¥{record.amount}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCredits(record.credits_received)}
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {record.bonus_credits > 0 ? formatCredits(record.bonus_credits) : '-'}
                      </TableCell>
                      <TableCell>
                        {getPaymentMethodDisplay(record.payment_method)}
                      </TableCell>
                      <TableCell>
                        {getStatusDisplay(record.status)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatDate(record.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 分页 */}
      {pagination.total_pages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-600">
            第 {pagination.current_page} 页，共 {pagination.total_pages} 页
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.previous}
              onClick={() => fetchRechargeRecords(pagination.current_page - 1)}
            >
              上一页
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.next}
              onClick={() => fetchRechargeRecords(pagination.current_page + 1)}
            >
              下一页
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}