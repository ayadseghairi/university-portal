"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { ArrowRight, Calendar, Users, BookOpen, Award, TrendingUp, Globe, Zap } from "lucide-react"
import { newsAPI } from "../api/newsAPI"
import LoadingSpinner from "../components/common/LoadingSpinner"
import AnimatedCounter from "../components/common/AnimatedCounter"
import ParallaxSection from "../components/common/ParallaxSection"
import LazyImage from "../components/common/LazyImage"

const Home = () => {
  const { t, i18n } = useTranslation()
  const [latestNews, setLatestNews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLatestNews = async () => {
      try {
        const response = await newsAPI.getLatest(3)
        setLatestNews(response.data)
      } catch (error) {
        console.error("Error fetching news:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLatestNews()
  }, [])

  const stats = [
    {
      icon: Users,
      value: 11335      ,
      label: t("home.students") || "Students",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: BookOpen,
      value: 7,
      label: t("home.faculties") || "Faculties",
      color: "from-green-500 to-green-600",
    },
    {
      icon: Award,
      value: 50,
      label: t("home.programs") || "Programs",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Calendar,
      value: 25,
      label: t("home.years") || "Years of Excellence",
      color: "from-orange-500 to-orange-600",
    },
  ]

  const features = [
    {
      icon: Globe,
      title: i18n.language === "ar" ? "تعليم عالمي" : "Global Education",
      description:
        i18n.language === "ar"
          ? "شراكات دولية مع جامعات مرموقة حول العالم"
          : "International partnerships with prestigious universities worldwide",
    },
    {
      icon: Zap,
      title: i18n.language === "ar" ? "ابتكار وتكنولوجيا" : "Innovation & Technology",
      description:
        i18n.language === "ar"
          ? "مختبرات حديثة ومراكز بحثية متطورة"
          : "Modern laboratories and advanced research centers",
    },
    {
      icon: TrendingUp,
      title: i18n.language === "ar" ? "نمو مستمر" : "Continuous Growth",
      description:
        i18n.language === "ar"
          ? "تطوير مستمر للبرامج الأكاديمية والبحثية"
          : "Continuous development of academic and research programs",
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section with Parallax */}
      <ParallaxSection speed={0.3}>
        <section className="relative gradient-bg hero-pattern text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>

          {/* Floating elements */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full floating-animation"></div>
          <div
            className="absolute top-40 right-20 w-16 h-16 bg-university-gold/20 rounded-full floating-animation"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute bottom-20 left-1/4 w-12 h-12 bg-white/10 rounded-full floating-animation"
            style={{ animationDelay: "4s" }}
          ></div>

          <div className="relative page-container py-20 lg:py-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8 slide-in-left">
                <h1 className="text-4xl lg:text-7xl font-bold leading-tight">{t("home.welcome")}</h1>
                <p className="text-xl lg:text-2xl text-blue-100 leading-relaxed">{t("home.subtitle")}</p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/about"
                    className="btn-primary bg-university-gold hover:bg-yellow-600 text-black font-bold text-lg px-8 py-4 pulse-glow"
                  >
                    {i18n.language === "ar" ? "اكتشف المزيد" : "Discover More"}
                    <ArrowRight className="ml-2 h-6 w-6 rtl:rotate-180" />
                  </Link>
                  <Link to="/faculties" className="btn-ghost border-2 border-white/30 text-lg px-8 py-4">
                    {i18n.language === "ar" ? "الكليات" : "Our Faculties"}
                  </Link>
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-2 gap-6 pt-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-university-gold">
                      <AnimatedCounter end={15000} suffix="+" />
                    </div>
                    <div className="text-blue-100">{i18n.language === "ar" ? "طالب" : "Students"}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-university-gold">
                      <AnimatedCounter end={50} suffix="+" />
                    </div>
                    <div className="text-blue-100">{i18n.language === "ar" ? "برنامج" : "Programs"}</div>
                  </div>
                </div>
              </div>

              <div className="relative slide-in-right">
                <div className="relative z-10">
                  <LazyImage
                    src="/public/hero/herp.png?height=600&width=800"
                    alt="University Campus"
                    className="rounded-2xl shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500"
                  />
                </div>
                <div className="absolute -top-4 -left-4 w-full h-full bg-university-gold/20 rounded-2xl -z-10"></div>
              </div>
            </div>
          </div>
        </section>
      </ParallaxSection>

      {/* Stats Section with Animation */}
      <section className="py-20 bg-white relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50"></div>
        <div className="relative page-container">
          <div className="text-center mb-16 fade-in-up">
            <h2 className="section-title">
              {i18n.language === "ar" ? "إنجازاتنا بالأرقام" : "Our Achievements in Numbers"}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {i18n.language === "ar"
                ? "أرقام تعكس التميز والنمو المستمر في مسيرتنا التعليمية"
                : "Numbers that reflect excellence and continuous growth in our educational journey"}
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="stats-card text-center group hover:scale-105 transition-transform duration-300"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${stat.color} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  <AnimatedCounter end={stat.value} suffix={stat.value > 100 ? "+" : ""} />
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="page-container">
          <div className="text-center mb-16">
            <h2 className="section-title">{i18n.language === "ar" ? "لماذا تختارنا؟" : "Why Choose Us?"}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card-interactive text-center group"
                style={{ animationDelay: `${index * 0.3}s` }}
              >
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-university-blue to-blue-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest News Section */}
      <section className="py-20 bg-white">
        <div className="page-container">
          <div className="flex justify-between items-center mb-12">
            <h2 className="section-title">{t("home.latestNews")}</h2>
            <Link to="/news" className="btn-secondary group">
              {t("home.viewAll")}
              <ArrowRight className="ml-2 h-5 w-5 rtl:rotate-180 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner text={t("common.loading")} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestNews.map((news, index) => (
                <article key={news.id} className="card-interactive group" style={{ animationDelay: `${index * 0.2}s` }}>
                  <div className="relative overflow-hidden rounded-xl mb-6">
                    <LazyImage
                      src={news.image || "/public/public/logo/university-logo.png?height=200&width=400"}
                      alt={news.title}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-university-blue text-white px-3 py-1 rounded-full text-sm font-medium">
                        {news.category}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(news.created_at).toLocaleDateString(i18n.language)}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-university-blue transition-colors">
                      {news.title}
                    </h3>

                    <p className="text-gray-600 line-clamp-3 leading-relaxed">{news.excerpt}</p>

                    <Link
                      to={`/news/${news.id}`}
                      className="inline-flex items-center text-university-blue hover:text-blue-700 font-semibold group"
                    >
                      {i18n.language === "ar" ? "اقرأ المزيد" : "Read More"}
                      <ArrowRight className="ml-2 h-4 w-4 rtl:rotate-180 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-bg text-white relative overflow-hidden">
        <div className="absolute inset-0 hero-pattern"></div>
        <div className="relative page-container text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              {i18n.language === "ar" ? "انضم إلى مجتمعنا الأكاديمي" : "Join Our Academic Community"}
            </h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              {i18n.language === "ar"
                ? "كن جزءاً من رحلة التعلم والاكتشاف في جامعة خنشلة"
                : "Be part of the learning and discovery journey at University of Khenchela"}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {[
                { title: t("nav.aiHouse"), href: "/ai-house", icon: "🤖" },
                { title: t("nav.incubator"), href: "/incubator", icon: "🚀" },
                { title: i18n.language === "ar" ? "المكتبة" : "Library", href: "/library", icon: "📚" },
              ].map((item, index) => (
                <Link
                  key={index}
                  to={item.href}
                  className="glass-effect p-6 text-center hover:bg-white/20 transition-all duration-300 group"
                >
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                </Link>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="btn-primary bg-university-gold hover:bg-yellow-600 text-black text-lg px-8 py-4"
              >
                {i18n.language === "ar" ? "تواصل معنا" : "Contact Us"}
              </Link>
              <Link to="/about" className="btn-ghost border-2 border-white/30 text-lg px-8 py-4">
                {i18n.language === "ar" ? "تعرف علينا أكثر" : "Learn More About Us"}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
