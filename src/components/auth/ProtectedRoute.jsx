"use client"

import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import LoadingSpinner from "../common/LoadingSpinner"

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/admin" replace />
  }

  return children
}

export default ProtectedRoute
