// services/authService.js
import {
  GoogleSignin,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin"
import * as SecureStore from "expo-secure-store"
import { ENDPOINTS, STORAGE_KEYS } from "../../constants/api"
import { Logger } from "../../utility/logger"
import apiClient from "./apiClient"
class AuthService {
  constructor() {
    this.initializeGoogleSignIn()
  }

  /**
   * Initialize Google Sign-In configuration
   */
  initializeGoogleSignIn() {
    const webClientId =
      "622393446179-mv5r7kksekdgbb3lt063kh0do5ebvfea.apps.googleusercontent.com"
    console.log("Initializing Google Sign-In with Web Client ID:", webClientId)
    // Replace with your actual Web Client ID
    GoogleSignin.configure({
      webClientId: webClientId,
      offlineAccess: true,
      hostedDomain: "", // Optional
      forceCodeForRefreshToken: true,
      profileImageSize: 120,
    })
  }
  /**
   * Sign in with Google
   */
  async signInWithGoogle() {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })
      const userInfo = await GoogleSignin.signIn()
      if (isSuccessResponse(userInfo)) {
        console.log("Google sign-in user info:", userInfo)

        // Send Google token to your backend for verification
        let result = await apiClient.post(ENDPOINTS.AUTH.GOOGLE_LOGIN, {
          idToken: userInfo.data.idToken,
          accessToken: userInfo.data.serverAuthCode,
          user: userInfo.data.user,
        })

        result = result.data

        if (result?.success) {
          const { tokens, user } = result.data
          const token = tokens.accessToken
          const refreshToken = tokens.refreshToken

          // Store authentication data
          await this.storeAuthData(token, user, refreshToken)

          return {
            success: true,
            user,
            token,
          }
        }

        return result
      } else {
        // sign in was cancelled by user
      }
    } catch (error) {
      console.error("Google Sign-In Error Details:", error)

      // Enhanced error handling
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        return {
          success: false,
          error: "Sign in was cancelled",
          type: "SIGN_IN_CANCELLED",
        }
      } else if (error.code === statusCodes.IN_PROGRESS) {
        return {
          success: false,
          error: "Sign in is already in progress",
          type: "IN_PROGRESS",
        }
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        return {
          success: false,
          error: "Google Play Services not available",
          type: "PLAY_SERVICES_NOT_AVAILABLE",
        }
      } else if (error.code === statusCodes.DEVELOPER_ERROR) {
        return {
          success: false,
          error: "Configuration error - check SHA-1 fingerprint and Client ID",
          type: "DEVELOPER_ERROR",
        }
      }

      return {
        success: false,
        error: error.message || "Google sign in failed",
        type: "NETWORK_ERROR",
      }
    }
  }

  /**
   * Check if user is signed in with Google
   */
  async isGoogleSignedIn() {
    try {
      const hasSignedInBefore = await GoogleSignin.hasPreviousSignIn()
      if (!hasSignedInBefore) return false

      const userInfo = await GoogleSignin.getCurrentUser()
      return !!userInfo
    } catch (error) {
      console.error("Error checking Google sign-in status:", error)
      return false
    }
  }

  /**
   * Get current Google user info
   */
  async getCurrentGoogleUser() {
    try {
      return await GoogleSignin.getCurrentUser()
    } catch (error) {
      console.error("Error getting current Google user:", error)
      return null
    }
  }

  /**
   * Sign out from Google
   */
  async signOutFromGoogle() {
    try {
      await GoogleSignin.signOut()
    } catch (error) {
      console.error("Error signing out from Google:", error)
    }
  }

  /**
   * Login user with email and password
   */

  async login(email, password) {
    try {
      let result = await apiClient.post(ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
      })
      Logger.debug("[authService] Login API result:", result)
      console.log("Result of login:: ", result?.data)
      if (result.success) {
        const { tokens, user } = result.data.data
        const token = tokens.accessToken
        const refreshToken = tokens.refreshToken

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
      let result = await apiClient.post(ENDPOINTS.AUTH.REGISTER, userData)
      Logger.debug("[authService] Register API result:", result?.data.data)

      if (result.success) {
        const { tokens, user } = result.data.data
        await this.storeAuthData(tokens.accessToken, user, tokens.refreshToken)

        return {
          success: true,
          user,
          tokens,
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

      // Sign out from Google if user was signed in
      const isGoogleSignedIn = await this.isGoogleSignedIn()
      if (isGoogleSignedIn) {
        await this.signOutFromGoogle()
      }
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
    console.log("Storing auth data:: ", { token, user, refreshToken })
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
