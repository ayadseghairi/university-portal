import apiClient from "./config"

export const incubatorAPI = {
  getStartups: async () => {
    const response = await apiClient.get("/incubator/startups")
    return response.data
  },

  getPrograms: async () => {
    const response = await apiClient.get("/incubator/programs")
    return response.data
  },

  createStartup: async (startupData) => {
    const response = await apiClient.post("/incubator/startups", startupData)
    return response.data
  },

  createProgram: async (programData) => {
    const response = await apiClient.post("/incubator/programs", programData)
    return response.data
  },

  updateStartup: async (id, startupData) => {
    const response = await apiClient.put(`/incubator/startups/${id}`, startupData)
    return response.data
  },

  deleteStartup: async (id) => {
    const response = await apiClient.delete(`/incubator/startups/${id}`)
    return response.data
  },
}
