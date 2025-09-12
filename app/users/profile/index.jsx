import { Ionicons } from "@expo/vector-icons"
import { router, useFocusEffect } from "expo-router"
import React, { useCallback, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Modal,
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
import { useReports } from "../../../src/hooks/useReports"
import { useSettings } from "../../../src/hooks/useSettings"
import { useSplitBudgetSync } from "../../../src/hooks/useSplitBudgetSync"
import { Logger } from "../../../src/utility/logger"

const { width, height } = Dimensions.get("window")

// Simple Logout Confirmation Modal Component
const SimpleLogoutModal = ({ visible, onClose, onConfirm, loading }) => {
  const [scaleValue] = useState(new Animated.Value(0))

  const showModal = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      tension: 150,
      friction: 8,
    }).start()
  }

  const hideModal = () => {
    Animated.spring(scaleValue, {
      toValue: 0,
      useNativeDriver: true,
      tension: 150,
      friction: 8,
    }).start(() => onClose())
  }

  React.useEffect(() => {
    if (visible) {
      showModal()
    }
  }, [visible])

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.simpleModalContainer,
            {
              transform: [{ scale: scaleValue }],
            },
          ]}
        >
          {/* Modal Header */}
          <View style={styles.simpleModalHeader}>
            <View style={styles.confirmIconContainer}>
              <Ionicons name="log-out" size={28} color="#1CC29F" />
            </View>
            <Text style={styles.simpleModalTitle}>Sign Out</Text>
            <Text style={styles.simpleModalMessage}>
              Are you sure you want to sign out of your account?
            </Text>
          </View>

          {/* Modal Actions */}
          <View style={styles.simpleModalActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={hideModal}
              activeOpacity={0.8}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmButton, loading && styles.disabledButton]}
              onPress={onConfirm}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="log-out-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.confirmButtonText}>Sign Out</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  )
}

// Warning Logout Modal Component
const WarningLogoutModal = ({
  visible,
  onClose,
  onConfirm,
  loading,
  pendingSyncCount,
  onBackup,
}) => {
  const [scaleValue] = useState(new Animated.Value(0))

  const showModal = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      tension: 150,
      friction: 8,
    }).start()
  }

  const hideModal = () => {
    Animated.spring(scaleValue, {
      toValue: 0,
      useNativeDriver: true,
      tension: 150,
      friction: 8,
    }).start(() => onClose())
  }

  React.useEffect(() => {
    if (visible) {
      showModal()
    }
  }, [visible])

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: scaleValue }],
            },
          ]}
        >
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View style={styles.warningIconContainer}>
              <Ionicons name="warning" size={28} color="#F59E0B" />
            </View>
            <Text style={styles.modalTitle}>Unsaved Data Warning</Text>
          </View>

          {/* Modal Content */}
          <View style={styles.modalContent}>
            <Text style={styles.modalMessage}>
              You have {pendingSyncCount} pending sync operation
              {pendingSyncCount > 1 ? "s" : ""} that will be lost if you sign
              out now.
            </Text>

            <View style={styles.warningBox}>
              <View style={styles.warningItem}>
                <Ionicons
                  name="cloud-offline-outline"
                  size={18}
                  color="#EF4444"
                />
                <Text style={styles.warningText}>
                  {pendingSyncCount} unsaved change
                  {pendingSyncCount > 1 ? "s" : ""}
                </Text>
              </View>
              <View style={styles.warningItem}>
                <Ionicons name="time-outline" size={18} color="#EF4444" />
                <Text style={styles.warningText}>Sync in progress</Text>
              </View>
            </View>

            <View style={styles.recommendationBox}>
              <Ionicons name="information-circle" size={20} color="#0EA5E9" />
              <Text style={styles.recommendationText}>
                Please wait for sync to complete or backup your data before
                signing out.
              </Text>
            </View>
          </View>

          {/* Modal Actions */}
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.waitButton}
              onPress={onBackup}
              activeOpacity={0.8}
            >
              <Ionicons name="time-outline" size={18} color="#1CC29F" />
              <Text style={styles.waitButtonText}>Backup</Text>
            </TouchableOpacity>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.backupButton}
                onPress={hideModal}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="cloud-upload-outline"
                  size={16}
                  color="#0EA5E9"
                />
                <Text style={styles.backupSmallText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.signOutButton, loading && styles.disabledButton]}
                onPress={onConfirm}
                activeOpacity={0.8}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons
                      name="log-out-outline"
                      size={16}
                      color="#FFFFFF"
                    />
                    <Text style={styles.signOutButtonText}>Sign Out</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  )
}

// Loading Overlay Component
const LoadingOverlay = ({ visible, message = "Clearing data..." }) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.loadingOverlay}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingIconContainer}>
            <ActivityIndicator size="large" color="#1CC29F" />
          </View>
          <Text style={styles.loadingTitle}>Signing Out</Text>
          <Text style={styles.loadingMessage}>{message}</Text>
          <View style={styles.loadingSteps}>
            <View style={styles.stepItem}>
              <Ionicons name="checkmark-circle" size={16} color="#1CC29F" />
              <Text style={styles.stepText}>Saving pending changes</Text>
            </View>
            <View style={styles.stepItem}>
              <ActivityIndicator
                size="small"
                color="#1CC29F"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.stepText}>Clearing local storage</Text>
            </View>
            <View style={styles.stepItem}>
              <Ionicons name="ellipse-outline" size={16} color="#D1D5DB" />
              <Text style={[styles.stepText, { color: "#9CA3AF" }]}>
                Finalizing logout
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  )
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [stats, setStats] = useState({
    totalAccounts: 0,
    totalTransactions: 0,
    totalGroups: 0,
    pendingSyncOperations: 0, // This should come from your sync service
  })
  const { getStats } = useReports()
  const {
    logout: dbClear,
    loading: logoutLoading,
    error: logoutError,
  } = useSettings()

  const { triggerSync } = useSplitBudgetSync()
  // Function to check for pending sync operations
  const checkPendingSyncOperations = async () => {
    try {
      // This should be replaced with actual sync status check
      // For demo purposes, randomly return 0-3 pending operations
      await fetchStats()
      return stats.pendingSyncOperations
    } catch (error) {
      Logger.error("Failed to check sync status:", error)
      return 0
    }
  }

  // Fetch stats when component mounts
  const fetchStats = async () => {
    const data = await getStats()

    Logger.debug("[profile-> index]Fetched stats:", data)

    if (data.success) {
      setStats(data.data)
    }
  }

  useState(() => {
    fetchStats()
  }, [])

  useFocusEffect(
    useCallback(() => {
      fetchStats()
    }, [])
  )

  const handleSignOut = async () => {
    // Check for pending sync operations before showing modal
    const pendingCount = await checkPendingSyncOperations()
    setStats((prev) => ({ ...prev, pendingSyncOperations: pendingCount }))
    setShowLogoutModal(true)
  }

  const confirmSignOut = async () => {
    try {
      await dbClear()
      await signOut()
      setShowLogoutModal(false)
      router.replace("/(auth)/login")
    } catch (error) {
      Alert.alert("Error", "Failed to sign out. Please try again.")
      setShowLogoutModal(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleteLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
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
          <TouchableOpacity style={styles.editProfileButton}>
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
              <Text style={styles.statAmount}>{stats.totalAccounts || 0}</Text>
              <Text style={styles.statLabel}>Accounts</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="swap-horizontal" size={20} color="#06B6D4" />
              </View>
              <Text style={styles.statAmount}>
                {stats.totalTransactions || 0}
              </Text>
              <Text style={styles.statLabel}>Transactions</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons
                  name={stats.pendingSyncOperations > 0 ? "sync" : "people"}
                  size={20}
                  color={
                    stats.pendingSyncOperations > 0 ? "#F59E0B" : "#8B5CF6"
                  }
                />
              </View>
              <Text style={styles.statAmount}>
                {stats.pendingSyncOperations > 0
                  ? stats.pendingSyncOperations
                  : stats.totalGroups || 0}
              </Text>
              <Text style={styles.statLabel}>
                {stats.pendingSyncOperations > 0 ? "Pending Sync" : "Groups"}
              </Text>
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
                {stats.pendingSyncOperations > 0 && (
                  <View style={styles.syncBadge}>
                    <Text style={styles.syncBadgeText}>
                      {stats.pendingSyncOperations}
                    </Text>
                  </View>
                )}
                <Ionicons name="chevron-forward" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Version Info */}
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>SplitBudget v1.0.0</Text>
            <Text style={styles.buildText}>Build 2025.09.12</Text>
          </View>
        </ScrollView>

        {/* Conditional Logout Modal */}
        {stats.pendingSyncOperations > 0 ? (
          <WarningLogoutModal
            visible={showLogoutModal}
            onClose={() => setShowLogoutModal(false)}
            onConfirm={confirmSignOut}
            loading={logoutLoading}
            pendingSyncCount={stats.pendingSyncOperations}
            onBackup={async () => {
              setShowLogoutModal(false)
              await triggerSync()
              await fetchStats()
            }}
          />
        ) : (
          <SimpleLogoutModal
            visible={showLogoutModal}
            onClose={() => setShowLogoutModal(false)}
            onConfirm={confirmSignOut}
            loading={logoutLoading}
          />
        )}

        {/* Loading Overlay */}
        <LoadingOverlay visible={logoutLoading} />

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
    fontweight: "800",
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
    fontweight: "500",
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

  // Sync Badge
  syncBadge: {
    backgroundColor: "#F59E0B",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: "center",
    marginRight: 8,
  },
  syncBadgeText: {
    fontSize: 10,
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

  // Modal Overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  // Simple Modal Styles
  simpleModalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    width: width - 60,
    maxWidth: 350,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  simpleModalHeader: {
    alignItems: "center",
    paddingTop: 28,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  confirmIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  simpleModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  simpleModalMessage: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
  },
  simpleModalActions: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },

  // Warning Modal Styles
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    width: width - 40,
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    alignItems: "center",
    paddingTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  warningIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
  },
  modalContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  modalMessage: {
    fontSize: 16,
    color: "#374151",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 20,
  },
  warningBox: {
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",
  },
  warningItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: "#7F1D1D",
    marginLeft: 12,
    fontWeight: "500",
  },
  recommendationBox: {
    backgroundColor: "#F0F9FF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    borderLeftWidth: 4,
    borderLeftColor: "#0EA5E9",
  },
  recommendationText: {
    fontSize: 14,
    color: "#0C4A6E",
    marginLeft: 12,
    lineHeight: 20,
    flex: 1,
    fontWeight: "500",
  },
  modalActions: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  waitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0FDF4",
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1CC29F",
  },
  waitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1CC29F",
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  backupButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F9FF",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#0EA5E9",
  },
  backupSmallText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0EA5E9",
    marginLeft: 6,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  confirmButton: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#1CC29F",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  signOutButton: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    backgroundColor: "#FCA5A5",
  },
  signOutButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 6,
  },

  // Loading Overlay Styles
  loadingOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  loadingContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    width: width - 80,
    maxWidth: 320,
  },
  loadingIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  loadingMessage: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  loadingSteps: {
    alignSelf: "stretch",
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  stepText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
})
