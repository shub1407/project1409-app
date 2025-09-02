// contexts/AccountsContext.jsx
import { createContext, useContext, useEffect, useState } from "react"
import { useDatabase } from "../database/providers/DatabaseProvider"
import { accountService } from "../services/accountService"
import { Logger } from "../utility/logger"
const AccountsContext = createContext()
export const AccountsProvider = ({ children }) => {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { dbService } = useDatabase()

  const loadAccounts = async () => {
    setLoading(true)
    try {
      //const result = await accountService.getAccounts()
      const result = await dbService.accounts.findAll()
      Logger.info("Db result is:: ", result)

      const transformedAccounts = result.data.map((account) => ({
        id: account.id,
        name: account.name,
        balance: account.balance,
        type: account.type,
        color: account.color,
        icon: account.icon,
        initialBalance: account.initialBalance,
        createdAt: account.createdAt,
        order: account.order_index || 0, // Add order field
      }))

      // Sort accounts by order
      const sortedAccounts = transformedAccounts.sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order
        }
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
      })

      setAccounts(sortedAccounts)
    } catch (error) {
      console.error("Error loading accounts:", error)
      setError("Failed to load accounts. Please try again later.", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAccounts()
  }, [])

  const refreshAccounts = () => loadAccounts()

  // Delete account
  const deleteAccount = async (accountId) => {
    try {
      //const result = await accountService.deleteAccount(accountId)
      const result = await dbService.accounts.delete(accountId)

      if (result.success) {
        // Remove from local state
        return { success: true }
      } else {
        throw new Error(result.error || "Failed to delete account")
      }
    } catch (error) {
      console.error("Error deleting account:", error)
      throw error
    }
  }

  // Create new account
  const createAccount = async (accountData) => {
    console.log("Account data:: in auth Context: ", accountData)
    try {
      //const result = await accountService.createAccount(accountData)
      const result = await dbService.accounts.create(accountData)
      // Logger.info("Db result is::(creation) ", dbResult)

      if (result.success) {
        // Refresh accounts to get the updated list
        await loadAccounts()
        return { success: true, data: result.data }
      } else {
        throw new Error(result.error || "Failed to create account")
      }
    } catch (error) {
      console.error("Error creating account:", error)
      throw error
    }
  }

  // Update existing account
  const updateAccount = async (accountId, accountData) => {
    try {
      //const result = await accountService.updateAccount(accountId, accountData)
      const result = await dbService.accounts.update(accountId, accountData)
      Logger.info("Db result is::(update) ", result)

      if (result.success) {
        // Update local state
        setAccounts((prev) =>
          prev.map((account) =>
            account.id === accountId ? { ...account, ...accountData } : account
          )
        )
        return { success: true, data: result.data }
      } else {
        throw new Error(result.error || "Failed to update account")
      }
    } catch (error) {
      console.error("Error updating account:", error)
      throw error
    }
  }
  // Update account order

  const updateAccountOrder = async (orderedAccounts) => {
    try {
      // Prepare data for bulk update
      const accountsData = orderedAccounts.map((account, index) => ({
        id: account.id,
        order: index,
      }))

      // Use bulk update
      const result = await accountService.updateAccountsOrder(accountsData)

      if (result.success) {
        // Update local state with new order
        const updatedAccounts = orderedAccounts.map((account, index) => ({
          ...account,
          order: index,
        }))
        setAccounts(updatedAccounts)
        return { success: true }
      } else {
        throw new Error(result.error || "Failed to update account order")
      }
    } catch (error) {
      console.error("Error updating account order:", error)
      throw error
    }
  }

  return (
    <AccountsContext.Provider
      value={{
        accounts,
        loading,
        refreshAccounts,
        error,
        updateAccountOrder, // Add this
        deleteAccount, // Add this
        createAccount, // Add this
        updateAccount, // Add this
      }}
    >
      {children}
    </AccountsContext.Provider>
  )
}

export const useAccountsContext = () => {
  const context = useContext(AccountsContext)
  if (!context) {
    throw new Error("useAccountsContext must be used within AccountsProvider")
  }
  return context
}
