"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Globe, ChevronDown, Check } from "lucide-react"

const LanguageSwitcher = () => {
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const languages = [
    { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
    { code: "fr", name: "Français", nativeName: "Français", flag: "🇫🇷" },
    { code: "ar", name: "العربية", nativeName: "العربية", flag: "🇩🇿" },
  ]

  const currentLanguage = languages.find((lang) => lang.code === i18n.language)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest(".language-switcher")) {
        setIsOpen(false)
      }
    }
    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [isOpen])

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode)
    setIsOpen(false)

    // Update document direction
    document.dir = langCode === "ar" ? "rtl" : "ltr"
    document.documentElement.lang = langCode
  }

  return (
    <div className="relative language-switcher">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 text-sm text-gray-700 hover:text-university-blue hover:bg-gray-50 rounded-lg transition-all duration-300 group min-w-0"
      >
        <Globe className="h-4 w-4 flex-shrink-0" />
        <span className="text-lg flex-shrink-0">{currentLanguage?.flag}</span>
        <span className="hidden sm:inline font-medium truncate">{currentLanguage?.nativeName}</span>
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200/50 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Select Language</p>
          </div>
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => changeLanguage(language.code)}
              className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center justify-between space-x-3 rtl:space-x-reverse transition-colors duration-200 ${
                i18n.language === language.code ? "bg-blue-50 text-university-blue" : "text-gray-700"
              }`}
            >
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <span className="text-lg">{language.flag}</span>
                <div className="flex flex-col">
                  <span className="font-medium">{language.nativeName}</span>
                  <span className="text-xs text-gray-500">{language.name}</span>
                </div>
              </div>
              {i18n.language === language.code && <Check className="h-4 w-4 text-university-blue" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default LanguageSwitcher
