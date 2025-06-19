"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  ArrowRight,
  CheckCircle,
  FileText,
  Upload,
  Zap,
  Sparkles,
  Bot,
  UserRound,
  Shield,
  Clock,
  CheckCheck,
  QrCode,
  History,
  CreditCard,
  AlertCircle,
  Coins,
  Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { useRouter } from 'next/navigation'; 

export default function HomePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [textContent, setTextContent] = useState("")
  const [activeTab, setActiveTab] = useState("upload")
  const [serviceMode, setServiceMode] = useState("auto") // "auto" or "human"
  const [mounted, setMounted] = useState(false)
  const [termsOpen, setTermsOpen] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [orderSubmittedOpen, setOrderSubmittedOpen] = useState(false)
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null)
  const [paymentStep, setPaymentStep] = useState<"payment" | "success">("payment")
  const [usePoints, setUsePoints] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [processedResult, setProcessedResult] = useState<string | null>(null)
  const [documentId, setDocumentId] = useState<string | null>(null); // <--- 添加 documentId 状态
  const { toast } = useToast()
  const router = useRouter(); // 初始化 useRouter

  // 模拟用户数据 - 在实际应用中这应该从全局状态获取
  const user = {
    id: "1",
    name: "张三",
    email: "zhangsan@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    points: 1250,
  }

  // 防止服务端渲染和客户端渲染不一致的问题
  useEffect(() => {
    setMounted(true)
  }, [])

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

  const getPricePerThousand = () => {
    return serviceMode === "auto" ? 29 : 99
  }

  const getWordCount = () => {
    if (activeTab === "upload" && selectedFile) {
      // 假设每个文件1000字
      return 1000
    } else if (activeTab === "paste" && textContent) {
      return textContent.length
    }
    return 0
  }

  const getTotalPrice = () => {
    const wordCount = getWordCount()
    const pricePerThousand = getPricePerThousand()
    const totalPrice = Math.max(pricePerThousand, Math.ceil(wordCount / 1000) * pricePerThousand)

    if (usePoints && user) {
      const pointsDiscount = Math.min(user.points * 0.01, totalPrice) // 1积分=0.01元
      return Math.max(0, totalPrice - pointsDiscount)
    }

    return totalPrice
  }

  const getPointsUsed = () => {
    if (!usePoints || !user) return 0
    const wordCount = getWordCount()
    const pricePerThousand = getPricePerThousand()
    const totalPrice = Math.max(pricePerThousand, Math.ceil(wordCount / 1000) * pricePerThousand)
    return Math.min(user.points, totalPrice * 100) // 1元=100积分
  }

  const handleStartOptimization = async () => {
    const wordCount = getWordCount()

    if (wordCount === 0) {
      toast({
        title: (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center">
              <AlertCircle className="h-3 w-3 text-white" />
            </div>
            <span>内容为空</span>
          </div>
        ),
        description: "请先上传文档或粘贴文本内容，然后再开始优化服务",
        variant: "destructive",
        duration: 2000,
      })
      return
    }

    // 弹出付费弹窗
    setPaymentOpen(true)
  }

  const handleUploadNewDocument = () => {
    // 清除当前上传文档状态
    setSelectedFile(null)
    setTextContent('')
    setProcessedResult(null)
    setProcessingProgress(0)
    setCurrentOrderId(null)
    setOrderSubmittedOpen(false)
    
    // 重置文件输入
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const handlePaymentSuccess = async () => {
    setPaymentOpen(false)
    setIsProcessing(true)
    setProcessingProgress(0)
    let currentUploadedDocumentId: string | null = null; // 用于存储本次上传的 documentId
    
    try {
      if (activeTab === "upload" && selectedFile) {
        // 1. 文件上传到 /api/v1/documents/upload/
        const docFormData = new FormData()
        docFormData.append('file', selectedFile)
        
        console.log('[DocumentUpload] Attempting to upload document...');
        const docUploadResponse = await fetch('/api/v1/core/documents/upload/', {
          method: 'POST',
          body: docFormData,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          },
        });

        if (!docUploadResponse.ok) {
          const errorText = await docUploadResponse.text();
          console.error('[DocumentUpload] Document upload failed. Status:', docUploadResponse.status, 'Response:', errorText);
          throw new Error(`文档上传失败: ${errorText}`);
        }

        const docUploadResult = await docUploadResponse.json();
        currentUploadedDocumentId = docUploadResult.document_id;
        setDocumentId(currentUploadedDocumentId); // 保存到状态，虽然在此函数后续流程中我们直接用 currentUploadedDocumentId
        console.log('[DocumentUpload] Document uploaded successfully, document_id:', currentUploadedDocumentId);

        // 2. 调用核心文件处理 /api/v1/core/file/process/
        console.log('[FileProcess] Attempting to process file with document_id:', currentUploadedDocumentId);
        const processResponse = await fetch('/api/v1/core/file/process/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          },
          body: JSON.stringify({
            document_id: currentUploadedDocumentId, // 使用获取到的 document_id
            service_type: serviceMode === 'auto' ? 'standard' : 'enhanced', 
            reduction_level: serviceMode === 'auto' ? 'medium' : 'high'
          }),
        });

        if (!processResponse.ok) {
          const errorText = await processResponse.text();
          console.error('[FileProcess] Failed to start processing. Status:', processResponse.status, 'Response:', errorText);
          throw new Error(`文件处理请求失败: ${errorText}`);
        }

        const result = await processResponse.json();
        setProcessingId(result.processing_id);
        
        // 检查是否文档已经在处理中
        if (result.status === 'already_processing') {
          // 文档已经在处理中，直接创建订单
          console.log('[FileProcess] Document already processing, creating order directly');
          setIsProcessing(false);
          setProcessingProgress(100);
          
          // 直接创建订单
          await createOrder(currentUploadedDocumentId);
          return;
        }
        
        toast({
          title: "处理开始",
          description: "文件正在处理中，请稍候...",
          duration: 3000,
        });
        pollProcessingStatus(result.processing_id, currentUploadedDocumentId); // <--- 传递 document_id

      } else if (activeTab === "paste" && textContent) {
        // 文本处理 (保持不变, 但确保 pollProcessingStatus 调用传递 null for documentId)
        console.log('[TextProcess] Attempting to process text...');
        const response = await fetch('/api/v1/core/text/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          },
          body: JSON.stringify({
            content: textContent, // 确保这里是 content
            service_type: serviceMode === 'auto' ? 'standard' : 'enhanced',
            reduction_level: serviceMode === 'auto' ? 'medium' : 'high'
          }),
        });
        
        if (response?.ok) {
          const result = await response.json();
          setProcessingId(result.processing_id);
          toast({
            title: "处理开始",
            description: "文本正在处理中，请稍候...",
            duration: 3000,
          });
          pollProcessingStatus(result.processing_id, null); // 文本处理，documentId 为 null
        } else {
          const errorText = await response.text();
          console.error('[TextProcess] Failed to start processing. Status:', response.status, 'Response:', errorText);
          throw new Error(`文本处理请求失败: ${errorText}`);
        }
      } else {
        throw new Error('没有选择文件或输入文本内容');
      }
    } catch (error) {
      console.error('处理失败:', error);
      setIsProcessing(false);
      toast({
        title: "处理失败",
        description: (error as Error).message || "请稍后重试或联系客服",
        variant: "destructive",
        duration: 3000,
      });
    }
  }

  // 创建订单的独立函数
  const createOrder = async (currentDocumentIdForOrder: string | null) => {
    try {
      const calculatedPrice = getTotalPrice(); 
      const orderPayload: any = {
        product_name: activeTab === 'upload' && selectedFile ? selectedFile.name : (activeTab === 'paste' ? '文本处理服务' : '未知产品'),
        total_amount: calculatedPrice, 
        payment_method: 'wechat_pay', 
      };

      if (activeTab === "upload") {
        if (currentDocumentIdForOrder) {
          orderPayload.document_id = currentDocumentIdForOrder;
          console.log('[OrderCreation] For upload order, using document_id:', currentDocumentIdForOrder);
        } else {
          console.error('[OrderCreation] CRITICAL ERROR: document_id is missing for an upload order.');
          toast({
            title: "订单创建严重错误",
            description: "文档ID丢失，无法创建上传文件的订单。请重新尝试或联系支持。",
            variant: "destructive",
            duration: 7000,
          });
          return; 
        }
      }
      
      console.log('[OrderCreation] Attempting to create order with payload:', JSON.stringify(orderPayload, null, 2));
      const orderResponse = await fetch('/api/v1/orders/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(orderPayload),
      });

      console.log('[OrderCreation] Order response status:', orderResponse.status);
      console.log('[OrderCreation] Order response ok:', orderResponse.ok);

      if (orderResponse.ok) {
        const orderData = await orderResponse.json();
        console.log('[OrderCreation] Order created successfully:', JSON.stringify(orderData, null, 2));
        setCurrentOrderId(orderData.order_number); 
        setOrderSubmittedOpen(true);
        toast({
          title: "订单创建成功",
          description: `您的订单 ${orderData.order_number} 已成功提交。`,
          duration: 3000,
        });
      } else {
        let errorDataText = await orderResponse.text();
        console.error('[OrderCreation] Failed to create order. Status:', orderResponse.status, 'Response text:', errorDataText);
        let errorData;
        try {
          errorData = JSON.parse(errorDataText);
        } catch (e) {
          errorData = { detail: errorDataText || "未知错误，响应不是有效的JSON" };
        }
        const errorMessage = errorData.document_id ? `文档ID: ${errorData.document_id.join(', ')}` : (errorData.detail || '请检查提交的信息');
        toast({
          title: "订单创建失败",
          description: `原因: ${errorMessage}`, 
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch (orderError) {
      console.error('[OrderCreation] Error during fetch request for order creation:', orderError);
      toast({
        title: "订单创建请求错误",
        description: (orderError as Error).message || "无法连接到订单服务，请检查网络连接或稍后重试。",
        variant: "destructive",
        duration: 3000,
      });
    }
  }

  const pollProcessingStatus = async (processingId: string, currentDocumentIdForOrder: string | null) => { // <--- 重命名第二个参数以明确其用途
    const pollInterval = setInterval(async () => {
      try {
        const endpoint = activeTab === "upload" ? '/api/v1/core/file/status' : '/api/v1/core/text/status';
        const queryParams = new URLSearchParams({ processing_id: processingId });
        
        if (activeTab === "upload" && currentDocumentIdForOrder) { // 使用 currentDocumentIdForOrder 进行状态查询
          queryParams.append('document_id', currentDocumentIdForOrder);
          console.log('[PollingStatus] For file, using document_id:', currentDocumentIdForOrder);
        }

        const response = await fetch(`${endpoint}?${queryParams.toString()}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          },
        });
        
        if (response.ok) {
          const status = await response.json();
          setProcessingProgress(status.progress || 0);
          
          if (status.status === 'completed') {
            clearInterval(pollInterval);
            setIsProcessing(false);
            setProcessingProgress(100);
            
            if (activeTab === "paste") {
              setProcessedResult(status.processed_text);
            }
            
            // 调用创建订单函数
            await createOrder(currentDocumentIdForOrder);
            
          } else if (status.status === 'failed') {
            clearInterval(pollInterval);
            setIsProcessing(false);
            toast({
              title: "处理失败",
              description: status.error || "处理过程中出现错误",
              variant: "destructive",
              duration: 3000,
            });
          }
        } else { // response not ok for polling
            clearInterval(pollInterval);
            setIsProcessing(false);
            const errorText = await response.text();
            console.error('[PollingStatus] Failed to get processing status. Status:', response.status, 'Response:', errorText);
            toast({
                title: "获取处理状态失败",
                description: `错误: ${errorText || '未知错误'}`, 
                variant: "destructive",
                duration: 3000,
            });
        }
      } catch (error) {
        clearInterval(pollInterval);
        setIsProcessing(false);
        console.error('[PollingStatus] Error polling status:', error);
        toast({
          title: "轮询状态异常",
          description: (error as Error).message || "检查处理状态时发生错误。",
          variant: "destructive",
          duration: 3000,
        });
      }
    }, 2000); 
    
    setTimeout(() => {
      clearInterval(pollInterval);
      if (isProcessing) {
        setIsProcessing(false);
        toast({
          title: "处理超时",
          description: "处理时间过长，请稍后查看结果",
          variant: "destructive",
          duration: 3000,
        });
      }
    }, 300000); 
  }
  
  const handleDownloadFile = async () => {
    try {
      const response = await fetch('/api/v1/core/file/download', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `processed_${selectedFile?.name || 'document.txt'}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        toast({
          title: "下载成功",
          description: "处理后的文件已下载到您的设备",
          duration: 3000,
        })
      } else {
        throw new Error('下载失败')
      }
    } catch (error) {
      console.error('下载失败:', error)
      toast({
        title: "下载失败",
        description: "请稍后重试或联系客服",
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  const handlePayment = () => {
    // 模拟支付过程
    setTimeout(() => {
      setPaymentStep("success")
      // 支付成功后刷新用户信息（如果有刷新函数的话）
      if (typeof window !== 'undefined' && (window as any).refreshUserInfo) {
        (window as any).refreshUserInfo()
      }
      // 支付成功后开始处理
      handlePaymentSuccess()
    }, 3000)
  }

  // 防止服务端渲染问题
  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-orange-200 rounded-full px-6 py-3 mb-6">
            <Sparkles className="h-5 w-5 text-orange-500" />
            <span className="text-sm font-medium text-gray-700">AI驱动的专业内容优化</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            智能降低
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
              AIGC检测率
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            上传文档或粘贴文本，立即开始专业的内容优化服务，让您的内容更加原创和自然
          </p>
        </div>

        {/* Main Upload and Service Card */}
        <div className="max-w-6xl mx-auto">
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="grid lg:grid-cols-[1fr,400px] gap-6 items-start">
                {/* Left Column - Upload Area */}
                <div className="space-y-4 h-full">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4 bg-orange-50 p-1">
                      <TabsTrigger
                        value="upload"
                        className="data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm font-medium"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        上传文档
                      </TabsTrigger>
                      <TabsTrigger
                        value="paste"
                        className="data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm font-medium"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        粘贴文本
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="upload" className="space-y-4">
                      <div
                        className="border-2 border-dashed border-orange-300 rounded-xl p-8 text-center hover:border-orange-400 hover:bg-orange-50/50 transition-all duration-300 cursor-pointer group"
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() => {
                          const fileInput = document.getElementById("file-upload") as HTMLInputElement
                          if (fileInput) {
                            fileInput.click()
                          }
                        }}
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
                                上传成功
                              </Badge>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                              <Upload className="h-8 w-8 text-orange-500" />
                            </div>
                            <p className="text-lg font-bold text-gray-800 mb-2">拖拽文档到此处或点击上传</p>
                            <p className="text-gray-500 mb-4 text-sm">支持 PDF、Word、TXT、PPT 等格式，最大 50MB</p>
                            <div className="flex justify-center items-center space-x-6 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Shield className="h-3 w-3 text-orange-500" />
                                <span>安全加密</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Zap className="h-3 w-3 text-orange-500" />
                                <span>快速处理</span>
                              </div>
                            </div>
                          </div>
                        )}
                        <input
                          id="file-upload"
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
                          onChange={handleFileUpload}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="paste" className="space-y-4">
                      <div className="space-y-2">
                        <Textarea
                          placeholder="请粘贴您需要优化的文本内容..."
                          value={textContent}
                          onChange={(e) => setTextContent(e.target.value)}
                          className="min-h-[240px] resize-none border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                        />
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>字符数: {getWordCount()}</span>
                          <span>建议字符数: 100-10000</span>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Right Column - Service Options */}
                <div className="flex flex-col h-full">
                  {/* Service Mode Selection */}
                  <div>
                    <RadioGroup value={serviceMode} onValueChange={setServiceMode} className="grid grid-cols-2 gap-4">
                      <div
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${serviceMode === "auto" ? "border-orange-400 bg-orange-50" : "border-gray-200 hover:border-orange-200"}`}
                        onClick={() => setServiceMode("auto")}
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <RadioGroupItem value="auto" id="auto" className="text-orange-500 pointer-events-none" />
                          <div className="flex items-center gap-2">
                            <Bot className="h-5 w-5 text-orange-500" />
                            <label htmlFor="auto" className="font-semibold text-gray-800 cursor-pointer">
                              AI自动优化
                            </label>
                          </div>
                        </div>
                        <div className="text-lg font-bold text-orange-600 mb-3">¥{getPricePerThousand()}/千字起</div>
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <Zap className="h-3.5 w-3.5 text-orange-500 mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-gray-600">快速处理，最快5分钟完成</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCheck className="h-3.5 w-3.5 text-orange-500 mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-gray-600">智能调整句式结构和用词</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Shield className="h-3.5 w-3.5 text-orange-500 mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-gray-600">保持原文意思和关键信息不变</span>
                          </div>
                        </div>
                      </div>
                      <div
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${serviceMode === "human" ? "border-orange-400 bg-orange-50" : "border-gray-200 hover:border-orange-200"}`}
                        onClick={() => setServiceMode("human")}
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <RadioGroupItem value="human" id="human" className="text-orange-500 pointer-events-none" />
                          <div className="flex items-center gap-2">
                            <UserRound className="h-5 w-5 text-orange-500" />
                            <label htmlFor="human" className="font-semibold text-gray-800 cursor-pointer">
                              人工专家优化
                            </label>
                          </div>
                        </div>
                        <div className="text-lg font-bold text-orange-600 mb-3">¥{getPricePerThousand()}/千字起</div>
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <UserRound className="h-3.5 w-3.5 text-orange-500 mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-gray-600">由5年以上资深编辑亲自处理</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Clock className="h-3.5 w-3.5 text-orange-500 mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-gray-600">24小时内完成，重要文档优先</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCheck className="h-3.5 w-3.5 text-orange-500 mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-gray-600">深度优化语言表达和逻辑结构</span>
                          </div>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Action Section - Bottom Aligned */}
                  <div className="space-y-3 mt-6">
                    {isProcessing ? (
                      <div className="space-y-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${processingProgress}%` }}
                          ></div>
                        </div>
                        <Button
                          disabled
                          className="w-full bg-gray-400 text-white font-semibold py-3"
                          size="lg"
                        >
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          处理中... {processingProgress}%
                        </Button>
                      </div>
                    ) : processedResult ? (
                      <div className="space-y-3">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="font-semibold text-green-800">处理完成</span>
                          </div>
                          <div className="text-sm text-green-700 max-h-32 overflow-y-auto">
                            {processedResult.substring(0, 200)}...
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            onClick={() => {
                              navigator.clipboard.writeText(processedResult)
                              toast({
                                title: "复制成功",
                                description: "处理结果已复制到剪贴板",
                                duration: 2000,
                              })
                            }}
                            variant="outline"
                            className="border-orange-300 text-orange-600 hover:bg-orange-50"
                          >
                            复制结果
                          </Button>
                          <Button
                            onClick={() => {
                              setProcessedResult(null)
                              setSelectedFile(null)
                              setTextContent("")
                            }}
                            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                          >
                            重新处理
                          </Button>
                        </div>
                      </div>
                    ) : processingProgress === 100 && activeTab === "upload" ? (
                      <div className="space-y-3">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="font-semibold text-green-800">文件处理完成</span>
                          </div>
                          <p className="text-sm text-green-700">您的文件已成功处理，可以下载了！</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            onClick={handleDownloadFile}
                            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            下载文件
                          </Button>
                          <Button
                            onClick={() => {
                              setProcessingProgress(0)
                              setSelectedFile(null)
                              setTextContent("")
                            }}
                            variant="outline"
                            className="border-orange-300 text-orange-600 hover:bg-orange-50"
                          >
                            重新处理
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Button
                          onClick={handleStartOptimization}
                          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 group"
                          size="lg"
                        >
                          立即开始优化
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                        <p className="text-xs text-gray-500 text-center leading-relaxed">
                          点击开始即表示您同意我们的
                          <button
                            onClick={() => setTermsOpen(true)}
                            className="text-orange-600 hover:underline cursor-pointer"
                          >
                            服务条款
                          </button>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/50">
            <div className="text-3xl font-bold text-gray-900 mb-2">50万+</div>
            <div className="text-gray-600">服务文档</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/50">
            <div className="text-3xl font-bold text-gray-900 mb-2">99.8%</div>
            <div className="text-gray-600">通过率</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/50">
            <div className="text-3xl font-bold text-gray-900 mb-2">5000+</div>
            <div className="text-gray-600">企业客户</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/50">
            <div className="text-3xl font-bold text-gray-900 mb-2">24小时</div>
            <div className="text-gray-600">处理时长</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-orange-200/50 mt-16 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">WritePro</span>
              </div>
              <p className="text-gray-600">专业的AIGC检测率降低服务提供商</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-gray-900">服务</h3>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <Link href="/upload" className="hover:text-orange-600 transition-colors">
                    学术论文优化
                  </Link>
                </li>
                <li>
                  <Link href="/upload" className="hover:text-orange-600 transition-colors">
                    商业文档处理
                  </Link>
                </li>
                <li>
                  <Link href="/upload" className="hover:text-orange-600 transition-colors">
                    创意内容改写
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-gray-900">公司</h3>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <Link href="/partnership" className="hover:text-orange-600 transition-colors">
                    关于我们
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-orange-600 transition-colors">
                    服务条款
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-orange-600 transition-colors">
                    隐私政策
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-gray-900">联系</h3>
              <ul className="space-y-2 text-gray-600">
                <li>400-888-8888</li>
                <li>service@writepro.com</li>
                <li>
                  <Link href="/help" className="hover:text-orange-600 transition-colors">
                    帮助中心
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-orange-200/50 mt-8 pt-8 text-center text-gray-500">
            <p>&copy; 2024 WritePro. 保留所有权利。</p>
          </div>
        </div>
      </footer>

      {/* Terms Dialog */}
      <Dialog open={termsOpen} onOpenChange={setTermsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white border-0 shadow-2xl">
          <DialogHeader className="border-b border-gray-100 pb-4">
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              WritePro 服务条款
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              请仔细阅读以下服务条款，使用我们的服务即表示您同意这些条款。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4 text-sm text-gray-700 leading-relaxed">
            <section>
              <h3 className="font-semibold text-lg text-gray-900 mb-3">1. 服务说明</h3>
              <p>
                WritePro
                提供基于人工智能和专业编辑的内容优化服务，旨在降低AIGC检测率，提高内容原创性。我们承诺保护您的隐私和数据安全。
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg text-gray-900 mb-3">2. 用户责任</h3>
              <p>用户需确保上传的内容合法合规，不包含违法、侵权或有害信息。用户对其提供的内容承担全部责任。</p>
            </section>

            <section>
              <h3 className="font-semibold text-lg text-gray-900 mb-3">3. 服务质量</h3>
              <p>
                我们承诺提供高质量的优化服务，AI优化服务通常在5分钟内完成，人工专家优化在24小时内完成。如对结果不满意，可申请重新处理。
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg text-gray-900 mb-3">4. 隐私保护</h3>
              <p>
                我们严格保护用户隐私，所有上传的文档和内容仅用于提供优化服务，不会泄露给第三方。处理完成后，原始文件将在30天内自动删除。
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg text-gray-900 mb-3">5. 费用说明</h3>
              <p>
                服务费用按字数计算，AI优化29元/千字起，人工专家优化99元/千字起。费用一经支付，除服务质量问题外，不予退款。
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg text-gray-900 mb-3">6. 免责声明</h3>
              <p>WritePro 不对优化后内容的使用结果承担责任。用户应自行判断优化后内容的适用性和合规性。</p>
            </section>
          </div>

          <DialogFooter className="border-t border-gray-100 pt-4">
            <Button
              onClick={() => setTermsOpen(false)}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold"
            >
              我已阅读并同意服务条款
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent className="max-w-sm bg-white border-0 shadow-2xl">
          {paymentStep === "payment" ? (
            <>
              <DialogHeader className="text-center border-b border-gray-100 pb-4">
                <DialogTitle className="text-xl font-bold text-gray-900 flex items-center justify-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-white" />
                  </div>
                  确认订单
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {/* 订单详情 */}
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-3 border border-orange-200">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">订单详情</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">服务类型：</span>
                      <span className="font-medium">{serviceMode === "auto" ? "AI自动优化" : "人工专家优化"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">文档字数：</span>
                      <span className="font-medium">{getWordCount().toLocaleString()} 字</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">单价：</span>
                      <span className="font-medium">¥{getPricePerThousand()}/千字</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">原价：</span>
                      <span className="font-medium">
                        ¥{Math.max(getPricePerThousand(), Math.ceil(getWordCount() / 1000) * getPricePerThousand())}
                      </span>
                    </div>
                    {usePoints && user && getPointsUsed() > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>积分抵扣：</span>
                        <span className="font-medium">
                          -¥{(getPointsUsed() * 0.01).toFixed(2)} ({getPointsUsed()}积分)
                        </span>
                      </div>
                    )}
                    <div className="border-t border-orange-200 pt-1 mt-2">
                      <div className="flex justify-between text-sm font-bold text-orange-600">
                        <span>实付金额：</span>
                        <span>¥{getTotalPrice()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 积分抵扣选项 */}
                {user && user.points > 0 && (
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-3 border border-orange-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="use-points"
                          checked={usePoints}
                          onCheckedChange={setUsePoints}
                          className="border-orange-300"
                        />
                        <Label htmlFor="use-points" className="text-sm font-medium text-gray-700 cursor-pointer">
                          使用积分抵扣
                        </Label>
                      </div>
                      <div className="text-xs text-gray-500">可用: {user.points.toLocaleString()}积分</div>
                    </div>
                    {usePoints && (
                      <div className="mt-2 text-xs text-orange-600">
                        将使用 {getPointsUsed().toLocaleString()} 积分，抵扣 ¥{(getPointsUsed() * 0.01).toFixed(2)}
                      </div>
                    )}
                  </div>
                )}

                {/* 积分充值提示 */}
                {user && user.points < 1000 && (
                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg p-3 border border-amber-200">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-amber-700">积分不足？立即充值享受更多优惠</div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setPaymentOpen(false)
                          // 这里应该调用充值弹窗，但由于状态管理在ClientLayout中，暂时省略
                        }}
                        className="border-amber-300 text-amber-700 hover:bg-amber-50 text-xs px-2 py-1 h-auto"
                      >
                        <Coins className="h-3 w-3 mr-1" />
                        充值
                      </Button>
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
                  <p className="text-xs text-gray-500 mt-1">支付完成后系统将自动处理您的订单</p>
                </div>

                {/* 模拟支付按钮 */}
                <Button
                  onClick={handlePayment}
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
                  支付成功
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-2 text-center">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">任务已提交成功！</h4>
                  <p className="text-gray-600 text-xs">
                    您的文档正在处理中，预计{serviceMode === "auto" ? "5分钟" : "24小时"}内完成。
                    请稍后到"处理历史"界面查询结果。
                  </p>
                </div>

                <div className="space-y-2">
                  <Link href="/history">
                    <Button
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold text-sm"
                      onClick={() => setPaymentOpen(false)}
                    >
                      <History className="h-4 w-4 mr-2" />
                      查看处理历史
                    </Button>
                  </Link>

                  <Button
                    variant="outline"
                    onClick={() => setPaymentOpen(false)}
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

      {/* 订单提交成功弹窗 */}
      <Dialog open={orderSubmittedOpen} onOpenChange={setOrderSubmittedOpen}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">订单已提交</h3>
              <p className="text-sm text-gray-600">
                您的文档处理订单已成功提交，订单号：{currentOrderId}
              </p>
            </div>

            <div className="space-y-2 pt-4">
              <Link href={`/paper/${currentOrderId}`}>
                <Button
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold"
                  onClick={() => setOrderSubmittedOpen(false)}
                >
                  立即查看订单
                </Button>
              </Link>

              <Button
                variant="outline"
                onClick={handleUploadNewDocument}
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                上传新文档
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
