"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { Users, BookOpen, ArrowRight } from "lucide-react"
import { facultiesAPI } from "../api/facultiesAPI"
import LoadingSpinner from "../components/common/LoadingSpinner"

const Faculties = () => {
  const { t, i18n } = useTranslation()
  const [faculties, setFaculties] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const response = await facultiesAPI.getAll()
        setFaculties(response.data)
      } catch (error) {
        console.error("Error fetching faculties:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFaculties()
  }, [])

  if (loading) {
    return <LoadingSpinner text={t("common.loading")} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-university-blue text-white py-20">
        <div className="page-container">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">{t("nav.faculties")}</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              {i18n.language === "ar"
                ? "اكتشف كلياتنا المتنوعة والبرامج الأكاديمية المتميزة التي نقدمها"
                : "Discover our diverse faculties and the outstanding academic programs we offer"}
            </p>
          </div>
        </div>
      </section>

      {/* Faculties Grid */}
      <section className="py-16">
        <div className="page-container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {faculties.map((faculty) => (
              <div key={faculty.id} className="card hover:shadow-lg transition-shadow duration-300">
                <img
                  src={faculty.image || "/placeholder.svg?height=200&width=400"}
                  alt={faculty.name}
                  className="w-full h-48 object-cover rounded-lg mb-6"
                />

                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-gray-900">{faculty.name}</h3>

                  <p className="text-gray-600 line-clamp-3">{faculty.description}</p>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-2" />
                      <span>
                        {faculty.departments_count} {i18n.language === "ar" ? "قسم" : "Departments"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      <span>
                        {faculty.students_count} {i18n.language === "ar" ? "طالب" : "Students"}
                      </span>
                    </div>
                  </div>

                  <Link
                    to={`/faculties/${faculty.id}`}
                    className="inline-flex items-center text-university-blue hover:text-blue-700 font-medium"
                  >
                    {i18n.language === "ar" ? "اكتشف المزيد" : "Learn More"}
                    <ArrowRight className="ml-2 h-4 w-4 rtl:rotate-180" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Faculties
