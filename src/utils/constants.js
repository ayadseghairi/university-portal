export const USER_ROLES = {
  SUPER_ADMIN: "super_admin",
  FACULTY_ADMIN: "faculty_admin",
  DEPARTMENT_ADMIN: "department_admin",
  AI_HOUSE_ADMIN: "ai_house_admin",
  INCUBATOR_ADMIN: "incubator_admin",
}

export const LANGUAGES = {
  EN: "en",
  FR: "fr",
  AR: "ar",
}

export const FILE_TYPES = {
  IMAGES: ["image/jpeg", "image/png", "image/gif"],
  DOCUMENTS: ["application/pdf"],
}

export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export const ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  FACULTIES: "/faculties",
  NEWS: "/news",
  AI_HOUSE: "/ai-house",
  INCUBATOR: "/incubator",
  CONTACT: "/contact",
  LOGIN: "/login",
  ADMIN: "/admin",
}
