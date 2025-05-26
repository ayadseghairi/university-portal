import apiClient from "./config"

export const analyticsAPI = {
  trackPageView: async (visitorInfo) => {
    try {
      const response = await apiClient.post("/analytics/track", visitorInfo)
      return response.data
    } catch (error) {
      // Silently fail for analytics
      console.debug("Analytics tracking failed:", error)
      return null
    }
  },

  getAnalytics: async (timeRange = "7d") => {
    const response = await apiClient.get("/analytics/dashboard", {
      params: { timeRange },
      withCredentials: true,
    })
    return response.data
  },

  getPageAnalytics: async (page, timeRange = "7d") => {
    const response = await apiClient.get(`/analytics/page/${encodeURIComponent(page)}`, {
      params: { timeRange },
      withCredentials: true,
    })
    return response.data
  },

  getRealTimeStats: async () => {
    const response = await apiClient.get("/analytics/realtime", {
      withCredentials: true,
    })
    return response.data
  },

  exportAnalytics: async (timeRange = "30d", format = "csv") => {
    const response = await apiClient.get("/analytics/export", {
      params: { timeRange, format },
      responseType: "blob",
      withCredentials: true,
    })
    return response.data
  },
}
