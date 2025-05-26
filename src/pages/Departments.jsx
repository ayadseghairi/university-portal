"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { ArrowLeft, Users, BookOpen, Mail, Phone, MapPin, Calendar, Award } from "lucide-react"
import { facultiesAPI } from "../api/facultiesAPI"
import LoadingSpinner from "../components/common/LoadingSpinner"
import LazyImage from "../components/common/LazyImage"

const Departments = () => {
  const { id } = useParams()
  const { t, i18n } = useTranslation()
  const [faculty, setFaculty] = useState(null)
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchFacultyAndDepartments = async () => {
      try {
        setLoading(true)
        const [facultyResponse, departmentsResponse] = await Promise.all([
          facultiesAPI.getById(id),
          facultiesAPI.getDepartments(id),
        ])

        setFaculty(facultyResponse.data)
        setDepartments(departmentsResponse.data)
      } catch (error) {
        console.error("Error fetching faculty data:", error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchFacultyAndDepartments()
    }
  }, [id])

  if (loading) {
    return <LoadingSpinner text={t("common.loading")} />
  }

  if (error || !faculty) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {i18n.language === "ar" ? "الكلية غير موجودة" : "Faculty Not Found"}
          </h2>
          <p className="text-gray-600 mb-6">
            {i18n.language === "ar"
              ? "عذراً، لم نتمكن من العثور على الكلية المطلوبة"
              : "Sorry, we couldn't find the requested faculty"}
          </p>
          <Link to="/faculties" className="btn-primary">
            {i18n.language === "ar" ? "العودة للكليات" : "Back to Faculties"}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <section className="bg-white border-b py-4">
        <div className="page-container">
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-600">
            <Link to="/" className="hover:text-university-blue">
              {i18n.language === "ar" ? "الرئيسية" : "Home"}
            </Link>
            <span>/</span>
            <Link to="/faculties" className="hover:text-university-blue">
              {t("nav.faculties")}
            </Link>
            <span>/</span>
            <span className="text-gray-900">{faculty.name}</span>
          </div>
        </div>
      </section>

      {/* Faculty Header */}
      <section className="bg-university-blue text-white py-16">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Link
                to="/faculties"
                className="inline-flex items-center text-blue-100 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2 rtl:mr-0 rtl:ml-2 rtl:rotate-180" />
                {i18n.language === "ar" ? "العودة للكليات" : "Back to Faculties"}
              </Link>

              <h1 className="text-4xl lg:text-5xl font-bold">{faculty.name}</h1>
              <p className="text-xl text-blue-100 leading-relaxed">{faculty.description}</p>

              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-university-gold">
                    {faculty.students_count?.toLocaleString() || "0"}
                  </div>
                  <div className="text-blue-100">{i18n.language === "ar" ? "طالب" : "Students"}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-university-gold">
                    {faculty.departments_count || departments.length}
                  </div>
                  <div className="text-blue-100">{i18n.language === "ar" ? "قسم" : "Departments"}</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <LazyImage
                src={faculty.image || "/placeholder.svg?height=400&width=600"}
                alt={faculty.name}
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Faculty Info */}
      <section className="py-16 bg-white">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="card">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                {i18n.language === "ar" ? "معلومات الاتصال" : "Contact Information"}
              </h3>

              <div className="space-y-4">
                {faculty.dean_name && (
                  <div className="flex items-start space-x-3 rtl:space-x-reverse">
                    <Award className="h-5 w-5 text-university-blue mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">{i18n.language === "ar" ? "العميد" : "Dean"}</div>
                      <div className="text-gray-600">{faculty.dean_name}</div>
                    </div>
                  </div>
                )}

                {faculty.contact_email && (
                  <div className="flex items-start space-x-3 rtl:space-x-reverse">
                    <Mail className="h-5 w-5 text-university-blue mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">
                        {i18n.language === "ar" ? "البريد الإلكتروني" : "Email"}
                      </div>
                      <a href={`mailto:${faculty.contact_email}`} className="text-university-blue hover:underline">
                        {faculty.contact_email}
                      </a>
                    </div>
                  </div>
                )}

                {faculty.contact_phone && (
                  <div className="flex items-start space-x-3 rtl:space-x-reverse">
                    <Phone className="h-5 w-5 text-university-blue mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">{i18n.language === "ar" ? "الهاتف" : "Phone"}</div>
                      <a href={`tel:${faculty.contact_phone}`} className="text-university-blue hover:underline">
                        {faculty.contact_phone}
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-start space-x-3 rtl:space-x-reverse">
                  <MapPin className="h-5 w-5 text-university-blue mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">{i18n.language === "ar" ? "الموقع" : "Location"}</div>
                    <div className="text-gray-600">
                      {i18n.language === "ar"
                        ? "جامعة خنشلة، خنشلة، الجزائر"
                        : "University of Khenchela, Khenchela, Algeria"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="card">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                {i18n.language === "ar" ? "إحصائيات سريعة" : "Quick Stats"}
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">{i18n.language === "ar" ? "إجمالي الطلاب" : "Total Students"}</span>
                  <span className="font-bold text-university-blue">
                    {faculty.students_count?.toLocaleString() || "N/A"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">{i18n.language === "ar" ? "عدد الأقسام" : "Departments"}</span>
                  <span className="font-bold text-university-blue">{departments.length}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">
                    {i18n.language === "ar" ? "البرامج المتاحة" : "Programs Available"}
                  </span>
                  <span className="font-bold text-university-blue">
                    {departments.reduce((total, dept) => total + (dept.programs_count || 3), 0)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">
                    {i18n.language === "ar" ? "أعضاء هيئة التدريس" : "Faculty Members"}
                  </span>
                  <span className="font-bold text-university-blue">
                    {departments.reduce((total, dept) => total + (dept.faculty_count || 15), 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="card">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                {i18n.language === "ar" ? "الإنجازات" : "Achievements"}
              </h3>

              <div className="space-y-4">
                <div className="flex items-start space-x-3 rtl:space-x-reverse">
                  <Award className="h-5 w-5 text-university-gold mt-1 flex-shrink-0" />
                  <div className="text-sm text-gray-600">
                    {i18n.language === "ar"
                      ? "اعتماد دولي من منظمات تعليمية مرموقة"
                      : "International accreditation from prestigious educational organizations"}
                  </div>
                </div>

                <div className="flex items-start space-x-3 rtl:space-x-reverse">
                  <Award className="h-5 w-5 text-university-gold mt-1 flex-shrink-0" />
                  <div className="text-sm text-gray-600">
                    {i18n.language === "ar"
                      ? "شراكات مع جامعات عالمية رائدة"
                      : "Partnerships with leading global universities"}
                  </div>
                </div>

                <div className="flex items-start space-x-3 rtl:space-x-reverse">
                  <Award className="h-5 w-5 text-university-gold mt-1 flex-shrink-0" />
                  <div className="text-sm text-gray-600">
                    {i18n.language === "ar"
                      ? "مشاريع بحثية متميزة ومنشورات علمية"
                      : "Outstanding research projects and scientific publications"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Departments */}
      <section className="py-16 bg-gray-50">
        <div className="page-container">
          <div className="text-center mb-12">
            <h2 className="section-title">{i18n.language === "ar" ? "الأقسام الأكاديمية" : "Academic Departments"}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {i18n.language === "ar"
                ? "تعرف على الأقسام المختلفة والبرامج الأكاديمية المتاحة"
                : "Explore our different departments and available academic programs"}
            </p>
          </div>

          {departments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {departments.map((department) => (
                <div key={department.id} className="card-interactive">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <div className="w-12 h-12 bg-gradient-to-r from-university-blue to-blue-600 rounded-xl flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900">{department.name}</h3>
                        {department.head_name && (
                          <p className="text-sm text-gray-600">
                            {i18n.language === "ar" ? "رئيس القسم: " : "Head: "}
                            {department.head_name}
                          </p>
                        )}
                      </div>
                    </div>

                    <p className="text-gray-600 line-clamp-3">
                      {department.description ||
                        (i18n.language === "ar"
                          ? "قسم أكاديمي متميز يقدم برامج تعليمية عالية الجودة"
                          : "Distinguished academic department offering high-quality educational programs")}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        <span>
                          {department.students_count || "200+"} {i18n.language === "ar" ? "طالب" : "Students"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-2" />
                        <span>
                          {department.programs_count || "3"} {i18n.language === "ar" ? "برامج" : "Programs"}
                        </span>
                      </div>
                    </div>

                    {department.contact_email && (
                      <div className="pt-4 border-t">
                        <a
                          href={`mailto:${department.contact_email}`}
                          className="text-university-blue hover:underline text-sm"
                        >
                          {department.contact_email}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {i18n.language === "ar" ? "لا توجد أقسام متاحة" : "No Departments Available"}
              </h3>
              <p className="text-gray-600">
                {i18n.language === "ar"
                  ? "سيتم إضافة معلومات الأقسام قريباً"
                  : "Department information will be added soon"}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Programs and Admissions */}
      <section className="py-16 bg-white">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Programs */}
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-8">
                {i18n.language === "ar" ? "البرامج الأكاديمية" : "Academic Programs"}
              </h3>

              <div className="space-y-6">
                {[
                  {
                    level: i18n.language === "ar" ? "البكالوريوس" : "Bachelor's Degree",
                    duration: i18n.language === "ar" ? "3 سنوات" : "3 Years",
                    description:
                      i18n.language === "ar"
                        ? "برامج البكالوريوس في مختلف التخصصات"
                        : "Bachelor's programs in various specializations",
                  },
                  {
                    level: i18n.language === "ar" ? "الماجستير" : "Master's Degree",
                    duration: i18n.language === "ar" ? "2 سنة" : "2 Years",
                    description:
                      i18n.language === "ar"
                        ? "برامج الماجستير المتقدمة والبحثية"
                        : "Advanced and research master's programs",
                  },
                  {
                    level: i18n.language === "ar" ? "الدكتوراه" : "PhD Degree",
                    duration: i18n.language === "ar" ? "3-5 سنوات" : "3-5 Years",
                    description:
                      i18n.language === "ar" ? "برامج الدكتوراه والبحث العلمي" : "PhD and scientific research programs",
                  },
                ].map((program, index) => (
                  <div key={index} className="flex items-start space-x-4 rtl:space-x-reverse">
                    <div className="w-12 h-12 bg-university-blue/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-6 w-6 text-university-blue" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{program.level}</h4>
                      <p className="text-university-blue font-medium">{program.duration}</p>
                      <p className="text-gray-600 mt-1">{program.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Admissions */}
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-8">
                {i18n.language === "ar" ? "القبول والتسجيل" : "Admissions"}
              </h3>

              <div className="card bg-gradient-to-br from-university-blue to-blue-600 text-white">
                <h4 className="text-xl font-bold mb-4">
                  {i18n.language === "ar" ? "متطلبات القبول" : "Admission Requirements"}
                </h4>

                <ul className="space-y-3">
                  <li className="flex items-start space-x-3 rtl:space-x-reverse">
                    <div className="w-2 h-2 bg-university-gold rounded-full mt-2 flex-shrink-0"></div>
                    <span>
                      {i18n.language === "ar" ? "شهادة البكالوريا أو ما يعادلها" : "High school diploma or equivalent"}
                    </span>
                  </li>
                  <li className="flex items-start space-x-3 rtl:space-x-reverse">
                    <div className="w-2 h-2 bg-university-gold rounded-full mt-2 flex-shrink-0"></div>
                    <span>
                      {i18n.language === "ar"
                        ? "معدل مناسب حسب التخصص المطلوب"
                        : "Appropriate GPA based on desired specialization"}
                    </span>
                  </li>
                  <li className="flex items-start space-x-3 rtl:space-x-reverse">
                    <div className="w-2 h-2 bg-university-gold rounded-full mt-2 flex-shrink-0"></div>
                    <span>
                      {i18n.language === "ar" ? "اجتياز امتحان القبول (إن وجد)" : "Pass entrance exam (if applicable)"}
                    </span>
                  </li>
                  <li className="flex items-start space-x-3 rtl:space-x-reverse">
                    <div className="w-2 h-2 bg-university-gold rounded-full mt-2 flex-shrink-0"></div>
                    <span>
                      {i18n.language === "ar" ? "استكمال جميع الوثائق المطلوبة" : "Complete all required documents"}
                    </span>
                  </li>
                </ul>

                <div className="mt-6 pt-6 border-t border-white/20">
                  <Link to="/contact" className="btn-secondary bg-white text-university-blue hover:bg-gray-100">
                    {i18n.language === "ar" ? "تواصل معنا للمزيد" : "Contact Us for More Info"}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Departments
