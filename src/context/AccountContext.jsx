// contexts/AccountsContext.jsx
import { createContext, useContext, useEffect, useState } from "react"
import { accountService } from "../services/accountService"

const AccountsContext = createContext()

export const AccountsProvider = ({ children }) => {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadAccounts = async () => {
    setLoading(true)
    try {
      const result = await accountService.getAccounts()
      if (result.success) {
        const transformedAccounts = result.data.accounts.map((account) => ({
          id: account._id,
          name: account.name,
          balance: account.balance,
          type: account.type,
          color: account.color,
          icon: account.icon,
          initialBalance: account.intitialBalance,
          createdAt: account.createdAt,
        }))

        setAccounts(transformedAccounts)
      }
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

  return (
    <AccountsContext.Provider
      value={{
        accounts,
        loading,
        refreshAccounts,
        error,
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
