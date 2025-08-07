import { Ionicons } from "@expo/vector-icons"
import { useEffect, useState } from "react"
import {
  Dimensions,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { useAuth } from "../../src/context/AuthContext"

const { width: screenWidth } = Dimensions.get("window")

export default function AccountsScreen() {
  const [accounts, setAccounts] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [totalBalance, setTotalBalance] = useState(0)
  const { user } = useAuth()

  useEffect(() => {
    loadAccounts()
  }, [])

  const loadAccounts = async () => {
    try {
      // Mock data based on your screenshots
      const accountsData = [
        {
          id: 1,
          name: "Cash",
          balance: 600.0,
          type: "cash",
          color: "#1CC29F",
          icon: "cash-outline",
        },
        {
          id: 2,
          name: "PNB",
          balance: 2300.0,
          type: "bank",
          color: "#8B4513",
          icon: "card-outline",
        },
        {
          id: 3,
          name: "BOB",
          balance: 0.0,
          type: "bank",
          color: "#FF6B6B",
          icon: "card-outline",
        },
        {
          id: 4,
          name: "BOB",
          balance: 0.0,
          type: "bank",
          color: "#FF6B6B",
          icon: "card-outline",
        },
      ]

      setAccounts(accountsData)

      // Calculate total balance
      const total = accountsData.reduce(
        (sum, account) => sum + account.balance,
        0
      )
      setTotalBalance(total)
    } catch (error) {
      console.error("Error loading accounts:", error)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadAccounts()
    setRefreshing(false)
  }

  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`
  }

  const getAccountIcon = (type) => {
    const icons = {
      cash: "cash-outline",
      bank: "card-outline",
      upi: "phone-portrait-outline",
      wallet: "wallet-outline",
    }
    return icons[type] || "wallet-outline"
  }

  const handleAccountPress = (account) => {
    // Navigate to account details or transactions
    console.log("Account pressed:", account.name)
  }

  const handleAddAccount = () => {
    // Navigate to add account screen
    console.log("Add account pressed")
  }

  const handleViewRecords = () => {
    // Navigate to records/transactions screen
    console.log("View records pressed")
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1CC29F" />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.username}>{user?.name || "User"}</Text>
          </View>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#1CC29F"]}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Total Balance Card */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Text style={styles.balanceAmount}>
              {formatCurrency(totalBalance)}
            </Text>
            <View style={styles.balanceActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Add Money</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="send" size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Send Money</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Accounts List Section */}
          <View style={styles.accountsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>List of accounts</Text>
              <TouchableOpacity style={styles.settingsIcon}>
                <Ionicons name="settings-outline" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Accounts Grid */}
            <View style={styles.accountsGrid}>
              {accounts.map((account) => (
                <TouchableOpacity
                  key={account.id}
                  style={[
                    styles.accountCard,
                    { backgroundColor: account.color },
                  ]}
                  onPress={() => handleAccountPress(account)}
                >
                  <View style={styles.accountHeader}>
                    <Ionicons name={account.icon} size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.accountInfo}>
                    <Text style={styles.accountName}>{account.name}</Text>
                    <Text style={styles.accountBalance}>
                      {formatCurrency(account.balance)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}

              {/* Add Account Card */}
              <TouchableOpacity
                style={styles.addAccountCard}
                onPress={handleAddAccount}
              >
                <View style={styles.addAccountContent}>
                  <View style={styles.addAccountIcon}>
                    <Ionicons name="add" size={24} color="#1CC29F" />
                  </View>
                  <Text style={styles.addAccountText}>ADD ACCOUNT</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Records Button */}
          <TouchableOpacity
            style={styles.recordsButton}
            onPress={handleViewRecords}
          >
            <Ionicons name="list" size={20} color="#1CC29F" />
            <Text style={styles.recordsButtonText}>RECORDS</Text>
          </TouchableOpacity>

          {/* Recent Activity Section */}
          <View style={styles.activitySection}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>

            <View style={styles.activityCard}>
              <Text style={styles.activityHeader}>Last records overview</Text>
              <Text style={styles.activitySubheader}>LAST 5 YEARS</Text>

              <View style={styles.activityList}>
                {/* Sample activity items */}
                <View style={styles.activityItem}>
                  <View style={styles.activityLeft}>
                    <View
                      style={[
                        styles.activityIcon,
                        { backgroundColor: "#FFE5E5" },
                      ]}
                    >
                      <Ionicons name="shirt" size={20} color="#FF6B6B" />
                    </View>
                    <View>
                      <Text style={styles.activityDescription}>
                        Clothes & shoes
                      </Text>
                      <Text style={styles.activityAccount}>PNB</Text>
                    </View>
                  </View>
                  <View style={styles.activityRight}>
                    <Text style={styles.activityAmount}>-₹200.00</Text>
                    <Text style={styles.activityDate}>1 Aug</Text>
                  </View>
                </View>

                <View style={styles.activityItem}>
                  <View style={styles.activityLeft}>
                    <View
                      style={[
                        styles.activityIcon,
                        { backgroundColor: "#E5F7E5" },
                      ]}
                    >
                      <Ionicons
                        name="arrow-forward"
                        size={20}
                        color="#1CC29F"
                      />
                    </View>
                    <View>
                      <Text style={styles.activityDescription}>
                        Transfer, withdraw
                      </Text>
                      <Text style={styles.activityAccount}>
                        ...outside of Wallet → PNB
                      </Text>
                    </View>
                  </View>
                  <View style={styles.activityRight}>
                    <Text style={[styles.activityAmount, { color: "#1CC29F" }]}>
                      +₹500.00
                    </Text>
                    <Text style={styles.activityDate}>1 Aug</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity style={styles.showMoreButton}>
                <Text style={styles.showMoreText}>SHOW MORE</Text>
              </TouchableOpacity>
            </View>
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
