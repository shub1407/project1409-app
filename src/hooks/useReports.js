// hooks/useReports.js
import { useCallback, useState } from "react"
import { useDatabase } from "../database/providers/DatabaseProvider"
import { Logger } from "../utility/logger"

export const useReports = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const { dbService } = useDatabase()

  const generateSpendingByCategory = useCallback(
    async (startDate, endDate, type = "expense", accountId) => {
      setLoading(true)
      setError(null)

      try {
        const result = await dbService.report.getSpendingByCategory({
          startDate,
          endDate,
          type,
          accountId,
        })
        return result
      } catch (err) {
        setError(err.message)
        Logger.error("Error generating spending by category report:", err)
        return { success: false, error: err.message }
      } finally {
        setLoading(false)
      }
    },
    [dbService]
  )

  const generateMonthlyReport = useCallback(
    async (year, month) => {
      setLoading(true)
      setError(null)

      try {
        const result = await dbService.report.getMonthlyFinancialSummary(
          year,
          month
        )
        return result
      } catch (err) {
        setError(err.message)
        Logger.error("Error generating monthly report:", err)
        return { success: false, error: err.message }
      } finally {
        setLoading(false)
      }
    },
    [dbService]
  )

  const generateIncomeVsExpense = useCallback(
    async (startDate, endDate, groupBy = "month") => {
      setLoading(true)
      setError(null)

      try {
        const result = await dbService.report.getIncomeVsExpenseSummary({
          startDate,
          endDate,
          groupBy,
        })
        return result
      } catch (err) {
        setError(err.message)
        Logger.error("Error generating income vs expense report:", err)
        return { success: false, error: err.message }
      } finally {
        setLoading(false)
      }
    },
    [dbService]
  )

  const generateAccountBalanceTrends = useCallback(
    async (startDate, endDate) => {
      setLoading(true)
      setError(null)

      try {
        const result = await dbService.report.getAccountBalanceTrend({
          startDate,
          endDate,
        })
        return result
      } catch (err) {
        setError(err.message)
        Logger.error("Error generating account balance trend report:", err)
        return { success: false, error: err.message }
      } finally {
        setLoading(false)
      }
    },
    [dbService]
  )
  const generateCashFlowAnalysis = useCallback(
    async ({ startDate, endDate, groupBy, accountId }) => {
      setLoading(true)
      setError(null)

      try {
        const result = await dbService.report.getCashFlowAnalysis({
          startDate,
          endDate,
          groupBy,
          accountId,
        })
        return result
      } catch (err) {
        setError(err.message)
        Logger.error("Error generating cash flow analysis report:", err)
        return { success: false, error: err.message }
      } finally {
        setLoading(false)
      }
    },
    [dbService]
  )
  const getStats = useCallback(
    async (startDate, endDate) => {
      setLoading(true)
      setError(null)
      try {
        const result = await dbService.report.getStats({ startDate, endDate })
        return result
      } catch (err) {
        setError(err.message)
        Logger.error("Error generating stats:", err)
        return { success: false, error: err.message }
      } finally {
        setLoading(false)
      }
    },
    [dbService]
  )

  return {
    loading,
    error,
    generateSpendingByCategory,
    generateAccountBalanceTrends,
    generateMonthlyReport,
    generateIncomeVsExpense,
    generateCashFlowAnalysis,
    getStats,
    // Add other report methods as needed
  }
}
