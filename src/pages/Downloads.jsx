"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Download, FileText, ImageIcon, File, Search, Filter, Calendar, User } from "lucide-react"
import { downloadsAPI } from "../api/downloadsAPI"
import { useAuth } from "../contexts/AuthContext"
import LoadingSpinner from "../components/common/LoadingSpinner"

const Downloads = () => {
  const { t, i18n } = useTranslation()
  const { user, canAccessResource } = useAuth()
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedFaculty, setSelectedFaculty] = useState("")
  const [faculties, setFaculties] = useState([])

  const categories = [
    { value: "", label: i18n.language === "ar" ? "جميع الفئات" : "All Categories" },
    { value: "documents", label: i18n.language === "ar" ? "وثائق" : "Documents" },
    { value: "forms", label: i18n.language === "ar" ? "نماذج" : "Forms" },
    { value: "guides", label: i18n.language === "ar" ? "أدلة" : "Guides" },
    { value: "research", label: i18n.language === "ar" ? "بحوث" : "Research" },
    { value: "presentations", label: i18n.language === "ar" ? "عروض تقديمية" : "Presentations" },
  ]

  useEffect(() => {
    fetchFiles()
    fetchFaculties()
  }, [searchTerm, selectedCategory, selectedFaculty])

  const fetchFiles = async () => {
    try {
      setLoading(true)
      const response = await downloadsAPI.getFiles({
        search: searchTerm,
        category: selectedCategory,
        faculty_id: selectedFaculty,
      })
      setFiles(response.data)
    } catch (error) {
      console.error("Error fetching files:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFaculties = async () => {
    try {
      const response = await downloadsAPI.getFaculties()
      setFaculties(response.data)
    } catch (error) {
      console.error("Error fetching faculties:", error)
    }
  }

  const handleDownload = async (fileId, filename) => {
    try {
      await downloadsAPI.downloadFile(fileId, filename)
    } catch (error) {
      console.error("Error downloading file:", error)
    }
  }

  const getFileIcon = (fileType) => {
    if (fileType.includes("image")) return <ImageIcon className="h-6 w-6" />
    if (fileType.includes("pdf")) return <FileText className="h-6 w-6" />
    return <File className="h-6 w-6" />
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-university-blue text-white py-20">
        <div className="page-container">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              {i18n.language === "ar" ? "مركز التحميل" : "Download Center"}
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              {i18n.language === "ar"
                ? "تحميل الوثائق والملفات المشتركة من الكليات والأقسام"
                : "Download documents and files shared by faculties and departments"}
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-8 bg-white border-b">
        <div className="page-container">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder={i18n.language === "ar" ? "البحث في الملفات..." : "Search files..."}
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

              <select
                value={selectedFaculty}
                onChange={(e) => setSelectedFaculty(e.target.value)}
                className="input-field min-w-[200px]"
              >
                <option value="">{i18n.language === "ar" ? "جميع الكليات" : "All Faculties"}</option>
                {faculties.map((faculty) => (
                  <option key={faculty.id} value={faculty.id}>
                    {faculty.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Files Grid */}
      <section className="py-16">
        <div className="page-container">
          {loading ? (
            <LoadingSpinner text={t("common.loading")} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {files.map((file) => (
                <div key={file.id} className="card hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-start space-x-4 rtl:space-x-reverse">
                    <div className="flex-shrink-0 p-3 bg-university-blue/10 rounded-lg">
                      {getFileIcon(file.mime_type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {file.original_filename}
                      </h3>

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          <span>{file.uploaded_by_name}</span>
                        </div>

                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>{new Date(file.created_at).toLocaleDateString(i18n.language)}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                            {file.category}
                          </span>
                          <span className="text-gray-500">{formatFileSize(file.file_size)}</span>
                        </div>

                        {file.faculty_name && (
                          <div className="text-university-blue font-medium">{file.faculty_name}</div>
                        )}
                      </div>

                      <button
                        onClick={() => handleDownload(file.id, file.original_filename)}
                        className="mt-4 w-full btn-primary flex items-center justify-center"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {i18n.language === "ar" ? "تحميل" : "Download"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && files.length === 0 && (
            <div className="text-center py-12">
              <File className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {i18n.language === "ar" ? "لا توجد ملفات" : "No files found"}
              </h3>
              <p className="text-gray-600">
                {i18n.language === "ar"
                  ? "لم يتم العثور على ملفات تطابق معايير البحث"
                  : "No files match your search criteria"}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Downloads
