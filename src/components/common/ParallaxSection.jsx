"use client"

import { useEffect, useRef, useState } from "react"

const ParallaxSection = ({ children, speed = 0.5, className = "" }) => {
  const [offset, setOffset] = useState(0)
  const parallaxRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      if (parallaxRef.current) {
        const rect = parallaxRef.current.getBoundingClientRect()
        const scrolled = window.pageYOffset
        const rate = scrolled * -speed
        setOffset(rate)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [speed])

  return (
    <div
      ref={parallaxRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        transform: `translateY(${offset}px)`,
      }}
    >
      {children}
    </div>
  )
}

export default ParallaxSection
