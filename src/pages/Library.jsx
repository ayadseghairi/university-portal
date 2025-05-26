"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Clock, MapPin, Phone, Mail, BookOpen, Users, Wifi, Coffee, Calendar, ArrowRight } from "lucide-react"
import LazyImage from "../components/common/LazyImage"
import ParallaxSection from "../components/common/ParallaxSection"

const Library = () => {
  const { t, i18n } = useTranslation()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const libraryImages = [
    {
      src: "/placeholder.svg?height=600&width=800",
      alt: i18n.language === "ar" ? "القاعة الرئيسية للمكتبة" : "Main Library Hall",
      caption: i18n.language === "ar" ? "القاعة الرئيسية للمكتبة" : "Main Library Hall",
    },
    {
      src: "/placeholder.svg?height=600&width=800",
      alt: i18n.language === "ar" ? "قاعة القراءة الهادئة" : "Silent Reading Room",
      caption: i18n.language === "ar" ? "قاعة القراءة الهادئة" : "Silent Reading Room",
    },
    {
      src: "/placeholder.svg?height=600&width=800",
      alt: i18n.language === "ar" ? "قسم الكتب الرقمية" : "Digital Books Section",
      caption: i18n.language === "ar" ? "قسم الكتب الرقمية" : "Digital Books Section",
    },
    {
      src: "/placeholder.svg?height=600&width=800",
      alt: i18n.language === "ar" ? "قاعة الدراسة الجماعية" : "Group Study Room",
      caption: i18n.language === "ar" ? "قاعة الدراسة الجماعية" : "Group Study Room",
    },
    {
      src: "/placeholder.svg?height=600&width=800",
      alt: i18n.language === "ar" ? "مركز الحاسوب" : "Computer Center",
      caption: i18n.language === "ar" ? "مركز الحاسوب" : "Computer Center",
    },
    {
      src: "/placeholder.svg?height=600&width=800",
      alt: i18n.language === "ar" ? "قسم المراجع" : "Reference Section",
      caption: i18n.language === "ar" ? "قسم المراجع" : "Reference Section",
    },
  ]

  const workingHours = [
    {
      day: i18n.language === "ar" ? "الأحد - الخميس" : "Sunday - Thursday",
      hours: "8:00 AM - 8:00 PM",
      type: "regular",
    },
    {
      day: i18n.language === "ar" ? "الجمعة" : "Friday",
      hours: "9:00 AM - 5:00 PM",
      type: "weekend",
    },
    {
      day: i18n.language === "ar" ? "السبت" : "Saturday",
      hours: i18n.language === "ar" ? "مغلق" : "Closed",
      type: "closed",
    },
  ]

  const services = [
    {
      icon: BookOpen,
      title: i18n.language === "ar" ? "مجموعة واسعة من الكتب" : "Extensive Book Collection",
      description:
        i18n.language === "ar"
          ? "أكثر من 100,000 كتاب في مختلف التخصصات"
          : "Over 100,000 books across various disciplines",
    },
    {
      icon: Wifi,
      title: i18n.language === "ar" ? "إنترنت مجاني" : "Free WiFi",
      description:
        i18n.language === "ar"
          ? "إنترنت عالي السرعة في جميع أنحاء المكتبة"
          : "High-speed internet throughout the library",
    },
    {
      icon: Users,
      title: i18n.language === "ar" ? "قاعات دراسة جماعية" : "Group Study Rooms",
      description:
        i18n.language === "ar"
          ? "مساحات مخصصة للدراسة الجماعية والمشاريع"
          : "Dedicated spaces for group study and projects",
    },
    {
      icon: Coffee,
      title: i18n.language === "ar" ? "منطقة استراحة" : "Relaxation Area",
      description: i18n.language === "ar" ? "مقهى ومنطقة استراحة للطلاب" : "Café and relaxation area for students",
    },
  ]

  const stats = [
    {
      number: "100,000+",
      label: i18n.language === "ar" ? "كتاب" : "Books",
    },
    {
      number: "500+",
      label: i18n.language === "ar" ? "مقعد دراسة" : "Study Seats",
    },
    {
      number: "50+",
      label: i18n.language === "ar" ? "حاسوب" : "Computers",
    },
    {
      number: "24/7",
      label: i18n.language === "ar" ? "كتالوج رقمي" : "Digital Catalog",
    },
  ]

  // Auto-rotate images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % libraryImages.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [libraryImages.length])

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <ParallaxSection speed={0.3}>
        <section className="relative gradient-bg text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="relative page-container py-20">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-5xl lg:text-7xl font-bold mb-6 slide-in-up">
                {i18n.language === "ar" ? "مكتبة الجامعة" : "University Library"}
              </h1>
              <p className="text-xl lg:text-2xl text-blue-100 mb-8 slide-in-up" style={{ animationDelay: "0.2s" }}>
                {i18n.language === "ar"
                  ? "مركز المعرفة والتعلم في قلب الجامعة"
                  : "The heart of knowledge and learning at our university"}
              </p>
              <div className="flex flex-wrap justify-center gap-6 slide-in-up" style={{ animationDelay: "0.4s" }}>
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold text-university-gold">{stat.number}</div>
                    <div className="text-blue-100">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </ParallaxSection>

      {/* Image Gallery Section */}
      <section className="py-20 bg-white">
        <div className="page-container">
          <div className="text-center mb-16">
            <h2 className="section-title">{i18n.language === "ar" ? "جولة في المكتبة" : "Library Tour"}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {i18n.language === "ar"
                ? "استكشف مرافق المكتبة الحديثة والمساحات المخصصة للدراسة والبحث"
                : "Explore our modern library facilities and dedicated spaces for study and research"}
            </p>
          </div>

          {/* Main Image Display */}
          <div className="relative mb-8">
            <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <LazyImage
                src={libraryImages[currentImageIndex].src}
                alt={libraryImages[currentImageIndex].alt}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                <h3 className="text-white text-2xl font-bold">{libraryImages[currentImageIndex].caption}</h3>
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={() => setCurrentImageIndex((prev) => (prev - 1 + libraryImages.length) % libraryImages.length)}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
            >
              <ArrowRight className="h-6 w-6 rotate-180" />
            </button>
            <button
              onClick={() => setCurrentImageIndex((prev) => (prev + 1) % libraryImages.length)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
            >
              <ArrowRight className="h-6 w-6" />
            </button>
          </div>

          {/* Thumbnail Gallery */}
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
            {libraryImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`relative h-24 rounded-lg overflow-hidden transition-all duration-300 ${
                  index === currentImageIndex
                    ? "ring-4 ring-university-blue scale-105"
                    : "hover:scale-105 opacity-70 hover:opacity-100"
                }`}
              >
                <LazyImage src={image.src} alt={image.alt} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Working Hours Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="section-title text-left mb-8">
                {i18n.language === "ar" ? "ساعات العمل" : "Working Hours"}
              </h2>

              <div className="space-y-4">
                {workingHours.map((schedule, index) => (
                  <div
                    key={index}
                    className={`flex justify-between items-center p-6 rounded-xl transition-all duration-300 ${
                      schedule.type === "closed"
                        ? "bg-red-50 border-l-4 border-red-400"
                        : schedule.type === "weekend"
                          ? "bg-yellow-50 border-l-4 border-yellow-400"
                          : "bg-green-50 border-l-4 border-green-400"
                    }`}
                  >
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <Clock
                        className={`h-6 w-6 ${
                          schedule.type === "closed"
                            ? "text-red-500"
                            : schedule.type === "weekend"
                              ? "text-yellow-500"
                              : "text-green-500"
                        }`}
                      />
                      <span className="text-lg font-semibold text-gray-800">{schedule.day}</span>
                    </div>
                    <span
                      className={`text-lg font-bold ${
                        schedule.type === "closed"
                          ? "text-red-600"
                          : schedule.type === "weekend"
                            ? "text-yellow-600"
                            : "text-green-600"
                      }`}
                    >
                      {schedule.hours}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-6 bg-university-blue/10 rounded-xl border border-university-blue/20">
                <h3 className="text-lg font-bold text-university-blue mb-3 flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  {i18n.language === "ar" ? "ملاحظة مهمة" : "Important Note"}
                </h3>
                <p className="text-gray-700">
                  {i18n.language === "ar"
                    ? "قد تختلف ساعات العمل خلال فترات الامتحانات والعطل الرسمية. يرجى مراجعة الإعلانات للحصول على آخر التحديثات."
                    : "Working hours may vary during exam periods and official holidays. Please check announcements for the latest updates."}
                </p>
              </div>
            </div>

            <div className="relative">
              <LazyImage
                src="/placeholder.svg?height=500&width=600"
                alt={i18n.language === "ar" ? "مكتبة الجامعة من الخارج" : "University Library Exterior"}
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-university-gold p-6 rounded-xl shadow-xl">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">24/7</div>
                  <div className="text-sm text-white/90">
                    {i18n.language === "ar" ? "كتالوج رقمي" : "Digital Access"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="page-container">
          <div className="text-center mb-16">
            <h2 className="section-title">{i18n.language === "ar" ? "خدمات المكتبة" : "Library Services"}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {i18n.language === "ar"
                ? "نوفر مجموعة شاملة من الخدمات لدعم رحلتك الأكاديمية والبحثية"
                : "We provide a comprehensive range of services to support your academic and research journey"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="card-interactive text-center group"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-university-blue to-blue-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <service.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{service.title}</h3>
                <p className="text-gray-600 leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20 gradient-bg text-white">
        <div className="page-container">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-6">
              {i18n.language === "ar" ? "معلومات الاتصال" : "Contact Information"}
            </h2>
            <p className="text-xl text-blue-100">
              {i18n.language === "ar" ? "نحن هنا لمساعدتك" : "We're here to help you"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center glass-effect p-8">
              <MapPin className="h-12 w-12 text-university-gold mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">{i18n.language === "ar" ? "الموقع" : "Location"}</h3>
              <p className="text-blue-100">
                {i18n.language === "ar"
                  ? "الطابق الأول، المبنى الرئيسي، جامعة خنشلة"
                  : "First Floor, Main Building, University of Khenchela"}
              </p>
            </div>

            <div className="text-center glass-effect p-8">
              <Phone className="h-12 w-12 text-university-gold mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">{i18n.language === "ar" ? "الهاتف" : "Phone"}</h3>
              <p className="text-blue-100">+213 32 21 XX XX</p>
            </div>

            <div className="text-center glass-effect p-8">
              <Mail className="h-12 w-12 text-university-gold mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">{i18n.language === "ar" ? "البريد الإلكتروني" : "Email"}</h3>
              <p className="text-blue-100">library@univ-khenchela.dz</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Library
