"use client"

import { useState } from "react"
import { Routes, Route, Link, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  LayoutDashboard,
  FileText,
  Users,
  Building,
  Brain,
  Rocket,
  LogOut,
  Menu,
  X,
  BarChart3,
  Settings,
} from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import DashboardHome from "./DashboardHome"
import ManageNews from "./ManageNews"
import ManageUsers from "./ManageUsers"
import ManageFaculties from "./ManageFaculties"
import ManageAIHouse from "./ManageAIHouse"
import ManageIncubator from "./ManageIncubator"
import Analytics from "./Analytics"
import AdminSettings from "./Settings"

const Dashboard = () => {
  const { t, i18n } = useTranslation()
  const { user, logout } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    {
      name: i18n.language === "ar" ? "الرئيسية" : "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      current: location.pathname === "/admin",
    },
    {
      name: i18n.language === "ar" ? "التحليلات" : "Analytics",
      href: "/admin/analytics",
      icon: BarChart3,
      current: location.pathname.startsWith("/admin/analytics"),
      roles: ["super_admin", "college_admin"],
    },
    {
      name: i18n.language === "ar" ? "الأخبار" : "News",
      href: "/admin/news",
      icon: FileText,
      current: location.pathname.startsWith("/admin/news"),
    },
    {
      name: i18n.language === "ar" ? "المستخدمين" : "Users",
      href: "/admin/users",
      icon: Users,
      current: location.pathname.startsWith("/admin/users"),
      adminOnly: true,
    },
    {
      name: i18n.language === "ar" ? "الكليات" : "Faculties",
      href: "/admin/faculties",
      icon: Building,
      current: location.pathname.startsWith("/admin/faculties"),
    },
    {
      name: i18n.language === "ar" ? "بيت الذكاء الاصطناعي" : "AI House",
      href: "/admin/ai-house",
      icon: Brain,
      current: location.pathname.startsWith("/admin/ai-house"),
      roles: ["super_admin", "ai_house_admin"],
    },
    {
      name: i18n.language === "ar" ? "الحاضنة" : "Incubator",
      href: "/admin/incubator",
      icon: Rocket,
      current: location.pathname.startsWith("/admin/incubator"),
      roles: ["super_admin", "incubator_admin"],
    },
    {
      name: i18n.language === "ar" ? "الإعدادات" : "Settings",
      href: "/admin/settings",
      icon: Settings,
      current: location.pathname.startsWith("/admin/settings"),
    },
  ]

  const filteredNavigation = navigation.filter((item) => {
    if (item.adminOnly && user?.role !== "super_admin") return false
    if (item.roles && !item.roles.includes(user?.role)) return false
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b bg-gradient-to-r from-university-blue to-blue-600">
          <h1 className="text-xl font-bold text-white">{i18n.language === "ar" ? "لوحة التحكم" : "Admin Panel"}</h1>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white hover:text-gray-200">
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {filteredNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  item.current
                    ? "bg-gradient-to-r from-university-blue to-blue-600 text-white shadow-lg"
                    : "text-gray-700 hover:bg-blue-50 hover:text-university-blue"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon
                  className={`mr-3 rtl:mr-0 rtl:ml-3 h-5 w-5 transition-colors duration-200 ${
                    item.current ? "text-white" : "text-gray-400 group-hover:text-university-blue"
                  }`}
                />
                {item.name}
              </Link>
            ))}
          </div>
        </nav>

        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-gray-50">
          <div className="flex items-center space-x-3 rtl:space-x-reverse mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-university-blue to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">{user?.name?.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors duration-200"
          >
            <LogOut className="mr-3 rtl:mr-0 rtl:ml-3 h-4 w-4" />
            {i18n.language === "ar" ? "تسجيل الخروج" : "Logout"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b h-16 flex items-center justify-between px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700">
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <span className="text-sm text-gray-500">
              {i18n.language === "ar" ? "مرحباً" : "Welcome"}, {user?.name}
            </span>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-6">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/analytics/*" element={<Analytics />} />
            <Route path="/news/*" element={<ManageNews />} />
            <Route path="/users/*" element={<ManageUsers />} />
            <Route path="/faculties/*" element={<ManageFaculties />} />
            <Route path="/ai-house/*" element={<ManageAIHouse />} />
            <Route path="/incubator/*" element={<ManageIncubator />} />
            <Route path="/settings/*" element={<AdminSettings />} />
          </Routes>
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}

export default Dashboard
