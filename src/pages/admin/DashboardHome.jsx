"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { FileText, Users, Building, Eye } from "lucide-react"
import { newsAPI } from "../../api/newsAPI"
import LoadingSpinner from "../../components/common/LoadingSpinner"

const DashboardHome = () => {
  const { t, i18n } = useTranslation()
  const [stats, setStats] = useState({
    totalNews: 0,
    totalUsers: 0,
    totalFaculties: 0,
    totalViews: 0,
  })
  const [recentNews, setRecentNews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch dashboard statistics and recent news
        const [newsResponse] = await Promise.all([newsAPI.getLatest(5)])

        setRecentNews(newsResponse.data)

        // Mock stats - in real app, fetch from API
        setStats({
          totalNews: 45,
          totalUsers: 12,
          totalFaculties: 8,
          totalViews: 15420,
        })
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const statCards = [
    {
      title: i18n.language === "ar" ? "إجمالي الأخبار" : "Total News",
      value: stats.totalNews,
      icon: FileText,
      color: "bg-blue-500",
      change: "+12%",
    },
    {
      title: i18n.language === "ar" ? "المستخدمين" : "Users",
      value: stats.totalUsers,
      icon: Users,
      color: "bg-green-500",
      change: "+3%",
    },
    {
      title: i18n.language === "ar" ? "الكليات" : "Faculties",
      value: stats.totalFaculties,
      icon: Building,
      color: "bg-purple-500",
      change: "0%",
    },
    {
      title: i18n.language === "ar" ? "إجمالي المشاهدات" : "Total Views",
      value: stats.totalViews.toLocaleString(),
      icon: Eye,
      color: "bg-orange-500",
      change: "+8%",
    },
  ]

  if (loading) {
    return <LoadingSpinner text={t("common.loading")} />
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {i18n.language === "ar" ? "مرحباً بك في لوحة التحكم" : "Welcome to Dashboard"}
        </h1>
        <p className="text-gray-600">
          {i18n.language === "ar" ? "إدارة محتوى موقع جامعة خنشلة" : "Manage University of Khenchela website content"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className={`text-sm ${stat.change.startsWith("+") ? "text-green-600" : "text-gray-500"}`}>
                  {stat.change} {i18n.language === "ar" ? "من الشهر الماضي" : "from last month"}
                </p>
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent News */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              {i18n.language === "ar" ? "آخر الأخبار" : "Recent News"}
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentNews.map((news) => (
                <div key={news.id} className="flex items-start space-x-3 rtl:space-x-reverse">
                  <img
                    src={news.image || "/placeholder.svg?height=60&width=60"}
                    alt={news.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 line-clamp-2">{news.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(news.created_at).toLocaleDateString(i18n.language)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              {i18n.language === "ar" ? "إجراءات سريعة" : "Quick Actions"}
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">{i18n.language === "ar" ? "إضافة خبر جديد" : "Add New Article"}</span>
                </div>
              </button>

              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <Users className="h-5 w-5 text-green-500" />
                  <span className="font-medium">{i18n.language === "ar" ? "إدارة المستخدمين" : "Manage Users"}</span>
                </div>
              </button>

              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <Building className="h-5 w-5 text-purple-500" />
                  <span className="font-medium">{i18n.language === "ar" ? "إدارة الكليات" : "Manage Faculties"}</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Timeline */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {i18n.language === "ar" ? "النشاط الأخير" : "Recent Activity"}
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[
              {
                action: i18n.language === "ar" ? "تم نشر خبر جديد" : "New article published",
                time: "2 hours ago",
                user: "Admin",
              },
              {
                action: i18n.language === "ar" ? "تم تحديث معلومات الكلية" : "Faculty information updated",
                time: "4 hours ago",
                user: "Faculty Admin",
              },
              {
                action: i18n.language === "ar" ? "تم إضافة مستخدم جديد" : "New user added",
                time: "1 day ago",
                user: "Super Admin",
              },
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-2 h-2 bg-university-blue rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">
                    {activity.time} • {activity.user}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardHome
