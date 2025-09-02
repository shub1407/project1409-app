import { Stack } from "expo-router"
import { SQLiteProvider } from "expo-sqlite"
import { Suspense, useEffect } from "react"
import { Text } from "react-native"
import { AuthProvider } from "../src/context/AuthContext"
import { DatabaseProvider } from "../src/database/providers/DatabaseProvider"
export default function RootLayout() {
  useEffect(() => {
    const initializeApp = async () => {
      console.log("🚀 Initializing app...")
      console.log("✅ App initialization complete")
    }

    initializeApp()
  }, [])
  return (
    <Suspense fallback={<Text>Loading...</Text>}>
      <SQLiteProvider databaseName="split_db.db" useSuspense>
        <DatabaseProvider>
          <AuthProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="users" />
            </Stack>
          </AuthProvider>
        </DatabaseProvider>
      </SQLiteProvider>
    </Suspense>
  )
}
