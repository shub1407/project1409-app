import { Ionicons } from "@expo/vector-icons"
import { Tabs } from "expo-router"
import { Platform, View } from "react-native"
import { AccountsProvider } from "../../src/context/AccountContext"
import { CategoryProvider } from "../../src/context/CategoryContext"
import { ReportsProvider } from "../../src/context/ReportContext"
export default function TabLayout() {
  return (
    <AccountsProvider>
      <CategoryProvider>
        <ReportsProvider>
          <Tabs
            screenOptions={{
              tabBarActiveTintColor: "#1CC29F",
              tabBarInactiveTintColor: "#9CA3AF",
              headerShown: false,
              tabBarStyle: {
                backgroundColor: "#FFFFFF",
                borderTopWidth: 1,
                borderTopColor: "#F3F4F6",
                height: Platform.OS === "ios" ? 85 : 70,
                paddingTop: 8,
                paddingBottom: Platform.OS === "ios" ? 25 : 10,
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: -4,
                },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 10,
              },
              tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: "600",
                marginTop: 4,
              },
              tabBarIconStyle: {
                marginTop: 4,
              },
            }}
          >
            <Tabs.Screen
              name="index"
              options={{
                title: "Accounts",
                tabBarIcon: ({ color, size, focused }) => (
                  <Ionicons
                    name={focused ? "grid" : "grid-outline"}
                    size={size}
                    color={color}
                  />
                ),
              }}
            />
            <Tabs.Screen
              name="records"
              options={{
                title: "Records",
                // Hide tab bar on this screen
                tabBarIcon: ({ color, size, focused }) => (
                  <Ionicons
                    name={focused ? "list" : "list-outline"}
                    size={size}
                    color={color}
                  />
                ),
              }}
            />
            <Tabs.Screen
              name="add"
              options={{
                title: "",
                tabBarStyle: { display: "none" },
                tabBarIcon: ({ color, size }) => (
                  <View
                    style={{
                      backgroundColor: "#1CC29F",
                      borderRadius: 25,
                      width: 50,
                      height: 50,
                      justifyContent: "center",
                      alignItems: "center",
                      marginBottom: 10,
                      shadowColor: "#1CC29F",
                      shadowOffset: {
                        width: 0,
                        height: 4,
                      },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 8,
                    }}
                  >
                    <Ionicons name="add" size={28} color="#FFFFFF" />
                  </View>
                ),
              }}
            />
            <Tabs.Screen
              name="groups"
              options={{
                title: "Groups",
                tabBarIcon: ({ color, size, focused }) => (
                  <Ionicons
                    name={focused ? "people" : "people-outline"}
                    size={size}
                    color={color}
                  />
                ),
              }}
            />
            <Tabs.Screen
              name="profile"
              options={{
                title: "Profile",
                tabBarIcon: ({ color, size, focused }) => (
                  <Ionicons
                    name={focused ? "person-circle" : "person-circle-outline"}
                    size={size}
                    color={color}
                  />
                ),
              }}
            />
            <Tabs.Screen
              name="add-account"
              options={{
                title: "Add Account",
                href: null, // This prevents it from showing in the tab bar
                tabBarStyle: { display: "none" }, // Hide tab bar on this screen
              }}
            />
            <Tabs.Screen
              name="reports"
              options={{
                title: "Detailed Report",
                href: null, // This prevents it from showing in the tab bar
                tabBarStyle: { display: "none" }, // Hide tab bar on this screen
                // Hide tab bar on this screen
              }}
            />
            <Tabs.Screen
              name="account-setting"
              options={{
                title: "Account Settings",
                href: null, // This prevents it from showing in the tab bar
                tabBarStyle: { display: "none" }, // Hide tab bar on this screen
                // Hide tab bar on this screen
              }}
            />
            <Tabs.Screen
              name="edit-account"
              options={{
                title: "Edit Settings",
                href: null, // This prevents it from showing in the tab bar
                tabBarStyle: { display: "none" }, // Hide tab bar on this screen
                // Hide tab bar on this screen
              }}
            />
            <Tabs.Screen
              name="edit-record"
              options={{
                title: "Edit Record",
                href: null, // This prevents it from showing in the tab bar
                tabBarStyle: { display: "none" }, // Hide tab bar on this screen
                // Hide tab bar on this screen
              }}
            />
          </Tabs>
        </ReportsProvider>
      </CategoryProvider>
    </AccountsProvider>
  )
}
