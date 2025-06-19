"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FileText,
  Download,
  RefreshCw,
  Upload,
  CheckCircle,
  Clock,
  ArrowLeft,
  Eye,
  Copy,
  Share2,
  MoreHorizontal,
  Sparkles,
  Zap,
  Target,
  TrendingDown,
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

interface PaperData {
  id: string
  order_number: string
  status: "pending" | "paid" | "processing" | "completed" | "cancelled" | "refunded"
  total_amount: number
  created_at: string
  updated_at: string
  modifiedContent?: string
  document?: {
    id: string
    title: string
    original_file: string
    processed_file?: string
    status: string
    ai_detection_rate_before?: number
    ai_detection_rate_after?: number
    word_count: number
    created_at: string
    updated_at: string
  }
}

/*
const mockPaperData: PaperData = {
  id: "HIS001",
  fileName: "学术论文_人工智能发展趋势.docx",
  serviceType: "学术论文优化",
  status: "processing",
  submitTime: "2024-01-15 14:30",
  originalDetectionRate: 85,
  price: 299,
  wordCount: 8500,
  processingProgress: 65,
  estimatedTime: 8,
  originalContent: `人工智能技术的快速发展正在深刻改变着我们的生活和工作方式。从机器学习到深度学习，从自然语言处理到计算机视觉，AI技术在各个领域都展现出了巨大的潜力和应用价值。

在教育领域，AI技术正在革命性地改变传统的教学模式。智能教学系统能够根据学生的学习进度和能力水平，提供个性化的学习内容和教学方案。通过分析学生的学习数据，AI系统可以识别学生的薄弱环节，并针对性地提供辅导和练习。

在医疗健康领域，AI技术的应用同样令人瞩目。医学影像诊断、药物研发、疾病预测等方面都有AI技术的身影。AI辅助诊断系统能够帮助医生更准确地识别疾病，提高诊断效率和准确性。

然而，AI技术的发展也带来了一些挑战和问题。数据隐私、算法偏见、就业影响等问题需要我们认真思考和解决。如何在享受AI技术带来便利的同时，确保技术的安全性和公平性，是我们面临的重要课题。

展望未来，AI技术将继续快速发展，并在更多领域发挥重要作用。我们需要加强AI技术的研发和应用，同时也要重视相关的伦理和法律问题，确保AI技术能够真正造福人类社会。`,
}
*/

export default function PaperDetailPage() {
  const params = useParams()
  const orderId = params.id as string;
  const [paperData, setPaperData] = useState<PaperData | null>(null) // Initialize with null
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [countdown, setCountdown] = useState(0) // Initialize countdown
  const [activeTab, setActiveTab] = useState("original")
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async (orderNumber: string | undefined) => {
    if (!orderNumber) {
      console.error("订单号不存在");
      return;
    }
    try {
      const token = localStorage.getItem('access_token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      // 如果有处理后的文件，直接下载
      if (paperData?.document?.processed_file) {
        window.open(paperData.document.processed_file, '_blank');
        return;
      }
      // 否则尝试通过API下载
      const res = await fetch(`/api/v1/orders/${orderNumber}/download`, { headers });
      if (!res.ok) {
        throw new Error("下载失败");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `processed_${orderNumber}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("下载错误:", error);
    }
  };

  const fetchOrderDetails = async (currentOrderId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`/api/v1/orders/${orderId}/`, { headers });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "获取订单详情失败");
      }
      const data: PaperData = await res.json();
      setPaperData(data);
      // 如果是处理中状态，设置一个默认的倒计时
      if (data.status === "processing") {
        setCountdown(300); // 默认5分钟倒计时
      }
      setIsLoading(false);
      setError(null);
      return data;
    } catch (err: any) {
      console.error("获取订单详情错误:", err);
      setError(err.message || "加载订单信息时发生错误");
      setIsLoading(false);
      setPaperData(null);
      return null;
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails(orderId);
    }
  }, [orderId]);

  // Polling for status update and countdown effect
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (paperData && paperData.status === "processing") {
      intervalId = setInterval(async () => {
        setCountdown(async (prevCountdown) => {
          if (prevCountdown <= 1) {
            // Fetch latest status when countdown reaches zero or if it was already zero
            const updatedData = await fetchOrderDetails(orderId);
            if (updatedData && updatedData.status === "completed") {
              clearInterval(intervalId); // Stop polling if completed
            }
            return updatedData?.estimatedTime ? updatedData.estimatedTime * 60 : 0; // Reset countdown based on new data or to 0
          }
          return prevCountdown - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [paperData, orderId]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const formatTime = (minutes: number) => {
    const hrs = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hrs > 0) {
      return `${hrs}小时${mins}分钟`
    }
    return `${mins}分钟`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            已完成
          </Badge>
        )
      case "processing":
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            <Clock className="w-3 h-3 mr-1" />
            处理中
          </Badge>
        )
      case "paid":
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            <Clock className="w-3 h-3 mr-1" />
            已支付
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            待支付
          </Badge>
        )
      case "cancelled":
        return (
          <Badge className="bg-gray-100 text-gray-700 border-gray-200">
            <Clock className="w-3 h-3 mr-1" />
            已取消
          </Badge>
        )
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <Clock className="w-3 h-3 mr-1" />
            失败
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header */}
      <header className="border-b border-orange-200/50 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/history">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  返回列表
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 truncate max-w-md">{paperData?.document?.title || paperData?.order_number || '加载中...'}</h1>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>订单号: {paperData?.order_number || '加载中...'}</span>
                  <span>•</span>
                  <span>ID: {paperData?.id || 'N/A'}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {paperData?.status ? getStatusBadge(paperData.status) : <Badge>加载中...</Badge>}
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                分享
              </Button>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Status Bar */}
        <Card className="mb-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="grid md:grid-cols-4 gap-4 items-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{paperData?.document?.word_count?.toLocaleString() || '-'}</div>
                <div className="text-sm text-gray-500">总字数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{paperData?.document?.ai_detection_rate_before !== undefined ? `${paperData.document.ai_detection_rate_before}%` : '-'}</div>
                <div className="text-sm text-gray-500">原始检测率</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {paperData?.status === 'completed' && paperData?.document?.ai_detection_rate_after !== undefined ? `${paperData.document.ai_detection_rate_after}%` : (paperData?.status === 'processing' ? '处理中' : '-')}
                </div>
                <div className="text-sm text-gray-500">目标检测率</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{paperData?.total_amount !== undefined ? `¥${parseFloat(paperData.total_amount.toString()).toFixed(2)}` : '-'}</div>
                <div className="text-sm text-gray-500">服务费用</div>
              </div>
            </div>
            {paperData?.status === "processing" && (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">处理进度</span>
                  <span className="text-sm text-gray-500">处理中...</span>
                </div>
                <Progress value={50} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6 lg:items-stretch">
          {/* Left Side - Original Content */}
          <div className="flex flex-col">
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm h-full">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  原始文档
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 flex flex-col">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                  <TabsList className="grid w-full grid-cols-2 mb-4 bg-orange-50 p-1">
                    <TabsTrigger
                      value="original"
                      className="data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm font-medium text-sm"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      查看原文
                    </TabsTrigger>
                    <TabsTrigger
                      value="reupload"
                      className="data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm font-medium text-sm"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      重新上传
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="original" className="flex-1 flex flex-col">
                    <div className="flex-1 border border-orange-200 rounded-lg p-4 bg-gray-50 overflow-y-auto max-h-[600px]">
                      <div className="prose prose-sm max-w-none">
                        {paperData?.document?.original_file ? (
                          <div className="text-center py-8">
                            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 mb-2">原始文档</p>
                            <p className="text-sm text-gray-500">{paperData.document.original_file.split('/').pop()}</p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-4 border-orange-200 hover:bg-orange-50"
                              onClick={() => window.open(paperData.document?.original_file, '_blank')}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              查看原文
                            </Button>
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-8">暂无原始内容</p>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                      <span>上传时间: {paperData?.created_at ? new Date(paperData.created_at).toLocaleString('zh-CN') : 'N/A'}</span>
                      <Button variant="outline" size="sm" className="border-orange-200 hover:bg-orange-50">
                        <Copy className="h-4 w-4 mr-1" />
                        复制原文
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="reupload" className="flex-1 flex flex-col">
                    <div
                      className="flex-1 border-2 border-dashed border-orange-300 rounded-xl p-8 text-center hover:border-orange-400 hover:bg-orange-50/50 transition-all duration-300 cursor-pointer group"
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById("file-reupload")?.click()}
                    >
                      {selectedFile ? (
                        <div className="flex items-center justify-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                            <FileText className="h-6 w-6 text-white" />
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-lg text-gray-800">{selectedFile.name}</p>
                            <p className="text-gray-500 text-sm">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            <Badge className="bg-green-100 text-green-700 border-green-200 mt-1">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              准备就绪
                            </Badge>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                            <Upload className="h-8 w-8 text-orange-500" />
                          </div>
                          <p className="text-lg font-bold text-gray-800 mb-2">重新上传文档</p>
                          <p className="text-gray-500 mb-4 text-sm">支持 PDF、Word、TXT、PPT 等格式</p>
                        </div>
                      )}
                      <input
                        id="file-reupload"
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
                        onChange={handleFileUpload}
                      />
                    </div>
                    {selectedFile && (
                      <div className="mt-4">
                        <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          开始重新处理
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Modified Content or Loading */}
          <div className="flex flex-col">
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm h-full">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  优化结果
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                {paperData?.status === "completed" && paperData?.modifiedContent ? (
                  // 完成状态 - 显示修改后的内容
                  <div className="flex-1 flex flex-col">
                    <div className="flex-1 border border-green-200 rounded-lg p-4 bg-green-50/30 overflow-y-auto max-h-[600px]">
                      <div className="prose prose-sm max-w-none">
                        {(paperData?.modifiedContent || '').split("\n\n").map((paragraph, index) => (
                          <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">完成时间: {paperData?.updated_at ? new Date(paperData.updated_at).toLocaleString('zh-CN') : 'N/A'}</span>
                        <div className="flex items-center gap-2">
                          <TrendingDown className="h-4 w-4 text-green-500" />
                          <span className="text-green-600 font-medium">
                            检测率降低 {paperData?.document?.ai_detection_rate_before !== undefined && paperData?.document?.ai_detection_rate_after !== undefined ? (paperData.document.ai_detection_rate_before - paperData.document.ai_detection_rate_after).toFixed(1) : 0}%
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                          onClick={() => handleDownload(paperData?.order_number)}
                          disabled={!paperData || paperData.status !== 'completed'}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          下载结果
                        </Button>
                        <Button variant="outline" className="border-green-200 hover:bg-green-50">
                          <Copy className="h-4 w-4 mr-1" />
                          复制
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // 处理中状态 - 显示加载动画和倒计时
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    {/* 华丽的加载动画 */}
                    <div className="relative mb-8">
                      <div className="w-32 h-32 relative">
                        {/* 外圈旋转动画 */}
                        <div className="absolute inset-0 border-4 border-orange-200 rounded-full animate-spin">
                          <div className="absolute top-0 left-1/2 w-2 h-2 bg-orange-500 rounded-full transform -translate-x-1/2 -translate-y-1"></div>
                        </div>
                        {/* 中圈反向旋转 */}
                        <div className="absolute inset-2 border-4 border-blue-200 rounded-full animate-spin-reverse">
                          <div className="absolute top-0 left-1/2 w-2 h-2 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1"></div>
                        </div>
                        {/* 内圈脉冲动画 */}
                        <div className="absolute inset-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center animate-pulse">
                          <Zap className="h-8 w-8 text-white" />
                        </div>
                        {/* 光晕效果 */}
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full animate-ping"></div>
                      </div>
                    </div>

                    <div className="space-y-4 max-w-sm">
                      <h3 className="text-2xl font-bold text-gray-900">AI正在优化您的文档</h3>
                      <p className="text-gray-600">
                        我们的智能算法正在分析您的内容，并进行专业的降重处理，请耐心等待...
                      </p>

                      {/* 倒计时 */}
                      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Clock className="h-5 w-5 text-orange-500" />
                          <span className="font-semibold text-gray-900">预计剩余时间</span>
                        </div>
                        <div className="text-3xl font-bold text-orange-600">{formatTime(countdown)}</div>
                      </div>

                      {/* 处理步骤 */}
                      <div className="space-y-3 text-left">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-sm text-gray-600">文档解析完成</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-sm text-gray-600">AI检测分析完成</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center animate-spin">
                            <Target className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-sm text-gray-600">智能降重处理中...</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                            <Clock className="h-4 w-4 text-gray-500" />
                          </div>
                          <span className="text-sm text-gray-400">质量检查待处理</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }
        .animate-spin-reverse {
          animation: spin-reverse 3s linear infinite;
        }
      `}</style>
    </div>
  )
}
