"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from 'next/navigation'; // 导入 useRouter
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Upload, FileText, CheckCircle, Clock, Users, Loader2 } from "lucide-react" // 导入 Loader2
import { toast } from "@/components/ui/use-toast"

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [serviceType, setServiceType] = useState("")
  const [targetLevel, setTargetLevel] = useState("")
  const [humanService, setHumanService] = useState(false)
  const [urgency, setUrgency] = useState("")
  const [documentId, setDocumentId] = useState<string | null>(null) // 新增 documentId 状态
  const [isUploading, setIsUploading] = useState(false) // 新增上传状态
  const [isSubmitting, setIsSubmitting] = useState(false); // 新增提交订单状态
  const router = useRouter(); // 初始化 useRouter

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      await uploadFileToServer(file}
  }

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file) {
      setSelectedFile(file)
      await uploadFileToServer(file)
    }
  }

  // 新增文件上传到服务器的函数
  const uploadFileToServer = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/v1/documents/upload/", {
        method: "POST",
        body: formData,
        headers: {
          // 如果需要认证，在这里添加 Authorization header
          // "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log("File upload success data:", data); // 添加日志
        console.log("Document ID from server:", data.document_id); // 添加日志
        setDocumentId(data.document_id); // 保存 document_id
        toast({
          title: "上传成功",
          description: "文件已成功上传并开始处理。",
        })
      } else {
        const errorData = await response.json();
        console.error("File upload failed:", errorData);
        setSelectedFile(null); // 清除选择的文件
        setDocumentId(null);
        toast({
          title: "上传失败",
          description: errorData.detail || "文件上传失败，请重试。",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setSelectedFile(null); // 清除选择的文件
      setDocumentId(null);
      toast({
        title: "上传出错",
        description: "文件上传过程中发生错误，请检查网络连接或联系支持。",
        variant: "destructive",
      })
    }
    setIsUploading(false);
  };

  // 新增提交订单函数
  const handleSubmitOrder = async () => {
    console.log("Current documentId before submit:", documentId); // 添加日志
    if (!selectedFile || !serviceType || !targetLevel || !documentId) {
      toast({
        title: "信息不完整",
        description: "请确保已上传文件并选择了所有必要的服务选项。",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);

    const orderData = {
      document_id: documentId, // 将 document 改回 document_id
      // 其他订单信息，如果后端需要的话
      // service_type: serviceType, 
      // reduction_level: targetLevel,
      // ...
    };
    console.log("Order data to be submitted:", orderData); // 添加日志

    try {
      const response = await fetch("/api/v1/orders/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // 如果需要认证，在这里添加 Authorization header
          // "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "订单提交成功!",
          description: `您的订单号是: ${result.order_number}`, 
        });
        // 跳转到订单详情页
        router.push(`/paper/${result.order_number}`);
      } else {
        const errorData = await response.json();
        console.error("Order submission failed:", errorData);
        let errorMessage = "订单提交失败，请重试。";
        if (errorData.document_id && Array.isArray(errorData.document_id)) {
            errorMessage = errorData.document_id.join(' ');
        } else if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
        }

        toast({
          title: "订单提交失败",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      toast({
        title: "订单提交出错",
        description: "订单提交过程中发生错误，请检查网络连接或联系支持。",
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">AIGC检测率降低服务</h1>
          <p className="text-lg text-gray-600">请上传您的文档并选择相应的服务选项</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* File Upload */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-orange-600" />
                  文档上传
                </CardTitle>
                <CardDescription>支持 PDF、Word、TXT、PPT 等格式，最大支持 50MB</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className="border-2 border-dashed border-orange-300 rounded-lg p-8 text-center hover:border-orange-400 transition-colors cursor-pointer bg-orange-50/50"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("file-upload")?.click()}
                >
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-2">
                      <FileText className="h-8 w-8 text-orange-600" />
                      <div>
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        {isUploading && <Loader2 className="h-5 w-5 animate-spin text-orange-600" />} {/* 添加上传中图标 */}
                        {documentId && !isUploading && <CheckCircle className="h-5 w-5 text-green-500" />} {/* 添加上传完成图标 */}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-12 w-12 text-orange-400 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-700 mb-2">拖拽文件到此处或点击上传</p>
                      <p className="text-sm text-gray-500">支持 PDF、DOC、DOCX、TXT、PPT、PPTX 格式</p>
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
              </CardContent>
            </Card>

            {/* Service Type */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>服务类型选择</CardTitle>
                <CardDescription>请选择最适合您文档类型的服务</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={serviceType} onValueChange={setServiceType}>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-colors">
                      <RadioGroupItem value="academic" id="academic" />
                      <Label htmlFor="academic" className="flex-1 cursor-pointer">
                        <div className="font-medium">学术论文优化</div>
                        <div className="text-sm text-gray-500">适用于学术论文、研究报告等</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-colors">
                      <RadioGroupItem value="business" id="business" />
                      <Label htmlFor="business" className="flex-1 cursor-pointer">
                        <div className="font-medium">商业文档处理</div>
                        <div className="text-sm text-gray-500">适用于商业计划书、报告、提案等</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-colors">
                      <RadioGroupItem value="creative" id="creative" />
                      <Label htmlFor="creative" className="flex-1 cursor-pointer">
                        <div className="font-medium">创意内容改写</div>
                        <div className="text-sm text-gray-500">适用于营销文案、创意内容等</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-colors">
                      <RadioGroupItem value="technical" id="technical" />
                      <Label htmlFor="technical" className="flex-1 cursor-pointer">
                        <div className="font-medium">技术文档润色</div>
                        <div className="text-sm text-gray-500">适用于技术文档、说明书等</div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Target Level */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>降低目标设置</CardTitle>
                <CardDescription>选择您希望达到的AIGC检测率目标</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="target-level">检测率目标</Label>
                  <Select value={targetLevel} onValueChange={setTargetLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="请选择目标检测率" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="under-10">10%以下（标准）</SelectItem>
                      <SelectItem value="under-5">5%以下（严格）</SelectItem>
                      <SelectItem value="under-1">1%以下（极严格）</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="urgency">处理时长</Label>
                  <Select value={urgency} onValueChange={setUrgency}>
                    <SelectTrigger>
                      <SelectValue placeholder="请选择处理时长" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rush">加急处理（6小时内）</SelectItem>
                      <SelectItem value="standard">标准处理（24小时内）</SelectItem>
                      <SelectItem value="economy">经济处理（72小时内）</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Additional Services */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>增值服务</CardTitle>
                <CardDescription>可选的专业增值服务</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-colors">
                  <Checkbox id="human-service" checked={humanService} onCheckedChange={setHumanService} />
                  <Label htmlFor="human-service" className="flex-1">
                    <div className="font-medium">人工专家服务</div>
                    <div className="text-sm text-gray-500">专业编辑人工审核，确保质量和准确性 (+¥200)</div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-colors">
                  <Checkbox id="quality-guarantee" />
                  <Label htmlFor="quality-guarantee" className="flex-1">
                    <div className="font-medium">质量保证服务</div>
                    <div className="text-sm text-gray-500">7天内免费修改，不满意全额退款 (+¥100)</div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-colors">
                  <Checkbox id="consultation" />
                  <Label htmlFor="consultation" className="flex-1">
                    <div className="font-medium">一对一咨询</div>
                    <div className="text-sm text-gray-500">30分钟专家咨询，优化建议和指导 (+¥150)</div>
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Special Requirements */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>特殊要求</CardTitle>
                <CardDescription>如有特殊要求或说明，请在此填写</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea placeholder="请描述您的特殊要求或需要注意的事项..." className="min-h-[100px]" />
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 bg-white">
              <CardHeader>
                <CardTitle>订单摘要</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">基础服务</span>
                    <span className="font-medium">¥299</span>
                  </div>
                  {humanService && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">人工专家服务</span>
                      <span className="font-medium">¥200</span>
                    </div>
                  )}
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>总计</span>
                      <span className="text-orange-600">¥{humanService ? 499 : 299}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-amber-500" />
                    99.8% 成功通过率
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4 text-amber-500" />
                    24小时内完成
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4 text-amber-500" />
                    专业团队服务
                  </div>
                </div>

                <Button
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  size="lg"
                  disabled={!selectedFile || !serviceType || !targetLevel || !documentId || isUploading || isSubmitting} // 更新 disabled 条件
                  onClick={handleSubmitOrder} // 修改点击事件
                >
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} {/* 添加提交中图标 */}
                  提交订单
                </Button>

                <p className="text-xs text-gray-500 text-center">提交订单即表示您同意我们的服务条款和隐私政策</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
