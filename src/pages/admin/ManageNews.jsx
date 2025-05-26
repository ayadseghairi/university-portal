"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Link, useLocation } from "react-router-dom"
import { Plus, Search, Filter, Edit, Trash2, Eye, Calendar, User, Tag, Save, X } from "lucide-react"
import { newsAPI } from "../../api/newsAPI"
import { useAuth } from "../../contexts/AuthContext"
import LoadingSpinner from "../../components/common/LoadingSpinner"

const ManageNews = () => {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const location = useLocation()
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingNews, setEditingNews] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const categories = [
    { value: "", label: i18n.language === "ar" ? "جميع الفئات" : "All Categories" },
    { value: "academic", label: i18n.language === "ar" ? "أكاديمي" : "Academic" },
    { value: "events", label: i18n.language === "ar" ? "فعاليات" : "Events" },
    { value: "research", label: i18n.language === "ar" ? "بحث علمي" : "Research" },
    { value: "student", label: i18n.language === "ar" ? "طلابي" : "Student Life" },
    { value: "announcement", label: i18n.language === "ar" ? "إعلانات" : "Announcements" },
  ]

  useEffect(() => {
    fetchNews()
  }, [currentPage, searchTerm, selectedCategory])

  const fetchNews = async () => {
    try {
      setLoading(true)
      const response = await newsAPI.getAll({
        page: currentPage,
        search: searchTerm,
        category: selectedCategory,
      })
      setNews(response.data)
      setTotalPages(response.pages || 1)
    } catch (error) {
      console.error("Error fetching news:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm(i18n.language === "ar" ? "هل أنت متأكد من الحذف؟" : "Are you sure you want to delete?")) {
      try {
        await newsAPI.delete(id)
        fetchNews()
      } catch (error) {
        console.error("Error deleting news:", error)
      }
    }
  }

  const handleTogglePublish = async (id, isPublished) => {
    try {
      await newsAPI.update(id, { is_published: !isPublished })
      fetchNews()
    } catch (error) {
      console.error("Error updating news:", error)
    }
  }

  if (location.pathname === "/admin/news/create" || editingNews) {
    return <NewsEditor news={editingNews} onSave={fetchNews} onCancel={() => setEditingNews(null)} />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {i18n.language === "ar" ? "إدارة الأخبار" : "Manage News"}
          </h1>
          <p className="text-gray-600 mt-2">
            {i18n.language === "ar"
              ? "إنشاء وتحرير ونشر الأخبار والمقالات"
              : "Create, edit and publish news and articles"}
          </p>
        </div>

        <Link to="/admin/news/create" className="btn-primary">
          <Plus className="h-5 w-5 mr-2" />
          {i18n.language === "ar" ? "إضافة خبر جديد" : "Add New Article"}
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder={i18n.language === "ar" ? "البحث في الأخبار..." : "Search news..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 rtl:pl-3 rtl:pr-10"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-gray-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field min-w-[150px]"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* News List */}
      <div className="card">
        {loading ? (
          <LoadingSpinner text={t("common.loading")} />
        ) : (
          <div className="space-y-4">
            {news.map((article) => (
              <div
                key={article.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{article.title}</h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          article.is_published ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {article.is_published
                          ? i18n.language === "ar"
                            ? "منشور"
                            : "Published"
                          : i18n.language === "ar"
                            ? "مسودة"
                            : "Draft"}
                      </span>
                      {article.is_featured && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                          {i18n.language === "ar" ? "مميز" : "Featured"}
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 line-clamp-2 mb-3">{article.excerpt}</p>

                    <div className="flex items-center space-x-6 rtl:space-x-reverse text-sm text-gray-500">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {article.author_name}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(article.created_at).toLocaleDateString(i18n.language)}
                      </div>
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 mr-1" />
                        {article.category}
                      </div>
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {article.views_count || 0} {i18n.language === "ar" ? "مشاهدة" : "views"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 rtl:space-x-reverse ml-4">
                    <button
                      onClick={() => handleTogglePublish(article.id, article.is_published)}
                      className={`p-2 rounded-lg transition-colors ${
                        article.is_published ? "text-green-600 hover:bg-green-50" : "text-yellow-600 hover:bg-yellow-50"
                      }`}
                      title={
                        article.is_published
                          ? i18n.language === "ar"
                            ? "إلغاء النشر"
                            : "Unpublish"
                          : i18n.language === "ar"
                            ? "نشر"
                            : "Publish"
                      }
                    >
                      <Eye className="h-5 w-5" />
                    </button>

                    <button
                      onClick={() => setEditingNews(article)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title={i18n.language === "ar" ? "تحرير" : "Edit"}
                    >
                      <Edit className="h-5 w-5" />
                    </button>

                    <button
                      onClick={() => handleDelete(article.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title={i18n.language === "ar" ? "حذف" : "Delete"}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {news.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600">{i18n.language === "ar" ? "لا توجد أخبار" : "No news found"}</p>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <div className="flex space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-lg ${
                    currentPage === page
                      ? "bg-university-blue text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const NewsEditor = ({ news, onSave, onCancel }) => {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    title: "",
    title_ar: "",
    title_fr: "",
    content: "",
    content_ar: "",
    content_fr: "",
    excerpt: "",
    excerpt_ar: "",
    excerpt_fr: "",
    category: "academic",
    is_published: false,
    is_featured: false,
    image: null,
  })
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)

  useEffect(() => {
    if (news) {
      setFormData({
        title: news.title || "",
        title_ar: news.title_ar || "",
        title_fr: news.title_fr || "",
        content: news.content || "",
        content_ar: news.content_ar || "",
        content_fr: news.content_fr || "",
        excerpt: news.excerpt || "",
        excerpt_ar: news.excerpt_ar || "",
        excerpt_fr: news.excerpt_fr || "",
        category: news.category || "academic",
        is_published: news.is_published || false,
        is_featured: news.is_featured || false,
        image: null,
      })
      if (news.image) {
        setImagePreview(news.image)
      }
    }
  }, [news])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData = {
        ...formData,
        author_id: user.id,
        author_name: user.name,
      }

      if (news) {
        await newsAPI.update(news.id, submitData)
      } else {
        await newsAPI.create(submitData)
      }

      onSave()
      onCancel()
    } catch (error) {
      console.error("Error saving news:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData({ ...formData, image: file })
      const reader = new FileReader()
      reader.onload = (e) => setImagePreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const categories = [
    { value: "academic", label: i18n.language === "ar" ? "أكاديمي" : "Academic" },
    { value: "events", label: i18n.language === "ar" ? "فعاليات" : "Events" },
    { value: "research", label: i18n.language === "ar" ? "بحث علمي" : "Research" },
    { value: "student", label: i18n.language === "ar" ? "طلابي" : "Student Life" },
    { value: "announcement", label: i18n.language === "ar" ? "إعلانات" : "Announcements" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          {news
            ? i18n.language === "ar"
              ? "تحرير الخبر"
              : "Edit Article"
            : i18n.language === "ar"
              ? "إضافة خبر جديد"
              : "Add New Article"}
        </h1>

        <button onClick={onCancel} className="btn-secondary">
          <X className="h-5 w-5 mr-2" />
          {i18n.language === "ar" ? "إلغاء" : "Cancel"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Titles */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">{i18n.language === "ar" ? "العناوين" : "Titles"}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {i18n.language === "ar" ? "العنوان (إنجليزي)" : "Title (English)"}
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {i18n.language === "ar" ? "العنوان (عربي)" : "Title (Arabic)"}
                  </label>
                  <input
                    type="text"
                    value={formData.title_ar}
                    onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                    className="input-field"
                    dir="rtl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {i18n.language === "ar" ? "العنوان (فرنسي)" : "Title (French)"}
                  </label>
                  <input
                    type="text"
                    value={formData.title_fr}
                    onChange={(e) => setFormData({ ...formData, title_fr: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">{i18n.language === "ar" ? "المحتوى" : "Content"}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {i18n.language === "ar" ? "المحتوى (إنجليزي)" : "Content (English)"}
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="input-field h-40"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {i18n.language === "ar" ? "المحتوى (عربي)" : "Content (Arabic)"}
                  </label>
                  <textarea
                    value={formData.content_ar}
                    onChange={(e) => setFormData({ ...formData, content_ar: e.target.value })}
                    className="input-field h-40"
                    dir="rtl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {i18n.language === "ar" ? "المحتوى (فرنسي)" : "Content (French)"}
                  </label>
                  <textarea
                    value={formData.content_fr}
                    onChange={(e) => setFormData({ ...formData, content_fr: e.target.value })}
                    className="input-field h-40"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Settings */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">
                {i18n.language === "ar" ? "إعدادات النشر" : "Publish Settings"}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {i18n.language === "ar" ? "الفئة" : "Category"}
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-field"
                  >
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="is_published"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    className="rounded border-gray-300 text-university-blue focus:ring-university-blue"
                  />
                  <label htmlFor="is_published" className="text-sm font-medium text-gray-700">
                    {i18n.language === "ar" ? "نشر فوراً" : "Publish immediately"}
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="rounded border-gray-300 text-university-blue focus:ring-university-blue"
                  />
                  <label htmlFor="is_featured" className="text-sm font-medium text-gray-700">
                    {i18n.language === "ar" ? "خبر مميز" : "Featured article"}
                  </label>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">
                {i18n.language === "ar" ? "الصورة المميزة" : "Featured Image"}
              </h3>
              <div className="space-y-4">
                <div>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="input-field" />
                </div>

                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null)
                        setFormData({ ...formData, image: null })
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="card">
              <div className="space-y-3">
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mx-auto" />
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-2" />
                      {news ? (i18n.language === "ar" ? "تحديث" : "Update") : i18n.language === "ar" ? "حفظ" : "Save"}
                    </>
                  )}
                </button>

                <button type="button" onClick={onCancel} className="btn-secondary w-full">
                  {i18n.language === "ar" ? "إلغاء" : "Cancel"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default ManageNews
