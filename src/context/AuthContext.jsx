// context/AuthContext.js
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import { authService } from "../services/api"
import apiClient from "../services/api/apiClient"

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    initializeAuth()
  }, [])

  /**
   * Initialize authentication state on app start
   */
  const initializeAuth = useCallback(async () => {
    try {
      setIsLoading(true)
      const authData = await authService.getStoredAuthData()

      if (authData) {
        setUser(authData.user)
      }
    } catch (error) {
      console.error("Auth initialization error:", error)
      // Clear potentially corrupted data
      await apiClient.clearAuthData()
    } finally {
      setIsLoading(false)
      setIsInitialized(true)
    }
  }, [])

  /**
   * Setup listener for auth events from apiClient
   */

  /**
   * Sign in user
   */
  const signIn = useCallback(async (email, password) => {
    try {
      setIsLoading(true)
      const result = await authService.login(email, password)
      console.log("Result is:: ", result)

      if (result.success) {
        setUser(result.user)
      }

      return result
    } catch (error) {
      console.error("Sign in error:", error)
      return {
        success: false,
        error: "An unexpected error occurred during sign in",
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Sign up new user
   */
  const signUp = useCallback(async (userData) => {
    try {
      setIsLoading(true)
      const result = await authService.register(userData)

      if (result.success) {
        setUser(result.user)
      }

      return result
    } catch (error) {
      console.error("Sign up error:", error)
      return {
        success: false,
        error: "An unexpected error occurred during sign up",
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Sign out user
   */
  const signOut = useCallback(async () => {
    try {
      setIsLoading(true)
      await authService.logout()
      setUser(null)
    } catch (error) {
      console.error("Sign out error:", error)
      // Still clear user state even if logout API fails
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Update user profile
   */
  const updateProfile = useCallback(async (userData) => {
    try {
      const result = await authService.updateProfile(userData)

      if (result.success) {
        setUser(result.user)
      }

      return result
    } catch (error) {
      console.error("Update profile error:", error)
      return {
        success: false,
        error: "An unexpected error occurred while updating profile",
      }
    }
  }, [])

  /**
   * Refresh user data from storage
   */
  const refreshUserData = useCallback(async () => {
    try {
      const userData = await authService.getStoredUserData()
      if (userData) {
        setUser(userData)
      }
    } catch (error) {
      console.error("Refresh user data error:", error)
    }
  }, [])

  /**
   * Change password
   */
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      return await authService.changePassword(currentPassword, newPassword)
    } catch (error) {
      console.error("Change password error:", error)
      return {
        success: false,
        error: "An unexpected error occurred while changing password",
      }
    }
  }, [])

  /**
   * Forgot password
   */
  const forgotPassword = useCallback(async (email) => {
    try {
      return await authService.forgotPassword(email)
    } catch (error) {
      console.error("Forgot password error:", error)
      return {
        success: false,
        error: "An unexpected error occurred while processing forgot password",
      }
    }
  }, [])

  /**
   * Reset password
   */
  const resetPassword = useCallback(async (token, newPassword) => {
    try {
      return await authService.resetPassword(token, newPassword)
    } catch (error) {
      console.error("Reset password error:", error)
      return {
        success: false,
        error: "An unexpected error occurred while resetting password",
      }
    }
  }, [])

  /**
   * Check API health
   */
  const checkApiHealth = useCallback(async () => {
    return await apiClient.healthCheck()
  }, [])

  const value = {
    // State
    user,
    isLoading,
    isInitialized,
    isAuthenticated: !!user,

    // Actions
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshUserData,
    changePassword,
    forgotPassword,
    resetPassword,
    checkApiHealth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
