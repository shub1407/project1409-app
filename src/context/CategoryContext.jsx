// contexts/CategoryContext.js
import * as SecureStore from "expo-secure-store"
import { createContext, useContext, useEffect, useReducer } from "react"
import { useDatabase } from "../database/providers/DatabaseProvider"
import { categoryService } from "../services/categoryService"
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

// Reducer
const categoryReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload }

    case ACTIONS.SET_CATEGORIES:
      const categories = action.payload
      return {
        ...state,
        categories,
        expenseCategories: categories.filter((cat) => cat.type === "expense"),
        incomeCategories: categories.filter((cat) => cat.type === "income"),
        loading: false,
        error: null,
      }

    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false }

    case ACTIONS.CLEAR_ERROR:
      return { ...state, error: null }

    case ACTIONS.ADD_CATEGORY:
      const newCategory = action.payload
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
      const updatedCategoriesUpdate = state.categories.map((cat) =>
        cat.id === action.payload.id ? { ...cat, ...action.payload } : cat
      )
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
      const filteredCategories = state.categories.filter(
        (cat) => cat.id !== action.payload
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
      const result = await dbService.categories.findAll()
      console.log("Db categories::", result)

      if (result.success) {
        dispatch({ type: ACTIONS.SET_CATEGORIES, payload: result.data })
        // Cache categories locally
        await SecureStore.setItemAsync(
          "categories_cache",
          JSON.stringify(result.data)
        )
      } else {
        // Try to load from cache if API fails
        const cachedCategories = await SecureStore.getItemAsync(
          "categories_cache"
        )
        if (cachedCategories) {
          dispatch({
            type: ACTIONS.SET_CATEGORIES,
            payload: JSON.parse(cachedCategories),
          })
        } else {
          dispatch({ type: ACTIONS.SET_ERROR, payload: result.error })
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
      const result = await categoryService.addCategory(categoryData)

      if (result.success) {
        dispatch({ type: ACTIONS.ADD_CATEGORY, payload: result.data })
        return { success: true, category: result.data }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error("Error creating category:", error)
      return { success: false, error: "Failed to create category" }
    }
  }

  // Update category
  const updateCategory = async (categoryId, updates) => {
    try {
      const result = await categoryService.updateCategory(categoryId, updates)

      if (result.success) {
        dispatch({
          type: ACTIONS.UPDATE_CATEGORY,
          payload: { ...updates, id: categoryId },
        })
        return { success: true, category: result.data }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error("Error updating category:", error)
      return { success: false, error: "Failed to update category" }
    }
  }

  // Delete category
  const deleteCategory = async (categoryId) => {
    try {
      const result = await categoryService.deleteCategory(categoryId)

      if (result.success) {
        dispatch({ type: ACTIONS.DELETE_CATEGORY, payload: categoryId })
        return { success: true }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error("Error deleting category:", error)
      return { success: false, error: "Failed to delete category" }
    }
  }

  // Utility functions
  const getCategoryById = (categoryId) => {
    return state.categories.find((category) => category.id === categoryId)
  }

  const getCategoriesByType = (type) => {
    return type === "expense" ? state.expenseCategories : state.incomeCategories
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
    categories: state.categories,
    expenseCategories: state.expenseCategories,
    incomeCategories: state.incomeCategories,
    loading: state.loading,
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
