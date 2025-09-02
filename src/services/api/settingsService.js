// services/settingsService.js
import * as SecureStore from "expo-secure-store"
import { ENDPOINTS, STORAGE_KEYS } from "../../constants/api"
import apiClient from "./apiClient"

class SettingsService {
  async deleteAccount(reason) {
    try {
      const result = await apiClient.delete(ENDPOINTS.SETTINGS.ACCOUNT, {
        data: { reason },
      })
      return result
    } catch (error) {
      console.error("Delete account error:", error)
      return {
        success: false,
        error: error.message || "Failed to delete account",
      }
    }
  }

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

  async clearLocalData() {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(STORAGE_KEYS.USER_TOKEN),
        SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
        SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA),
        // Add any other keys you store locally
      ])
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

export default new SettingsService()
