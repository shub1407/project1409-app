// contexts/CategoryContext.js
import * as SecureStore from "expo-secure-store"
import { createContext, useContext, useEffect, useReducer } from "react"
import { useDatabase } from "../database/providers/DatabaseProvider"

// Initial state
const initialState = {
  categories: [],
  expenseCategories: [],
  incomeCategories: [],
  loading: false,
  error: null,
}

// Action types
const ACTIONS = {
  SET_LOADING: "SET_LOADING",
  SET_CATEGORIES: "SET_CATEGORIES",
  SET_ERROR: "SET_ERROR",
  ADD_CATEGORY: "ADD_CATEGORY",
  UPDATE_CATEGORY: "UPDATE_CATEGORY",
  DELETE_CATEGORY: "DELETE_CATEGORY",
  CLEAR_ERROR: "CLEAR_ERROR",
}

// Helper function to validate and sanitize category data
const sanitizeCategory = (category) => {
  if (!category || typeof category !== "object") return null

  return {
    id: category.id || "",
    label: category.label || "",
    icon: category.icon || "apps-outline",
    color: category.color || "#1CC29F",
    type: category.type || "expense",
    isDefault: Boolean(category.isDefault),
    isActive:
      category.isActive !== undefined ? Boolean(category.isActive) : true,
    isDeleted: Boolean(category.isDeleted),
    transactionCount:
      typeof category.transactionCount === "number"
        ? category.transactionCount
        : 0,
    createdAt: category.createdAt || Date.now(),
    updatedAt: category.updatedAt || Date.now(),
    version: category.version || 1,
    syncStatus: category.syncStatus || "pending",
    cloudId: category.cloudId || null,
    lastSynced: category.lastSynced || 0,
  }
}

// Helper function to sanitize categories array
const sanitizeCategories = (categories) => {
  if (!Array.isArray(categories)) return []

  return categories
    .map(sanitizeCategory)
    .filter((category) => category !== null) // Remove any null/invalid categories
}

// Reducer
const categoryReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: Boolean(action.payload) }

    case ACTIONS.SET_CATEGORIES:
      const sanitizedCategories = sanitizeCategories(action.payload)
      return {
        ...state,
        categories: sanitizedCategories,
        expenseCategories: sanitizedCategories.filter(
          (cat) => cat.type === "expense"
        ),
        incomeCategories: sanitizedCategories.filter(
          (cat) => cat.type === "income"
        ),
        loading: false,
        error: null,
      }

    case ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload || "An unknown error occurred",
        loading: false,
      }

    case ACTIONS.CLEAR_ERROR:
      return { ...state, error: null }

    case ACTIONS.ADD_CATEGORY:
      const newCategory = sanitizeCategory(action.payload)
      if (!newCategory) return state

      const updatedCategoriesAdd = [...state.categories, newCategory]
      return {
        ...state,
        categories: updatedCategoriesAdd,
        expenseCategories: updatedCategoriesAdd.filter(
          (cat) => cat.type === "expense"
        ),
        incomeCategories: updatedCategoriesAdd.filter(
          (cat) => cat.type === "income"
        ),
      }

    case ACTIONS.UPDATE_CATEGORY:
      const updateData = action.payload
      if (!updateData || !updateData.id) return state

      const updatedCategoriesUpdate = state.categories.map((cat) => {
        if (cat.id === updateData.id) {
          const updatedCategory = sanitizeCategory({ ...cat, ...updateData })
          return updatedCategory || cat // fallback to original if sanitization fails
        }
        return cat
      })

      return {
        ...state,
        categories: updatedCategoriesUpdate,
        expenseCategories: updatedCategoriesUpdate.filter(
          (cat) => cat.type === "expense"
        ),
        incomeCategories: updatedCategoriesUpdate.filter(
          (cat) => cat.type === "income"
        ),
      }

    case ACTIONS.DELETE_CATEGORY:
      const categoryIdToDelete = action.payload
      if (!categoryIdToDelete) return state

      const filteredCategories = state.categories.filter(
        (cat) => cat.id !== categoryIdToDelete
      )
      return {
        ...state,
        categories: filteredCategories,
        expenseCategories: filteredCategories.filter(
          (cat) => cat.type === "expense"
        ),
        incomeCategories: filteredCategories.filter(
          (cat) => cat.type === "income"
        ),
      }

    default:
      return state
  }
}

// Create context
const CategoryContext = createContext()

// Provider component
export const CategoryProvider = ({ children }) => {
  const [state, dispatch] = useReducer(categoryReducer, initialState)
  const { dbService } = useDatabase()

  // Fetch categories from API
  const fetchCategories = async () => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true })

    try {
      const result = await dbService.categories.getCategories()

      if (result && result.success && result.data) {
        dispatch({ type: ACTIONS.SET_CATEGORIES, payload: result.data })
        // Cache categories locally
        try {
          await SecureStore.setItemAsync(
            "categories_cache",
            JSON.stringify(result.data)
          )
        } catch (cacheError) {
          console.warn("Failed to cache categories:", cacheError)
        }
      } else {
        // Try to load from cache if API fails
        try {
          const cachedCategories = await SecureStore.getItemAsync(
            "categories_cache"
          )
          if (cachedCategories) {
            const parsedCategories = JSON.parse(cachedCategories)
            dispatch({
              type: ACTIONS.SET_CATEGORIES,
              payload: parsedCategories,
            })
          } else {
            dispatch({
              type: ACTIONS.SET_ERROR,
              payload: result?.error || "Failed to load categories",
            })
          }
        } catch (cacheError) {
          console.error("Cache error:", cacheError)
          dispatch({
            type: ACTIONS.SET_ERROR,
            payload: "Failed to load categories from cache",
          })
        }
      }
    } catch (error) {
      console.error("Unexpected error fetching categories:", error)
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: "Failed to load categories",
      })
    }
  }

  // Create new category
  const addCategory = async (categoryData) => {
    try {
      if (!categoryData || typeof categoryData !== "object") {
        return { success: false, error: "Invalid category data" }
      }

      const result = await dbService.categories.create(categoryData)

      if (result && result.success && result.data) {
        dispatch({ type: ACTIONS.ADD_CATEGORY, payload: result.data })
        return { success: true, category: result.data }
      } else {
        return {
          success: false,
          error: result?.error || "Failed to create category",
        }
      }
    } catch (error) {
      console.error("Error creating category:", error)
      return { success: false, error: "Failed to create category" }
    }
  }

  // Update category
  const updateCategory = async (categoryId, updates) => {
    try {
      if (!categoryId || !updates || typeof updates !== "object") {
        return { success: false, error: "Invalid update data" }
      }

      const result = await dbService.categories.update(categoryId, updates)

      if (result && result.success) {
        dispatch({
          type: ACTIONS.UPDATE_CATEGORY,
          payload: { ...updates, id: categoryId },
        })
        return { success: true, category: result.data }
      } else {
        return {
          success: false,
          error: result?.error || "Failed to update category",
        }
      }
    } catch (error) {
      console.error("Error updating category:", error)
      return { success: false, error: "Failed to update category" }
    }
  }

  // Delete category
  const deleteCategory = async (categoryId) => {
    try {
      if (!categoryId) {
        return { success: false, error: "Invalid category ID" }
      }

      const result = await dbService.categories.delete(categoryId)
      console.log("Delete category result:", categoryId, "result", result)

      if (result && result.success) {
        dispatch({ type: ACTIONS.DELETE_CATEGORY, payload: categoryId })
        return { success: true }
      } else {
        return {
          success: false,
          error: result?.error || "Failed to delete category",
        }
      }
    } catch (error) {
      console.error("Error deleting category:", error)
      return { success: false, error: "Failed to delete category" }
    }
  }

  // Utility functions
  const getCategoryById = (categoryId) => {
    if (!categoryId) return null
    return (
      state.categories.find(
        (category) => category && category.id === categoryId
      ) || null
    )
  }

  const getCategoriesByType = (type) => {
    if (type === "expense") {
      return Array.isArray(state.expenseCategories)
        ? state.expenseCategories
        : []
    } else if (type === "income") {
      return Array.isArray(state.incomeCategories) ? state.incomeCategories : []
    }
    return []
  }

  const clearError = () => {
    dispatch({ type: ACTIONS.CLEAR_ERROR })
  }

  // Load categories on mount
  useEffect(() => {
    fetchCategories()
  }, [])

  const value = {
    // State
    categories: Array.isArray(state.categories) ? state.categories : [],
    expenseCategories: Array.isArray(state.expenseCategories)
      ? state.expenseCategories
      : [],
    incomeCategories: Array.isArray(state.incomeCategories)
      ? state.incomeCategories
      : [],
    loading: Boolean(state.loading),
    error: state.error,

    // Actions
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,

    // Utilities
    getCategoryById,
    getCategoriesByType,
    clearError,
  }

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  )
}

// Hook to use context
export const useCategoryContext = () => {
  const context = useContext(CategoryContext)
  if (!context) {
    throw new Error("useCategoryContext must be used within a CategoryProvider")
  }
  return context
}
