import axios from "axios"
import * as SecureStore from "expo-secure-store"
import { baseUrl } from "../utility/constant"
export const handleApiError = (error) => {
  console.error("API Error:", error)

  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response

    switch (status) {
      case 400:
        return {
          success: false,
          error: data.message || "Invalid request data",
        }
      case 401:
        return {
          success: false,
          error: "Authentication required",
        }
      case 403:
        return {
          success: false,
          error: "Access denied",
        }
      case 404:
        return {
          success: false,
          error: "Resource not found",
        }
      case 409:
        return {
          success: false,
          error: data.message || "Account already exists",
        }
      case 500:
        return {
          success: false,
          error: "Server error. Please try again later.",
        }
      default:
        return {
          success: false,
          error: data.message || "An error occurred",
        }
    }
  } else if (error.request) {
    // Network error
    return {
      success: false,
      error: "Network error. Please check your connection.",
    }
  } else {
    return {
      success: false,
      error: "An unexpected error occurred",
    }
  }
}
export const getAuthHeaders = async () => {
  try {
    const token = await SecureStore.getItemAsync("userToken")
    return token ? { Authorization: `Bearer ${token}` } : {}
  } catch (error) {
    console.error("Error getting token:", error)
    return {}
  }
}
// Create axios instance with interceptors
export const apiRequest = axios.create({
  baseURL: `${baseUrl}`,
  timeout: 10000,
})

// Request interceptor to add auth token
apiRequest.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync("userToken")
      console.log("userToken:", token)
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (error) {
      console.error("Error getting auth token:", error)
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiRequest.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle token expiration
      SecureStore.deleteItemAsync("userToken")
      // Navigate to login screen if needed
    }
    return Promise.reject(error)
  }
)
