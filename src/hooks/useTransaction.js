import { useCallback, useEffect, useState } from "react"
import { useDatabase } from "../database/providers/DatabaseProvider"
import { Logger } from "../utility/logger"

export const useTransaction = () => {
  const { dbService } = useDatabase()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [transactions, setTransactions] = useState([])
  useEffect(() => {
    getTransactions()
  }, [dbService])

  const getTransactions = useCallback(
    async (options) => {
      setLoading(true)
      setError(null)
      try {
        const result = await dbService.transactions.getTransactions(options)
        Logger.debug(
          "Fetched transactions:(useTxnHook)",
          result.data.transactions
        )
        setTransactions(result.data.transactions || [])
        return result
      } catch (err) {
        setError(err.message)
        Logger.error("Error fetching transactions:", err)
        return { success: false, error: err.message }
      } finally {
        setLoading(false)
      }
    },
    [dbService]
  )

  const findAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await dbService.transactions.findAll()
      return result
    } catch (err) {
      setError(err.message)
      Logger.error("Error fetching all transactions:", err)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [dbService])

  const createTransaction = useCallback(
    async (transactionData) => {
      setLoading(true)
      setError(null)
      try {
        const result = await dbService.transactions.createTransaction(
          transactionData
        )
        return result
      } catch (err) {
        setError(err.message)
        Logger.error("Error creating transaction:", err)
        return { success: false, error: err.message }
      } finally {
        setLoading(false)
      }
    },
    [dbService]
  )

  const getTransactionById = useCallback(
    async (id) => {
      setLoading(true)
      setError(null)
      try {
        const result = await dbService.transactions.getTransactionById(id)
        return result
      } catch (err) {
        setError(err.message)
        Logger.error(`Error fetching transaction with id ${id}:`, err)
        return { success: false, error: err.message }
      } finally {
        setLoading(false)
      }
    },
    [dbService]
  )

  const updateTransaction = useCallback(
    async (id, updateData) => {
      setLoading(true)
      setError(null)
      try {
        const result = await dbService.transactions.updateTransaction(
          id,
          updateData
        )
        return result
      } catch (err) {
        setError(err.message)
        Logger.error(`Error updating transaction with id ${id}:`, err)
        return { success: false, error: err.message }
      } finally {
        setLoading(false)
      }
    },
    [dbService]
  )

  const deleteTransaction = useCallback(
    async (id) => {
      setLoading(true)
      setError(null)
      try {
        const result = await dbService.transactions.deleteTransaction(id)
        return result
      } catch (err) {
        setError(err.message)
        Logger.error(`Error deleting transaction with id ${id}:`, err)
        return { success: false, error: err.message }
      } finally {
        setLoading(false)
      }
    },
    [dbService]
  )

  return {
    //state
    loading,
    error,
    transactions,
    //actions
    getTransactions,
    createTransaction,
    updateTransaction,
    findAll,
    getTransactionById,
    deleteTransaction,
  }
}
