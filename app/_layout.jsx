import { Stack } from "expo-router"
import { SQLiteProvider } from "expo-sqlite"
import { Suspense } from "react"
import { StyleSheet, Text } from "react-native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import CustomStatusBar from "../src/components/CustomStatusBar"
import { AuthProvider } from "../src/context/AuthContext"
import { SMSProvider } from "../src/context/SMSProvider"
import { StyleProvider } from "../src/context/StyleContext"
import { DatabaseProvider } from "../src/database/providers/DatabaseProvider"

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StyleProvider>
        <CustomStatusBar backgroundColor="#0D9488" barStyle="light">
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
        </CustomStatusBar>
      </StyleProvider>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC", // Match your login screen background
  },
})
