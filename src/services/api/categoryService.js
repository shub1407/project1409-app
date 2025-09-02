// services/categoryService.js
import { ENDPOINTS } from "../../constants/api"
import apiClient from "./apiClient"

class CategoryService {
  async getCategories() {
    try {
      const result = await apiClient.get(ENDPOINTS.CATEGORIES.BASE)

      if (result.success) {
        return {
          success: true,
          data: result.data.categories || result.data,
        }
      }

      return result
    } catch (error) {
      console.error("Error fetching categories:", error)
      return {
        success: false,
        error: error.message || "Failed to fetch categories",
      }
    }
  }

  async addCategory(categoryData) {
    try {
      const result = await apiClient.post(
        ENDPOINTS.CATEGORIES.BASE,
        categoryData
      )

      if (result.success) {
        return {
          success: true,
          data: result.data.category || result.data,
        }
      }

      return result
    } catch (error) {
      console.error("Error creating category:", error)
      return {
        success: false,
        error: error.message || "Failed to create category",
      }
    }
  }

  async updateCategory(categoryId, updates) {
    try {
      const result = await apiClient.put(
        ENDPOINTS.CATEGORIES.BY_ID(categoryId),
        updates
      )

      if (result.success) {
        return {
          success: true,
          data: result.data.category || result.data,
        }
      }

      return result
    } catch (error) {
      console.error("Error updating category:", error)
      return {
        success: false,
        error: error.message || "Failed to update category",
      }
    }
  }

  async deleteCategory(categoryId) {
    try {
      const result = await apiClient.delete(
        ENDPOINTS.CATEGORIES.BY_ID(categoryId)
      )

      if (result.success) {
        return {
          success: true,
        }
      }

      return result
    } catch (error) {
      console.error("Error deleting category:", error)
      return {
        success: false,
        error: error.message || "Failed to delete category",
      }
    }
  }
}

export default new CategoryService()
