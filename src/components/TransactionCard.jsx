import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useMemo } from "react"
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

const TransactionCard = ({ transactions, loading, onViewAll }) => {
  // Get last 5 transactions sorted by date (newest first)
  const recentTransactions = useMemo(() => {
    if (!transactions || transactions.length === 0) return []

    return transactions
      .sort(
        (a, b) =>
          new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
      )
      .slice(0, 5)
  }, [transactions])

  const formatAmount = (amount, type) => {
    const formattedAmount = `₹${Math.abs(amount).toFixed(0)}`
    return type === "income" ? `+${formattedAmount}` : `-${formattedAmount}`
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      })
    }
  }

  const getTransactionIcon = (type, category) => {
    if (type === "transfer") return "swap-horizontal"
    if (type === "income") return "trending-up"

    // Category-based icons for expenses
    const categoryIcons = {
      food: "restaurant",
      transport: "car",
      shopping: "bag",
      entertainment: "game-controller",
      healthcare: "medical",
      education: "school",
      utilities: "flash",
      rent: "home",
      fuel: "car-sport",
    }

    return categoryIcons[category?.toLowerCase()] || "trending-down"
  }

  const getTransactionColor = (type) => {
    switch (type) {
      case "income":
        return "#1CC29F"
      case "transfer":
        return "#45B7D1"
      default:
        return "#FF6B6B"
    }
  }

  const handleTransactionPress = (transaction) => {
    router.push(`/transactions/edit?id=${transaction._id}`)
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Recent Transactions</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1CC29F" />
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent Transactions</Text>
        <Text style={styles.subtitle}>
          {transactions?.length || 0} transactions
        </Text>
      </View>

      {recentTransactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons name="receipt-outline" size={48} color="#9CA3AF" />
          </View>
          <Text style={styles.emptyTitle}>No transactions yet</Text>
          <Text style={styles.emptyText}>
            Start tracking your income and expenses
          </Text>
          <TouchableOpacity
            style={styles.addFirstButton}
            onPress={() => router.push("/transactions/add")}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addFirstButtonText}>Add Transaction</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.transactionsList}>
            {recentTransactions.map((transaction, index) => (
              <TouchableOpacity
                key={transaction._id || index}
                style={[
                  styles.transactionItem,
                  index === recentTransactions.length - 1 && styles.lastItem,
                ]}
                onPress={() => handleTransactionPress(transaction)}
                activeOpacity={0.7}
              >
                <View style={styles.transactionLeft}>
                  <View
                    style={[
                      styles.transactionIcon,
                      {
                        backgroundColor: `${getTransactionColor(
                          transaction.type
                        )}20`,
                      },
                    ]}
                  >
                    <Ionicons
                      name={getTransactionIcon(
                        transaction.type,
                        transaction.categoryId?.label
                      )}
                      size={20}
                      color={getTransactionColor(transaction.type)}
                    />
                  </View>
                  <View style={styles.transactionDetails}>
                    <Text
                      style={styles.transactionDescription}
                      numberOfLines={1}
                    >
                      {transaction.description || "No description"}
                    </Text>
                    <View style={styles.transactionMeta}>
                      <Text style={styles.transactionAccount}>
                        {transaction.accountId?.name || transaction.accountId}
                      </Text>
                      {transaction.type === "transfer" &&
                        transaction.toAccount && (
                          <>
                            <Ionicons
                              name="arrow-forward"
                              size={12}
                              color="#9CA3AF"
                              style={styles.arrowIcon}
                            />
                            <Text style={styles.transactionAccount}>
                              {transaction.toAccountId.name}
                            </Text>
                          </>
                        )}
                    </View>
                  </View>
                </View>
                <View style={styles.transactionRight}>
                  <Text
                    style={[
                      styles.transactionAmount,
                      { color: getTransactionColor(transaction.type) },
                    ]}
                  >
                    {formatAmount(transaction.amount, transaction.type)}
                  </Text>
                  <Text style={styles.transactionDate}>
                    {formatDate(transaction.date || transaction.createdAt)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={onViewAll || (() => router.push("/transactions"))}
          >
            <Text style={styles.viewAllText}>View All Transactions</Text>
            <Ionicons name="chevron-forward" size={16} color="#1CC29F" />
          </TouchableOpacity>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    margin: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    padding: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9CA3AF",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  addFirstButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1CC29F",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  addFirstButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  transactionsList: {
    paddingHorizontal: 20,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 16,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  transactionMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  transactionAccount: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  arrowIcon: {
    marginHorizontal: 4,
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 13,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    gap: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1CC29F",
    letterSpacing: 0.5,
  },
})

export default TransactionCard
