import axios from "axios"
import { baseUrl } from "../utility/constant"
import { getAuthHeaders, handleApiError } from "./apiUtils"
// Helper function to get auth headers

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

  //update account order
  updateAccountsOrder: async (accountsData) => {
    console.log("Updating account order with data:", accountsData)
    const headers = await getAuthHeaders()
    console.log("Headers for updateAccountsOrder:", headers)
    console.log(
      "Base URL for updateAccountsOrder:",
      `${baseUrl}/accounts/reorder/bulk-update-order`
    )
    const response = await axios.put(
      `${baseUrl}/accounts/reorder/bulk-update-order`,
      { accounts: accountsData },
      { headers }
    )
    console.log("Response from updateAccountsOrder:", response.data)
    console.log("Response from updateAccountsOrder:", response.data)
    return {
      success: true,
      data: response.data,
    }
  },

  // Update individual account order (alternative)
  updateAccountOrder: async (accountId, order) => {
    try {
      const headers = await getAuthHeaders()
      const response = await axios.put(
        `${baseUrl}/accounts/${accountId}/order`,
        { order },
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
}
