"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Plus, Search, Edit, Trash2, Users, BookOpen, Mail, Phone, Save, X } from "lucide-react"
import { facultiesAPI } from "../../api/facultiesAPI"
import LoadingSpinner from "../../components/common/LoadingSpinner"

const ManageFaculties = () => {
  const { t, i18n } = useTranslation()
  const [faculties, setFaculties] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingFaculty, setEditingFaculty] = useState(null)

  useEffect(() => {
    fetchFaculties()
  }, [searchTerm])

  const fetchFaculties = async () => {
    try {
      setLoading(true)
      const response = await facultiesAPI.getAll()
      let filteredFaculties = response.data

      if (searchTerm) {
        filteredFaculties = filteredFaculties.filter((faculty) =>
          faculty.name.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      }

      setFaculties(filteredFaculties)
    } catch (error) {
      console.error("Error fetching faculties:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm(i18n.language === "ar" ? "هل أنت متأكد من الحذف؟" : "Are you sure you want to delete?")) {
      try {
        await facultiesAPI.delete(id)
        fetchFaculties()
      } catch (error) {
        console.error("Error deleting faculty:", error)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {i18n.language === "ar" ? "إدارة الكليات" : "Manage Faculties"}
          </h1>
          <p className="text-gray-600 mt-2">
            {i18n.language === "ar" ? "إدارة معلومات الكليات والأقسام" : "Manage faculty and department information"}
          </p>
        </div>

        <button onClick={() => setShowCreateModal(true)} className="btn-primary">
          <Plus className="h-5 w-5 mr-2" />
          {i18n.language === "ar" ? "إضافة كلية جديدة" : "Add New Faculty"}
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder={i18n.language === "ar" ? "البحث في الكليات..." : "Search faculties..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10 rtl:pl-3 rtl:pr-10"
          />
        </div>
      </div>

      {/* Faculties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full">
            <LoadingSpinner text={t("common.loading")} />
          </div>
        ) : (
          faculties.map((faculty) => (
            <div key={faculty.id} className="card hover:shadow-lg transition-shadow duration-300">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{faculty.name}</h3>
                    <p className="text-gray-600 line-clamp-3">{faculty.description}</p>
                  </div>
                  <div className="flex space-x-2 rtl:space-x-reverse">
                    <button
                      onClick={() => setEditingFaculty(faculty)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title={i18n.language === "ar" ? "تحرير" : "Edit"}
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(faculty.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title={i18n.language === "ar" ? "حذف" : "Delete"}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Users className="h-5 w-5 text-university-blue" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{faculty.students_count || 0}</div>
                    <div className="text-sm text-gray-600">{i18n.language === "ar" ? "طالب" : "Students"}</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <BookOpen className="h-5 w-5 text-university-blue" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{faculty.departments_count || 0}</div>
                    <div className="text-sm text-gray-600">{i18n.language === "ar" ? "قسم" : "Departments"}</div>
                  </div>
                </div>

                {faculty.dean_name && (
                  <div className="pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      {i18n.language === "ar" ? "العميد: " : "Dean: "}
                      <span className="font-medium text-gray-900">{faculty.dean_name}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500">
                  {faculty.contact_email && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      <span className="truncate">{faculty.contact_email}</span>
                    </div>
                  )}
                  {faculty.contact_phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      <span>{faculty.contact_phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {!loading && faculties.length === 0 && (
          <div className="col-span-full text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {i18n.language === "ar" ? "لا توجد كليات" : "No faculties found"}
            </h3>
            <p className="text-gray-600">
              {i18n.language === "ar" ? "ابدأ بإضافة كلية جديدة" : "Start by adding a new faculty"}
            </p>
          </div>
        )}
      </div>

      {/* Create/Edit Faculty Modal */}
      {(showCreateModal || editingFaculty) && (
        <FacultyModal
          faculty={editingFaculty}
          onSave={() => {
            fetchFaculties()
            setShowCreateModal(false)
            setEditingFaculty(null)
          }}
          onCancel={() => {
            setShowCreateModal(false)
            setEditingFaculty(null)
          }}
        />
      )}
    </div>
  )
}

const FacultyModal = ({ faculty, onSave, onCancel }) => {
  const { t, i18n } = useTranslation()
  const [formData, setFormData] = useState({
    name: "",
    name_ar: "",
    name_fr: "",
    description: "",
    description_ar: "",
    description_fr: "",
    dean_name: "",
    contact_email: "",
    contact_phone: "",
    students_count: 0,
    departments_count: 0,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (faculty) {
      setFormData({
        name: faculty.name || "",
        name_ar: faculty.name_ar || "",
        name_fr: faculty.name_fr || "",
        description: faculty.description || "",
        description_ar: faculty.description_ar || "",
        description_fr: faculty.description_fr || "",
        dean_name: faculty.dean_name || "",
        contact_email: faculty.contact_email || "",
        contact_phone: faculty.contact_phone || "",
        students_count: faculty.students_count || 0,
        departments_count: faculty.departments_count || 0,
      })
    }
  }, [faculty])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (faculty) {
        await facultiesAPI.update(faculty.id, formData)
      } else {
        await facultiesAPI.create(formData)
      }
      onSave()
    } catch (error) {
      console.error("Error saving faculty:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">
              {faculty
                ? i18n.language === "ar"
                  ? "تحرير الكلية"
                  : "Edit Faculty"
                : i18n.language === "ar"
                  ? "إضافة كلية جديدة"
                  : "Add New Faculty"}
            </h3>
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Names */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {i18n.language === "ar" ? "الاسم (إنجليزي)" : "Name (English)"}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {i18n.language === "ar" ? "الاسم (عربي)" : "Name (Arabic)"}
                </label>
                <input
                  type="text"
                  value={formData.name_ar}
                  onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                  className="input-field"
                  dir="rtl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {i18n.language === "ar" ? "الاسم (فرنسي)" : "Name (French)"}
                </label>
                <input
                  type="text"
                  value={formData.name_fr}
                  onChange={(e) => setFormData({ ...formData, name_fr: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>

            {/* Descriptions */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {i18n.language === "ar" ? "الوصف (إنجليزي)" : "Description (English)"}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field h-24"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {i18n.language === "ar" ? "الوصف (عربي)" : "Description (Arabic)"}
                </label>
                <textarea
                  value={formData.description_ar}
                  onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                  className="input-field h-24"
                  dir="rtl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {i18n.language === "ar" ? "الوصف (فرنسي)" : "Description (French)"}
                </label>
                <textarea
                  value={formData.description_fr}
                  onChange={(e) => setFormData({ ...formData, description_fr: e.target.value })}
                  className="input-field h-24"
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {i18n.language === "ar" ? "اسم العميد" : "Dean Name"}
                </label>
                <input
                  type="text"
                  value={formData.dean_name}
                  onChange={(e) => setFormData({ ...formData, dean_name: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {i18n.language === "ar" ? "البريد الإلكتروني" : "Contact Email"}
                </label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {i18n.language === "ar" ? "رقم الهاتف" : "Contact Phone"}
                </label>
                <input
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {i18n.language === "ar" ? "عدد الطلاب" : "Students Count"}
                </label>
                <input
                  type="number"
                  value={formData.students_count}
                  onChange={(e) => setFormData({ ...formData, students_count: Number.parseInt(e.target.value) || 0 })}
                  className="input-field"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {i18n.language === "ar" ? "عدد الأقسام" : "Departments Count"}
                </label>
                <input
                  type="number"
                  value={formData.departments_count}
                  onChange={(e) =>
                    setFormData({ ...formData, departments_count: Number.parseInt(e.target.value) || 0 })
                  }
                  className="input-field"
                  min="0"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-6 border-t">
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mx-auto" />
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    {faculty ? (i18n.language === "ar" ? "تحديث" : "Update") : i18n.language === "ar" ? "حفظ" : "Save"}
                  </>
                )}
              </button>
              <button type="button" onClick={onCancel} className="btn-secondary flex-1">
                {i18n.language === "ar" ? "إلغاء" : "Cancel"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ManageFaculties
