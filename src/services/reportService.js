import { apiRequest } from "./apiUtils"

export const reportService = {
  async getReportStats(filters = {}) {
    try {
      const queryParams = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value)
        }
      })

      const response = await apiRequest(
        `/reports/stats?${queryParams.toString()}`
      )
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Get report stats error:", error)
      return { success: false, error: error.message }
    }
  },

  async getMonthlyComparison(months = 6) {
    try {
      const response = await apiRequest(
        `/reports/monthly-comparison?months=${months}`
      )
      // console.log(
      //   "Monthly Comparison Response:",
      //   response.data.monthlyComparison
      // )
      return { success: true, data: response }
    } catch (error) {
      console.error("Get monthly comparison error:", error)
      return { success: false, error: error.message }
    }
  },

  async getTopCategories(type = "expense", limit = 10, startDate, endDate) {
    try {
      const params = new URLSearchParams({ type, limit })
      if (startDate) params.append("startDate", startDate)
      if (endDate) params.append("endDate", endDate)

      const response = await apiRequest(
        `/reports/top-categories?${params.toString()}`
      )
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Get top categories error:", error)
      return { success: false, error: error.message }
    }
  },
}
