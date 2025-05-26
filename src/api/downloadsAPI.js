import apiClient from "./config"

export const downloadsAPI = {
  getFiles: async (params = {}) => {
    const response = await apiClient.get("/downloads/files", { params })
    return response.data
  },

  getFaculties: async () => {
    const response = await apiClient.get("/downloads/faculties")
    return response.data
  },

  downloadFile: async (fileId, filename) => {
    const response = await apiClient.get(`/downloads/file/${fileId}`, {
      responseType: "blob",
    })

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

    return response.data
  },

  getFileStats: async () => {
    const response = await apiClient.get("/downloads/stats")
    return response.data
  },
}
