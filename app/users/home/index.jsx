import { Ionicons } from "@expo/vector-icons"
import { router, useFocusEffect } from "expo-router"
import { useCallback, useEffect, useRef, useState } from "react"
import {
  Animated,
  Dimensions,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import ListOfAccounts from "../../../src/components/ListOfAccounts"
import SMSTransactionModal from "../../../src/components/SMSTransactionModal"
import TransactionCard from "../../../src/components/TransactionCard"
import { useAccountsContext } from "../../../src/context/AccountContext"
import { useAuth } from "../../../src/context/AuthContext"
import { useSMS } from "../../../src/context/SMSProvider"
import { useTransaction } from "../../../src/hooks/useTransaction"

const { width: screenWidth } = Dimensions.get("window")
const HEADER_HEIGHT = 180 // Height of your header

export default function AccountsScreen() {
  const [refreshing, setRefreshing] = useState(false)
  const [totalBalance, setTotalBalance] = useState(0)
  const [transactions, setTransactions] = useState([])
  const [transactionsLoading, setTransactionsLoading] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)

  // Modern SMS Modal state
  const [showSMSModal, setShowSMSModal] = useState(false)
  const [currentSMSTransaction, setCurrentSMSTransaction] = useState(null)
  const [currentSMSIndex, setCurrentSMSIndex] = useState(0)
  const { user } = useAuth()
  const { accounts, refreshAccounts, loading } = useAccountsContext()
  const { getTransactions } = useTransaction()
  const {
    pendingTransactions,
    checkPendingTransactions,
    clearTransactionByKey,
    clearAllTransactions,
  } = useSMS()

  // Animated value for scroll position
  const scrollY = useRef(new Animated.Value(0)).current

  useEffect(() => {
    loadTransactions()
    showPendingTransactionsFromSMS()
  }, [])

  // useFocusEffect(
  //   useCallback(() => {
  //     checkPendingTransactions()
  //     showPendingTransactionsFromSMS()
  //   }, [])
  // )

  const showPendingTransactionsFromSMS = async () => {
    setPendingCount(pendingTransactions.length)
    console.log("[SMS] Pending Transactions:", pendingTransactions)

    // Show modern modal for latest transaction
    if (pendingTransactions.length > 0) {
      const latest = pendingTransactions[0]
      console.log(
        "[SMS] Showing modern modal for latest pending transaction:",
        latest
      )

      setCurrentSMSTransaction(latest)
      setShowSMSModal(true)
    }
  }

  // Modern Modal Handlers
  const handleSMSModalDismiss = () => {
    setShowSMSModal(false)
    setCurrentSMSIndex(0)
  }
  const handleNextSMSTransaction = () => {
    if (currentSMSIndex < pendingTransactions.length - 1) {
      setCurrentSMSIndex(currentSMSIndex + 1)
    }
  }

  const handlePreviousSMSTransaction = () => {
    if (currentSMSIndex > 0) {
      setCurrentSMSIndex(currentSMSIndex - 1)
    }
  }

  const handleSkipCurrentSMS = async () => {
    try {
      // Remove current transaction from pending
      const currentTransaction = pendingTransactions[currentSMSIndex]
      await clearTransactionByKey(currentTransaction.key)

      // Move to next or close if no more
      if (currentSMSIndex < pendingTransactions.length - 1) {
        // Will automatically show next due to updated pending list
        checkPendingTransactions()
      } else {
        setShowSMSModal(false)
        setCurrentSMSIndex(0)
      }
    } catch (error) {
      console.error("Error skipping SMS transaction:", error)
    }
  }

  const handleViewAllSMSTransactions = () => {
    setShowSMSModal(false)
    router.push("/users/home/notifications")
  }

  const handleAddNowTransaction = (transaction) => {
    setShowSMSModal(false)
    router.push({
      pathname: "/users/add-record",
      params: { transaction: JSON.stringify(transaction) },
    })
  }

  useFocusEffect(
    useCallback(() => {
      console.log("Screen is focused")
      loadTransactions()

      return () => {
        console.log("Screen is unfocused")
      }
    }, [])
  )

  const loadTransactions = async () => {
    try {
      setTransactionsLoading(true)
      const result = await getTransactions({ limit: 5 })
      if (result.success) {
        const transactions = result?.data?.transactions
        setTransactions(transactions || [])
      }
    } catch (error) {
      console.error("Error loading transactions:", error)
    } finally {
      setTransactionsLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await Promise.all([refreshAccounts(), loadTransactions()])
    setRefreshing(false)
  }

  const handleViewAllTransactions = () => {
    router.push("/users/records")
  }

  const handleAccountPress = (account) => {
    router.push({
      pathname: "/users/home/edit-account",
      params: { accountId: account.id },
    })
  }

  const handleAddAccount = () => {
    router.push("/users/home/add-account")
  }

  const handleDebugDb = () => {
    console.log("Debug DB pressed")
    router.push("/users/home/debug-db")
  }

  const handleSettingsPress = () => {
    router.push("/users/home/account-setting")
  }

  const handleProfilePress = () => {
    router.push("/users/profile")
  }

  const handleNotificationsPress = () => {
    console.log("Notifications pressed")
    router.push("/users/home/notifications")
  }

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 17) return "Good Afternoon"
    return "Good Evening"
  }

  // Header animation - moves up when scrolling down
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, -HEADER_HEIGHT],
    extrapolate: "clamp",
  })

  // Header opacity - fades out when scrolling
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT / 2, HEADER_HEIGHT],
    outputRange: [1, 0.5, 0],
    extrapolate: "clamp",
  })

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1CC29F" />
      <SafeAreaView style={styles.container}>
        {/* Animated Header */}
        <Animated.View
          style={[
            styles.modernHeader,
            {
              transform: [{ translateY: headerTranslateY }],
              opacity: headerOpacity,
            },
          ]}
        >
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <View style={styles.appBranding}>
                <Text style={styles.appName}>SplitBudget</Text>
                <View style={styles.brandingDot} />
              </View>
              <Text style={styles.tagline}>Smart Finance Management</Text>
            </View>

            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={handleNotificationsPress}
              >
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color="#FFFFFF"
                />
                {pendingCount > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.badgeText}>{pendingCount}</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.profileButton}
                onPress={handleProfilePress}
              >
                <Text style={styles.profileInitial}>
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.welcomeSection}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.username}>
              {user?.name?.split(" ")[0] || "User"} 👋
            </Text>
          </View>

          {/* Decorative Elements */}
          <View style={styles.headerDecorations}>
            <View style={[styles.decorationCircle, styles.circle1]} />
            <View style={[styles.decorationCircle, styles.circle2]} />
            <View style={[styles.decorationCircle, styles.circle3]} />
          </View>
        </Animated.View>

        {/* Animated ScrollView */}
        <Animated.ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: HEADER_HEIGHT }, // Add padding to account for header
          ]}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16} // Smooth animation
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true } // Use native driver for better performance
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#1CC29F"]}
              tintColor="#1CC29F"
              progressViewOffset={HEADER_HEIGHT} // Adjust for header height
            />
          }
        >
          <ListOfAccounts
            accounts={accounts}
            onAccountPress={handleAccountPress}
            onAddAccount={handleAddAccount}
            onSettingsPress={handleSettingsPress}
          />

          <TransactionCard
            transactions={transactions}
            loading={transactionsLoading}
            onViewAll={handleViewAllTransactions}
          />

          <TouchableOpacity
            style={styles.recordsButton}
            onPress={handleDebugDb}
          >
            <Text style={styles.recordsButtonText}>Debug DB</Text>
          </TouchableOpacity>
        </Animated.ScrollView>

        {/* Modern SMS Transaction Modal */}
        <SMSTransactionModal
          visible={showSMSModal}
          transactions={pendingTransactions} // Pass full array
          currentIndex={currentSMSIndex}
          onDismiss={handleSMSModalDismiss}
          onNext={handleNextSMSTransaction}
          onPrevious={handlePreviousSMSTransaction}
          onSkipCurrent={handleSkipCurrentSMS}
          onViewAll={handleViewAllSMSTransactions}
          onAddNow={handleAddNowTransaction}
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

  // Modern Header Styles (now animated and positioned absolutely)
  modernHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    backgroundColor: "#1CC29F",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
    zIndex: 1000,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    overflow: "hidden",
  },

  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },

  headerLeft: {
    flex: 1,
  },

  appBranding: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },

  appName: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },

  brandingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFD700",
    marginLeft: 8,
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },

  tagline: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.8,
    fontWeight: "500",
    letterSpacing: 0.5,
  },

  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },

  notificationBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#FF6B6B",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#1CC29F",
    paddingHorizontal: 4,
  },

  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },

  profileInitial: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1CC29F",
  },

  welcomeSection: {
    marginBottom: 8,
  },

  greeting: {
    fontSize: 16,
    color: "#FFFFFF",
    opacity: 0.9,
    fontWeight: "500",
    marginBottom: 4,
  },

  username: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },

  // Decorative Elements
  headerDecorations: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    pointerEvents: "none",
  },

  decorationCircle: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },

  circle1: {
    width: 120,
    height: 120,
    top: -40,
    right: -30,
  },

  circle2: {
    width: 80,
    height: 80,
    top: 20,
    right: -20,
  },

  circle3: {
    width: 40,
    height: 40,
    bottom: 10,
    right: 60,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },

  // Debug Button
  recordsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 24,
    marginTop: 16,
    paddingVertical: 16,
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
  recordsButtonText: {
    color: "#1CC29F",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
    letterSpacing: 0.5,
  },

  // Keep all your existing styles for accounts, balance, etc...
  header: {
    backgroundColor: "#1CC29F",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  balanceCard: {
    backgroundColor: "#1CC29F",
    marginHorizontal: 24,
    marginTop: 20,
    borderRadius: 20,
    padding: 24,
    shadowColor: "#1CC29F",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  balanceLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    opacity: 0.9,
    marginBottom: 8,
  },
  balanceAmount: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "800",
    marginBottom: 20,
  },
  balanceActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  accountsSection: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  settingsIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  accountsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  accountCard: {
    width: (screenWidth - 60) / 2,
    aspectRatio: 1.6,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  accountHeader: {
    alignItems: "flex-start",
  },
  accountInfo: {
    alignItems: "flex-start",
  },
  accountName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  accountBalance: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },
  addAccountCard: {
    width: (screenWidth - 60) / 2,
    aspectRatio: 1.6,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    marginBottom: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  addAccountContent: {
    alignItems: "center",
  },
  addAccountIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  addAccountText: {
    color: "#1CC29F",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  activitySection: {
    paddingHorizontal: 24,
    marginTop: 32,
    marginBottom: 40,
  },
  activityCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  activityHeader: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  activitySubheader: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9CA3AF",
    letterSpacing: 0.5,
    marginBottom: 20,
  },
  activityList: {
    marginBottom: 20,
  },
  activityItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  activityLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityDescription: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  activityAccount: {
    fontSize: 14,
    color: "#6B7280",
  },
  activityRight: {
    alignItems: "flex-end",
  },
  activityAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FF6B6B",
    marginBottom: 2,
  },
  activityDate: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  showMoreButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  showMoreText: {
    color: "#1CC29F",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
})
