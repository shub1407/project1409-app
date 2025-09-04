// hooks/useScheduledTransaction.js
import { useCallback, useEffect, useMemo, useState } from "react"
import { useDatabase } from "../database/providers/DatabaseProvider"
import { ScheduledTransactionService } from "../services/databse/ScheduledTransactionService"
import { Logger } from "../utility/logger"

export const useScheduledTransaction = () => {
  const { dbService } = useDatabase()
  const [scheduledTransactions, setScheduledTransactions] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    paused: 0,
    completed: 0,
    overdue: 0,
    totalMonthlyIncome: 0,
    totalMonthlyExpenses: 0,
    netMonthlyFlow: 0,
  })

  // Create service instance
  const scheduledTransactionService = useMemo(() => {
    return new ScheduledTransactionService(dbService)
  }, [dbService])

  useEffect(() => {
    if (scheduledTransactionService) {
      getScheduledTransactions()
      getScheduledTransactionStats()
    }
  }, [scheduledTransactionService, dbService])

  const createScheduledTransaction = useCallback(
    async (data) => {
      setLoading(true)
      setError(null)
      try {
        const result =
          await scheduledTransactionService.createScheduledTransaction(data)

        return result
      } catch (err) {
        setError(err.message)
        Logger.error("Error creating scheduled transaction:", err)
        return { success: false, error: err.message }
      } finally {
        setLoading(false)
      }
    },
    [scheduledTransactionService]
  )

  const getScheduledTransactions = useCallback(
    async (options) => {
      setLoading(true)
      setError(null)
      try {
        const result =
          await scheduledTransactionService.getScheduledTransactions(options)
        setScheduledTransactions(result.data.scheduledTransactions)
        return result
      } catch (err) {
        setError(err.message)
        Logger.error("Error fetching scheduled transactions:", err)
        return { success: false, error: err.message }
      } finally {
        setLoading(false)
      }
    },
    [scheduledTransactionService]
  )

  const getScheduledTransactionById = useCallback(
    async (id) => {
      setLoading(true)
      setError(null)
      try {
        const result =
          await scheduledTransactionService.getScheduledTransactionById(id)
        return result
      } catch (err) {
        setError(err.message)
        Logger.error(`Error fetching scheduled transaction with id ${id}:`, err)
        return { success: false, error: err.message }
      } finally {
        setLoading(false)
      }
    },
    [scheduledTransactionService]
  )

  const updateScheduledTransaction = useCallback(
    async (id, data) => {
      setLoading(true)
      setError(null)
      try {
        const result =
          await scheduledTransactionService.updateScheduledTransaction(id, data)
        return result
      } catch (err) {
        setError(err.message)
        Logger.error(`Error updating scheduled transaction with id ${id}:`, err)
        return { success: false, error: err.message }
      } finally {
        setLoading(false)
      }
    },
    [scheduledTransactionService]
  )
  const refreshData = useCallback(async () => {
    getScheduledTransactions()
    getScheduledTransactionStats()
  }, [getScheduledTransactions, getScheduledTransactionStats])

  const toggleScheduledTransactionStatus = useCallback(
    async (id) => {
      setLoading(true)
      setError(null)
      try {
        const result =
          await scheduledTransactionService.toggleScheduledTransactionStatus(id)

        return result
      } catch (err) {
        setError(err.message)
        Logger.error(
          `Error toggling scheduled transaction status with id ${id}:`,
          err
        )
        return { success: false, error: err.message }
      } finally {
        setLoading(false)
      }
    },
    [scheduledTransactionService]
  )

  const deleteScheduledTransaction = useCallback(
    async (id) => {
      setLoading(true)
      setError(null)
      try {
        const result =
          await scheduledTransactionService.deleteScheduledTransaction(id)
        return result
      } catch (err) {
        setError(err.message)
        Logger.error(`Error deleting scheduled transaction with id ${id}:`, err)

        return { success: false, error: err.message }
      } finally {
        setLoading(false)
      }
    },
    [scheduledTransactionService]
  )

  const getScheduledTransactionStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result =
        await scheduledTransactionService.getScheduledTransactionStats()
      setStats(result.data)
    } catch (err) {
      setError(err.message)
      Logger.error("Error fetching scheduled transaction stats:", err)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [scheduledTransactionService])

  const getUpcomingScheduledTransactions = useCallback(
    async (days) => {
      setLoading(true)
      setError(null)
      try {
        const result =
          await scheduledTransactionService.getUpcomingScheduledTransactions(
            days
          )
        return result
      } catch (err) {
        setError(err.message)
        Logger.error("Error fetching upcoming scheduled transactions:", err)
        return { success: false, error: err.message }
      } finally {
        setLoading(false)
      }
    },
    [scheduledTransactionService]
  )

  const getOverdueScheduledTransactions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result =
        await scheduledTransactionService.getOverdueScheduledTransactions()
      return result
    } catch (err) {
      setError(err.message)
      Logger.error("Error fetching overdue scheduled transactions:", err)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [scheduledTransactionService])

  const getAccountBalanceAfterTransaction = useCallback(
    async (id) => {
      setLoading(true)
      setError(null)
      try {
        const result =
          await scheduledTransactionService.getAccountBalanceAfterTransaction(
            id
          )
        return result
      } catch (err) {
        setError(err.message)
        Logger.error(`Error calculating balance preview for id ${id}:`, err)
        return { success: false, error: err.message }
      } finally {
        setLoading(false)
      }
    },
    [scheduledTransactionService]
  )

  const confirmScheduledTransaction = useCallback(
    async (id, confirmData = {}) => {
      setLoading(true)
      setError(null)
      try {
        const result =
          await scheduledTransactionService.confirmScheduledTransaction(
            id,
            confirmData
          )
        return result
      } catch (err) {
        setError(err.message)
        Logger.error(
          `Error confirming scheduled transaction with id ${id}:`,
          err
        )
        return { success: false, error: err.message }
      } finally {
        setLoading(false)
      }
    },
    [scheduledTransactionService]
  )
  const getExecutionHistory = useCallback(
    async (id) => {
      setLoading(true)
      setError(null)
      try {
        const result = await scheduledTransactionService.getExecutionHistory(id)
        return result
      } catch (err) {
        setError(err.message)
        Logger.error(`Error fetching execution history for id ${id}:`, err)
        return { success: false, error: err.message }
      } finally {
        setLoading(false)
      }
    },
    [scheduledTransactionService]
  )

  return {
    //data
    scheduledTransactions,
    loading,
    error,
    stats,
    //action

    createScheduledTransaction,
    getScheduledTransactions,
    getScheduledTransactionById,
    updateScheduledTransaction,
    toggleScheduledTransactionStatus,
    deleteScheduledTransaction,
    getScheduledTransactionStats,
    getUpcomingScheduledTransactions,
    getOverdueScheduledTransactions,
    getAccountBalanceAfterTransaction,
    confirmScheduledTransaction,
    getExecutionHistory,
    refreshData,
  }
}
