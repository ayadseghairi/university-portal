"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate, useLocation } from "react-router-dom"
import { Eye, EyeOff, Lock, User } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"

const Login = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const from = location.state?.from?.pathname || "/admin"

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await login(formData)
      if (result.success) {
        navigate(from, { replace: true })
      } else {
        setError(result.error || "Login failed")
      }
    } catch (error) {
      setError("An error occurred during login")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <img src="/placeholder.svg?height=80&width=80" alt="University Logo" className="mx-auto h-20 w-20" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {i18n.language === "ar" ? "تسجيل الدخول" : "Admin Login"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {i18n.language === "ar"
              ? "قم بتسجيل الدخول للوصول إلى لوحة التحكم"
              : "Sign in to access the admin dashboard"}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{error}</div>}

          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                {i18n.language === "ar" ? "اسم المستخدم" : "Username"}
              </label>
              <div className="relative">
                <User className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="input-field pl-10 rtl:pl-3 rtl:pr-10"
                  placeholder={i18n.language === "ar" ? "أدخل اسم المستخدم" : "Enter your username"}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {i18n.language === "ar" ? "كلمة المرور" : "Password"}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pl-10 pr-10 rtl:pl-10 rtl:pr-10"
                  placeholder={i18n.language === "ar" ? "أدخل كلمة المرور" : "Enter your password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center">
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : i18n.language === "ar" ? (
                "تسجيل الدخول"
              ) : (
                "Sign In"
              )}
            </button>
          </div>

         
        </form>
      </div>
    </div>
  )
}

export default Login
