// services/reportService.js
import { ENDPOINTS } from "../../constants/api"
import apiClient from "./apiClient"

class ReportService {
  async getReportStats(filters = {}) {
    try {
      const queryParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value)
        }
      })

      const url = `${ENDPOINTS.REPORTS.STATS}?${queryParams.toString()}`
      const result = await apiClient.get(url)

      return result.success ? { success: true, data: result.data } : result
    } catch (error) {
      console.error("Get report stats error:", error)
      return {
        success: false,
        error: error.message || "Failed to fetch report stats",
      }
    }
  }

  async getMonthlyComparison(months = 6) {
    try {
      const url = `${ENDPOINTS.REPORTS.MONTHLY_COMPARISON}?months=${months}`
      const result = await apiClient.get(url)

      return result.success ? { success: true, data: result.data } : result
    } catch (error) {
      console.error("Get monthly comparison error:", error)
      return {
        success: false,
        error: error.message || "Failed to fetch monthly comparison",
      }
    }
  }

  async getTopCategories(type = "expense", limit = 10, startDate, endDate) {
    try {
      const params = new URLSearchParams({ type, limit })
      if (startDate) params.append("startDate", startDate)
      if (endDate) params.append("endDate", endDate)

      const url = `${ENDPOINTS.REPORTS.TOP_CATEGORIES}?${params.toString()}`
      const result = await apiClient.get(url)

      return result.success ? { success: true, data: result.data } : result
    } catch (error) {
      console.error("Get top categories error:", error)
      return {
        success: false,
        error: error.message || "Failed to fetch top categories",
      }
    }
  }
}

export default new ReportService()
