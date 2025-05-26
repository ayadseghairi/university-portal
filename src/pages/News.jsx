"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { Calendar, User, Search, Filter, ArrowRight } from "lucide-react"
import { newsAPI } from "../api/newsAPI"
import LoadingSpinner from "../components/common/LoadingSpinner"

const News = () => {
  const { t, i18n } = useTranslation()
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const categories = [
    { value: "", label: i18n.language === "ar" ? "جميع الفئات" : "All Categories" },
    { value: "academic", label: i18n.language === "ar" ? "أكاديمي" : "Academic" },
    { value: "events", label: i18n.language === "ar" ? "فعاليات" : "Events" },
    { value: "research", label: i18n.language === "ar" ? "بحث علمي" : "Research" },
    { value: "student", label: i18n.language === "ar" ? "طلابي" : "Student Life" },
  ]

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true)
        const response = await newsAPI.getAll({
          page: currentPage,
          search: searchTerm,
          category: selectedCategory,
        })
        setNews(response.data)
      } catch (error) {
        console.error("Error fetching news:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [currentPage, searchTerm, selectedCategory])

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-university-blue text-white py-20">
        <div className="page-container">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">{t("nav.news")}</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              {i18n.language === "ar"
                ? "ابق على اطلاع بآخر الأخبار والفعاليات في جامعة خنشلة"
                : "Stay updated with the latest news and events at University of Khenchela"}
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-8 bg-white border-b">
        <div className="page-container">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
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
            </form>

            <div className="flex items-center gap-4">
              <Filter className="h-5 w-5 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-field min-w-[200px]"
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
      </section>

      {/* News Grid */}
      <section className="py-16">
        <div className="page-container">
          {loading ? (
            <LoadingSpinner text={t("common.loading")} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {news.map((article) => (
                <article key={article.id} className="card hover:shadow-lg transition-shadow duration-300">
                  <img
                    src={article.image || "/placeholder.svg?height=200&width=400"}
                    alt={article.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(article.created_at).toLocaleDateString(i18n.language)}
                      </div>
                      <span className="bg-university-blue/10 text-university-blue px-2 py-1 rounded-full text-xs">
                        {article.category}
                      </span>
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">{article.title}</h3>

                    <p className="text-gray-600 line-clamp-3">{article.excerpt}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <User className="h-4 w-4 mr-2" />
                        {article.author}
                      </div>

                      <Link
                        to={`/news/${article.id}`}
                        className="inline-flex items-center text-university-blue hover:text-blue-700 font-medium"
                      >
                        {i18n.language === "ar" ? "اقرأ المزيد" : "Read More"}
                        <ArrowRight className="ml-2 h-4 w-4 rtl:rotate-180" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default News
