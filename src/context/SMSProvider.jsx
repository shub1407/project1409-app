import { createContext, useContext, useEffect, useRef, useState } from "react"
import { BackgroundSMSService } from "../services/sms/BackgroundSMSService"
import { Logger } from "../utility/logger"
const SMSContext = createContext()

export function SMSProvider({ children }) {
  const [pendingTransactions, setPendingTransactions] = useState([])
  const [notificationLaunchData, setNotificationLaunchData] = useState(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    initializeSMS()
  }, [])
  const foregroundListeners = useRef([])

  // Method to add listener for foreground notifications
  const addNotificationListener = (callback) => {
    foregroundListeners.current.push(callback)

    // Return unsubscribe function
    return () => {
      const index = foregroundListeners.current.indexOf(callback)
      if (index > -1) {
        foregroundListeners.current.splice(index, 1)
      }
    }
  }

  // Call this when notification is clicked while app is in foreground
  const handleForegroundNotificationClick = (notificationData) => {
    console.log(
      "[SMSProvider] Foreground notification clicked:",
      notificationData
    )
    foregroundListeners.current.forEach((listener) => {
      try {
        listener(notificationData)
      } catch (error) {
        console.error("Error in notification listener:", error)
      }
    })
  }

  const initializeSMS = async () => {
    try {
      const initialized = await BackgroundSMSService.initialize()
      setIsInitialized(initialized)

      if (initialized) {
        // Alert.alert(
        //   "🎉 Background SMS Active!",
        //   "SplitBudget will now detect transactions even when the app is closed.",
        //   [{ text: "Awesome!" }]
        // )
        checkPendingTransactions()
      }
    } catch (error) {
      console.error("SMS initialization error:", error)
    }
  }

  const checkPendingTransactions = async () => {
    const pending = await BackgroundSMSService.checkPendingTransactions()
    setPendingTransactions(pending)
  }
  const clearTransactionByKey = async (key) => {
    await BackgroundSMSService.clearTransaction(key)
    setPendingTransactions((prev) => prev.filter((tx) => tx.key !== key))
  }
  const clearAllTransactions = async () => {
    await BackgroundSMSService.clearAllTransactions()
    setPendingTransactions([])
  }
  const checkNotificationLaunch = async () => {
    const launchData = await BackgroundSMSService.checkNotificationLaunch()
    let res
    if (launchData.fromNotification) {
      // Handle the launch from notification
      res = {
        status: true,
        amount: launchData.transactionAmount,
        type: launchData.transactionType,
        key: launchData.transactionKey,
        data: launchData.transactionData,
      }
      setNotificationLaunchData(res)
      Logger.debug(
        "[SMS Background]🚀 App launched from notification with data:",
        launchData
      )
    } else {
      res = { status: false }
      setNotificationLaunchData(null)
    }
    return res
  }
  const clearNotificationLaunch = async () => {
    await BackgroundSMSService.clearLaunchData()
    setNotificationLaunchData(null)
  }

  const value = {
    pendingTransactions,
    isInitialized,
    setPendingTransactions,
    checkPendingTransactions,
    clearTransactionByKey,
    clearAllTransactions,

    checkNotificationLaunch,
    clearNotificationLaunch,
    notificationLaunchData,
    addNotificationListener,
    handleForegroundNotificationClick,
  }

  return <SMSContext.Provider value={value}>{children}</SMSContext.Provider>
}

export const useSMS = () => {
  const context = useContext(SMSContext)
  if (!context) {
    throw new Error("useSMS must be used within SMSProvider")
  }
  return context
}
