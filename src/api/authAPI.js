import apiClient from "./config"

export const authAPI = {
  login: async (credentials) => {
    const response = await apiClient.post("/auth/login", credentials, {
      withCredentials: true,
    })
    return response.data
  },

  logout: async () => {
    const response = await apiClient.post(
      "/auth/logout",
      {},
      {
        withCredentials: true,
      },
    )
    return response.data
  },

  verifyToken: async () => {
    const response = await apiClient.get("/auth/verify", {
      withCredentials: true,
    })
    return response.data
  },

  refreshToken: async () => {
    const response = await apiClient.post(
      "/auth/refresh",
      {},
      {
        withCredentials: true,
      },
    )
    return response.data
  },

  changePassword: async (passwordData) => {
    const response = await apiClient.post("/auth/change-password", passwordData, {
      withCredentials: true,
    })
    return response.data
  },

  updateProfile: async (profileData) => {
    const response = await apiClient.put("/auth/profile", profileData, {
      withCredentials: true,
    })
    return response.data
  },

  getProfile: async () => {
    const response = await apiClient.get("/auth/profile", {
      withCredentials: true,
    })
    return response.data
  },
}
