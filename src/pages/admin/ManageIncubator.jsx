"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Plus, Search, Edit, Trash2, Rocket, Users, Building, Calendar, Save, X } from "lucide-react"
import { incubatorAPI } from "../../api/incubatorAPI"
import LoadingSpinner from "../../components/common/LoadingSpinner"

const ManageIncubator = () => {
  const { t, i18n } = useTranslation()
  const [startups, setStartups] = useState([])
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("startups")
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)

  useEffect(() => {
    fetchData()
  }, [searchTerm])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [startupsResponse, programsResponse] = await Promise.all([
        incubatorAPI.getStartups(),
        incubatorAPI.getPrograms(),
      ])

      let filteredStartups = startupsResponse.data
      let filteredPrograms = programsResponse.data

      if (searchTerm) {
        filteredStartups = filteredStartups.filter((startup) =>
          startup.name.toLowerCase().includes(searchTerm.toLowerCase()),
        )
        filteredPrograms = filteredPrograms.filter((program) =>
          program.name.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      }

      setStartups(filteredStartups)
      setPrograms(filteredPrograms)
    } catch (error) {
      console.error("Error fetching incubator data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id, type) => {
    if (window.confirm(i18n.language === "ar" ? "هل أنت متأكد من الحذف؟" : "Are you sure you want to delete?")) {
      try {
        if (type === "startup") {
          await incubatorAPI.deleteStartup(id)
        } else {
          await incubatorAPI.deleteProgram(id)
        }
        fetchData()
      } catch (error) {
        console.error("Error deleting item:", error)
      }
    }
  }

  const tabs = [
    {
      id: "startups",
      name: i18n.language === "ar" ? "الشركات الناشئة" : "Startups",
      icon: Rocket,
    },
    {
      id: "programs",
      name: i18n.language === "ar" ? "البرامج" : "Programs",
      icon: Building,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {i18n.language === "ar" ? "إدارة حاضنة الشركات الناشئة" : "Manage Startup Incubator"}
          </h1>
          <p className="text-gray-600 mt-2">
            {i18n.language === "ar"
              ? "إدارة الشركات الناشئة وبرامج الحاضنة"
              : "Manage startups and incubation programs"}
          </p>
        </div>

        <button
          onClick={() => {
            setShowCreateModal(true)
            setEditingItem(null)
          }}
          className="btn-primary"
        >
          <Plus className="h-5 w-5 mr-2" />
          {activeTab === "startups"
            ? i18n.language === "ar"
              ? "إضافة شركة ناشئة"
              : "Add New Startup"
            : i18n.language === "ar"
              ? "إضافة برنامج جديد"
              : "Add New Program"}
        </button>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="flex space-x-1 rtl:space-x-reverse">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-university-blue text-white"
                  : "text-gray-600 hover:text-university-blue hover:bg-blue-50"
              }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder={
              activeTab === "startups"
                ? i18n.language === "ar"
                  ? "البحث في الشركات الناشئة..."
                  : "Search startups..."
                : i18n.language === "ar"
                  ? "البحث في البرامج..."
                  : "Search programs..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10 rtl:pl-3 rtl:pr-10"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner text={t("common.loading")} />
      ) : activeTab === "startups" ? (
        <StartupsList startups={startups} onEdit={setEditingItem} onDelete={(id) => handleDelete(id, "startup")} />
      ) : (
        <ProgramsList programs={programs} onEdit={setEditingItem} onDelete={(id) => handleDelete(id, "program")} />
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingItem) && (
        <IncubatorModal
          item={editingItem}
          type={activeTab === "startups" ? "startup" : "program"}
          onSave={() => {
            fetchData()
            setShowCreateModal(false)
            setEditingItem(null)
          }}
          onCancel={() => {
            setShowCreateModal(false)
            setEditingItem(null)
          }}
        />
      )}
    </div>
  )
}

const StartupsList = ({ startups, onEdit, onDelete }) => {
  const { i18n } = useTranslation()

  const getStageColor = (stage) => {
    const colors = {
      idea: "bg-gray-100 text-gray-800",
      prototype: "bg-yellow-100 text-yellow-800",
      seed: "bg-blue-100 text-blue-800",
      growth: "bg-green-100 text-green-800",
      exit: "bg-purple-100 text-purple-800",
    }
    return colors[stage] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {startups.map((startup) => (
        <div key={startup.id} className="card hover:shadow-lg transition-shadow duration-300">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{startup.name}</h3>
                <p className="text-gray-600 line-clamp-3">{startup.description}</p>
              </div>
              <div className="flex space-x-2 rtl:space-x-reverse">
                <button
                  onClick={() => onEdit(startup)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title={i18n.language === "ar" ? "تحرير" : "Edit"}
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onDelete(startup.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title={i18n.language === "ar" ? "حذف" : "Delete"}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStageColor(startup.stage)}`}>
                {startup.stage}
              </span>
              <span className="text-sm text-gray-500">{startup.industry}</span>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                <span>
                  {startup.team_size} {i18n.language === "ar" ? "عضو" : "members"}
                </span>
              </div>
              {startup.founder_name && (
                <div className="text-right">
                  <div className="font-medium text-gray-900">{startup.founder_name}</div>
                  <div className="text-xs">{i18n.language === "ar" ? "المؤسس" : "Founder"}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {startups.length === 0 && (
        <div className="col-span-full text-center py-12">
          <Rocket className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {i18n.language === "ar" ? "لا توجد شركات ناشئة" : "No startups found"}
          </h3>
          <p className="text-gray-600">
            {i18n.language === "ar" ? "ابدأ بإضافة شركة ناشئة جديدة" : "Start by adding a new startup"}
          </p>
        </div>
      )}
    </div>
  )
}

const ProgramsList = ({ programs, onEdit, onDelete }) => {
  const { i18n } = useTranslation()

  return (
    <div className="space-y-4">
      {programs.map((program) => (
        <div key={program.id} className="card hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4 rtl:space-x-reverse flex-1">
              <div className="bg-green-100 rounded-lg p-4 text-center min-w-[100px]">
                <Building className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-sm font-medium text-green-600">{program.duration}</div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{program.name}</h3>
                <p className="text-gray-600 mb-3">{program.description}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{program.next_cohort}</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-2 rtl:space-x-reverse">
              <button
                onClick={() => onEdit(program)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title={i18n.language === "ar" ? "تحرير" : "Edit"}
              >
                <Edit className="h-5 w-5" />
              </button>
              <button
                onClick={() => onDelete(program.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title={i18n.language === "ar" ? "حذف" : "Delete"}
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {programs.length === 0 && (
        <div className="text-center py-12">
          <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {i18n.language === "ar" ? "لا توجد برامج" : "No programs found"}
          </h3>
          <p className="text-gray-600">
            {i18n.language === "ar" ? "ابدأ بإضافة برنامج جديد" : "Start by adding a new program"}
          </p>
        </div>
      )}
    </div>
  )
}

const IncubatorModal = ({ item, type, onSave, onCancel }) => {
  const { i18n } = useTranslation()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    industry: "",
    stage: "idea",
    team_size: 1,
    founder_name: "",
    founder_email: "",
    duration: "",
    next_cohort: "",
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || "",
        description: item.description || "",
        industry: item.industry || "",
        stage: item.stage || "idea",
        team_size: item.team_size || 1,
        founder_name: item.founder_name || "",
        founder_email: item.founder_email || "",
        duration: item.duration || "",
        next_cohort: item.next_cohort || "",
      })
    }
  }, [item])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (type === "startup") {
        if (item) {
          await incubatorAPI.updateStartup(item.id, formData)
        } else {
          await incubatorAPI.createStartup(formData)
        }
      } else {
        if (item) {
          await incubatorAPI.updateProgram(item.id, formData)
        } else {
          await incubatorAPI.createProgram(formData)
        }
      }
      onSave()
    } catch (error) {
      console.error("Error saving item:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">
              {item
                ? type === "startup"
                  ? i18n.language === "ar"
                    ? "تحرير الشركة الناشئة"
                    : "Edit Startup"
                  : i18n.language === "ar"
                    ? "تحرير البرنامج"
                    : "Edit Program"
                : type === "startup"
                  ? i18n.language === "ar"
                    ? "إضافة شركة ناشئة جديدة"
                    : "Add New Startup"
                  : i18n.language === "ar"
                    ? "إضافة برنامج جديد"
                    : "Add New Program"}
            </h3>
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {type === "startup"
                  ? i18n.language === "ar"
                    ? "اسم الشركة"
                    : "Startup Name"
                  : i18n.language === "ar"
                    ? "اسم البرنامج"
                    : "Program Name"}
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
                {i18n.language === "ar" ? "الوصف" : "Description"}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field h-32"
                required
              />
            </div>

            {type === "startup" ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {i18n.language === "ar" ? "الصناعة" : "Industry"}
                    </label>
                    <input
                      type="text"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {i18n.language === "ar" ? "المرحلة" : "Stage"}
                    </label>
                    <select
                      value={formData.stage}
                      onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                      className="input-field"
                    >
                      <option value="idea">{i18n.language === "ar" ? "فكرة" : "Idea"}</option>
                      <option value="prototype">{i18n.language === "ar" ? "نموذج أولي" : "Prototype"}</option>
                      <option value="seed">{i18n.language === "ar" ? "بذرة" : "Seed"}</option>
                      <option value="growth">{i18n.language === "ar" ? "نمو" : "Growth"}</option>
                      <option value="exit">{i18n.language === "ar" ? "خروج" : "Exit"}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {i18n.language === "ar" ? "حجم الفريق" : "Team Size"}
                    </label>
                    <input
                      type="number"
                      value={formData.team_size}
                      onChange={(e) => setFormData({ ...formData, team_size: Number.parseInt(e.target.value) || 1 })}
                      className="input-field"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {i18n.language === "ar" ? "اسم المؤسس" : "Founder Name"}
                    </label>
                    <input
                      type="text"
                      value={formData.founder_name}
                      onChange={(e) => setFormData({ ...formData, founder_name: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {i18n.language === "ar" ? "بريد المؤسس الإلكتروني" : "Founder Email"}
                  </label>
                  <input
                    type="email"
                    value={formData.founder_email}
                    onChange={(e) => setFormData({ ...formData, founder_email: e.target.value })}
                    className="input-field"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {i18n.language === "ar" ? "المدة" : "Duration"}
                    </label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="input-field"
                      placeholder={i18n.language === "ar" ? "مثال: 3 أشهر" : "e.g., 3 months"}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {i18n.language === "ar" ? "الدفعة القادمة" : "Next Cohort"}
                    </label>
                    <input
                      type="text"
                      value={formData.next_cohort}
                      onChange={(e) => setFormData({ ...formData, next_cohort: e.target.value })}
                      className="input-field"
                      placeholder={i18n.language === "ar" ? "مثال: مارس 2024" : "e.g., March 2024"}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div className="flex space-x-3 pt-6 border-t">
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mx-auto" />
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    {item ? (i18n.language === "ar" ? "تحديث" : "Update") : i18n.language === "ar" ? "حفظ" : "Save"}
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

export default ManageIncubator
