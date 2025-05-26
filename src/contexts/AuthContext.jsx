"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { authAPI } from "../api/authAPI"
import { getAuthToken, removeAuthTokens, isTokenExpired } from "../utils/auth"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = getAuthToken()

      if (!token || isTokenExpired(token)) {
        // Try to refresh token only if we had a token before
        if (token) {
          const refreshed = await refreshToken()
          if (!refreshed) {
            setLoading(false)
            return
          }
        } else {
          setLoading(false)
          return
        }
      }

      // Verify token with server
      const userData = await authAPI.verifyToken()
      setUser(userData)
      setIsAuthenticated(true)
    } catch (error) {
      console.error("Auth check failed:", error)
      removeAuthTokens()
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      setLoading(true)
      const response = await authAPI.login(credentials)

      if (response.user) {
        setUser(response.user)
        setIsAuthenticated(true)
        return { success: true }
      }

      return { success: false, error: "Login failed" }
    } catch (error) {
      console.error("Login error:", error)
      return {
        success: false,
        error: error.response?.data?.error || "Login failed",
      }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      removeAuthTokens()
      setUser(null)
      setIsAuthenticated(false)
    }
  }

  const refreshToken = async () => {
    try {
      await authAPI.refreshToken()
      return true
    } catch (error) {
      console.error("Token refresh failed:", error)
      removeAuthTokens()
      setUser(null)
      setIsAuthenticated(false)
      return false
    }
  }

  const updateProfile = async (profileData) => {
    try {
      const updatedUser = await authAPI.updateProfile(profileData)
      setUser(updatedUser)
      return { success: true }
    } catch (error) {
      console.error("Profile update error:", error)
      return {
        success: false,
        error: error.response?.data?.error || "Profile update failed",
      }
    }
  }

  const changePassword = async (passwordData) => {
    try {
      await authAPI.changePassword(passwordData)
      return { success: true }
    } catch (error) {
      console.error("Password change error:", error)
      return {
        success: false,
        error: error.response?.data?.error || "Password change failed",
      }
    }
  }

  const hasPermission = (permission, resourceType = null, resourceId = null) => {
    if (!user) return false

    // Super admin has all permissions
    if (user.role === "super_admin") return true

    // Import permission checking logic
    const { hasPermission: checkPermission } = require("../utils/auth")
    return checkPermission(
      user.role,
      permission,
      user.college_id,
      user.faculty_id,
      resourceType === "college" ? resourceId : null,
      resourceType === "faculty" ? resourceId : null,
    )
  }

  const canAccessResource = (resourceType, resourceCollegeId = null, resourceFacultyId = null) => {
    if (!user) return false

    const { canAccessResource: checkAccess } = require("../utils/auth")
    return checkAccess(user.role, resourceType, user.college_id, user.faculty_id, resourceCollegeId, resourceFacultyId)
  }

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    refreshToken,
    updateProfile,
    changePassword,
    hasPermission,
    canAccessResource,
    checkAuthStatus,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
