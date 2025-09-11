//create home layout
import { Stack } from "expo-router"

export default function HomeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: "Home" }} />
      <Stack.Screen
        name="account-setting"
        options={{ title: "Account Settings" }}
      />
      <Stack.Screen name="add-account" options={{ title: "Add Account" }} />
      <Stack.Screen name="edit-account" options={{ title: "Edit Account" }} />

      <Stack.Screen
        name="notifications"
        options={{ title: "Notifications", tabBarStyle: { display: "none" } }}
      />
      <Stack.Screen
        name="add-txn-msg"
        options={{
          title: "Add Transaction from SMS",
          tabBarStyle: { display: "none" },
        }}
      />
    </Stack>
  )
}
