import { Stack } from "expo-router"
export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: "Schedule Payment" }} />
      <Stack.Screen name="add" options={{ title: "Add Scheduled Payment" }} />
    </Stack>
  )
}
