import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useState } from "react"
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

export default function NotificationsScreen() {
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: false,
    transactionAlerts: true,
    budgetAlerts: true,
    scheduledReminders: true,
    groupUpdates: false,
    marketing: false,
    security: true,
    weeklyReports: true,
    monthlyReports: false,
  })

  const toggleSetting = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const notificationGroups = [
    {
      title: "General Notifications",
      items: [
        {
          key: "pushNotifications",
          title: "Push Notifications",
          subtitle: "Receive notifications on your device",
          icon: "notifications-outline",
          color: "#1CC29F",
        },
        {
          key: "emailNotifications",
          title: "Email Notifications",
          subtitle: "Get updates via email",
          icon: "mail-outline",
          color: "#4F46E5",
        },
      ],
    },
    {
      title: "Transaction & Budget Alerts",
      items: [
        {
          key: "transactionAlerts",
          title: "Transaction Alerts",
          subtitle: "Notify when transactions are added",
          icon: "card-outline",
          color: "#059669",
        },
        {
          key: "budgetAlerts",
          title: "Budget Alerts",
          subtitle: "Alert when approaching budget limits",
          icon: "warning-outline",
          color: "#F59E0B",
        },
        {
          key: "scheduledReminders",
          title: "Scheduled Reminders",
          subtitle: "Remind about upcoming scheduled transactions",
          icon: "time-outline",
          color: "#06B6D4",
        },
      ],
    },
    {
      title: "Social & Updates",
      items: [
        {
          key: "groupUpdates",
          title: "Group Updates",
          subtitle: "Notifications from shared expense groups",
          icon: "people-outline",
          color: "#8B5CF6",
        },
        {
          key: "marketing",
          title: "Marketing & Tips",
          subtitle: "Financial tips and product updates",
          icon: "megaphone-outline",
          color: "#F97316",
        },
      ],
    },
    {
      title: "Security & Reports",
      items: [
        {
          key: "security",
          title: "Security Alerts",
          subtitle: "Important security notifications",
          icon: "shield-checkmark-outline",
          color: "#EF4444",
        },
        {
          key: "weeklyReports",
          title: "Weekly Reports",
          subtitle: "Summary of your weekly activity",
          icon: "bar-chart-outline",
          color: "#10B981",
        },
        {
          key: "monthlyReports",
          title: "Monthly Reports",
          subtitle: "Detailed monthly financial reports",
          icon: "analytics-outline",
          color: "#7C3AED",
        },
      ],
    },
  ]

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1CC29F" />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content}>
          {notificationGroups.map((group, groupIndex) => (
            <View key={groupIndex} style={styles.notificationGroup}>
              <Text style={styles.groupTitle}>{group.title}</Text>
              <View style={styles.groupContainer}>
                {group.items.map((item, itemIndex) => (
                  <View
                    key={item.key}
                    style={[
                      styles.notificationItem,
                      itemIndex === group.items.length - 1 && styles.lastItem,
                    ]}
                  >
                    <View style={styles.itemLeft}>
                      <View
                        style={[
                          styles.itemIcon,
                          { backgroundColor: `${item.color}15` },
                        ]}
                      >
                        <Ionicons
                          name={item.icon}
                          size={22}
                          color={item.color}
                        />
                      </View>
                      <View style={styles.itemText}>
                        <Text style={styles.itemTitle}>{item.title}</Text>
                        <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                      </View>
                    </View>
                    <Switch
                      value={settings[item.key]}
                      onValueChange={() => toggleSetting(item.key)}
                      trackColor={{ false: "#E5E7EB", true: "#1CC29F" }}
                      thumbColor={settings[item.key] ? "#FFFFFF" : "#FFFFFF"}
                      ios_backgroundColor="#E5E7EB"
                    />
                  </View>
                ))}
              </View>
            </View>
          ))}

          <View style={styles.infoSection}>
            <View style={styles.infoCard}>
              <Ionicons
                name="information-circle-outline"
                size={24}
                color="#6B7280"
              />
              <Text style={styles.infoText}>
                You can always change these settings later. Some notifications
                are required for security purposes.
              </Text>
            </View>
          </View>

          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => {
                const allTrue = Object.values(settings).every((val) => val)
                const newSettings = {}
                Object.keys(settings).forEach((key) => {
                  newSettings[key] = !allTrue
                })
                setSettings(newSettings)
              }}
            >
              <Text style={styles.quickActionText}>
                {Object.values(settings).every((val) => val)
                  ? "Disable All"
                  : "Enable All"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    backgroundColor: "#1CC29F",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  notificationGroup: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  groupContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  itemText: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 13,
    color: "#6B7280",
  },
  infoSection: {
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: "#EBF8FF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#1E40AF",
    lineHeight: 20,
  },
  quickActions: {
    marginBottom: 32,
  },
  quickAction: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#1CC29F",
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1CC29F",
  },
})
