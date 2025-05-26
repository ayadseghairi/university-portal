"use client"

import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Menu, X, ChevronDown, User, LogOut, Settings } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import LanguageSwitcher from "../common/LanguageSwitcher"

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const { user, logout } = useAuth()

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest(".user-dropdown")) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [isDropdownOpen])

  const navigation = [
    { name: t("nav.home"), href: "/" },
    { name: t("nav.about"), href: "/about" },
    { name: t("nav.faculties"), href: "/faculties" },
    { name: t("nav.news"), href: "/news" },
    { name: t("nav.aiHouse"), href: "/ai-house" },
    { name: t("nav.incubator"), href: "/incubator" },
    { name: t("nav.contact"), href: "/contact" },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-lg shadow-xl border-b border-gray-200/50"
          : "bg-white/90 backdrop-blur-sm shadow-lg"
      }`}
    >
      <div className="page-container">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse group">
            <div className="relative">
              <img
                src="/public/public/logo/university-logo.png?height=48&width=48"
                alt="University Logo"
                className="h-12 w-12 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-university-blue/20 to-blue-600/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-university-blue to-blue-600 bg-clip-text text-transparent">
                {i18n.language === "ar" ? "جامعة خنشلة" : "University of Khenchela"}
              </span>
              <span className="text-sm text-gray-500 font-medium">
                {i18n.language === "ar" ? "الجزائر" : "Algeria"}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1 rtl:space-x-reverse">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 group ${
                  isActive(item.href)
                    ? "text-university-blue bg-blue-50"
                    : "text-gray-700 hover:text-university-blue hover:bg-gray-50"
                }`}
              >
                {item.name}
                {isActive(item.href) && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-university-blue to-blue-600 rounded-full"></div>
                )}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-university-blue/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
            ))}
          </div>

          {/* Right side items */}
          <div className="hidden lg:flex items-center space-x-4 rtl:space-x-reverse">
            <LanguageSwitcher />

            {user ? (
              <div className="relative user-dropdown">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-3 rtl:space-x-reverse px-4 py-2 text-gray-700 hover:text-university-blue rounded-xl hover:bg-gray-50 transition-all duration-300 group"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-university-blue to-blue-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow-lg group-hover:shadow-xl transition-all duration-300">
                    {user.name?.charAt(0)?.toUpperCase() || <User className="h-4 w-4" />}
                  </div>
                  <span className="font-medium">{user.name}</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200/50 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <Link
                      to="/admin"
                      className="flex items-center space-x-3 rtl:space-x-reverse px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-university-blue transition-colors duration-200"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      <span>{t("nav.dashboard")}</span>
                    </Link>
                    <button
                      onClick={() => {
                        logout()
                        setIsDropdownOpen(false)
                      }}
                      className="flex items-center space-x-3 rtl:space-x-reverse w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>{t("nav.logout")}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn-primary text-sm px-6 py-2.5">
                {t("nav.login")}
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center space-x-3 rtl:space-x-reverse">
            <LanguageSwitcher />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-700 hover:text-university-blue hover:bg-gray-50 rounded-lg transition-all duration-300"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden border-t border-gray-200/50 bg-white/95 backdrop-blur-lg">
            <div className="px-4 py-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-4 py-3 text-base font-medium rounded-xl transition-all duration-300 ${
                    isActive(item.href)
                      ? "text-university-blue bg-blue-50 border-l-4 border-university-blue"
                      : "text-gray-700 hover:text-university-blue hover:bg-gray-50"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {user ? (
                <div className="pt-4 border-t border-gray-200/50 space-y-2">
                  <div className="px-4 py-2">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <Link
                    to="/admin"
                    className="flex items-center space-x-3 rtl:space-x-reverse px-4 py-3 text-gray-700 hover:text-university-blue hover:bg-gray-50 rounded-xl transition-colors duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    <span>{t("nav.dashboard")}</span>
                  </Link>
                  <button
                    onClick={() => {
                      logout()
                      setIsOpen(false)
                    }}
                    className="flex items-center space-x-3 rtl:space-x-reverse w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-200"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{t("nav.logout")}</span>
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-200/50">
                  <Link to="/login" className="btn-primary w-full text-center py-3" onClick={() => setIsOpen(false)}>
                    {t("nav.login")}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
