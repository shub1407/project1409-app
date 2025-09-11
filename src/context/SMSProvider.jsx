import { createContext, useContext, useEffect, useState } from "react"
import { Alert } from "react-native"
import { BackgroundSMSService } from "../services/sms/BackgroundSMSService"

const SMSContext = createContext()

export function SMSProvider({ children }) {
  const [pendingTransactions, setPendingTransactions] = useState([])
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    initializeSMS()
  }, [])

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

  //check launchhed from notification
  useEffect(() => {
    const checkLaunch = async () => {
      const launchData = await BackgroundSMSService.checkNotificationLaunch()
      console.log("[SMSProvider] Launch Data:", launchData)
      if (launchData) {
        Logger.debug(
          "[SMS Background]🚀 App launched from notification with data:",
          launchData
        )
        Alert.alert(
          "🔔 Notification Clicked!",
          `You clicked on a transaction notification:\n₹${launchData.transactionAmount} ${launchData.transactionType}\n\nWould you like to add it now?`,
          [
            { text: "Later", style: "cancel" },
            {
              text: "Add Now",
              onPress: () => console.log("Navigate to add transaction screen"),
            },
          ]
        )
      }
    }
    checkLaunch()
  }, [])

  const value = {
    pendingTransactions,
    isInitialized,
    setPendingTransactions,
    checkPendingTransactions,
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
