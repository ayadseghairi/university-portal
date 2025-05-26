import Cookies from "js-cookie"

export const AUTH_COOKIE_NAME = "access_token_cookie"
export const REFRESH_COOKIE_NAME = "refresh_token_cookie"

export const getAuthToken = () => {
  return Cookies.get(AUTH_COOKIE_NAME)
}

export const getRefreshToken = () => {
  return Cookies.get(REFRESH_COOKIE_NAME)
}

export const removeAuthTokens = () => {
  Cookies.remove(AUTH_COOKIE_NAME)
  Cookies.remove(REFRESH_COOKIE_NAME)
}

export const isTokenExpired = (token) => {
  if (!token) return true

  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    const currentTime = Date.now() / 1000
    return payload.exp < currentTime
  } catch (error) {
    return true
  }
}

export const getUserFromToken = (token) => {
  if (!token) return null

  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    return {
      id: payload.sub,
      role: payload.role,
      college_id: payload.college_id,
      faculty_id: payload.faculty_id,
    }
  } catch (error) {
    return null
  }
}

export const hasPermission = (
  userRole,
  requiredPermission,
  userCollegeId = null,
  userFacultyId = null,
  resourceCollegeId = null,
  resourceFacultyId = null,
) => {
  // Super admin has all permissions
  if (userRole === "super_admin") {
    return true
  }

  // Define role permissions
  const rolePermissions = {
    college_admin: [
      "college_manage",
      "faculty_manage",
      "department_manage",
      "user_manage",
      "news_manage",
      "files_manage",
    ],
    faculty_admin: ["faculty_read", "faculty_edit", "department_manage", "news_manage", "files_manage"],
    department_admin: ["department_read", "department_edit", "news_create", "news_edit", "files_manage"],
    ai_house_admin: ["ai_house_manage", "projects_manage", "events_manage"],
    incubator_admin: ["incubator_manage", "startups_manage", "programs_manage"],
    editor: ["news_create", "news_edit", "files_upload"],
    viewer: ["read_only"],
  }

  const permissions = rolePermissions[userRole] || []

  // Check if user has the required permission
  if (!permissions.includes(requiredPermission)) {
    return false
  }

  // Check hierarchical permissions
  if (resourceCollegeId && userCollegeId !== resourceCollegeId) {
    return false
  }

  if (resourceFacultyId && userFacultyId !== resourceFacultyId && userRole !== "college_admin") {
    return false
  }

  return true
}

export const canAccessResource = (
  userRole,
  resourceType,
  userCollegeId = null,
  userFacultyId = null,
  resourceCollegeId = null,
  resourceFacultyId = null,
) => {
  if (userRole === "super_admin") {
    return true
  }

  switch (resourceType) {
    case "college":
      return userRole === "college_admin" && userCollegeId === resourceCollegeId

    case "faculty":
      return (
        (userRole === "college_admin" && userCollegeId === resourceCollegeId) ||
        (userRole === "faculty_admin" && userFacultyId === resourceFacultyId)
      )

    case "department":
      return userRole === "college_admin" || userRole === "faculty_admin" || userRole === "department_admin"

    case "news":
      return ["college_admin", "faculty_admin", "department_admin", "editor"].includes(userRole)

    case "files":
      return ["college_admin", "faculty_admin", "department_admin", "editor"].includes(userRole)

    default:
      return false
  }
}
