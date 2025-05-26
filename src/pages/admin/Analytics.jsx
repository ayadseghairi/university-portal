"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Eye, Users, Clock, TrendingUp, Globe, Smartphone, Monitor, BarChart3, PieChart } from "lucide-react"
import { analyticsAPI } from "../../api/analyticsAPI"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import AnimatedCounter from "../../components/common/AnimatedCounter"

const Analytics = () => {
  const { t, i18n } = useTranslation()
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("7d")

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await analyticsAPI.getAnalytics(timeRange)
      setAnalytics(response.data)
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner text={t("common.loading")} />
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">{i18n.language === "ar" ? "لا توجد بيانات متاحة" : "No data available"}</p>
      </div>
    )
  }

  const timeRangeOptions = [
    { value: "1d", label: i18n.language === "ar" ? "اليوم" : "Today" },
    { value: "7d", label: i18n.language === "ar" ? "7 أيام" : "7 Days" },
    { value: "30d", label: i18n.language === "ar" ? "30 يوم" : "30 Days" },
    { value: "90d", label: i18n.language === "ar" ? "90 يوم" : "90 Days" },
  ]

  const overviewStats = [
    {
      title: i18n.language === "ar" ? "إجمالي الزيارات" : "Total Visits",
      value: analytics.overview.totalVisits,
      icon: Eye,
      color: "from-blue-500 to-blue-600",
      change: analytics.overview.visitsChange,
    },
    {
      title: i18n.language === "ar" ? "زوار فريدون" : "Unique Visitors",
      value: analytics.overview.uniqueVisitors,
      icon: Users,
      color: "from-green-500 to-green-600",
      change: analytics.overview.visitorsChange,
    },
    {
      title: i18n.language === "ar" ? "متوسط وقت الجلسة" : "Avg. Session Duration",
      value: analytics.overview.avgSessionDuration,
      icon: Clock,
      color: "from-purple-500 to-purple-600",
      change: analytics.overview.durationChange,
      suffix: "m",
    },
    {
      title: i18n.language === "ar" ? "معدل الارتداد" : "Bounce Rate",
      value: analytics.overview.bounceRate,
      icon: TrendingUp,
      color: "from-orange-500 to-orange-600",
      change: analytics.overview.bounceChange,
      suffix: "%",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {i18n.language === "ar" ? "تحليلات الموقع" : "Website Analytics"}
          </h1>
          <p className="text-gray-600 mt-2">
            {i18n.language === "ar"
              ? "تتبع أداء الموقع وسلوك الزوار"
              : "Track website performance and visitor behavior"}
          </p>
        </div>

        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="input-field w-auto min-w-[150px]"
        >
          {timeRangeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewStats.map((stat, index) => (
          <div key={index} className="stats-card">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div
                className={`text-sm font-medium ${
                  stat.change > 0 ? "text-green-600" : stat.change < 0 ? "text-red-600" : "text-gray-600"
                }`}
              >
                {stat.change > 0 ? "+" : ""}
                {stat.change}%
              </div>
            </div>

            <div className="text-3xl font-bold text-gray-900 mb-1">
              <AnimatedCounter end={stat.value} suffix={stat.suffix || ""} duration={1500} />
            </div>

            <p className="text-gray-600 text-sm">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Page Views Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              {i18n.language === "ar" ? "مشاهدات الصفحات" : "Page Views"}
            </h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            {analytics.topPages.map((page, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{page.path}</div>
                  <div className="text-sm text-gray-500">{page.title}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">{page.views.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">
                    {((page.views / analytics.overview.totalVisits) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Device Types */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              {i18n.language === "ar" ? "أنواع الأجهزة" : "Device Types"}
            </h3>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            {analytics.deviceTypes.map((device, index) => {
              const icons = {
                desktop: Monitor,
                mobile: Smartphone,
                tablet: Monitor,
              }
              const Icon = icons[device.type] || Monitor

              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5 text-gray-400" />
                    <span className="font-medium text-gray-900 capitalize">{device.type}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">{device.count.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">{device.percentage}%</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Referrers */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              {i18n.language === "ar" ? "أهم المصادر" : "Top Referrers"}
            </h3>
            <Globe className="h-5 w-5 text-gray-400" />
          </div>

          <div className="space-y-3">
            {analytics.topReferrers.map((referrer, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="font-medium text-gray-900 truncate">{referrer.source || "Direct"}</div>
                <div className="text-sm text-gray-600">{referrer.visits}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Browser Stats */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">{i18n.language === "ar" ? "المتصفحات" : "Browsers"}</h3>
            <Globe className="h-5 w-5 text-gray-400" />
          </div>

          <div className="space-y-3">
            {analytics.browsers.map((browser, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="font-medium text-gray-900">{browser.name}</div>
                <div className="text-sm text-gray-600">{browser.percentage}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Countries */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">{i18n.language === "ar" ? "البلدان" : "Countries"}</h3>
            <Globe className="h-5 w-5 text-gray-400" />
          </div>

          <div className="space-y-3">
            {analytics.countries.map((country, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{country.flag}</span>
                  <span className="font-medium text-gray-900">{country.name}</span>
                </div>
                <div className="text-sm text-gray-600">{country.visits}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Real-time Stats */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            {i18n.language === "ar" ? "الإحصائيات المباشرة" : "Real-time Stats"}
          </h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Live</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              <AnimatedCounter end={analytics.realTime.activeUsers} />
            </div>
            <div className="text-gray-600">{i18n.language === "ar" ? "مستخدمون نشطون" : "Active Users"}</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              <AnimatedCounter end={analytics.realTime.pageViewsLastHour} />
            </div>
            <div className="text-gray-600">{i18n.language === "ar" ? "مشاهدات آخر ساعة" : "Views Last Hour"}</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              <AnimatedCounter end={analytics.realTime.newVisitorsToday} />
            </div>
            <div className="text-gray-600">{i18n.language === "ar" ? "زوار جدد اليوم" : "New Visitors Today"}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
