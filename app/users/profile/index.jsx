import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useState } from "react"
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { DeleteConfirmationModal } from "../../../src/components/DeleteModal"
import { useAuth } from "../../../src/context/AuthContext"

export default function ProfileScreen() {
  const { user, signOut } = useAuth()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut()
          router.replace("/(auth)/login")
        },
      },
    ])
  }

  const handleDeleteAccount = async () => {
    setDeleteLoading(true)
    try {
      // Add your delete account logic here
      await new Promise((resolve) => setTimeout(resolve, 2000)) // Mock API call
      await signOut()
      router.replace("/(auth)/login")
    } catch (error) {
      Alert.alert("Error", "Failed to delete account")
    } finally {
      setDeleteLoading(false)
      setShowDeleteModal(false)
    }
  }

  // Main Menu Options
  const mainOptions = [
    {
      icon: "person-outline",
      title: "User Profile",
      route: "/users/profile/user-profile",
      color: "#1CC29F",
    },
    {
      icon: "star-outline",
      title: "Premium Plans",
      route: "/users/profile/premium",
      color: "#FFB800",
      badge: "Pro",
    },
    {
      icon: "apps-outline",
      title: "Categories",
      route: "/users/profile/categories",
      color: "#8B5CF6",
    },
    {
      icon: "time-outline",
      title: "Scheduled Transactions",
      route: "/users/profile/schedule-payment",
      color: "#06B6D4",
    },
    {
      icon: "notifications-outline",
      title: "Notifications",
      route: "/users/profile/notifications",
      color: "#F97316",
    },
  ]

  // Settings & Support
  const settingsOptions = [
    {
      icon: "settings-outline",
      title: "Advanced Settings",
      route: "/users/profile/advanced-settings",
      color: "#6B7280",
    },
    {
      icon: "bug-outline",
      title: "Report Bug / Suggest Feature",
      route: "/users/profile/feedback",
      color: "#EF4444",
    },
  ]

  // Legal & Info
  const legalOptions = [
    {
      icon: "shield-checkmark-outline",
      title: "Privacy Policy",
      route: "/users/profile/privacy",
      color: "#059669",
    },
    {
      icon: "document-text-outline",
      title: "Terms of Service",
      route: "/users/profile/terms",
      color: "#7C3AED",
    },
    {
      icon: "information-circle-outline",
      title: "About Us",
      route: "/users/profile/about",
      color: "#0284C7",
    },
  ]

  const renderMenuSection = (title, options) => (
    <View style={styles.menuSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.menuContainer}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.menuItem,
              index === options.length - 1 && styles.lastMenuItem,
            ]}
            onPress={() => router.push(option.route)}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View
                style={[
                  styles.menuIcon,
                  { backgroundColor: `${option.color}15` },
                ]}
              >
                <Ionicons name={option.icon} size={22} color={option.color} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuText}>{option.title}</Text>
                {option.subtitle && (
                  <Text style={styles.menuSubtext}>{option.subtitle}</Text>
                )}
              </View>
            </View>
            <View style={styles.menuRight}>
              {option.badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{option.badge}</Text>
                </View>
              )}
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1CC29F" />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={() => router.push("/profile/user-profile")}
          >
            <Ionicons name="create-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* User Info Card */}
          <View style={styles.userCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.name || "User Name"}</Text>
              <Text style={styles.userEmail}>
                {user?.email || "user@example.com"}
              </Text>
              {user?.phone && (
                <Text style={styles.userPhone}>{user.phone}</Text>
              )}
              <View style={styles.userBadge}>
                <Ionicons name="star" size={12} color="#FFB800" />
                <Text style={styles.badgeLabel}>Free Plan</Text>
              </View>
            </View>
          </View>

          {/* Quick Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="wallet" size={20} color="#1CC29F" />
              </View>
              <Text style={styles.statAmount}>3</Text>
              <Text style={styles.statLabel}>Accounts</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="swap-horizontal" size={20} color="#06B6D4" />
              </View>
              <Text style={styles.statAmount}>127</Text>
              <Text style={styles.statLabel}>Transactions</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="people" size={20} color="#8B5CF6" />
              </View>
              <Text style={styles.statAmount}>2</Text>
              <Text style={styles.statLabel}>Groups</Text>
            </View>
          </View>

          {/* Menu Sections */}
          {renderMenuSection("Main", mainOptions)}
          {renderMenuSection("Settings & Support", settingsOptions)}
          {renderMenuSection("Legal & Information", legalOptions)}

          {/* Danger Zone */}
          <View style={styles.dangerZone}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.menuContainer}>
              <TouchableOpacity
                style={[styles.menuItem, styles.dangerMenuItem]}
                onPress={handleSignOut}
                activeOpacity={0.7}
              >
                <View style={styles.menuLeft}>
                  <View
                    style={[styles.menuIcon, { backgroundColor: "#FEE2E2" }]}
                  >
                    <Ionicons
                      name="log-out-outline"
                      size={22}
                      color="#EF4444"
                    />
                  </View>
                  <Text style={[styles.menuText, { color: "#EF4444" }]}>
                    Sign Out
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Version Info */}
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>SplitBudget v1.0.0</Text>
            <Text style={styles.buildText}>Build 2025.08.16</Text>
          </View>
        </ScrollView>

        {/* Delete Account Modal */}
        <DeleteConfirmationModal
          visible={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteAccount}
          title="Delete Account"
          message="Are you sure you want to permanently delete your account?"
          warningMessage="This will permanently delete all your data, transactions, and account information. This action cannot be undone."
          confirmText="Delete Account"
          loading={deleteLoading}
        />
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
    shadowColor: "#1CC29F",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  editProfileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // User Card
  userCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: "#1CC29F",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  userBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  badgeLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#D97706",
    marginLeft: 4,
  },

  // Stats
  statsContainer: {
    flexDirection: "row",
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    flex: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statAmount: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    fontWeight: "500",
  },

  // Menu Sections
  menuSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  menuContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
  },
  menuSubtext: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  menuRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  badge: {
    backgroundColor: "#FFB800",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  // Danger Zone
  dangerZone: {
    marginBottom: 32,
  },
  dangerMenuItem: {
    borderBottomWidth: 0,
  },

  // Version
  versionContainer: {
    alignItems: "center",
    paddingVertical: 20,
    marginBottom: 20,
  },
  versionText: {
    fontSize: 14,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  buildText: {
    fontSize: 12,
    color: "#D1D5DB",
    marginTop: 2,
  },
})
