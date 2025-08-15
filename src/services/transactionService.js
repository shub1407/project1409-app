// services/transactionService.js
import axios from "axios"
import * as SecureStore from "expo-secure-store"
import { baseUrl } from "../utility/constant"

class TransactionService {
  constructor() {
    this.baseURL = `${baseUrl}/transactions`
    this.setupAxiosInterceptors()
  }

  // Setup Axios interceptors for authentication
  setupAxiosInterceptors() {
    // Request interceptor to add auth token
    axios.interceptors.request.use(
      async (config) => {
        try {
          const token = await SecureStore.getItemAsync("userToken")
          if (token) {
            config.headers.Authorization = `Bearer ${token}`
          }
        } catch (error) {
          console.error("Error retrieving auth token:", error)
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor for error handling
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid, clear it
          await SecureStore.deleteItemAsync("userToken")
          // You might want to redirect to login screen here
        }
        return Promise.reject(error)
      }
    )
  }

  // Helper method to handle axios errors
  handleAxiosError(error) {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || "Server error occurred"
      throw new Error(message)
    } else if (error.request) {
      // Request made but no response received
      throw new Error("Network error - please check your connection")
    } else {
      // Something else happened
      throw new Error(error.message || "An unexpected error occurred")
    }
  }

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

      const params = {
        page,
        limit,
      }

      if (type) params.type = type
      if (category) params.category = category
      if (accountId) params.accountId = accountId
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate

      const response = await axios.get(this.baseURL, { params })
      return response.data
    } catch (error) {
      console.error("Error fetching transactions:", error)
      this.handleAxiosError(error)
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
        throw new Error("Account, type, and amount are required")
      }

      // Validate transaction type
      if (!["income", "expense", "transfer"].includes(type)) {
        throw new Error("Invalid transaction type")
      }

      // For transfers, toAccountId is required
      if (type === "transfer" && !toAccountId) {
        throw new Error("Destination account is required for transfers")
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

      const response = await axios.post(this.baseURL, payload)
      return response.data
    } catch (error) {
      console.error("Error creating transaction:", error)
      this.handleAxiosError(error)
    }
  }

  // Update an existing transaction
  async updateTransaction(transactionId, updateData) {
    try {
      if (!transactionId) {
        throw new Error("Transaction ID is required")
      }

      // Format date if provided
      if (updateData.date) {
        updateData.date = new Date(updateData.date).toISOString()
      }

      // Convert amount to number if provided
      if (updateData.amount) {
        updateData.amount = parseFloat(updateData.amount)
      }

      const response = await axios.put(
        `${this.baseURL}/${transactionId}`,
        updateData
      )
      return {
        data: response.data,
        success: true,
      }
    } catch (error) {
      console.error("Error updating transaction:", error)

      this.handleAxiosError(error)
      return {
        success: false,
      }
    }
  }

  // Delete a transaction
  async deleteTransaction(transactionId) {
    try {
      if (!transactionId) {
        throw new Error("Transaction ID is required")
      }

      const response = await axios.delete(`${this.baseURL}/${transactionId}`)
      return {
        data: response.data,
        success: true,
      }
    } catch (error) {
      console.error("Error deleting transaction:", error)
      this.handleAxiosError(error)
    }
  }

  // Get a specific transaction by ID
  async getTransactionById(transactionId) {
    try {
      if (!transactionId) {
        throw new Error("Transaction ID is required")
      }

      const response = await axios.get(`${this.baseURL}/${transactionId}`)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Error fetching transaction:", error)
      this.handleAxiosError(error)
    }
  }

  // Get transactions by account
  async getTransactionsByAccount(accountId, options = {}) {
    try {
      if (!accountId) {
        throw new Error("Account ID is required")
      }

      const { page = 1, limit = 10 } = options
      const params = { page, limit }

      const response = await axios.get(`${this.baseURL}/account/${accountId}`, {
        params,
      })
      return response.data
    } catch (error) {
      console.error("Error fetching account transactions:", error)
      this.handleAxiosError(error)
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

      const response = await axios.get(`${this.baseURL}/stats`, { params })
      return response.data
    } catch (error) {
      console.error("Error fetching transaction stats:", error)
      this.handleAxiosError(error)
    }
  }

  // Helper method to format transactions for display
  formatTransactionForDisplay(transaction) {
    return {
      ...transaction,
      formattedAmount: this.formatCurrency(transaction.amount),
      formattedDate: this.formatDate(transaction.date),
      typeDisplay: this.getTransactionTypeDisplay(transaction.type),
      typeColor: this.getTransactionTypeColor(transaction.type),
    }
  }

  // Helper method to format currency
  formatCurrency(amount, currency = "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount)
  }

  // Helper method to format date
  formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Helper method to get transaction type display text
  getTransactionTypeDisplay(type) {
    const typeMap = {
      income: "Income",
      expense: "Expense",
      transfer: "Transfer",
    }
    return typeMap[type] || type
  }

  // Helper method to get transaction type color
  getTransactionTypeColor(type) {
    const colorMap = {
      income: "#10B981", // Green
      expense: "#EF4444", // Red
      transfer: "#3B82F6", // Blue
    }
    return colorMap[type] || "#6B7280"
  }

  // Bulk operations
  async createMultipleTransactions(transactions) {
    try {
      const promises = transactions.map((transaction) =>
        this.createTransaction(transaction)
      )
      return Promise.all(promises)
    } catch (error) {
      console.error("Error creating multiple transactions:", error)
      this.handleAxiosError(error)
    }
  }

  // Search transactions
  async searchTransactions(searchTerm, options = {}) {
    try {
      const allTransactions = await this.getTransactions(options)

      if (!searchTerm) return allTransactions

      const filteredTransactions = allTransactions.transactions.filter(
        (transaction) =>
          transaction.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          transaction.note?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.accountId?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      )

      return {
        ...allTransactions,
        transactions: filteredTransactions,
      }
    } catch (error) {
      console.error("Error searching transactions:", error)
      this.handleAxiosError(error)
    }
  }

  // Get transactions for a specific date range (useful with your DatePickerModal)
  async getTransactionsForDateRange(startDate, endDate, options = {}) {
    try {
      return this.getTransactions({
        ...options,
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      })
    } catch (error) {
      console.error("Error fetching transactions for date range:", error)
      this.handleAxiosError(error)
    }
  }

  // Get transactions for today
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
      this.handleAxiosError(error)
    }
  }

  // Get transactions for current month
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
      this.handleAxiosError(error)
    }
  }
}

// Create and export a singleton instance
const transactionService = new TransactionService()
export default transactionService

// Also export the class for testing or multiple instances
export { TransactionService }
