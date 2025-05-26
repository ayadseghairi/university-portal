"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Plus, Search, Filter, Edit, Trash2, UserCheck, UserX, Save, X } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import LoadingSpinner from "../../components/common/LoadingSpinner"

const ManageUsers = () => {
  const { t, i18n } = useTranslation()
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)

  const roles = [
    { value: "", label: i18n.language === "ar" ? "جميع الأدوار" : "All Roles" },
    { value: "super_admin", label: i18n.language === "ar" ? "مدير عام" : "Super Admin" },
    { value: "faculty_admin", label: i18n.language === "ar" ? "مدير كلية" : "Faculty Admin" },
    { value: "department_admin", label: i18n.language === "ar" ? "مدير قسم" : "Department Admin" },
    { value: "ai_house_admin", label: i18n.language === "ar" ? "مدير بيت الذكاء الاصطناعي" : "AI House Admin" },
    { value: "incubator_admin", label: i18n.language === "ar" ? "مدير الحاضنة" : "Incubator Admin" },
    { value: "editor", label: i18n.language === "ar" ? "محرر" : "Editor" },
    { value: "viewer", label: i18n.language === "ar" ? "مشاهد" : "Viewer" },
  ]

  useEffect(() => {
    fetchUsers()
  }, [searchTerm, selectedRole])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      // Mock data - replace with actual API call
      const mockUsers = [
        {
          id: 1,
          username: "admin",
          name: "System Administrator",
          email: "admin@univ-khenchela.dz",
          role: "super_admin",
          is_active: true,
          last_login: "2024-01-15T10:30:00Z",
          created_at: "2024-01-01T00:00:00Z",
        },
        {
          id: 2,
          username: "faculty_admin1",
          name: "Dr. Ahmed Benali",
          email: "ahmed.benali@univ-khenchela.dz",
          role: "faculty_admin",
          is_active: true,
          last_login: "2024-01-14T15:45:00Z",
          created_at: "2024-01-02T00:00:00Z",
        },
        {
          id: 3,
          username: "editor1",
          name: "Sarah Khelifi",
          email: "sarah.khelifi@univ-khenchela.dz",
          role: "editor",
          is_active: true,
          last_login: "2024-01-13T09:20:00Z",
          created_at: "2024-01-03T00:00:00Z",
        },
      ]

      let filteredUsers = mockUsers
      if (searchTerm) {
        filteredUsers = filteredUsers.filter(
          (user) =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.username.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      }
      if (selectedRole) {
        filteredUsers = filteredUsers.filter((user) => user.role === selectedRole)
      }

      setUsers(filteredUsers)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (id, isActive) => {
    try {
      // Mock API call
      setUsers(users.map((user) => (user.id === id ? { ...user, is_active: !isActive } : user)))
    } catch (error) {
      console.error("Error updating user status:", error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm(i18n.language === "ar" ? "هل أنت متأكد من الحذف؟" : "Are you sure you want to delete?")) {
      try {
        // Mock API call
        setUsers(users.filter((user) => user.id !== id))
      } catch (error) {
        console.error("Error deleting user:", error)
      }
    }
  }

  const getRoleLabel = (role) => {
    const roleObj = roles.find((r) => r.value === role)
    return roleObj ? roleObj.label : role
  }

  const getRoleBadgeColor = (role) => {
    const colors = {
      super_admin: "bg-red-100 text-red-800",
      faculty_admin: "bg-blue-100 text-blue-800",
      department_admin: "bg-green-100 text-green-800",
      ai_house_admin: "bg-purple-100 text-purple-800",
      incubator_admin: "bg-orange-100 text-orange-800",
      editor: "bg-yellow-100 text-yellow-800",
      viewer: "bg-gray-100 text-gray-800",
    }
    return colors[role] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {i18n.language === "ar" ? "إدارة المستخدمين" : "Manage Users"}
          </h1>
          <p className="text-gray-600 mt-2">
            {i18n.language === "ar" ? "إدارة حسابات المستخدمين والصلاحيات" : "Manage user accounts and permissions"}
          </p>
        </div>

        <button onClick={() => setShowCreateModal(true)} className="btn-primary">
          <Plus className="h-5 w-5 mr-2" />
          {i18n.language === "ar" ? "إضافة مستخدم جديد" : "Add New User"}
        </button>
      </div>

      {/* Search and Filter */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder={i18n.language === "ar" ? "البحث في المستخدمين..." : "Search users..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 rtl:pl-3 rtl:pr-10"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-gray-500" />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="input-field min-w-[150px]"
            >
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="card">
        {loading ? (
          <LoadingSpinner text={t("common.loading")} />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {i18n.language === "ar" ? "المستخدم" : "User"}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {i18n.language === "ar" ? "الدور" : "Role"}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {i18n.language === "ar" ? "الحالة" : "Status"}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {i18n.language === "ar" ? "آخر دخول" : "Last Login"}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {i18n.language === "ar" ? "الإجراءات" : "Actions"}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-university-blue to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">{user.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          <div className="text-xs text-gray-400">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}
                      >
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.is_active
                          ? i18n.language === "ar"
                            ? "نشط"
                            : "Active"
                          : i18n.language === "ar"
                            ? "معطل"
                            : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.last_login ? new Date(user.last_login).toLocaleDateString(i18n.language) : "Never"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleActive(user.id, user.is_active)}
                          className={`p-2 rounded-lg transition-colors ${
                            user.is_active ? "text-red-600 hover:bg-red-50" : "text-green-600 hover:bg-green-50"
                          }`}
                          title={
                            user.is_active
                              ? i18n.language === "ar"
                                ? "تعطيل"
                                : "Deactivate"
                              : i18n.language === "ar"
                                ? "تفعيل"
                                : "Activate"
                          }
                        >
                          {user.is_active ? <UserX className="h-5 w-5" /> : <UserCheck className="h-5 w-5" />}
                        </button>

                        <button
                          onClick={() => setEditingUser(user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title={i18n.language === "ar" ? "تحرير" : "Edit"}
                        >
                          <Edit className="h-5 w-5" />
                        </button>

                        {user.id !== currentUser?.id && (
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title={i18n.language === "ar" ? "حذف" : "Delete"}
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {users.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600">{i18n.language === "ar" ? "لا توجد مستخدمين" : "No users found"}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create/Edit User Modal */}
      {(showCreateModal || editingUser) && (
        <UserModal
          user={editingUser}
          onSave={() => {
            fetchUsers()
            setShowCreateModal(false)
            setEditingUser(null)
          }}
          onCancel={() => {
            setShowCreateModal(false)
            setEditingUser(null)
          }}
        />
      )}
    </div>
  )
}

const UserModal = ({ user, onSave, onCancel }) => {
  const { t, i18n } = useTranslation()
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    role: "editor",
    password: "",
    confirmPassword: "",
    is_active: true,
  })
  const [loading, setLoading] = useState(false)

  const roles = [
    { value: "super_admin", label: i18n.language === "ar" ? "مدير عام" : "Super Admin" },
    { value: "faculty_admin", label: i18n.language === "ar" ? "مدير كلية" : "Faculty Admin" },
    { value: "department_admin", label: i18n.language === "ar" ? "مدير قسم" : "Department Admin" },
    { value: "ai_house_admin", label: i18n.language === "ar" ? "مدير بيت الذكاء الاصطناعي" : "AI House Admin" },
    { value: "incubator_admin", label: i18n.language === "ar" ? "مدير الحاضنة" : "Incubator Admin" },
    { value: "editor", label: i18n.language === "ar" ? "محرر" : "Editor" },
    { value: "viewer", label: i18n.language === "ar" ? "مشاهد" : "Viewer" },
  ]

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        name: user.name || "",
        email: user.email || "",
        role: user.role || "editor",
        password: "",
        confirmPassword: "",
        is_active: user.is_active !== undefined ? user.is_active : true,
      })
    }
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!user && formData.password !== formData.confirmPassword) {
        alert(i18n.language === "ar" ? "كلمات المرور غير متطابقة" : "Passwords do not match")
        return
      }

      // Mock API call
      console.log("Saving user:", formData)
      onSave()
    } catch (error) {
      console.error("Error saving user:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            {user
              ? i18n.language === "ar"
                ? "تحرير المستخدم"
                : "Edit User"
              : i18n.language === "ar"
                ? "إضافة مستخدم جديد"
                : "Add New User"}
          </h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {i18n.language === "ar" ? "اسم المستخدم" : "Username"}
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {i18n.language === "ar" ? "الاسم الكامل" : "Full Name"}
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
              {i18n.language === "ar" ? "البريد الإلكتروني" : "Email"}
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {i18n.language === "ar" ? "الدور" : "Role"}
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="input-field"
            >
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          {!user && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {i18n.language === "ar" ? "كلمة المرور" : "Password"}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {i18n.language === "ar" ? "تأكيد كلمة المرور" : "Confirm Password"}
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
            </>
          )}

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="rounded border-gray-300 text-university-blue focus:ring-university-blue"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
              {i18n.language === "ar" ? "حساب نشط" : "Active account"}
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mx-auto" />
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  {user ? (i18n.language === "ar" ? "تحديث" : "Update") : i18n.language === "ar" ? "حفظ" : "Save"}
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
  )
}

export default ManageUsers
