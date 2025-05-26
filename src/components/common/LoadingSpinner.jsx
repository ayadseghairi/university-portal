"use client"

const LoadingSpinner = ({ size = "md", text = null }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div
        className={`animate-spin rounded-full border-4 border-gray-300 border-t-university-blue ${sizeClasses[size]}`}
      />
      {text && <p className="mt-4 text-gray-600">{text}</p>}
    </div>
  )
}

export default LoadingSpinner
