// services/feedbackService.js
import axios from "axios"
import * as SecureStore from "expo-secure-store"

// Base API configuration
import { baseUrl } from "../utility/constant"

class FeedbackService {
  constructor() {
    this.api = axios.create({
      baseURL: `${baseUrl}/feedback`,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    })

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        try {
          const token = await SecureStore.getItemAsync("userToken")
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
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          await SecureStore.deleteItemAsync("userToken")
          // You might want to redirect to login screen here
        }
        return Promise.reject(error)
      }
    )
  }

  // Submit new feedback
  async submitFeedback(feedbackData) {
    try {
      const response = await this.api.post("/", feedbackData)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Submit feedback error:", error)
      return {
        success: false,
        error: error.response?.data?.message || "Failed to submit feedback",
        details: error.response?.data,
      }
    }
  }

  // Get user's feedback history
  async getUserFeedback(page = 1, limit = 10) {
    try {
      const response = await this.api.get("/my-feedback", {
        params: { page, limit },
      })
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Get user feedback error:", error)
      return {
        success: false,
        error:
          error.response?.data?.message || "Failed to fetch feedback history",
        details: error.response?.data,
      }
    }
  }

  // Get specific feedback by ID
  async getFeedbackById(feedbackId) {
    try {
      const response = await this.api.get(`/${feedbackId}`)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Get feedback by ID error:", error)
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch feedback",
        details: error.response?.data,
      }
    }
  }

  // Update feedback
  async updateFeedback(feedbackId, updateData) {
    try {
      const response = await this.api.put(`/${feedbackId}`, updateData)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Update feedback error:", error)
      return {
        success: false,
        error: error.response?.data?.message || "Failed to update feedback",
        details: error.response?.data,
      }
    }
  }

  // Check authentication status
  async isAuthenticated() {
    try {
      const token = await SecureStore.getItemAsync("userToken")
      return !!token
    } catch (error) {
      console.error("Error checking auth status:", error)
      return false
    }
  }

  // Get stored auth token
  async getAuthToken() {
    try {
      return await SecureStore.getItemAsync("userToken")
    } catch (error) {
      console.error("Error getting auth token:", error)
      return null
    }
  }
}

// Create and export service instance
const feedbackService = new FeedbackService()
export default feedbackService

// Export individual methods for convenience
export const {
  submitFeedback,
  getUserFeedback,
  getFeedbackById,
  updateFeedback,
  isAuthenticated,
  getAuthToken,
} = feedbackService
