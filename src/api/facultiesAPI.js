import apiClient from "./config"

export const facultiesAPI = {
  getAll: async () => {
    const response = await apiClient.get("/faculties")
    return response.data
  },

  getById: async (id) => {
    const response = await apiClient.get(`/faculties/${id}`)
    return response.data
  },

  getDepartments: async (facultyId) => {
    const response = await apiClient.get(`/faculties/${facultyId}/departments`)
    return response.data
  },

  create: async (facultyData) => {
    const response = await apiClient.post("/faculties", facultyData)
    return response.data
  },

  update: async (id, facultyData) => {
    const response = await apiClient.put(`/faculties/${id}`, facultyData)
    return response.data
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/faculties/${id}`)
    return response.data
  },
}
