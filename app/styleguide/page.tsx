"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import {
  Shield,
  CheckCircle,
  AlertCircle,
  XCircle,
  Info,
  ArrowLeft,
  Palette,
  Type,
  Layout,
  Zap,
  Star,
  Heart,
  Download,
  Upload,
  Search,
  Settings,
  Mail,
  Lock,
} from "lucide-react"
import Link from "next/link"

export default function StyleGuidePage() {
  const { toast } = useToast()
  const [selectedValue, setSelectedValue] = useState("")

  const showToast = (variant: "default" | "destructive" | "success" | "warning") => {
    const toastConfig = {
      default: {
        title: "默认提示",
        description: "这是一个默认样式的提示消息",
      },
      destructive: {
        title: "错误提示",
        description: "操作失败，请检查输入信息",
        variant: "destructive" as const,
      },
      success: {
        title: "成功提示",
        description: "操作已成功完成",
        variant: "success" as const,
      },
      warning: {
        title: "警告提示",
        description: "请注意相关风险",
        variant: "warning" as const,
      },
    }

    toast(toastConfig[variant])
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
              <h1 className="text-xl font-bold text-gray-900">样式指南</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Introduction */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-orange-200 rounded-full px-6 py-3 mb-6">
            <Palette className="h-5 w-5 text-orange-500" />
            <span className="text-sm font-medium text-gray-700">ContentGuard Pro 设计系统</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            UI组件
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">样式指南</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            统一的设计语言和组件库，确保产品体验的一致性和专业性
          </p>
        </div>

        <Tabs defaultValue="colors" className="space-y-8">
          <TabsList className="grid w-full grid-cols-6 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="colors">色彩</TabsTrigger>
            <TabsTrigger value="typography">字体</TabsTrigger>
            <TabsTrigger value="buttons">按钮</TabsTrigger>
            <TabsTrigger value="forms">表单</TabsTrigger>
            <TabsTrigger value="feedback">反馈</TabsTrigger>
            <TabsTrigger value="layout">布局</TabsTrigger>
          </TabsList>

          {/* Colors */}
          <TabsContent value="colors" className="space-y-6">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-orange-500" />
                  色彩系统
                </CardTitle>
                <CardDescription>品牌色彩和语义色彩的标准定义</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Brand Colors */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">品牌色彩</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl mx-auto mb-2"></div>
                      <div className="text-sm font-medium text-gray-900">主色调</div>
                      <div className="text-xs text-gray-500">Orange-Red</div>
                    </div>
                    <div className="text-center">
                      <div className="w-20 h-20 bg-orange-500 rounded-xl mx-auto mb-2"></div>
                      <div className="text-sm font-medium text-gray-900">橙色</div>
                      <div className="text-xs text-gray-500">#F97316</div>
                    </div>
                    <div className="text-center">
                      <div className="w-20 h-20 bg-red-500 rounded-xl mx-auto mb-2"></div>
                      <div className="text-sm font-medium text-gray-900">红色</div>
                      <div className="text-xs text-gray-500">#EF4444</div>
                    </div>
                    <div className="text-center">
                      <div className="w-20 h-20 bg-amber-500 rounded-xl mx-auto mb-2"></div>
                      <div className="text-sm font-medium text-gray-900">琥珀色</div>
                      <div className="text-xs text-gray-500">#F59E0B</div>
                    </div>
                  </div>
                </div>

                {/* Semantic Colors */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">语义色彩</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-green-500 rounded-xl mx-auto mb-2"></div>
                      <div className="text-sm font-medium text-gray-900">成功</div>
                      <div className="text-xs text-gray-500">#22C55E</div>
                    </div>
                    <div className="text-center">
                      <div className="w-20 h-20 bg-blue-500 rounded-xl mx-auto mb-2"></div>
                      <div className="text-sm font-medium text-gray-900">信息</div>
                      <div className="text-xs text-gray-500">#3B82F6</div>
                    </div>
                    <div className="text-center">
                      <div className="w-20 h-20 bg-yellow-500 rounded-xl mx-auto mb-2"></div>
                      <div className="text-sm font-medium text-gray-900">警告</div>
                      <div className="text-xs text-gray-500">#EAB308</div>
                    </div>
                    <div className="text-center">
                      <div className="w-20 h-20 bg-red-500 rounded-xl mx-auto mb-2"></div>
                      <div className="text-sm font-medium text-gray-900">错误</div>
                      <div className="text-xs text-gray-500">#EF4444</div>
                    </div>
                  </div>
                </div>

                {/* Gray Scale */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">灰度色彩</h3>
                  <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                    {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                      <div key={shade} className="text-center">
                        <div className={`w-16 h-16 bg-gray-${shade} rounded-lg mx-auto mb-1`}></div>
                        <div className="text-xs text-gray-600">{shade}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Typography */}
          <TabsContent value="typography" className="space-y-6">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="h-5 w-5 text-orange-500" />
                  字体系统
                </CardTitle>
                <CardDescription>标准字体大小、行高和字重定义</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="border-l-4 border-orange-500 pl-4">
                    <h1 className="text-4xl font-bold text-gray-900">标题 1 - 4xl/Bold</h1>
                    <p className="text-sm text-gray-500 mt-1">用于页面主标题，字号36px，字重700</p>
                  </div>
                  <div className="border-l-4 border-orange-400 pl-4">
                    <h2 className="text-3xl font-bold text-gray-900">标题 2 - 3xl/Bold</h2>
                    <p className="text-sm text-gray-500 mt-1">用于章节标题，字号30px，字重700</p>
                  </div>
                  <div className="border-l-4 border-orange-300 pl-4">
                    <h3 className="text-2xl font-bold text-gray-900">标题 3 - 2xl/Bold</h3>
                    <p className="text-sm text-gray-500 mt-1">用于小节标题，字号24px，字重700</p>
                  </div>
                  <div className="border-l-4 border-orange-200 pl-4">
                    <h4 className="text-xl font-semibold text-gray-900">标题 4 - xl/Semibold</h4>
                    <p className="text-sm text-gray-500 mt-1">用于卡片标题，字号20px，字重600</p>
                  </div>
                  <div className="border-l-4 border-gray-300 pl-4">
                    <p className="text-base text-gray-900">正文 - base/Regular</p>
                    <p className="text-sm text-gray-500 mt-1">用于正文内容，字号16px，字重400</p>
                  </div>
                  <div className="border-l-4 border-gray-200 pl-4">
                    <p className="text-sm text-gray-600">小字 - sm/Regular</p>
                    <p className="text-xs text-gray-500 mt-1">用于辅助信息，字号14px，字重400</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Buttons */}
          <TabsContent value="buttons" className="space-y-6">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-orange-500" />
                  按钮组件
                </CardTitle>
                <CardDescription>各种按钮样式和状态展示</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Primary Buttons */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">主要按钮</h3>
                  <div className="flex flex-wrap gap-4">
                    <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                      默认按钮
                    </Button>
                    <Button
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                      size="sm"
                    >
                      小按钮
                    </Button>
                    <Button
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                      size="lg"
                    >
                      大按钮
                    </Button>
                    <Button
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                      disabled
                    >
                      禁用按钮
                    </Button>
                  </div>
                </div>

                {/* Secondary Buttons */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">次要按钮</h3>
                  <div className="flex flex-wrap gap-4">
                    <Button variant="outline" className="border-orange-200 hover:bg-orange-50">
                      边框按钮
                    </Button>
                    <Button variant="ghost">幽灵按钮</Button>
                    <Button variant="secondary">次要按钮</Button>
                    <Button variant="destructive">危险按钮</Button>
                  </div>
                </div>

                {/* Icon Buttons */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">图标按钮</h3>
                  <div className="flex flex-wrap gap-4">
                    <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                      <Download className="h-4 w-4 mr-2" />
                      下载
                    </Button>
                    <Button variant="outline" className="border-orange-200 hover:bg-orange-50">
                      <Upload className="h-4 w-4 mr-2" />
                      上传
                    </Button>
                    <Button variant="ghost">
                      <Search className="h-4 w-4 mr-2" />
                      搜索
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Forms */}
          <TabsContent value="forms" className="space-y-6">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layout className="h-5 w-5 text-orange-500" />
                  表单组件
                </CardTitle>
                <CardDescription>输入框、选择器等表单元素样式</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Input Fields */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">输入框</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="text-input">文本输入框</Label>
                        <Input
                          id="text-input"
                          placeholder="请输入文本..."
                          className="border-orange-200 focus:border-orange-400"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email-input">邮箱输入框</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            id="email-input"
                            type="email"
                            placeholder="请输入邮箱..."
                            className="pl-10 border-orange-200 focus:border-orange-400"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="password-input">密码输入框</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            id="password-input"
                            type="password"
                            placeholder="请输入密码..."
                            className="pl-10 border-orange-200 focus:border-orange-400"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="textarea">文本域</Label>
                        <Textarea
                          id="textarea"
                          placeholder="请输入多行文本..."
                          className="border-orange-200 focus:border-orange-400"
                        />
                      </div>
                      <div>
                        <Label htmlFor="select">选择器</Label>
                        <Select value={selectedValue} onValueChange={setSelectedValue}>
                          <SelectTrigger className="border-orange-200 focus:border-orange-400">
                            <SelectValue placeholder="请选择选项" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="option1">选项 1</SelectItem>
                            <SelectItem value="option2">选项 2</SelectItem>
                            <SelectItem value="option3">选项 3</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Checkboxes and Radio */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">选择控件</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-base font-medium mb-3 block">复选框</Label>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="checkbox1" className="border-orange-300" />
                          <Label htmlFor="checkbox1">选项 1</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="checkbox2" className="border-orange-300" defaultChecked />
                          <Label htmlFor="checkbox2">选项 2（已选中）</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="checkbox3" className="border-orange-300" disabled />
                          <Label htmlFor="checkbox3">选项 3（禁用）</Label>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-base font-medium mb-3 block">单选框</Label>
                      <RadioGroup defaultValue="radio2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="radio1" id="radio1" className="border-orange-300" />
                          <Label htmlFor="radio1">选项 1</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="radio2" id="radio2" className="border-orange-300" />
                          <Label htmlFor="radio2">选项 2（已选中）</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="radio3" id="radio3" className="border-orange-300" disabled />
                          <Label htmlFor="radio3">选项 3（禁用）</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feedback */}
          <TabsContent value="feedback" className="space-y-6">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-orange-500" />
                  反馈组件
                </CardTitle>
                <CardDescription>Toast、Badge、Alert等反馈元素</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Toast Examples */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Toast 提示</h3>
                  <div className="flex flex-wrap gap-4">
                    <Button variant="outline" onClick={() => showToast("default")} className="border-gray-200">
                      默认提示
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => showToast("success")}
                      className="border-green-200 text-green-700 hover:bg-green-50"
                    >
                      成功提示
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => showToast("warning")}
                      className="border-yellow-200 text-yellow-700 hover:bg-yellow-50"
                    >
                      警告提示
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => showToast("destructive")}
                      className="border-red-200 text-red-700 hover:bg-red-50"
                    >
                      错误提示
                    </Button>
                  </div>
                </div>

                {/* Badges */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">徽章</h3>
                  <div className="flex flex-wrap gap-4">
                    <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      已完成
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                      <Info className="w-3 h-3 mr-1" />
                      处理中
                    </Badge>
                    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      待处理
                    </Badge>
                    <Badge className="bg-red-100 text-red-700 border-red-200">
                      <XCircle className="w-3 h-3 mr-1" />
                      失败
                    </Badge>
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      <Star className="w-3 h-3 mr-1" />
                      推荐
                    </Badge>
                  </div>
                </div>

                {/* Alert Messages */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">警告框</h3>
                  <div className="space-y-4">
                    <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                      <div className="flex items-start">
                        <Info className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-blue-900">信息提示</h4>
                          <p className="text-blue-800 text-sm mt-1">这是一条信息提示，用于向用户传达重要信息。</p>
                        </div>
                      </div>
                    </div>
                    <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-green-900">成功提示</h4>
                          <p className="text-green-800 text-sm mt-1">操作已成功完成，您可以继续下一步操作。</p>
                        </div>
                      </div>
                    </div>
                    <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-yellow-900">警告提示</h4>
                          <p className="text-yellow-800 text-sm mt-1">请注意相关风险，建议谨慎操作。</p>
                        </div>
                      </div>
                    </div>
                    <div className="border border-red-200 bg-red-50 rounded-lg p-4">
                      <div className="flex items-start">
                        <XCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-red-900">错误提示</h4>
                          <p className="text-red-800 text-sm mt-1">操作失败，请检查输入信息后重试。</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Layout */}
          <TabsContent value="layout" className="space-y-6">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layout className="h-5 w-5 text-orange-500" />
                  布局组件
                </CardTitle>
                <CardDescription>卡片、分隔线等布局元素</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Cards */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">卡片</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="h-5 w-5 text-orange-500" />
                          基础卡片
                        </CardTitle>
                        <CardDescription>这是一个基础卡片的描述文本</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600">卡片内容区域，可以放置各种内容元素。</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Heart className="h-5 w-5 text-red-500" />
                          彩色卡片
                        </CardTitle>
                        <CardDescription>带有渐变背景的卡片样式</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600">这是一个带有彩色背景的卡片示例。</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Separators */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">分隔线</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-600 mb-2">水平分隔线</p>
                      <Separator />
                    </div>
                    <div className="flex items-center space-x-4">
                      <p className="text-gray-600">垂直分隔线</p>
                      <Separator orientation="vertical" className="h-6" />
                      <p className="text-gray-600">内容</p>
                    </div>
                  </div>
                </div>

                {/* Spacing */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">间距系统</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="w-4 h-4 bg-orange-200 mx-auto mb-2"></div>
                        <div className="text-xs text-gray-600">4px (1)</div>
                      </div>
                      <div>
                        <div className="w-8 h-8 bg-orange-300 mx-auto mb-2"></div>
                        <div className="text-xs text-gray-600">8px (2)</div>
                      </div>
                      <div>
                        <div className="w-12 h-12 bg-orange-400 mx-auto mb-2"></div>
                        <div className="text-xs text-gray-600">12px (3)</div>
                      </div>
                      <div>
                        <div className="w-16 h-16 bg-orange-500 mx-auto mb-2"></div>
                        <div className="text-xs text-gray-600">16px (4)</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
