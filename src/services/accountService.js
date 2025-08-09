import axios from "axios"
import * as SecureStore from "expo-secure-store"
import { baseUrl } from "../utility/constant"
import { handleApiError } from "./apiUtils"

// Helper function to get auth headers
const getAuthHeaders = async () => {
  try {
    const token = await SecureStore.getItemAsync("userToken")
    return token ? { Authorization: `Bearer ${token}` } : {}
  } catch (error) {
    console.error("Error getting token:", error)
    return {}
  }
}

export const accountService = {
  // Create new account
  createAccount: async (accountData) => {
    try {
      const headers = await getAuthHeaders()

      if (!accountData.name || !accountData.type || !accountData.balance) {
        return {
          success: false,
          error: "Name, type, and balance are required fields.",
        }
      }
      const response = await axios.post(`${baseUrl}/accounts`, accountData, {
        headers,
      })
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      return handleApiError(error)
    }
  },

  // Get all accounts
  getAccounts: async () => {
    try {
      const headers = await getAuthHeaders()
      const response = await axios.get(`${baseUrl}/accounts`, {
        headers,
      })
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      return handleApiError(error)
    }
  },

  // Update account
  updateAccount: async (accountId, accountData) => {
    try {
      const headers = await getAuthHeaders()
      const response = await axios.put(
        `${baseUrl}/accounts/${accountId}`,
        accountData,
        { headers }
      )
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      return handleApiError(error)
    }
  },

  // Delete account
  deleteAccount: async (accountId) => {
    try {
      const headers = await getAuthHeaders()
      const response = await axios.delete(`${baseUrl}/accounts/${accountId}`, {
        headers,
      })
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      return handleApiError(error)
    }
  },
}
