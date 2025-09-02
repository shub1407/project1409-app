// services/scheduledTransactionService.js
import { ENDPOINTS } from "../../constants/api"
import apiClient from "./apiClient"

class ScheduledTransactionService {
  async create(data) {
    try {
      return await apiClient.post(ENDPOINTS.SCHEDULED_TRANSACTIONS.BASE, data)
    } catch (error) {
      console.error("Create scheduled transaction error:", error)
      return {
        success: false,
        error: error.message || "Failed to create scheduled transaction",
      }
    }
  }

  async getAll(params = {}) {
    try {
      return await apiClient.get(ENDPOINTS.SCHEDULED_TRANSACTIONS.BASE, {
        params,
      })
    } catch (error) {
      console.error("Get scheduled transactions error:", error)
      return {
        success: false,
        error: error.message || "Failed to fetch scheduled transactions",
      }
    }
  }

  async getById(id) {
    try {
      return await apiClient.get(ENDPOINTS.SCHEDULED_TRANSACTIONS.BY_ID(id))
    } catch (error) {
      console.error("Get scheduled transaction by ID error:", error)
      return {
        success: false,
        error: error.message || "Failed to fetch scheduled transaction",
      }
    }
  }

  async update(id, data) {
    try {
      return await apiClient.put(
        ENDPOINTS.SCHEDULED_TRANSACTIONS.BY_ID(id),
        data
      )
    } catch (error) {
      console.error("Update scheduled transaction error:", error)
      return {
        success: false,
        error: error.message || "Failed to update scheduled transaction",
      }
    }
  }

  async toggleStatus(id) {
    try {
      return await apiClient.patch(ENDPOINTS.SCHEDULED_TRANSACTIONS.TOGGLE(id))
    } catch (error) {
      console.error("Toggle scheduled transaction status error:", error)
      return {
        success: false,
        error: error.message || "Failed to toggle scheduled transaction status",
      }
    }
  }

  async delete(id) {
    try {
      return await apiClient.delete(ENDPOINTS.SCHEDULED_TRANSACTIONS.BY_ID(id))
    } catch (error) {
      console.error("Delete scheduled transaction error:", error)
      return {
        success: false,
        error: error.message || "Failed to delete scheduled transaction",
      }
    }
  }

  async getStats() {
    try {
      return await apiClient.get(ENDPOINTS.SCHEDULED_TRANSACTIONS.STATS)
    } catch (error) {
      console.error("Get scheduled transaction stats error:", error)
      return {
        success: false,
        error: error.message || "Failed to fetch scheduled transaction stats",
      }
    }
  }

  async confirmTransaction(id, confirmData) {
    try {
      return await apiClient.post(
        ENDPOINTS.SCHEDULED_TRANSACTIONS.CONFIRM(id),
        confirmData
      )
    } catch (error) {
      console.error("Confirm scheduled transaction error:", error)
      return {
        success: false,
        error: error.message || "Failed to confirm scheduled transaction",
      }
    }
  }

  async getBalancePreview(id) {
    try {
      return await apiClient.get(
        ENDPOINTS.SCHEDULED_TRANSACTIONS.BALANCE_PREVIEW(id)
      )
    } catch (error) {
      console.error("Get balance preview error:", error)
      return {
        success: false,
        error: error.message || "Failed to get balance preview",
      }
    }
  }

  async getUpcoming(days = 30) {
    try {
      return await apiClient.get(
        `${ENDPOINTS.SCHEDULED_TRANSACTIONS.UPCOMING}?days=${days}`
      )
    } catch (error) {
      console.error("Get upcoming scheduled transactions error:", error)
      return {
        success: false,
        error:
          error.message || "Failed to fetch upcoming scheduled transactions",
      }
    }
  }

  async getOverdue() {
    try {
      return await apiClient.get(ENDPOINTS.SCHEDULED_TRANSACTIONS.OVERDUE)
    } catch (error) {
      console.error("Get overdue scheduled transactions error:", error)
      return {
        success: false,
        error:
          error.message || "Failed to fetch overdue scheduled transactions",
      }
    }
  }

  async executeDue() {
    try {
      return await apiClient.post(ENDPOINTS.SCHEDULED_TRANSACTIONS.EXECUTE)
    } catch (error) {
      console.error("Execute due scheduled transactions error:", error)
      return {
        success: false,
        error: error.message || "Failed to execute due scheduled transactions",
      }
    }
  }
}

export default new ScheduledTransactionService()
