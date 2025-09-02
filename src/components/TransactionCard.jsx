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
import TransactionItem from "./TransactionItem"
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

  const getTransactionTypeColor = (type) => {
    const colors = {
      income: "#1CC29F",
      expense: "#ff1e1eff",
      transfer: "#45B7D1",
    }
    return colors[type] || "#6B7280"
  }
  const formatCurrency = (amount) => {
    return `₹${Math.abs(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
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
          Last {transactions?.length || 0} transactions
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
            onPress={() => router.push("/users/add-record")}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addFirstButtonText}>Add Transaction</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.transactionsList}>
            {recentTransactions.map((transaction, index) => (
              <View key={transaction.id} style={styles.transactionItem}>
                <TransactionItem
                  transaction={transaction}
                  getTransactionTypeColor={getTransactionTypeColor}
                  formatCurrency={formatCurrency}
                  homePage={true}
                />
              </View>
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
    paddingVertical: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#e2ebdfd7",
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
