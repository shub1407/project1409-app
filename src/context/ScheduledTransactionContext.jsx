import { createContext, useContext, useEffect, useState } from "react"
import ScheduledTransactionService from "../services/ScheduledTransactionService"

const ScheduledTransactionContext = createContext()

export const useScheduledTransactionContext = () => {
  const context = useContext(ScheduledTransactionContext)
  if (!context) {
    throw new Error(
      "useScheduledTransactionContext must be used within ScheduledTransactionProvider"
    )
  }
  return context
}

export const ScheduledTransactionProvider = ({ children }) => {
  const [scheduledTransactions, setScheduledTransactions] = useState([])
  const [loading, setLoading] = useState(false)
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

  // Fetch scheduled transactions
  const fetchScheduledTransactions = async (filters = {}) => {
    try {
      setLoading(true)
      const response = await ScheduledTransactionService.getAll(filters)
      if (response.data.success) {
        setScheduledTransactions(response.data.data.scheduledTransactions)
      }
    } catch (error) {
      console.error("Error fetching scheduled transactions:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await ScheduledTransactionService.getStats()
      if (response.data.success) {
        setStats(response.data.data.stats)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  // Create scheduled transaction
  const createScheduledTransaction = async (data) => {
    try {
      setLoading(true)
      const response = await ScheduledTransactionService.create(data)
      if (response.data.success) {
        await fetchScheduledTransactions()
        await fetchStats()
        return response.data.data.scheduledTransaction
      }
    } catch (error) {
      console.error("Error creating scheduled transaction:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Update scheduled transaction
  const updateScheduledTransaction = async (id, data) => {
    try {
      setLoading(true)
      const response = await ScheduledTransactionService.update(id, data)
      if (response.data.success) {
        await fetchScheduledTransactions()
        await fetchStats()
        return response.data.data.scheduledTransaction
      }
    } catch (error) {
      console.error("Error updating scheduled transaction:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Toggle status
  const toggleTransactionStatus = async (id) => {
    try {
      const response = await ScheduledTransactionService.toggleStatus(id)
      if (response.data.success) {
        await fetchScheduledTransactions()
        await fetchStats()
        return response.data.data.scheduledTransaction
      }
    } catch (error) {
      console.error("Error toggling transaction status:", error)
      throw error
    }
  }

  // Delete scheduled transaction
  const deleteScheduledTransaction = async (id) => {
    try {
      await ScheduledTransactionService.delete(id)
      await fetchScheduledTransactions()
      await fetchStats()
    } catch (error) {
      console.error("Error deleting scheduled transaction:", error)
      throw error
    }
  }
  const confirmScheduledTransaction = async (id) => {
    try {
      const response = await ScheduledTransactionService.confirmTransaction(id)
      if (response.data.success) {
        await fetchScheduledTransactions()
        await fetchStats()
        return response.data.data.scheduledTransaction
      }
    } catch (error) {
      console.error("Error confirming scheduled transaction:", error)
      throw error
    }
  }

  useEffect(() => {
    fetchScheduledTransactions()
    fetchStats()
  }, [])

  const value = {
    scheduledTransactions,
    loading,
    stats,
    fetchScheduledTransactions,
    createScheduledTransaction,
    updateScheduledTransaction,
    toggleTransactionStatus,
    deleteScheduledTransaction,
    confirmScheduledTransaction,
    refreshData: () => {
      fetchScheduledTransactions()
      fetchStats()
    },
  }

  return (
    <ScheduledTransactionContext.Provider value={value}>
      {children}
    </ScheduledTransactionContext.Provider>
  )
}
