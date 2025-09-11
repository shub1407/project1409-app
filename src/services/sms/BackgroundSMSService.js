import { NativeModules, PermissionsAndroid, Platform } from "react-native"
import { Logger } from "../../utility/logger"

const { SharedPrefsModule, LaunchIntentModule } = NativeModules

export class BackgroundSMSService {
  static async requestPermissions() {
    if (Platform.OS !== "android") return false

    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
        PermissionsAndroid.PERMISSIONS.READ_SMS,
      ])

      return (
        granted[PermissionsAndroid.PERMISSIONS.RECEIVE_SMS] === "granted" &&
        granted[PermissionsAndroid.PERMISSIONS.READ_SMS] === "granted"
      )
    } catch (error) {
      console.error("Permission request error:", error)
      return false
    }
  }

  static async initialize() {
    const hasPermissions = await this.requestPermissions()

    if (!hasPermissions) {
      console.log("SMS permissions not granted")
      return false
    }

    console.log("✅ Background SMS service initialized")
    return true
  }

  // NOW THIS WILL ACTUALLY WORK - Reading from SharedPreferences
  static async checkPendingTransactions() {
    try {
      if (!SharedPrefsModule) {
        console.log("SharedPrefsModule not available")
        return []
      }

      const rawTransactions = await SharedPrefsModule.getPendingTransactions()

      const parsedTransactions = rawTransactions
        .map((item) => {
          try {
            const transactionData = JSON.parse(item.data)
            return {
              key: item.key, // Keep the key for clearing later
              ...transactionData,
            }
          } catch (error) {
            console.error("Error parsing transaction:", error)
            return null
          }
        })
        .filter((transaction) => transaction !== null)

      Logger.debug(
        "[SMS Background]📱 Found pending transactions:",
        parsedTransactions.length
      )
      Logger.debug("[SMS Background] Pending Transactions:", parsedTransactions)
      return parsedTransactions
    } catch (error) {
      console.error("Error checking pending transactions:", error)
      return []
    }
  }

  // Clear a specific transaction
  static async clearTransaction(transactionKey) {
    try {
      if (!SharedPrefsModule) return false

      await SharedPrefsModule.clearTransaction(transactionKey)
      return true
    } catch (error) {
      console.error("Error clearing transaction:", error)
      return false
    }
  }

  // Clear all pending transactions
  static async clearAllTransactions() {
    try {
      if (!SharedPrefsModule) return false

      await SharedPrefsModule.clearAllTransactions()
      return true
    } catch (error) {
      console.error("Error clearing all transactions:", error)
      return false
    }
  }

  //check if app was launched from notification
  static async checkNotificationLaunch() {
    try {
      if (LaunchIntentModule) {
        const launchData = await LaunchIntentModule.getLaunchData()

        return launchData
      }
    } catch (error) {
      console.error("Error checking notification launch:", error)
    }
  }
  static async clearLaunchData() {
    try {
      if (LaunchIntentModule) {
        await LaunchIntentModule.clearLaunchData()
        Logger.debug("[SMS Background]🧹 Cleared launch data")
      }
    } catch (error) {
      console.error("Error clearing launch data:", error)
    }
  }
}
