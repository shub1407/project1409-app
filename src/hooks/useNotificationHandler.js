import { router } from "expo-router"
import { useEffect, useRef } from "react"
import { AppState } from "react-native"
import { useSMS } from "../context/SMSProvider"

export function useNotificationHandler() {
  const appState = useRef(AppState.currentState)
  const hasHandledNotification = useRef(false)
  const {
    checkNotificationLaunch,
    clearNotificationLaunch,
    addNotificationListener,
  } = useSMS()

  useEffect(() => {
    // Handle foreground notification clicks (when app is already active)
    const handleForegroundNotification = async (notificationData) => {
      console.log(
        "[NotificationHandler] Foreground notification clicked:",
        notificationData
      )

      try {
        router.push({
          pathname: "/users/add-record",
          params: {
            transaction: JSON.stringify(notificationData),
            fromNotification: "true",
          },
        })
      } catch (error) {
        console.error(
          "[NotificationHandler] Error navigating from foreground notification:",
          error
        )
      }
    }

    // Handle app state changes (background to foreground)
    const handleAppStateChange = async (nextAppState) => {
      console.log(
        `[NotificationHandler] App state: ${appState.current} -> ${nextAppState}`
      )

      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active" &&
        !hasHandledNotification.current
      ) {
        console.log(
          "[NotificationHandler] App came to foreground, checking notifications"
        )
        await checkAndNavigateFromNotification()
      }

      // Reset flag when going to background
      if (nextAppState === "background" || nextAppState === "inactive") {
        hasHandledNotification.current = false
      }

      appState.current = nextAppState
    }

    const checkAndNavigateFromNotification = async () => {
      try {
        const launchData = await checkNotificationLaunch()

        if (launchData?.status && launchData?.data) {
          console.log(
            "[NotificationHandler] Found notification data:",
            launchData.data
          )

          hasHandledNotification.current = true
          await clearNotificationLaunch()

          router.push({
            pathname: "/users/home/notifications",
          })
        }
      } catch (error) {
        console.error("[NotificationHandler] Error:", error)
      }
    }

    // Add listeners
    const appStateSubscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    )
    const foregroundNotificationUnsubscribe = addNotificationListener?.(
      handleForegroundNotification
    )

    // Initial check (cold start)
    checkAndNavigateFromNotification()

    return () => {
      appStateSubscription.remove()
      if (foregroundNotificationUnsubscribe) {
        foregroundNotificationUnsubscribe()
      }
    }
  }, [])

  return {
    currentAppState: appState.current,
    hasHandled: hasHandledNotification.current,
  }
}
