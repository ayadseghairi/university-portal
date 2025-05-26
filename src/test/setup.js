import "@testing-library/jest-dom"
import jest from "jest"

// Mock environment variables
global.import = {
  meta: {
    env: {
      VITE_API_URL: "http://localhost:5000/api",
      VITE_APP_NAME: "University of Khenchela",
      VITE_DEV_MODE: "true",
    },
  },
}

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.sessionStorage = sessionStorageMock

// Mock window.location
delete window.location
window.location = { href: "", assign: jest.fn(), reload: jest.fn() }

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}
