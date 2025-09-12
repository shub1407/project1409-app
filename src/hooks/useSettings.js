import { useCallback, useState } from "react"
import { useDatabase } from "../database/providers/DatabaseProvider"
import { Logger } from "../utility/logger"
import { Result } from "../utility/Result"
export const useSettings = () => {
  const { dbService } = useDatabase()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const getSetting = useCallback(
    async (key) => {
      setLoading(true)
      setError(null)
      try {
        const result = await dbService.settings.getSetting(key)
        if (result instanceof Result) {
          if (result.isSuccess) {
            return result.value
          } else {
            Logger.error("Error getting setting:", result.error)
            setError(result.error)
          }
        }
      } catch (error) {
        Logger.error("Error getting setting:", error)
        setError(error)
      } finally {
        setLoading(false)
      }
    },
    [dbService.settings]
  )
  const logout = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await dbService.settings.logout()
      return result
    } catch (error) {
      Logger.error("Error during logout:", error)
      setError(error)
      return { success: false, message: "Error during logout" }
    } finally {
      setLoading(false)
    }
  }, [dbService])
  return { getSetting, loading, error, logout }
}
