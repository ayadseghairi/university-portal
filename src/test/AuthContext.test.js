"use client"

import { render, screen, waitFor } from "@testing-library/react"
import { AuthProvider, useAuth } from "../contexts/AuthContext"
import { authAPI } from "../api/authAPI"
import jest from "jest" // Declare the jest variable

// Mock the authAPI
jest.mock("../api/authAPI")

const TestComponent = () => {
  const { user, isAuthenticated, loading } = useAuth()

  if (loading) return <div>Loading...</div>
  if (isAuthenticated) return <div>Authenticated: {user.name}</div>
  return <div>Not authenticated</div>
}

describe("AuthContext", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test("provides authentication state", async () => {
    authAPI.verifyToken.mockResolvedValue({
      id: 1,
      name: "Test User",
      role: "admin",
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    expect(screen.getByText("Loading...")).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText("Authenticated: Test User")).toBeInTheDocument()
    })
  })

  test("handles authentication failure", async () => {
    authAPI.verifyToken.mockRejectedValue(new Error("Token invalid"))

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("Not authenticated")).toBeInTheDocument()
    })
  })
})
