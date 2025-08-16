// app/record/_layout.tsx
import { Stack } from "expo-router"

export default function RecordLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: "Records" }} />
      <Stack.Screen
        name="edit-record"
        options={{
          title: "Edit Record",
          href: null,
          // 🚀 hides the bottom tabs
        }}
      />
      <Stack.Screen name="reports" options={{ title: "Report" }} />
    </Stack>
  )
}
