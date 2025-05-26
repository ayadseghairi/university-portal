"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Plus, Search, Edit, Trash2, Brain, Calendar, Users, Save, X } from "lucide-react"
import { aiHouseAPI } from "../../api/aiHouseAPI"
import LoadingSpinner from "../../components/common/LoadingSpinner"

const ManageAIHouse = () => {
  const { t, i18n } = useTranslation()
  const [projects, setProjects] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("projects")
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)

  useEffect(() => {
    fetchData()
  }, [searchTerm])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [projectsResponse, eventsResponse] = await Promise.all([aiHouseAPI.getProjects(), aiHouseAPI.getEvents()])

      let filteredProjects = projectsResponse.data
      let filteredEvents = eventsResponse.data

      if (searchTerm) {
        filteredProjects = filteredProjects.filter((project) =>
          project.title.toLowerCase().includes(searchTerm.toLowerCase()),
        )
        filteredEvents = filteredEvents.filter((event) => event.title.toLowerCase().includes(searchTerm.toLowerCase()))
      }

      setProjects(filteredProjects)
      setEvents(filteredEvents)
    } catch (error) {
      console.error("Error fetching AI House data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id, type) => {
    if (window.confirm(i18n.language === "ar" ? "هل أنت متأكد من الحذف؟" : "Are you sure you want to delete?")) {
      try {
        if (type === "project") {
          await aiHouseAPI.deleteProject(id)
        } else {
          await aiHouseAPI.deleteEvent(id)
        }
        fetchData()
      } catch (error) {
        console.error("Error deleting item:", error)
      }
    }
  }

  const tabs = [
    {
      id: "projects",
      name: i18n.language === "ar" ? "المشاريع" : "Projects",
      icon: Brain,
    },
    {
      id: "events",
      name: i18n.language === "ar" ? "الفعاليات" : "Events",
      icon: Calendar,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {i18n.language === "ar" ? "إدارة بيت الذكاء الاصطناعي" : "Manage AI House"}
          </h1>
          <p className="text-gray-600 mt-2">
            {i18n.language === "ar"
              ? "إدارة مشاريع وفعاليات بيت الذكاء الاصطناعي"
              : "Manage AI House projects and events"}
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
          {activeTab === "projects"
            ? i18n.language === "ar"
              ? "إضافة مشروع جديد"
              : "Add New Project"
            : i18n.language === "ar"
              ? "إضافة فعالية جديدة"
              : "Add New Event"}
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
              activeTab === "projects"
                ? i18n.language === "ar"
                  ? "البحث في المشاريع..."
                  : "Search projects..."
                : i18n.language === "ar"
                  ? "البحث في الفعاليات..."
                  : "Search events..."
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
      ) : activeTab === "projects" ? (
        <ProjectsList projects={projects} onEdit={setEditingItem} onDelete={(id) => handleDelete(id, "project")} />
      ) : (
        <EventsList events={events} onEdit={setEditingItem} onDelete={(id) => handleDelete(id, "event")} />
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingItem) && (
        <AIHouseModal
          item={editingItem}
          type={activeTab === "projects" ? "project" : "event"}
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

const ProjectsList = ({ projects, onEdit, onDelete }) => {
  const { i18n } = useTranslation()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <div key={project.id} className="card hover:shadow-lg transition-shadow duration-300">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{project.title}</h3>
                <p className="text-gray-600 line-clamp-3">{project.description}</p>
              </div>
              <div className="flex space-x-2 rtl:space-x-reverse">
                <button
                  onClick={() => onEdit(project)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title={i18n.language === "ar" ? "تحرير" : "Edit"}
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onDelete(project.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title={i18n.language === "ar" ? "حذف" : "Delete"}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                <span>
                  {project.team_size} {i18n.language === "ar" ? "عضو" : "members"}
                </span>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  project.status === "active"
                    ? "bg-green-100 text-green-800"
                    : project.status === "completed"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {project.status}
              </span>
            </div>

            {project.technologies && (
              <div className="flex flex-wrap gap-2">
                {project.technologies.split(",").map((tech, index) => (
                  <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                    {tech.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}

      {projects.length === 0 && (
        <div className="col-span-full text-center py-12">
          <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {i18n.language === "ar" ? "لا توجد مشاريع" : "No projects found"}
          </h3>
          <p className="text-gray-600">
            {i18n.language === "ar" ? "ابدأ بإضافة مشروع جديد" : "Start by adding a new project"}
          </p>
        </div>
      )}
    </div>
  )
}

const EventsList = ({ events, onEdit, onDelete }) => {
  const { i18n } = useTranslation()

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div key={event.id} className="card hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4 rtl:space-x-reverse flex-1">
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
            <div className="flex space-x-2 rtl:space-x-reverse">
              <button
                onClick={() => onEdit(event)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title={i18n.language === "ar" ? "تحرير" : "Edit"}
              >
                <Edit className="h-5 w-5" />
              </button>
              <button
                onClick={() => onDelete(event.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title={i18n.language === "ar" ? "حذف" : "Delete"}
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {events.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {i18n.language === "ar" ? "لا توجد فعاليات" : "No events found"}
          </h3>
          <p className="text-gray-600">
            {i18n.language === "ar" ? "ابدأ بإضافة فعالية جديدة" : "Start by adding a new event"}
          </p>
        </div>
      )}
    </div>
  )
}

const AIHouseModal = ({ item, type, onSave, onCancel }) => {
  const { i18n } = useTranslation()
  const [formData, setFormData] = useState({
    title: "",
    title_ar: "",
    description: "",
    technologies: "",
    team_size: 1,
    status: "active",
    date: "",
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title || "",
        title_ar: item.title_ar || "",
        description: item.description || "",
        technologies: item.technologies || "",
        team_size: item.team_size || 1,
        status: item.status || "active",
        date: item.date ? new Date(item.date).toISOString().split("T")[0] : "",
      })
    }
  }, [item])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (type === "project") {
        if (item) {
          await aiHouseAPI.updateProject(item.id, formData)
        } else {
          await aiHouseAPI.createProject(formData)
        }
      } else {
        if (item) {
          await aiHouseAPI.updateEvent(item.id, formData)
        } else {
          await aiHouseAPI.createEvent(formData)
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
                ? type === "project"
                  ? i18n.language === "ar"
                    ? "تحرير المشروع"
                    : "Edit Project"
                  : i18n.language === "ar"
                    ? "تحرير الفعالية"
                    : "Edit Event"
                : type === "project"
                  ? i18n.language === "ar"
                    ? "إضافة مشروع جديد"
                    : "Add New Project"
                  : i18n.language === "ar"
                    ? "إضافة فعالية جديدة"
                    : "Add New Event"}
            </h3>
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {type === "project" ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {i18n.language === "ar" ? "التقنيات المستخدمة" : "Technologies Used"}
                  </label>
                  <input
                    type="text"
                    value={formData.technologies}
                    onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                    className="input-field"
                    placeholder={
                      i18n.language === "ar" ? "مثال: Python, React, TensorFlow" : "e.g., Python, React, TensorFlow"
                    }
                  />
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
                      {i18n.language === "ar" ? "الحالة" : "Status"}
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="input-field"
                    >
                      <option value="active">{i18n.language === "ar" ? "نشط" : "Active"}</option>
                      <option value="completed">{i18n.language === "ar" ? "مكتمل" : "Completed"}</option>
                      <option value="paused">{i18n.language === "ar" ? "متوقف" : "Paused"}</option>
                    </select>
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {i18n.language === "ar" ? "تاريخ الفعالية" : "Event Date"}
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
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

export default ManageAIHouse
