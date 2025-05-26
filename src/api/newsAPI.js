import apiClient from "./config"

export const newsAPI = {
  getAll: async (params = {}) => {
    const response = await apiClient.get("/news", { params })
    return response.data
  },

  getById: async (id) => {
    const response = await apiClient.get(`/news/${id}`)
    return response.data
  },

  getLatest: async (limit = 5) => {
    const response = await apiClient.get(`/news/latest?limit=${limit}`)
    return response.data
  },

  create: async (newsData) => {
    const response = await apiClient.post("/news", newsData)
    return response.data
  },

  update: async (id, newsData) => {
    const response = await apiClient.put(`/news/${id}`, newsData)
    return response.data
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/news/${id}`)
    return response.data
  },

  uploadImage: async (file) => {
    const formData = new FormData()
    formData.append("image", file)
    const response = await apiClient.post("/news/upload-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return response.data
  },
}
