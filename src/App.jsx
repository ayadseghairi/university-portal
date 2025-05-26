"use client"

import { useEffect } from "react"
import { Routes, Route } from "react-router-dom"
import { useTranslation } from "react-i18next"
import Navbar from "./components/layout/Navbar"
import Footer from "./components/layout/Footer"
import VisitorTracker from "./components/common/VisitorTracker"
import Home from "./pages/Home"
import About from "./pages/About"
import Faculties from "./pages/Faculties"
import Departments from "./pages/Departments"
import News from "./pages/News"
import AIHouse from "./pages/AIHouse"
import Incubator from "./pages/Incubator"
import Contact from "./pages/Contact"
import Downloads from "./pages/Downloads"
import Login from "./pages/auth/Login"
import Dashboard from "./pages/admin/Dashboard"
import ProtectedRoute from "./components/auth/ProtectedRoute"
import { AuthProvider } from "./contexts/AuthContext"
import Library from "./pages/Library"
function App() {
  const { i18n } = useTranslation()

  useEffect(() => {
    // Set document direction based on language
    document.dir = i18n.language === "ar" ? "rtl" : "ltr"
    document.documentElement.lang = i18n.language

    // Add theme class to body
    document.body.classList.add("theme-university")
  }, [i18n.language])

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col">
        <VisitorTracker />
        <Navbar />
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/faculties" element={<Faculties />} />
            <Route path="/departments/:id" element={<Departments />} />
            <Route path="/news" element={<News />} />
            <Route path="/ai-house" element={<AIHouse />} />
            <Route path="/incubator" element={<Incubator />} />
            <Route path="/downloads" element={<Downloads />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/library" element={<Library />} />

            {/* Authentication Routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected Admin Routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  )
}

export default App
