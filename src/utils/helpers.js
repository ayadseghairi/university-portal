import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const formatDate = (date, locale = "en") => {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date))
}

export const truncateText = (text, maxLength = 150) => {
  if (text.length <= maxLength) return text
  return text.substr(0, maxLength) + "..."
}

export const validateFile = (file, allowedTypes, maxSize) => {
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "Invalid file type" }
  }

  if (file.size > maxSize) {
    return { valid: false, error: "File size too large" }
  }

  return { valid: true }
}

export const getFileExtension = (filename) => {
  return filename.split(".").pop().toLowerCase()
}
