import axios from "axios"
import * as SecureStore from "expo-secure-store"
import { baseUrl } from "../utility/constant"
// Base URL for API
const BASE_URL = `${baseUrl}/scheduled-transactions`
const TOKEN_KEY = "userToken"

// Create axios instance
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add request interceptor to include token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      SecureStore.deleteItemAsync(TOKEN_KEY)
      // You can add navigation logic here
    }
    return Promise.reject(error)
  }
)

// API services for scheduled transactions
const ScheduledTransactionService = {
  // Create new scheduled transaction
  create: (data) => apiClient.post("/", data),

  // Get all scheduled transactions with filters
  getAll: (params = {}) => apiClient.get("/", { params }),

  // Get single scheduled transaction by ID
  getById: (id) => apiClient.get(`/${id}`),

  // Update scheduled transaction
  update: (id, data) => apiClient.put(`/${id}`, data),

  // Toggle active/paused status
  toggleStatus: (id) => apiClient.patch(`/${id}/toggle`),

  // Delete scheduled transaction
  delete: (id) => apiClient.delete(`/${id}`),

  // Get statistics
  getStats: () => apiClient.get("/stats"),
  confirmTransaction: (id, confirmData) =>
    apiClient.post(`/${id}/confirm`, confirmData),

  // **NEW** - Get balance preview
  getBalancePreview: (id) => apiClient.get(`/${id}/balance-preview`),

  // **NEW** - Get upcoming transactions
  getUpcoming: (days = 30) => apiClient.get(`/upcoming?days=${days}`),

  // **NEW** - Get overdue transactions
  getOverdue: () => apiClient.get("/overdue"),

  // Admin - Execute due transactions
  executeDue: () => apiClient.post("/execute"),
}

export default ScheduledTransactionService
