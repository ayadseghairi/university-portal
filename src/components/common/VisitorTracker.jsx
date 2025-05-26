"use client"

import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { analyticsAPI } from "../../api/analyticsAPI"

const VisitorTracker = () => {
  const location = useLocation()

  useEffect(() => {
    const trackPageView = async () => {
      try {
        // Get visitor info
        const visitorInfo = {
          page: location.pathname,
          referrer: document.referrer,
          userAgent: navigator.userAgent,
          screenResolution: `${screen.width}x${screen.height}`,
          language: navigator.language,
          timestamp: new Date().toISOString(),
        }

        // Track the page view
        await analyticsAPI.trackPageView(visitorInfo)
      } catch (error) {
        // Silently fail - don't disrupt user experience
        console.debug("Analytics tracking failed:", error)
      }
    }

    // Track page view with a small delay to ensure page is loaded
    const timer = setTimeout(trackPageView, 1000)

    return () => clearTimeout(timer)
  }, [location.pathname])

  // This component doesn't render anything
  return null
}

export default VisitorTracker
