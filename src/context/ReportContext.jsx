import { createContext, useCallback, useContext, useState } from "react"
import { reportService } from "../services/reportService"

const ReportsContext = createContext()

export const useReportsContext = () => {
  const context = useContext(ReportsContext)
  if (!context) {
    throw new Error("useReportsContext must be used within a ReportsProvider")
  }
  return context
}

export const ReportsProvider = ({ children }) => {
  const [reportData, setReportData] = useState(null)
  const [monthlyComparison, setMonthlyComparison] = useState(null)
  const [topCategories, setTopCategories] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    groupBy: "month",
    type: "all",
    accountId: "",
    categoryId: "",
  })

  const fetchReportStats = useCallback(
    async (customFilters = {}) => {
      try {
        setLoading(true)
        setError(null)

        const filterParams = { ...filters, ...customFilters }
        const result = await reportService.getReportStats(filterParams)

        if (result.success) {
          setReportData(result.data)
          console.log("Report Stats Data:", result.data)
        } else {
          setError(result.error)
        }
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    },
    [filters]
  )

  const fetchMonthlyComparison = useCallback(async (months = 6) => {
    try {
      const result = await reportService.getMonthlyComparison(months)

      if (result.success) {
        setMonthlyComparison(result.data.monthlyComparison)
      } else {
        setError(result.error)
      }
    } catch (error) {
      setError(error.message)
    }
  }, [])

  const fetchTopCategories = useCallback(
    async (type = "expense", limit = 10) => {
      try {
        const result = await reportService.getTopCategories(
          type,
          limit,
          filters.startDate,
          filters.endDate
        )

        if (result.success) {
          setTopCategories(result.data.topCategories)
          console.log(
            `Top ${type.charAt(0).toUpperCase() + type.slice(1)} Categories:`,
            result.data.topCategories
          )
        } else {
          setError(result.error)
        }
      } catch (error) {
        setError(error.message)
      }
    },
    [filters.startDate, filters.endDate]
  )

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }, [])

  const refreshReportData = useCallback(async () => {
    await Promise.all([
      fetchReportStats(),
      fetchMonthlyComparison(),
      fetchTopCategories("expense"),
      fetchTopCategories("income"),
    ])
  }, [fetchReportStats, fetchMonthlyComparison, fetchTopCategories])

  const value = {
    reportData,
    monthlyComparison,
    topCategories,
    loading,
    error,
    filters,
    updateFilters,
    fetchReportStats,
    fetchMonthlyComparison,
    fetchTopCategories,
    refreshReportData,
  }

  return (
    <ReportsContext.Provider value={value}>{children}</ReportsContext.Provider>
  )
}
