// services/transactionService.js
import { ENDPOINTS } from "../../constants/api"
import apiClient from "./apiClient"

class TransactionService {
  // Get all transactions with filtering and pagination
  async getTransactions(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        type,
        category,
        accountId,
        startDate,
        endDate,
      } = options

      const params = { page, limit }

      if (type) params.type = type
      if (category) params.category = category
      if (accountId) params.accountId = accountId
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate

      const result = await apiClient.get(ENDPOINTS.TRANSACTIONS.BASE, {
        params,
      })
      return result.success ? result.data : result
    } catch (error) {
      console.error("Error fetching transactions:", error)
      return {
        success: false,
        error: error.message || "Failed to fetch transactions",
      }
    }
  }

  // Create a new transaction
  async createTransaction(transactionData) {
    try {
      const {
        accountId,
        toAccountId,
        type,
        categoryId,
        amount,
        description,
        isRecurring = false,
        date,
        note = "",
      } = transactionData

      // Validate required fields
      if (!accountId || !type || !amount) {
        return {
          success: false,
          error: "Account, type, and amount are required",
        }
      }

      // Validate transaction type
      if (!["income", "expense", "transfer"].includes(type)) {
        return {
          success: false,
          error: "Invalid transaction type",
        }
      }

      // For transfers, toAccountId is required
      if (type === "transfer" && !toAccountId) {
        return {
          success: false,
          error: "Destination account is required for transfers",
        }
      }

      // Format date properly
      const formattedDate = date
        ? new Date(date).toISOString()
        : new Date().toISOString()

      const payload = {
        accountId,
        type,
        amount: parseFloat(amount),
        description: description || "",
        isRecurring,
        date: formattedDate,
        note,
      }

      // Add optional fields based on transaction type
      if (type === "transfer") {
        payload.toAccountId = toAccountId
      } else if (categoryId) {
        payload.categoryId = categoryId
      }

      const result = await apiClient.post(ENDPOINTS.TRANSACTIONS.BASE, payload)
      return result
    } catch (error) {
      console.error("Error creating transaction:", error)
      return {
        success: false,
        error: error.message || "Failed to create transaction",
      }
    }
  }

  // Update an existing transaction
  async updateTransaction(transactionId, updateData) {
    try {
      if (!transactionId) {
        return {
          success: false,
          error: "Transaction ID is required",
        }
      }

      // Format date if provided
      if (updateData.date) {
        updateData.date = new Date(updateData.date).toISOString()
      }

      // Convert amount to number if provided
      if (updateData.amount) {
        updateData.amount = parseFloat(updateData.amount)
      }

      return await apiClient.put(
        ENDPOINTS.TRANSACTIONS.BY_ID(transactionId),
        updateData
      )
    } catch (error) {
      console.error("Error updating transaction:", error)
      return {
        success: false,
        error: error.message || "Failed to update transaction",
      }
    }
  }

  // Delete a transaction
  async deleteTransaction(transactionId) {
    try {
      if (!transactionId) {
        return {
          success: false,
          error: "Transaction ID is required",
        }
      }

      return await apiClient.delete(ENDPOINTS.TRANSACTIONS.BY_ID(transactionId))
    } catch (error) {
      console.error("Error deleting transaction:", error)
      return {
        success: false,
        error: error.message || "Failed to delete transaction",
      }
    }
  }

  // Get a specific transaction by ID
  async getTransactionById(transactionId) {
    try {
      if (!transactionId) {
        return {
          success: false,
          error: "Transaction ID is required",
        }
      }

      return await apiClient.get(ENDPOINTS.TRANSACTIONS.BY_ID(transactionId))
    } catch (error) {
      console.error("Error fetching transaction:", error)
      return {
        success: false,
        error: error.message || "Failed to fetch transaction",
      }
    }
  }

  // Get transactions by account
  async getTransactionsByAccount(accountId, options = {}) {
    try {
      if (!accountId) {
        return {
          success: false,
          error: "Account ID is required",
        }
      }

      const { page = 1, limit = 10 } = options
      const params = { page, limit }

      const result = await apiClient.get(
        ENDPOINTS.TRANSACTIONS.BY_ACCOUNT(accountId),
        { params }
      )
      return result.success ? result.data : result
    } catch (error) {
      console.error("Error fetching account transactions:", error)
      return {
        success: false,
        error: error.message || "Failed to fetch account transactions",
      }
    }
  }

  // Get transaction statistics
  async getTransactionStats(dateRange = {}) {
    try {
      const { startDate, endDate } = dateRange
      const params = {}

      if (startDate) {
        params.startDate = new Date(startDate).toISOString()
      }

      if (endDate) {
        params.endDate = new Date(endDate).toISOString()
      }

      const result = await apiClient.get(ENDPOINTS.TRANSACTIONS.STATS, {
        params,
      })
      return result.success ? result.data : result
    } catch (error) {
      console.error("Error fetching transaction stats:", error)
      return {
        success: false,
        error: error.message || "Failed to fetch transaction stats",
      }
    }
  }

  // Helper methods for formatting
  formatTransactionForDisplay(transaction) {
    return {
      ...transaction,
      formattedAmount: this.formatCurrency(transaction.amount),
      formattedDate: this.formatDate(transaction.date),
      typeDisplay: this.getTransactionTypeDisplay(transaction.type),
      typeColor: this.getTransactionTypeColor(transaction.type),
    }
  }

  formatCurrency(amount, currency = "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount)
  }

  formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  getTransactionTypeDisplay(type) {
    const typeMap = {
      income: "Income",
      expense: "Expense",
      transfer: "Transfer",
    }
    return typeMap[type] || type
  }

  getTransactionTypeColor(type) {
    const colorMap = {
      income: "#10B981", // Green
      expense: "#EF4444", // Red
      transfer: "#3B82F6", // Blue
    }
    return colorMap[type] || "#6B7280"
  }

  // Get transactions for date ranges
  async getTransactionsForDateRange(startDate, endDate, options = {}) {
    try {
      return this.getTransactions({
        ...options,
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      })
    } catch (error) {
      console.error("Error fetching transactions for date range:", error)
      return {
        success: false,
        error: error.message || "Failed to fetch transactions for date range",
      }
    }
  }

  // Get today's transactions
  async getTodayTransactions(options = {}) {
    try {
      const today = new Date()
      const startOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      )
      const endOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        23,
        59,
        59,
        999
      )

      return this.getTransactionsForDateRange(startOfDay, endOfDay, options)
    } catch (error) {
      console.error("Error fetching today transactions:", error)
      return {
        success: false,
        error: error.message || "Failed to fetch today's transactions",
      }
    }
  }

  // Get current month's transactions
  async getCurrentMonthTransactions(options = {}) {
    try {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endOfMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      )

      return this.getTransactionsForDateRange(startOfMonth, endOfMonth, options)
    } catch (error) {
      console.error("Error fetching current month transactions:", error)
      return {
        success: false,
        error: error.message || "Failed to fetch current month transactions",
      }
    }
  }
}

export default new TransactionService()
export { TransactionService }
