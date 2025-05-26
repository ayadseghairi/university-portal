"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Brain, Cpu, Database, Code, Users, Calendar } from "lucide-react"
import { aiHouseAPI } from "../api/aiHouseAPI"
import LoadingSpinner from "../components/common/LoadingSpinner"

const AIHouse = () => {
  const { t, i18n } = useTranslation()
  const [projects, setProjects] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsResponse, eventsResponse] = await Promise.all([aiHouseAPI.getProjects(), aiHouseAPI.getEvents()])
        setProjects(projectsResponse.data)
        setEvents(eventsResponse.data)
      } catch (error) {
        console.error("Error fetching AI House data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const features = [
    {
      icon: Brain,
      title: i18n.language === "ar" ? "الذكاء الاصطناعي" : "Artificial Intelligence",
      description:
        i18n.language === "ar"
          ? "تطوير حلول ذكية باستخدام تقنيات الذكاء الاصطناعي المتقدمة"
          : "Developing intelligent solutions using advanced AI technologies",
    },
    {
      icon: Cpu,
      title: i18n.language === "ar" ? "التعلم الآلي" : "Machine Learning",
      description:
        i18n.language === "ar"
          ? "بناء نماذج تعلم آلي لحل المشاكل المعقدة"
          : "Building machine learning models to solve complex problems",
    },
    {
      icon: Database,
      title: i18n.language === "ar" ? "علم البيانات" : "Data Science",
      description:
        i18n.language === "ar"
          ? "تحليل البيانات الضخمة واستخراج الرؤى القيمة"
          : "Analyzing big data and extracting valuable insights",
    },
    {
      icon: Code,
      title: i18n.language === "ar" ? "البرمجة المتقدمة" : "Advanced Programming",
      description:
        i18n.language === "ar"
          ? "تطوير تطبيقات متقدمة باستخدام أحدث التقنيات"
          : "Developing advanced applications using cutting-edge technologies",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-20">
        <div className="page-container">
          <div className="text-center">
            <div className="text-6xl mb-6">🤖</div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">{t("nav.aiHouse")}</h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto">
              {i18n.language === "ar"
                ? "مركز متخصص في الذكاء الاصطناعي والتقنيات المتقدمة لتطوير الحلول المبتكرة"
                : "A specialized center for artificial intelligence and advanced technologies to develop innovative solutions"}
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="page-container">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {i18n.language === "ar" ? "مجالات التخصص" : "Areas of Expertise"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card text-center hover:shadow-lg transition-shadow duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-6">
                  <feature.icon className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-16 bg-gray-50">
        <div className="page-container">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {i18n.language === "ar" ? "المشاريع الحالية" : "Current Projects"}
          </h2>

          {loading ? (
            <LoadingSpinner text={t("common.loading")} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project) => (
                <div key={project.id} className="card hover:shadow-lg transition-shadow duration-300">
                  <img
                    src={project.image || "/placeholder.svg?height=200&width=400"}
                    alt={project.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-gray-900">{project.title}</h3>
                    <p className="text-gray-600 line-clamp-3">{project.description}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="h-4 w-4 mr-2" />
                      <span>
                        {project.team_size} {i18n.language === "ar" ? "عضو" : "members"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies?.map((tech, index) => (
                        <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Events Section */}
      <section className="py-16 bg-white">
        <div className="page-container">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {i18n.language === "ar" ? "الفعاليات القادمة" : "Upcoming Events"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {events.map((event) => (
              <div key={event.id} className="card hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-start space-x-4 rtl:space-x-reverse">
                  <div className="bg-purple-100 rounded-lg p-4 text-center min-w-[80px]">
                    <div className="text-2xl font-bold text-purple-600">{new Date(event.date).getDate()}</div>
                    <div className="text-sm text-purple-600">
                      {new Date(event.date).toLocaleDateString(i18n.language, { month: "short" })}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
                    <p className="text-gray-600 mb-3">{event.description}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{new Date(event.date).toLocaleDateString(i18n.language)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Section */}
      <section className="py-16 bg-purple-600 text-white">
        <div className="page-container text-center">
          <h2 className="text-3xl font-bold mb-6">
            {i18n.language === "ar" ? "انضم إلى بيت الذكاء الاصطناعي" : "Join AI House"}
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            {i18n.language === "ar"
              ? "كن جزءاً من مجتمع الذكاء الاصطناعي وساهم في بناء مستقبل التكنولوجيا"
              : "Be part of the AI community and contribute to building the future of technology"}
          </p>
          <button className="btn-primary bg-white text-purple-600 hover:bg-gray-100">
            {i18n.language === "ar" ? "تقدم بطلب الانضمام" : "Apply to Join"}
          </button>
        </div>
      </section>
    </div>
  )
}

export default AIHouse
