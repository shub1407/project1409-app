// services/authService.js
import * as SecureStore from "expo-secure-store"
import { ENDPOINTS, STORAGE_KEYS } from "../../constants/api"
import apiClient from "./apiClient"

class AuthService {
  /**
   * Login user with email and password
   */
  async login(email, password) {
    try {
      const result = await apiClient.post(ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
      })

      if (result.success) {
        const { token, user, refreshToken } = result.data

        // Store authentication data
        await this.storeAuthData(token, user, refreshToken)

        return {
          success: true,
          user,
          token,
        }
      }

      return result
    } catch (error) {
      console.error("AuthService login error:", error)
      return this.formatError(error)
    }
  }

  /**
   * Register new user
   */
  async register(userData) {
    try {
      const result = await apiClient.post(ENDPOINTS.AUTH.REGISTER, userData)

      if (result.success) {
        const { token, user, refreshToken } = result.data
        await this.storeAuthData(token, user, refreshToken)

        return {
          success: true,
          user,
          token,
        }
      }

      return result
    } catch (error) {
      console.error("AuthService register error:", error)
      return this.formatError(error)
    }
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      // Attempt to call logout endpoint (optional)
      await apiClient.post(ENDPOINTS.AUTH.LOGOUT)
    } catch (error) {
      console.warn("Logout API call failed:", error)
    } finally {
      // Always clear local data regardless of API call result
      await apiClient.clearAuthData()
    }
  }

  /**
   * Forgot password
   */
  async forgotPassword(email) {
    try {
      return await apiClient.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email })
    } catch (error) {
      console.error("AuthService forgotPassword error:", error)
      return this.formatError(error)
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token, newPassword) {
    try {
      return await apiClient.post(ENDPOINTS.AUTH.RESET_PASSWORD, {
        token,
        password: newPassword,
      })
    } catch (error) {
      console.error("AuthService resetPassword error:", error)
      return this.formatError(error)
    }
  }

  /**
   * Change password for authenticated user
   */
  async changePassword(currentPassword, newPassword) {
    try {
      return await apiClient.put(ENDPOINTS.AUTH.CHANGE_PASSWORD, {
        currentPassword,
        newPassword,
      })
    } catch (error) {
      console.error("AuthService changePassword error:", error)
      return this.formatError(error)
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userData) {
    try {
      const result = await apiClient.put(
        ENDPOINTS.USER.UPDATE_PROFILE,
        userData
      )

      if (result.success) {
        // Update stored user data
        const currentUserData = await this.getStoredUserData()
        const updatedUserData = { ...currentUserData, ...result.data.user }

        await SecureStore.setItemAsync(
          STORAGE_KEYS.USER_DATA,
          JSON.stringify(updatedUserData)
        )

        return {
          success: true,
          user: updatedUserData,
        }
      }

      return result
    } catch (error) {
      console.error("AuthService updateProfile error:", error)
      return this.formatError(error)
    }
  }

  /**
   * Get stored authentication data
   */
  async getStoredAuthData() {
    try {
      const [token, userData, refreshToken] = await Promise.all([
        SecureStore.getItemAsync(STORAGE_KEYS.USER_TOKEN),
        SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA),
        SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
      ])

      if (token && userData) {
        return {
          token,
          user: JSON.parse(userData),
          refreshToken,
        }
      }

      return null
    } catch (error) {
      console.error("Error retrieving stored auth data:", error)
      // Clear potentially corrupted data
      await apiClient.clearAuthData()
      return null
    }
  }

  /**
   * Get stored user data only
   */
  async getStoredUserData() {
    try {
      const userData = await SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA)
      return userData ? JSON.parse(userData) : null
    } catch (error) {
      console.error("Error retrieving user data:", error)
      return null
    }
  }

  /**
   * Get stored token only
   */
  async getStoredToken() {
    try {
      return await SecureStore.getItemAsync(STORAGE_KEYS.USER_TOKEN)
    } catch (error) {
      console.error("Error retrieving token:", error)
      return null
    }
  }

  /**
   * Store authentication data securely
   */
  async storeAuthData(token, user, refreshToken = null) {
    try {
      const promises = [
        SecureStore.setItemAsync(STORAGE_KEYS.USER_TOKEN, token),
        SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(user)),
      ]

      if (refreshToken) {
        promises.push(
          SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
        )
      }

      await Promise.all(promises)
    } catch (error) {
      console.error("Error storing auth data:", error)
      throw error
    }
  }

  /**
   * Check if user is authenticated (has valid token)
   */
  async isAuthenticated() {
    const token = await this.getStoredToken()
    return !!token
  }

  /**
   * Validate token (optional - if your API has a validation endpoint)
   */
  async validateToken() {
    try {
      const result = await apiClient.get(ENDPOINTS.AUTH.VALIDATE)
      return result.success
    } catch (error) {
      return false
    }
  }

  /**
   * Format error responses consistently
   */
  formatError(error) {
    // If it's already a formatted error from apiClient, return as is
    if (error && typeof error === "object" && "success" in error) {
      return error
    }

    // Handle raw axios errors or other errors
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
      type: error.type || "UNKNOWN_ERROR",
    }
  }
}

export default new AuthService()
