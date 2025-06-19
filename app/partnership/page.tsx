"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Shield,
  TrendingUp,
  Users,
  DollarSign,
  Star,
  CheckCircle,
  ArrowRight,
  Building,
  Mail,
  Phone,
  MapPin,
  ArrowLeft,
  Handshake,
  Target,
  Award,
  Globe,
} from "lucide-react"
import Link from "next/link"

export default function PartnershipPage() {
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    region: "",
    businessType: "",
    experience: "",
    investment: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Partnership application:", formData)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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
              <h1 className="text-xl font-bold text-gray-900">招商加盟</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-orange-200 rounded-full px-6 py-3 mb-6">
            <Handshake className="h-5 w-5 text-orange-500" />
            <span className="text-sm font-medium text-gray-700">共创AI内容优化新时代</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            加入
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">WritePro</span>
            <br />
            合作伙伴计划
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            与我们携手开拓AI内容优化市场，享受丰厚回报和全方位支持，共同打造行业领先的服务生态
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Badge className="bg-orange-100 text-orange-700 border-orange-200 px-4 py-2 text-sm">
              <TrendingUp className="w-4 h-4 mr-2" />
              高成长市场
            </Badge>
            <Badge className="bg-green-100 text-green-700 border-green-200 px-4 py-2 text-sm">
              <DollarSign className="w-4 h-4 mr-2" />
              丰厚利润分成
            </Badge>
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 px-4 py-2 text-sm">
              <Users className="w-4 h-4 mr-2" />
              全程技术支持
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Partnership Benefits */}
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                    <Star className="h-5 w-5 text-white" />
                  </div>
                  合作优势
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Target className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">巨大市场潜力</h3>
                        <p className="text-sm text-gray-600">AI内容检测市场年增长率超过40%，万亿级市场等待开发</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Award className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">行业领先技术</h3>
                        <p className="text-sm text-gray-600">99.8%成功率的核心算法，持续技术创新和产品迭代</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <DollarSign className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">丰厚利润回报</h3>
                        <p className="text-sm text-gray-600">最高50%利润分成，多层级奖励机制，月入百万不是梦</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Users className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">全方位支持</h3>
                        <p className="text-sm text-gray-600">专业培训、营销支持、技术指导，助您快速启动业务</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Globe className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">品牌影响力</h3>
                        <p className="text-sm text-gray-600">借助知名品牌影响力，快速建立市场信任和客户基础</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Shield className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">风险保障</h3>
                        <p className="text-sm text-gray-600">完善的风险控制体系，保障合作伙伴利益和业务稳定</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Partnership Models */}
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">合作模式</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="border border-orange-200 rounded-xl p-6 hover:border-orange-400 transition-colors">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-4">
                      <Building className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2">区域代理</h3>
                    <p className="text-gray-600 text-sm mb-4">获得指定区域独家代理权，享受区域内所有业务分成</p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center">
                        <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                        独家区域权益
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                        30-50%利润分成
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                        品牌授权使用
                      </li>
                    </ul>
                  </div>
                  <div className="border border-orange-200 rounded-xl p-6 hover:border-orange-400 transition-colors">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-4">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2">渠道合作</h3>
                    <p className="text-gray-600 text-sm mb-4">利用现有客户资源，推广我们的服务获得佣金收益</p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center">
                        <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                        灵活合作方式
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                        15-25%佣金比例
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                        营销物料支持
                      </li>
                    </ul>
                  </div>
                  <div className="border border-orange-200 rounded-xl p-6 hover:border-orange-400 transition-colors">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-4">
                      <Handshake className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2">技术合作</h3>
                    <p className="text-gray-600 text-sm mb-4">共同开发新产品，分享技术成果和市场收益</p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center">
                        <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                        技术共享
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                        联合开发
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                        收益共享
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Success Stories */}
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">成功案例</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="border-l-4 border-orange-500 pl-6">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">华东区域合作伙伴 - 张总</h3>
                    <p className="text-gray-600 mb-3">
                      "加入WritePro半年来，我们的月收入从10万增长到80万，客户满意度极高。专业的技术支持和完善的培训体系让我们快速上手，现在已经成为当地最大的AI内容优化服务商。"
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>📈 月收入增长700%</span>
                      <span>👥 服务客户2000+</span>
                      <span>⭐ 客户满意度98%</span>
                    </div>
                  </div>
                  <div className="border-l-4 border-orange-500 pl-6">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">西南区域合作伙伴 - 李总</h3>
                    <p className="text-gray-600 mb-3">
                      "作为教育行业从业者，我深知学术诚信的重要性。WritePro不仅帮助学生提升写作质量，更重要的是培养了他们的原创思维。这是一个有意义且有前景的事业。"
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>🎓 服务高校50+</span>
                      <span>📚 处理论文10万+</span>
                      <span>💰 年收入500万+</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Application Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 bg-white/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Mail className="h-5 w-5 text-orange-500" />
                  申请加盟
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="companyName" className="text-sm font-medium text-gray-700">
                      公司名称 *
                    </Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange("companyName", e.target.value)}
                      className="border-orange-200 focus:border-orange-400"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactName" className="text-sm font-medium text-gray-700">
                      联系人姓名 *
                    </Label>
                    <Input
                      id="contactName"
                      value={formData.contactName}
                      onChange={(e) => handleInputChange("contactName", e.target.value)}
                      className="border-orange-200 focus:border-orange-400"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      邮箱地址 *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="border-orange-200 focus:border-orange-400"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                      联系电话 *
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="border-orange-200 focus:border-orange-400"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="region" className="text-sm font-medium text-gray-700">
                      意向区域 *
                    </Label>
                    <Select value={formData.region} onValueChange={(value) => handleInputChange("region", value)}>
                      <SelectTrigger className="border-orange-200 focus:border-orange-400">
                        <SelectValue placeholder="选择意向区域" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="华北">华北地区</SelectItem>
                        <SelectItem value="华东">华东地区</SelectItem>
                        <SelectItem value="华南">华南地区</SelectItem>
                        <SelectItem value="华中">华中地区</SelectItem>
                        <SelectItem value="西南">西南地区</SelectItem>
                        <SelectItem value="西北">西北地区</SelectItem>
                        <SelectItem value="东北">东北地区</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="businessType" className="text-sm font-medium text-gray-700">
                      业务类型 *
                    </Label>
                    <Select
                      value={formData.businessType}
                      onValueChange={(value) => handleInputChange("businessType", value)}
                    >
                      <SelectTrigger className="border-orange-200 focus:border-orange-400">
                        <SelectValue placeholder="选择业务类型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="区域代理">区域代理</SelectItem>
                        <SelectItem value="渠道合作">渠道合作</SelectItem>
                        <SelectItem value="技术合作">技术合作</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="experience" className="text-sm font-medium text-gray-700">
                      相关经验
                    </Label>
                    <Select
                      value={formData.experience}
                      onValueChange={(value) => handleInputChange("experience", value)}
                    >
                      <SelectTrigger className="border-orange-200 focus:border-orange-400">
                        <SelectValue placeholder="选择相关经验" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="无经验">无相关经验</SelectItem>
                        <SelectItem value="1-3年">1-3年</SelectItem>
                        <SelectItem value="3-5年">3-5年</SelectItem>
                        <SelectItem value="5年以上">5年以上</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="investment" className="text-sm font-medium text-gray-700">
                      投资预算
                    </Label>
                    <Select
                      value={formData.investment}
                      onValueChange={(value) => handleInputChange("investment", value)}
                    >
                      <SelectTrigger className="border-orange-200 focus:border-orange-400">
                        <SelectValue placeholder="选择投资预算" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10万以下">10万以下</SelectItem>
                        <SelectItem value="10-50万">10-50万</SelectItem>
                        <SelectItem value="50-100万">50-100万</SelectItem>
                        <SelectItem value="100万以上">100万以上</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="message" className="text-sm font-medium text-gray-700">
                      补充说明
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      className="border-orange-200 focus:border-orange-400 min-h-[80px]"
                      placeholder="请简要描述您的背景和合作意向..."
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3"
                    size="lg"
                  >
                    提交申请
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
                <div className="mt-6 p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">联系我们</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-orange-500" />
                      400-888-8888
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-orange-500" />
                      partner@writepro.com
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-orange-500" />
                      北京市朝阳区科技园
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <div>
          <p>
            推广链接示例：<a href="https://writepro.com/ref?code=USER123">https://writepro.com/ref?code=USER123</a>
          </p>
        </div>
      </div>
    </div>
  )
}
