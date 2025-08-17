import { Stack } from "expo-router"

export default function FeedbackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: "Feedback" }} />
      <Stack.Screen name="[id]" options={{ title: "Feedback Details" }} />
    </Stack>
  )
}
