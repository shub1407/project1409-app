// services/categoryService.js

import { apiRequest as categoryAPI } from "./apiUtils"

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

  // Add new category
  addCategory: async (categoryData) => {
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
