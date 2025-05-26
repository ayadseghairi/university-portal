"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Save, User, Lock, Globe, Bell, Shield, Database, Mail, Palette, Monitor, Eye, EyeOff, Check, X, AlertTriangle } from 'lucide-react'
import { useAuth } from "../../contexts/AuthContext"
import LoadingSpinner from "../../components/common/LoadingSpinner"

const Settings = () => {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("profile")
  const [loading, setLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null)
  const [showPassword, setShowPassword] = useState(false)

  // Profile settings
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    department: "",
    bio: "",
  })

  // Security settings
  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: false,
  })

  // System settings
  const [systemData, setSystemData] = useState({
    siteName: "University of Khenchela",
    siteDescription: "Leading educational institution in Algeria",
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotifications: true,
    smsNotifications: false,
  })

  // Appearance settings
  const [appearanceData, setAppearanceData] = useState({
    theme: "light",
    language: i18n.language,
    primaryColor: "#1e40af",
    fontSize: "medium",
  })

  const tabs = [
    {
      id: "profile",
      name: i18n.language === "ar" ? "الملف الشخصي" : "Profile",
      icon: User,
    },
    {
      id: "security",
      name: i18n.language === "ar" ? "الأمان" : "Security",
      icon: Lock,
    },
    {
      id: "system",
      name: i18n.language === "ar" ? "النظام" : "System",
      icon: Monitor,
      adminOnly: true,
    },
    {
      id: "appearance",
      name: i18n.language === "ar" ? "المظهر" : "Appearance",
      icon: Palette,
    },
  ]

  const filteredTabs = tabs.filter((tab) => {
    if (tab.adminOnly && user?.role !== "super_admin") return false
    return true
  })

  const handleSave = async (section) => {
    setLoading(true)
    setSaveStatus(null)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (section === "profile") {
        // Save profile data
        console.log("Saving profile:", profileData)
      } else if (section === "security") {
        // Save security data
        if (securityData.newPassword !== securityData.confirmPassword) {
          throw new Error("Passwords do not match")
        }
        console.log("Saving security settings")
      } else if (section === "system") {
        // Save system data
        console.log("Saving system settings:", systemData)
      } else if (section === "appearance") {
        // Save appearance data
        if (appearanceData.language !== i18n.language) {
          i18n.changeLanguage(appearanceData.language)
        }
        console.log("Saving appearance settings:", appearanceData)
      }

      setSaveStatus("success")
      setTimeout(() => setSaveStatus(null), 3000)
    } catch (error) {
      setSaveStatus("error")
      setTimeout(() => setSaveStatus(null), 3000)
    } finally {
      setLoading(false)
    }
  }

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {i18n.language === "ar" ? "معلومات الملف الشخصي" : "Profile Information"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {i18n.language === "ar" ? "الاسم الكامل" : "Full Name"}
            </label>
            <input
              type="text"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-university-blue focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {i18n.language === "ar" ? "البريد الإلكتروني" : "Email"}
            </label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-university-blue focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {i18n.language === "ar" ? "رقم الهاتف" : "Phone Number"}
            </label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-university-blue focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {i18n.language === "ar" ? "القسم" : "Department"}
            </label>
            <input
              type="text"
              value={profileData.department}
              onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-university-blue focus:border-transparent"
            />
          </div>
        </div>
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {i18n.language === "ar" ? "نبذة شخصية" : "Bio"}
          </label>
          <textarea
            rows={4}
            value={profileData.bio}
            onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-university-blue focus:border-transparent"
            placeholder={i18n.language === "ar" ? "اكتب نبذة عن نفسك..." : "Tell us about yourself..."}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <button
          onClick={() => handleSave("profile")}
          disabled={loading}
          className="btn-primary flex items-center space-x-2 rtl:space-x-reverse"
        >
          {loading ? <LoadingSpinner size="sm" /> : <Save className="h-4 w-4" />}
          <span>{i18n.language === "ar" ? "حفظ التغييرات" : "Save Changes"}</span>
        </button>
      </div>
    </div>
  )

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {i18n.language === "ar" ? "تغيير كلمة المرور" : "Change Password"}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {i18n.language === "ar" ? "كلمة المرور الحالية" : "Current Password"}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={securityData.currentPassword}
                onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-university-blue focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {i18n.language === "ar" ? "كلمة المرور الجديدة" : "New Password"}
            </label>
            <input
              type="password"
              value={securityData.newPassword}
              onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-university-blue focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {i18n.language === "ar" ? "تأكيد كلمة المرور" : "Confirm Password"}
            </label>
            <input
              type="password"
              value={securityData.confirmPassword}
              onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-university-blue focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {i18n.language === "ar" ? "المصادقة الثنائية" : "Two-Factor Authentication"}
        </h3>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">
              {i18n.language === "ar" ? "تفعيل المصادقة الثنائية" : "Enable Two-Factor Authentication"}
            </p>
            <p className="text-sm text-gray-600">
              {i18n.language === "ar" 
                ? "أضف طبقة حماية إضافية لحسابك" 
                : "Add an extra layer of security to your account"}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={securityData.twoFactorEnabled}
              onChange={(e) => setSecurityData({ ...securityData, twoFactorEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-university-blue"></div>
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleSave("security")}
          disabled={loading}
          className="btn-primary flex items-center space-x-2 rtl:space-x-reverse"
        >
          {loading ? <LoadingSpinner size="sm" /> : <Save className="h-4 w-4" />}
          <span>{i18n.language === "ar" ? "حفظ التغييرات" : "Save Changes"}</span>
        </button>
      </div>
    </div>
  )

  const renderSystemTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {i18n.language === "ar" ? "إعدادات الموقع" : "Site Settings"}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {i18n.language === "ar" ? "اسم الموقع" : "Site Name"}
            </label>
            <input
              type="text"
              value={systemData.siteName}
              onChange={(e) => setSystemData({ ...systemData, siteName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-university-blue focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {i18n.language === "ar" ? "وصف الموقع" : "Site Description"}
            </label>
            <textarea
              rows={3}
              value={systemData.siteDescription}
              onChange={(e) => setSystemData({ ...systemData, siteDescription: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-university-blue focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {i18n.language === "ar" ? "إعدادات النظام" : "System Configuration"}
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">
                {i18n.language === "ar" ? "وضع الصيانة" : "Maintenance Mode"}
              </p>
              <p className="text-sm text-gray-600">
                {i18n.language === "ar" 
                  ? "تعطيل الوصول للموقع مؤقتاً" 
                  : "Temporarily disable site access"}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={systemData.maintenanceMode}
                onChange={(e) => setSystemData({ ...systemData, maintenanceMode: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-university-blue"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">
                {i18n.language === "ar" ? "تفعيل التسجيل" : "Registration Enabled"}
              </p>
              <p className="text-sm text-gray-600">
                {i18n.language === "ar" 
                  ? "السماح للمستخدمين الجدد بالتسجيل" 
                  : "Allow new users to register"}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={systemData.registrationEnabled}
                onChange={(e) => setSystemData({ ...systemData, registrationEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-university-blue"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleSave("system")}
          disabled={loading}
          className="btn-primary flex items-center space-x-2 rtl:space-x-reverse"
        >
          {loading ? <LoadingSpinner size="sm" /> : <Save className="h-4 w-4" />}
          <span>{i18n.language === "ar" ? "حفظ التغييرات" : "Save Changes"}</span>
        </button>
      </div>
    </div>
  )

  const renderAppearanceTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {i18n.language === "ar" ? "إعدادات المظهر" : "Appearance Settings"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {i18n.language === "ar" ? "اللغة" : "Language"}
            </label>
            <select
              value={appearanceData.language}
              onChange={(e) => setAppearanceData({ ...appearanceData, language: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-university-blue focus:border-transparent"
            >
              <option value="en">English</option>
              <option value="ar">العربية</option>
              <option value="fr">Français</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {i18n.language === "ar" ? "حجم الخط" : "Font Size"}
            </label>
            <select
              value={appearanceData.fontSize}
              onChange={(e) => setAppearanceData({ ...appearanceData, fontSize: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-university-blue focus:border-transparent"
            >
              <option value="small">{i18n.language === "ar" ? "صغير" : "Small"}</option>
              <option value="medium">{i18n.language === "ar" ? "متوسط" : "Medium"}</option>
              <option value="large">{i18n.language === "ar" ? "كبير" : "Large"}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleSave("appearance")}
          disabled={loading}
          className="btn-primary flex items-center space-x-2 rtl:space-x-reverse"
        >
          {loading ? <LoadingSpinner size="sm" /> : <Save className="h-4 w-4" />}
          <span>{i18n.language === "ar" ? "حفظ التغييرات" : "Save Changes"}</span>
        </button>
      </div>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {i18n.language === "ar" ? "الإعدادات" : "Settings"}
        </h1>
        <p className="text-gray-600 mt-2">
          {i18n.language === "ar" 
            ? "إدارة إعدادات حسابك والنظام" 
            : "Manage your account and system preferences"}
        </p>
      </div>

      {/* Save Status */}
      {saveStatus && (
        <div className={`mb-6 p-4 rounded-lg flex items-center space-x-3 rtl:space-x-reverse ${
          saveStatus === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
        }`}>
          {saveStatus === "success" ? (
            <Check className="h-5 w-5" />
          ) : (
            <AlertTriangle className="h-5 w-5" />
          )}
          <span>
            {saveStatus === "success" 
              ? (i18n.language === "ar" ? "تم حفظ التغييرات بنجاح" : "Settings saved successfully")
              : (i18n.language === "ar" ? "حدث خطأ أثناء الحفظ" : "Error saving settings")
            }
          </span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 rtl:space-x-reverse px-6">
            {filteredTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 rtl:space-x-reverse py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? "border-university-blue text-university-blue"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "profile" && renderProfileTab()}
          {activeTab === "security" && renderSecurityTab()}
          {activeTab === "system" && renderSystemTab()}
          {activeTab === "appearance" && renderAppearanceTab()}
        </div>
      </div>
    </div>
  )
}

export default Settings
