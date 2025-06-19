"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Shield,
  Menu,
  X,
  Home,
  Upload,
  History,
  User,
  Users,
  Palette,
  HelpCircle,
  FileText,
  Lock,
  CreditCard,
  LogIn,
  UserPlus,
  Plus,
  Coins,
  LogOut,
  Settings,
} from "lucide-react"

const navigation = [
  { name: "首页", href: "/", icon: Home },
  { name: "上传文档", href: "/upload", icon: Upload },
  { name: "处理历史", href: "/history", icon: History },
  { name: "积分充值", href: "/recharge", icon: CreditCard },
  { name: "个人中心", href: "/my", icon: User },
  { name: "招商加盟", href: "/partnership", icon: Users },
  { name: "样式指南", href: "/styleguide", icon: Palette },
  { name: "帮助中心", href: "/help", icon: HelpCircle },
]

const footerLinks = [
  { name: "服务条款", href: "/terms", icon: FileText },
  { name: "隐私政策", href: "/privacy", icon: Lock },
  { name: "充值记录", href: "/recharge/history", icon: History },
]

// 移动端底部导航的主要链接
const mobileBottomNav = [
  { name: "首页", href: "/", icon: Home },
  { name: "上传", href: "/upload", icon: Upload },
  { name: "历史", href: "/history", icon: History },
  { name: "充值", href: "/recharge", icon: CreditCard },
  { name: "我的", href: "/my", icon: User },
]

interface UserType {
  id: string
  name: string
  email: string
  avatar: string
  points: number
}

interface MainNavProps {
  user?: UserType | null
  onAuthOpen?: (mode: "login" | "register") => void
  onRechargeOpen?: () => void
  onLogout?: () => void
  onRefreshUserInfo?: () => void
}

export function MainNav({ user, onAuthOpen, onRechargeOpen, onLogout, onRefreshUserInfo }: MainNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Desktop/Tablet Header */}
      <header className="sticky top-0 z-50 w-full border-b border-orange-200/50 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold text-gray-900">WritePro</span>
                <div className="text-xs text-orange-600 font-medium">AI内容优化专家</div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6">
              {navigation.slice(0, 4).map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-orange-600 ${
                    isActive(item.href) ? "text-orange-600" : "text-gray-600"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                href="/partnership"
                className={`text-sm font-medium transition-colors hover:text-orange-600 ${
                  isActive("/partnership") ? "text-orange-600" : "text-gray-600"
                }`}
              >
                招商加盟
              </Link>
            </nav>

            {/* User Section */}
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  {/* Points Display */}
                  <div className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-full px-4 py-2">
                    <Coins className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium text-gray-700">{user.points.toLocaleString()}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onRechargeOpen}
                      className="text-orange-600 hover:text-orange-700 p-1 h-auto"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Personal Center Icon with User Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-10 w-10 rounded-full bg-gradient-to-r from-orange-100 to-amber-100 hover:from-orange-200 hover:to-amber-200 border border-orange-200 transition-all duration-200"
                        title="个人中心"
                      >
                        <User className="h-5 w-5 text-orange-600" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-white border border-gray-200 shadow-lg rounded-xl" align="end">
                      {/* User Info Header */}
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-orange-600" />
                          </div>
                          <div className="flex flex-col space-y-1 leading-none">
                            <p className="font-semibold text-sm text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate max-w-[140px]">{user.email}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Points Display for Mobile */}
                      <div className="flex items-center justify-between p-3 sm:hidden bg-orange-50 mx-2 my-2 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Coins className="h-4 w-4 text-orange-600" />
                          <span className="text-sm font-medium text-gray-700">{user.points.toLocaleString()} 积分</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={onRechargeOpen}
                          className="text-orange-600 hover:text-orange-700 hover:bg-orange-100 p-1 h-auto"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      {/* Menu Items */}
                      <div className="py-2">
                        <DropdownMenuItem asChild>
                          <Link href="/my" className="cursor-pointer flex items-center px-4 py-2 hover:bg-gray-50 transition-colors">
                            <User className="h-4 w-4 text-gray-600 mr-3" />
                            <span className="text-sm text-gray-700">个人中心</span>
                          </Link>
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem onClick={onRechargeOpen}>
                          <div className="flex items-center px-4 py-2 hover:bg-gray-50 transition-colors w-full">
                            <Coins className="h-4 w-4 text-gray-600 mr-3" />
                            <span className="text-sm text-gray-700">积分充值</span>
                          </div>
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem>
                          <div className="flex items-center px-4 py-2 hover:bg-gray-50 transition-colors w-full">
                            <Settings className="h-4 w-4 text-gray-600 mr-3" />
                            <span className="text-sm text-gray-700">设置</span>
                          </div>
                        </DropdownMenuItem>
                        
                        <div className="my-1">
                          <div className="h-px bg-gray-200 mx-2"></div>
                        </div>
                        
                        <DropdownMenuItem onClick={onLogout}>
                          <div className="flex items-center px-4 py-2 hover:bg-red-50 transition-colors w-full">
                            <LogOut className="h-4 w-4 text-red-500 mr-3" />
                            <span className="text-sm text-red-600">退出登录</span>
                          </div>
                        </DropdownMenuItem>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAuthOpen?.("login")}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    登录
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onAuthOpen?.("register")}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    注册
                  </Button>
                </div>
              )}

              {/* Mobile Menu Button - Only for additional options */}
              <div className="lg:hidden">
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-2">
                      <Menu className="h-6 w-6 text-gray-600" />
                      <span className="sr-only">打开菜单</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-80 p-0 bg-white">
                    <div className="flex flex-col h-full">
                      {/* Header */}
                      <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                            <Shield className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <span className="text-lg font-bold text-gray-900">WritePro</span>
                            <div className="text-xs text-orange-600 font-medium">AI内容优化专家</div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsOpen(false)}
                          className="p-2 hover:bg-gray-100"
                        >
                          <X className="h-5 w-5 text-gray-500" />
                        </Button>
                      </div>

                      {/* Navigation Links */}
                      <div className="flex-1 overflow-y-auto">
                        <div className="p-6 space-y-1">
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                            更多功能
                          </div>
                          {navigation.slice(4).map((item) => {
                            const Icon = item.icon
                            return (
                              <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                                  isActive(item.href)
                                    ? "bg-orange-50 text-orange-600 border-l-4 border-orange-500"
                                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                              >
                                <Icon className="h-5 w-5" />
                                <span>{item.name}</span>
                              </Link>
                            )
                          })}
                        </div>

                        <div className="border-t border-gray-200 p-6 space-y-1">
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                            其他链接
                          </div>
                          {footerLinks.map((item) => {
                            const Icon = item.icon
                            return (
                              <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                                  isActive(item.href)
                                    ? "bg-orange-50 text-orange-600 border-l-4 border-orange-500"
                                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                              >
                                <Icon className="h-5 w-5" />
                                <span>{item.name}</span>
                              </Link>
                            )
                          })}
                        </div>
                      </div>

                      {/* Footer Actions */}
                      {!user && (
                        <div className="border-t border-gray-200 p-6 space-y-3">
                          <Button
                            variant="outline"
                            className="w-full justify-start border-orange-200 hover:bg-orange-50"
                            onClick={() => {
                              setIsOpen(false)
                              onAuthOpen?.("login")
                            }}
                          >
                            <LogIn className="h-4 w-4 mr-2" />
                            登录账户
                          </Button>
                          <Button
                            className="w-full justify-start bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                            onClick={() => {
                              setIsOpen(false)
                              onAuthOpen?.("register")
                            }}
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            免费注册
                          </Button>
                        </div>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-orange-200/50 mobile-bottom-nav">
        <div className="grid grid-cols-5 h-16">
          {/* Main Navigation Items */}
          {mobileBottomNav.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center space-y-1 transition-all duration-200 ${
                  active ? "text-orange-600 bg-orange-50/80" : "text-gray-500 hover:text-gray-700 active:bg-gray-50"
                }`}
              >
                <div className={`relative ${active ? "transform scale-110" : ""}`}>
                  <Icon className="h-5 w-5" />
                  {active && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                  )}
                </div>
                <span className={`text-xs font-medium ${active ? "font-semibold" : ""}`}>{item.name}</span>
              </Link>
            )
          })}

          {/* More Menu Button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <button className="flex flex-col items-center justify-center space-y-1 text-gray-500 hover:text-gray-700 active:bg-gray-50 transition-all duration-200">
                <div className="relative">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                    <Plus className="h-3 w-3 text-white" />
                  </div>
                </div>
                <span className="text-xs font-medium">更多</span>
              </button>
            </SheetTrigger>
          </Sheet>
        </div>

        {/* Active Tab Indicator */}
        <div
          className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 transform transition-transform duration-300"
          style={{
            width: "20%",
            transform: `translateX(${mobileBottomNav.findIndex((item) => isActive(item.href)) * 100}%)`,
          }}
        />
      </div>
    </>
  )
}
