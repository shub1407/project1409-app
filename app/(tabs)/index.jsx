import { router } from "expo-router"
import { useEffect, useState } from "react"
import {
  Dimensions, // Import from react-native
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
} from "react-native"
// Remove this line: import { ScrollView } from "react-native-web"
import ListOfAccounts from "../../src/components/ListOfAccounts"
import TransactionCard from "../../src/components/TransactionCard"
import { useAccountsContext } from "../../src/context/AccountContext"
import { useAuth } from "../../src/context/AuthContext"
import transactionService from "../../src/services/transactionService"

const { width: screenWidth } = Dimensions.get("window")

export default function AccountsScreen() {
  const [refreshing, setRefreshing] = useState(false)
  const [totalBalance, setTotalBalance] = useState(0)
  const [transactions, setTransactions] = useState([])
  const [transactionsLoading, setTransactionsLoading] = useState(false)
  const { user } = useAuth()
  const { accounts, refreshAccounts, loading } = useAccountsContext()

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    try {
      setTransactionsLoading(true)
      const result = await transactionService.getTransactions()
      if (result) {
        setTransactions(result.transactions)
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
    router.push("/(tabs)/records")
  }

  const handleAccountPress = (account) => {
    console.log("Account pressed:", account.name)
  }

  const handleAddAccount = () => {
    router.push("/add-account")
  }

  const handleViewRecords = () => {
    console.log("View records pressed")
  }

  const handleSettingsPress = () => {
    console.log("Settings pressed")
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1CC29F" />
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#1CC29F"]}
              tintColor="#1CC29F"
            />
          }
          contentContainerStyle={styles.scrollContent}
        >
          {/* Add your header component here if you have one */}

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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20, // Add some bottom padding
  },
  // ... rest of your existing styles
  header: {
    backgroundColor: "#1CC29F",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    fontSize: 16,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  username: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
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
