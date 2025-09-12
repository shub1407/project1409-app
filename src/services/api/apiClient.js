// services/api/apiClient.js
import NetInfo from "@react-native-community/netinfo"
import axios from "axios"
import * as SecureStore from "expo-secure-store"
import { API_CONFIG, ENDPOINTS, STORAGE_KEYS } from "../../constants/api"

class ApiClient {
  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })

    this.isRefreshing = false
    this.failedQueue = []
    this.retryCount = 0
    this.maxRetries = API_CONFIG.RETRY_ATTEMPTS

    // Define public endpoints that don't need authentication
    this.publicEndpoints = [
      ENDPOINTS.AUTH.LOGIN,
      ENDPOINTS.AUTH.REGISTER,
      ENDPOINTS.AUTH.GOOGLE_LOGIN,
      ENDPOINTS.AUTH.FORGOT_PASSWORD,
      ENDPOINTS.AUTH.RESET_PASSWORD,
      "/health",
    ]

    this.setupInterceptors()
  }

  // Check if endpoint is public (doesn't need auth)
  isPublicEndpoint(url) {
    return this.publicEndpoints.some(
      (endpoint) => url.includes(endpoint) || url.endsWith(endpoint)
    )
  }

  setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      async (config) => {
        // Check network connectivity
        const netInfo = await NetInfo.fetch()
        if (!netInfo.isConnected) {
          return Promise.reject(new Error("No internet connection"))
        }

        // Add authentication token only for protected endpoints
        if (!this.isPublicEndpoint(config.url)) {
          const token = await SecureStore.getItemAsync(STORAGE_KEYS.USER_TOKEN)
          if (token) {
            config.headers.Authorization = `Bearer ${token}`
          }
        }

        // Add request timestamp for tracking
        config.metadata = { startTime: new Date() }

        // Log request in development
        if (__DEV__) {
          console.log(
            `🚀 [API Request] ${config.method?.toUpperCase()} ${config.url}`
          )
          console.log("Headers:", config.headers)
          if (config.data) console.log("Data:", config.data)
        }

        return config
      },
      (error) => {
        console.error("❌ Request interceptor error:", error)
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Log response time in development
        if (__DEV__) {
          const duration = new Date() - response.config.metadata.startTime
          console.log(
            `✅ [API Response] ${response.config.method?.toUpperCase()} ${
              response.config.url
            } - ${duration}ms`
          )
        }

        return response
      },
      async (error) => {
        const originalRequest = error.config

        // Handle network errors
        if (!error.response) {
          return Promise.reject({
            type: "NETWORK_ERROR",
            message: "Network error. Please check your internet connection.",
            originalError: error,
          })
        }

        const { status } = error.response

        // Handle 401 Unauthorized - BUT NOT for auth endpoints
        if (
          status === 401 &&
          !originalRequest._retry &&
          !this.isPublicEndpoint(originalRequest.url)
        ) {
          if (this.isRefreshing) {
            return this.addToFailedQueue(originalRequest)
          }

          originalRequest._retry = true
          this.isRefreshing = true

          try {
            const refreshToken = await SecureStore.getItemAsync(
              STORAGE_KEYS.REFRESH_TOKEN
            )
            if (!refreshToken) {
              throw new Error("No refresh token available")
            }

            const response = await this.client.post(ENDPOINTS.AUTH.REFRESH, {
              refreshToken,
            })

            const { tokens } = response.data.data
            const { accessToken: newToken, refreshToken: newRefreshToken } =
              tokens

            await Promise.all([
              SecureStore.setItemAsync(STORAGE_KEYS.USER_TOKEN, newToken),
              SecureStore.setItemAsync(
                STORAGE_KEYS.REFRESH_TOKEN,
                newRefreshToken
              ),
            ])

            this.processQueue(null, newToken)

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            return this.client(originalRequest)
          } catch (refreshError) {
            this.processQueue(refreshError, null)
            await this.clearAuthData()

            // Emit logout event
            this.emit("auth:logout")

            return Promise.reject({
              type: "AUTH_ERROR",
              message: "Session expired. Please login again.",
              originalError: refreshError,
            })
          } finally {
            this.isRefreshing = false
          }
        }

        // Handle specific error codes
        const errorMap = {
          400: "Bad request. Please check your input.",
          401: this.isPublicEndpoint(originalRequest.url)
            ? "Invalid credentials"
            : "Unauthorized access",
          403: "Access forbidden. You do not have permission.",
          404: "Resource not found.",
          409: "Conflict. Resource already exists.",
          422: "Validation failed. Please check your input.",
          429: "Too many requests. Please try again later.",
          500: "Internal server error. Please try again later.",
          502: "Bad gateway. Service temporarily unavailable.",
          503: "Service unavailable. Please try again later.",
        }

        const errorMessage =
          error.response.data?.message ||
          errorMap[status] ||
          `HTTP ${status}: An error occurred`

        if (__DEV__) {
          console.error(
            `❌ [API Error] ${originalRequest.method?.toUpperCase()} ${
              originalRequest.url
            }`
          )
          console.error("Status:", status)
          console.error("Message:", errorMessage)
          console.error("Response:", error.response.data)
        }

        return Promise.reject({
          type: "API_ERROR",
          status,
          message: errorMessage,
          data: error.response.data,
          originalError: error,
        })
      }
    )
  }

  // Queue management for concurrent requests during token refresh
  addToFailedQueue(originalRequest) {
    return new Promise((resolve, reject) => {
      this.failedQueue.push({ resolve, reject, originalRequest })
    })
  }

  processQueue(error, token = null) {
    this.failedQueue.forEach(({ resolve, reject, originalRequest }) => {
      if (error) {
        reject(error)
      } else {
        originalRequest.headers.Authorization = `Bearer ${token}`
        resolve(this.client(originalRequest))
      }
    })

    this.failedQueue = []
  }

  // Event emitter for auth events
  emit(event, data) {
    // You can implement a proper event emitter or use a global state manager
    if (typeof window !== "undefined" && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent(event, { detail: data }))
    }
  }

  // Generic request methods with error handling
  async request(config) {
    try {
      const response = await this.client(config)
      return {
        success: true,
        data: response.data,
        status: response.status,
        headers: response.headers,
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  // Method specifically for public endpoints (no auth required)
  async publicRequest(config) {
    const originalHeaders = { ...config.headers }
    // Ensure no Authorization header is added
    if (config.headers) {
      delete config.headers.Authorization
    }

    try {
      const response = await this.client({
        ...config,
        headers: {
          ...originalHeaders,
          Authorization: undefined, // Explicitly remove auth header
        },
      })
      return {
        success: true,
        data: response.data,
        status: response.status,
        headers: response.headers,
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  async get(url, config = {}) {
    if (this.isPublicEndpoint(url)) {
      return this.publicRequest({ method: "GET", url, ...config })
    }
    return this.request({ method: "GET", url, ...config })
  }

  async post(url, data = {}, config = {}) {
    if (this.isPublicEndpoint(url)) {
      return this.publicRequest({ method: "POST", url, data, ...config })
    }
    return this.request({ method: "POST", url, data, ...config })
  }

  async put(url, data = {}, config = {}) {
    if (this.isPublicEndpoint(url)) {
      return this.publicRequest({ method: "PUT", url, data, ...config })
    }
    return this.request({ method: "PUT", url, data, ...config })
  }

  async patch(url, data = {}, config = {}) {
    if (this.isPublicEndpoint(url)) {
      return this.publicRequest({ method: "PATCH", url, data, ...config })
    }
    return this.request({ method: "PATCH", url, data, ...config })
  }

  async delete(url, config = {}) {
    if (this.isPublicEndpoint(url)) {
      return this.publicRequest({ method: "DELETE", url, ...config })
    }
    return this.request({ method: "DELETE", url, ...config })
  }

  // File upload with progress
  async uploadFile(url, formData, onUploadProgress) {
    return this.request({
      method: "POST",
      url,
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress,
    })
  }

  // Download file with progress
  async downloadFile(url, onDownloadProgress) {
    return this.request({
      method: "GET",
      url,
      responseType: "blob",
      onDownloadProgress,
    })
  }

  // Retry mechanism for failed requests
  async requestWithRetry(config, retries = this.maxRetries) {
    try {
      return await this.request(config)
    } catch (error) {
      if (retries > 0 && this.isRetryableError(error)) {
        console.log(
          `🔄 Retrying request... (${this.maxRetries - retries + 1}/${
            this.maxRetries
          })`
        )
        await this.delay(1000 * (this.maxRetries - retries + 1)) // Exponential backoff
        return this.requestWithRetry(config, retries - 1)
      }
      throw error
    }
  }

  // Check if error is retryable
  isRetryableError(error) {
    if (!error.status) return true // Network errors
    return [408, 429, 500, 502, 503, 504].includes(error.status)
  }

  // Utility delay function
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  // Error handler
  handleError(error) {
    if (error.response) {
      // Server responded with error
      return {
        success: false,
        error: error.message || "Server error occurred",
        status: error.status,
        data: error.data,
        type: error.type || "API_ERROR",
      }
    } else if (error.request) {
      // Request made but no response
      return {
        success: false,
        error: "Network error - no response from server",
        type: "NETWORK_ERROR",
      }
    } else {
      // Something else happened
      return {
        success: false,
        error: error.message || "An unexpected error occurred",
        type: "UNKNOWN_ERROR",
      }
    }
  }

  // Request cancellation
  createCancelToken() {
    return axios.CancelToken.source()
  }

  // Clear authentication data
  async clearAuthData() {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(STORAGE_KEYS.USER_TOKEN).catch(() => {}),
        SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN).catch(() => {}),
        SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA).catch(() => {}),
      ])
    } catch (error) {
      console.warn("Error clearing auth data:", error)
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await this.get("/health")
      return response.success
    } catch (error) {
      return false
    }
  }

  // Set default headers
  setDefaultHeader(key, value) {
    this.client.defaults.headers.common[key] = value
  }

  // Remove default header
  removeDefaultHeader(key) {
    delete this.client.defaults.headers.common[key]
  }

  // Get current configuration
  getConfig() {
    return {
      baseURL: this.client.defaults.baseURL,
      timeout: this.client.defaults.timeout,
      headers: this.client.defaults.headers,
    }
  }

  // Update base configuration
  updateConfig(config) {
    Object.assign(this.client.defaults, config)
  }
}

export default new ApiClient()
