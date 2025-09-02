import { useDatabase } from "../database/providers/DatabaseProvider"

export const useTransaction = () => {
  const { dbService } = useDatabase()

  const getTransactions = async (options) => {
    const result = await dbService.transactions.getTransactions(options)
    return result
  }
  const findAll = async () => {
    const result = await dbService.transactions.findAll()
    return result
  }

  const createTransaction = async (transactionData) => {
    const result = await dbService.transactions.createTransaction(
      transactionData
    )
    return result
  }

  const getTransactionById = async (id) => {
    const result = await dbService.transactions.getTransactionById(id)
    return result
  }

  const updateTransaction = async (id, updateData) => {
    const result = await dbService.transactions.updateTransaction(
      id,
      updateData
    )
    return result
  }
  const deleteTransaction = async (id) => {
    const result = await dbService.transactions.deleteTransaction(id)
    return result
  }

  return {
    getTransactions,
    createTransaction,
    updateTransaction,
    findAll,
    getTransactionById,
    deleteTransaction,
  }
}
