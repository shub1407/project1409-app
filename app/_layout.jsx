import { Stack } from "expo-router"
import { SQLiteProvider } from "expo-sqlite"
import { StatusBar } from "expo-status-bar"
import { Suspense } from "react"
import { StyleSheet, Text } from "react-native"
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"
import { AuthProvider } from "../src/context/AuthContext"
import { SMSProvider } from "../src/context/SMSProvider"
import { DatabaseProvider } from "../src/database/providers/DatabaseProvider"

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      {/* Global default StatusBar */}
      <StatusBar style="dark" />

      <SafeAreaView
        style={styles.container}
        edges={["top", "left", "right", "bottom"]}
      >
        <Suspense fallback={<Text>Loading...</Text>}>
          <SQLiteProvider databaseName="split_db.db" useSuspense>
            <SMSProvider>
              <DatabaseProvider>
                <AuthProvider>
                  <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="(auth)" />
                    <Stack.Screen name="users" />
                  </Stack>
                </AuthProvider>
              </DatabaseProvider>
            </SMSProvider>
          </SQLiteProvider>
        </Suspense>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff", // this color shows under status bar
  },
})
