"use client"

import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Youtube } from "lucide-react"

const Footer = () => {
  const { t, i18n } = useTranslation()

  const quickLinks = [
    { name: t("nav.about"), href: "/about" },
    { name: t("nav.faculties"), href: "/faculties" },
    { name: t("nav.news"), href: "/news" },
    { name: t("nav.contact"), href: "/contact" },
  ]

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Youtube, href: "#", label: "YouTube" },
  ]

  return (
    <footer className="bg-gray-900 text-white">
      <div className="page-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* University Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <img src="/public/public/logo/university-logo.png?height=40&width=40" alt="University Logo" className="h-10 w-10" />
              <div>
                <h3 className="text-lg font-bold">
                  {i18n.language === "ar" ? "جامعة خنشلة" : "University of Khenchela"}
                </h3>
                <p className="text-sm text-gray-400">{i18n.language === "ar" ? "الجزائر" : "Algeria"}</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              {i18n.language === "ar"
                ? "جامعة رائدة في التعليم العالي والبحث العلمي"
                : "Leading university in higher education and scientific research"}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{i18n.language === "ar" ? "روابط سريعة" : "Quick Links"}</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-gray-400 hover:text-white transition-colors duration-200">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">
              {i18n.language === "ar" ? "معلومات الاتصال" : "Contact Info"}
            </h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <MapPin className="h-5 w-5 text-university-gold flex-shrink-0" />
                <span className="text-gray-400 text-sm">
                  {i18n.language === "ar" ? "خنشلة، الجزائر" : "Khenchela, Algeria"}
                </span>
              </div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <Phone className="h-5 w-5 text-university-gold flex-shrink-0" />
                <span className="text-gray-400 text-sm">+21332731236</span>
              </div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <Mail className="h-5 w-5 text-university-gold flex-shrink-0" />
                <span className="text-gray-400 text-sm">contact@univ-khenchela.dz</span>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{i18n.language === "ar" ? "تابعنا" : "Follow Us"}</h4>
            <div className="flex space-x-4 rtl:space-x-reverse">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="text-gray-400 hover:text-university-gold transition-colors duration-200"
                  aria-label={social.label}
                >
                  <social.icon className="h-6 w-6" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 {i18n.language === "ar" ? "جامعة خنشلة" : "University of Khenchela"}.{" "}
            {i18n.language === "ar" ? "جميع الحقوق محفوظة" : "All rights reserved"}.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
