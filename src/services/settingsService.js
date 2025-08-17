// services/settingsService.js
import axios from "axios"
import * as SecureStore from "expo-secure-store"
import { baseUrl } from "../utility/constant"
class SettingsService {
  constructor() {
    this.api = axios.create({
      baseURL: baseUrl + "/settings",
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    })

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        try {
          const token = await SecureStore.getItemAsync("authToken")
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
  }

  // Delete account
  async deleteAccount(reason) {
    try {
      const response = await this.api.delete("/account", {
        data: { reason },
      })
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Delete account error:", error)
      return {
        success: false,
        error: error.response?.data?.message || "Failed to delete account",
        details: error.response?.data,
      }
    }
  }

  // Request data export (for future implementation)
  async requestDataExport(type, format) {
    try {
      // This will be implemented when backend is ready
      return {
        success: false,
        error: "Export feature coming soon!",
      }
    } catch (error) {
      return {
        success: false,
        error: "Export feature not available yet",
      }
    }
  }

  // Clear all local data
  async clearLocalData() {
    try {
      await SecureStore.deleteItemAsync("authToken")
      await SecureStore.deleteItemAsync("userProfile")
      await SecureStore.deleteItemAsync("userSettings")
      // Add any other keys you store locally
      return { success: true }
    } catch (error) {
      console.error("Clear local data error:", error)
      return {
        success: false,
        error: "Failed to clear local data",
      }
    }
  }
}

const settingsService = new SettingsService()
export default settingsService
