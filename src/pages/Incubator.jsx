"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Rocket, Lightbulb, TrendingUp, Users, Calendar, DollarSign } from "lucide-react"
import { incubatorAPI } from "../api/incubatorAPI"
import LoadingSpinner from "../components/common/LoadingSpinner"

const Incubator = () => {
  const { t, i18n } = useTranslation()
  const [startups, setStartups] = useState([])
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [startupsResponse, programsResponse] = await Promise.all([
          incubatorAPI.getStartups(),
          incubatorAPI.getPrograms(),
        ])
        setStartups(startupsResponse.data)
        setPrograms(programsResponse.data)
      } catch (error) {
        console.error("Error fetching incubator data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const services = [
    {
      icon: Lightbulb,
      title: i18n.language === "ar" ? "تطوير الأفكار" : "Idea Development",
      description:
        i18n.language === "ar"
          ? "مساعدة الطلاب في تطوير أفكارهم الريادية وتحويلها إلى مشاريع قابلة للتنفيذ"
          : "Helping students develop their entrepreneurial ideas and turn them into viable projects",
    },
    {
      icon: Users,
      title: i18n.language === "ar" ? "الإرشاد والتوجيه" : "Mentorship",
      description:
        i18n.language === "ar"
          ? "توفير الإرشاد من خبراء في مجال ريادة الأعمال والتكنولوجيا"
          : "Providing guidance from experts in entrepreneurship and technology",
    },
    {
      icon: DollarSign,
      title: i18n.language === "ar" ? "التمويل" : "Funding",
      description:
        i18n.language === "ar"
          ? "ربط الشركات الناشئة بمصادر التمويل والمستثمرين"
          : "Connecting startups with funding sources and investors",
    },
    {
      icon: TrendingUp,
      title: i18n.language === "ar" ? "تسريع النمو" : "Growth Acceleration",
      description:
        i18n.language === "ar"
          ? "برامج تسريع لمساعدة الشركات الناشئة على النمو والتوسع"
          : "Acceleration programs to help startups grow and scale",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-20">
        <div className="page-container">
          <div className="text-center">
            <div className="text-6xl mb-6">🚀</div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">{t("nav.incubator")}</h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              {i18n.language === "ar"
                ? "حاضنة الشركات الناشئة - مكان لتحويل الأفكار الإبداعية إلى مشاريع ناجحة"
                : "Startup Incubator - Where creative ideas transform into successful ventures"}
            </p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-white">
        <div className="page-container">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {i18n.language === "ar" ? "خدماتنا" : "Our Services"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <div key={index} className="card text-center hover:shadow-lg transition-shadow duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                  <service.icon className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Startups Section */}
      <section className="py-16 bg-gray-50">
        <div className="page-container">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {i18n.language === "ar" ? "الشركات الناشئة" : "Our Startups"}
          </h2>

          {loading ? (
            <LoadingSpinner text={t("common.loading")} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {startups.map((startup) => (
                <div key={startup.id} className="card hover:shadow-lg transition-shadow duration-300">
                  <img
                    src={startup.logo || "/placeholder.svg?height=200&width=400"}
                    alt={startup.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-gray-900">{startup.name}</h3>
                    <p className="text-gray-600 line-clamp-3">{startup.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">{startup.stage}</span>
                      <span className="text-gray-500">{startup.industry}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="h-4 w-4 mr-2" />
                      <span>
                        {startup.team_size} {i18n.language === "ar" ? "عضو" : "team members"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-16 bg-white">
        <div className="page-container">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {i18n.language === "ar" ? "برامج الحاضنة" : "Incubation Programs"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {programs.map((program) => (
              <div key={program.id} className="card hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-start space-x-4 rtl:space-x-reverse">
                  <div className="bg-green-100 rounded-lg p-4 text-center min-w-[100px]">
                    <Rocket className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-sm font-medium text-green-600">{program.duration}</div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{program.name}</h3>
                    <p className="text-gray-600 mb-3">{program.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{program.next_cohort}</span>
                      </div>
                      <button className="text-green-600 hover:text-green-700 font-medium">
                        {i18n.language === "ar" ? "تقدم الآن" : "Apply Now"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 bg-green-600 text-white">
        <div className="page-container text-center">
          <h2 className="text-3xl font-bold mb-12">{i18n.language === "ar" ? "قصص نجاح" : "Success Stories"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                metric: "50+",
                label: i18n.language === "ar" ? "شركة ناشئة" : "Startups Launched",
              },
              {
                metric: "$2M+",
                label: i18n.language === "ar" ? "تمويل مجموع" : "Total Funding Raised",
              },
              {
                metric: "200+",
                label: i18n.language === "ar" ? "وظيفة تم إنشاؤها" : "Jobs Created",
              },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold mb-2">{stat.metric}</div>
                <div className="text-green-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Apply Section */}
      <section className="py-16 bg-white">
        <div className="page-container text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            {i18n.language === "ar" ? "هل لديك فكرة مشروع؟" : "Have a Project Idea?"}
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {i18n.language === "ar"
              ? "انضم إلى حاضنة الشركات الناشئة وحول فكرتك إلى مشروع ناجح"
              : "Join our startup incubator and turn your idea into a successful venture"}
          </p>
          <button className="btn-primary bg-green-600 hover:bg-green-700">
            {i18n.language === "ar" ? "تقدم بطلب الانضمام" : "Apply Now"}
          </button>
        </div>
      </section>
    </div>
  )
}

export default Incubator
