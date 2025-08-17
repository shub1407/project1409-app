import { Stack } from "expo-router"
import { ScheduledTransactionProvider } from "../../../../src/context/ScheduledTransactionContext"
export default function Layout() {
  return (
    <ScheduledTransactionProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ title: "Schedule Payment" }} />
        <Stack.Screen name="add" options={{ title: "Add Scheduled Payment" }} />
      </Stack>
    </ScheduledTransactionProvider>
  )
}
