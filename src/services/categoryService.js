// services/categoryService.js
import axios from "axios"
import * as SecureStore from "expo-secure-store"

import { baseUrl } from "../utility/constant"

// Create axios instance with interceptors
const categoryAPI = axios.create({
  baseURL: `${baseUrl}`,
  timeout: 10000,
})

// Request interceptor to add auth token
categoryAPI.interceptors.request.use(
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
categoryAPI.interceptors.response.use(
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

// Category API service functions
export const categoryService = {
  // Get all categories for the authenticated user
  getCategories: async () => {
    try {
      const response = await categoryAPI.get("/categories")
      return {
        success: true,
        data: response.data.categories || response.data,
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch categories",
      }
    }
  },

  // Create new category
  createCategory: async (categoryData) => {
    try {
      const response = await categoryAPI.post("/categories", categoryData)
      return {
        success: true,
        data: response.data.category || response.data,
      }
    } catch (error) {
      console.error("Error creating category:", error)
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to create category",
      }
    }
  },

  // Update existing category
  updateCategory: async (categoryId, updates) => {
    try {
      const response = await categoryAPI.put(
        `/categories/${categoryId}`,
        updates
      )
      return {
        success: true,
        data: response.data.category || response.data,
      }
    } catch (error) {
      console.error("Error updating category:", error)
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to update category",
      }
    }
  },

  // Delete category
  deleteCategory: async (categoryId) => {
    try {
      await categoryAPI.delete(`/categories/${categoryId}`)
      return {
        success: true,
      }
    } catch (error) {
      console.error("Error deleting category:", error)
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to delete category",
      }
    }
  },
}
