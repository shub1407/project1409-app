// services/accountService.js
import { ENDPOINTS } from "../../constants/api"
import apiClient from "./apiClient"

class AccountService {
  async createAccount(accountData) {
    try {
      console.log("account balance::", accountData.balance)

      if (!accountData.name || !accountData.type) {
        return {
          success: false,
          error: "Name, type, and balance are required fields.",
        }
      }

      return await apiClient.post(ENDPOINTS.ACCOUNTS.BASE, accountData)
    } catch (error) {
      console.error("Create account error:", error)
      return {
        success: false,
        error: error.message || "Failed to create account",
      }
    }
  }

  async getAccounts() {
    try {
      return await apiClient.get(ENDPOINTS.ACCOUNTS.BASE)
    } catch (error) {
      console.error("Get accounts error:", error)
      return {
        success: false,
        error: error.message || "Failed to fetch accounts",
      }
    }
  }

  async deleteAccount(accountId) {
    try {
      return await apiClient.delete(ENDPOINTS.ACCOUNTS.BY_ID(accountId))
    } catch (error) {
      console.error("Delete account error:", error)
      return {
        success: false,
        error: error.message || "Failed to delete account",
      }
    }
  }

  async updateAccountsOrder(accountsData) {
    try {
      console.log("Updating account order with data:", accountsData)

      const result = await apiClient.put(ENDPOINTS.ACCOUNTS.REORDER, {
        accounts: accountsData,
      })

      console.log("Response from updateAccountsOrder:", result.data)
      return result
    } catch (error) {
      console.error("Update accounts order error:", error)
      return {
        success: false,
        error: error.message || "Failed to update accounts order",
      }
    }
  }

  async updateAccountOrder(accountId, order) {
    try {
      return await apiClient.put(ENDPOINTS.ACCOUNTS.ORDER(accountId), { order })
    } catch (error) {
      console.error("Update account order error:", error)
      return {
        success: false,
        error: error.message || "Failed to update account order",
      }
    }
  }

  async updateAccount(accountId, accountData) {
    try {
      return await apiClient.put(
        ENDPOINTS.ACCOUNTS.BY_ID(accountId),
        accountData
      )
    } catch (error) {
      console.error("Update account error:", error)
      return {
        success: false,
        error: error.message || "Failed to update account",
      }
    }
  }
}

export default new AccountService()
