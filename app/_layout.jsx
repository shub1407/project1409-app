import { Stack } from "expo-router"

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: "#fff",
        },
        animation: "fade_from_bottom",
        animationDuration: 400,
      }}
    />
  )
}
