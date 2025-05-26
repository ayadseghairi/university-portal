import apiClient from "./config"

export const aiHouseAPI = {
  getProjects: async () => {
    const response = await apiClient.get("/ai-house/projects")
    return response.data
  },

  getEvents: async () => {
    const response = await apiClient.get("/ai-house/events")
    return response.data
  },

  createProject: async (projectData) => {
    const response = await apiClient.post("/ai-house/projects", projectData)
    return response.data
  },

  createEvent: async (eventData) => {
    const response = await apiClient.post("/ai-house/events", eventData)
    return response.data
  },

  updateProject: async (id, projectData) => {
    const response = await apiClient.put(`/ai-house/projects/${id}`, projectData)
    return response.data
  },

  deleteProject: async (id) => {
    const response = await apiClient.delete(`/ai-house/projects/${id}`)
    return response.data
  },
}
