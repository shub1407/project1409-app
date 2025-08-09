import { Ionicons } from "@expo/vector-icons"
import { FlatList, StyleSheet, Text, View } from "react-native"
import TransactionItem from "./TransactionItem"

const TransactionList = ({
  transactions,
  accounts,
  refreshControl,
  onTransactionUpdate,
  transactionSummary,
}) => {
  const formatCurrency = (amount) => {
    return `₹${Math.abs(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  const getTransactionTypeColor = (type) => {
    const colors = {
      income: "#1CC29F",
      expense: "#ff1e1eff",
      transfer: "#45B7D1",
    }
    return colors[type] || "#6B7280"
  }

  const getTransactionIcon = (type) => {
    const icons = {
      income: "trending-up",
      expense: "trending-down",
      transfer: "swap-horizontal",
    }
    return icons[type] || "cash"
  }

  const getAccountName = (accountId) => {
    const account = accounts.find((acc) => acc.id === accountId)
    return account?.name || "Unknown Account"
  }

  // Group transactions by date
  const groupTransactionsByDate = (transactions) => {
    const grouped = transactions.reduce((groups, transaction) => {
      const date = new Date(transaction.date).toDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(transaction)
      return groups
    }, {})

    // Convert to array format for FlatList and sort by date (newest first)
    return Object.keys(grouped)
      .sort((a, b) => new Date(b) - new Date(a))
      .map((date) => ({
        date,
        transactions: grouped[date].sort(
          (a, b) =>
            new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
        ),
      }))
  }

  // Format date for display
  const formatDateHeader = (dateString) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date()
    yesterday.setDate(today.getDate() - 1)

    // Check if it's today
    if (date.toDateString() === today.toDateString()) {
      return "Today"
    }

    // Check if it's yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    }

    // Format other dates
    return date.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "2-digit",
      month: "short",
      year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    })
  }

  // Calculate daily totals
  const calculateDayTotal = (dayTransactions) => {
    const income = dayTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0)

    const expenses = dayTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0)

    const netAmount = income - expenses

    return { income, expenses, netAmount }
  }

  // Prepare data for FlatList
  const groupedTransactions = groupTransactionsByDate(transactions)
  const flatListData = []

  groupedTransactions.forEach((group) => {
    // Add date header
    flatListData.push({
      type: "header",
      date: group.date,
      transactions: group.transactions,
      id: `header-${group.date}`,
    })

    // Add all transactions for this date
    group.transactions.forEach((transaction) => {
      flatListData.push({
        type: "transaction",
        ...transaction,
      })
    })
  })

  const renderItem = ({ item }) => {
    if (item.type === "header") {
      const dayTotals = calculateDayTotal(item.transactions)

      return (
        <View style={styles.dateHeader}>
          <View style={styles.dateHeaderTop}>
            <Text style={styles.dateText}>{formatDateHeader(item.date)}</Text>
            <Text style={styles.transactionCountText}>
              {item.transactions.length} transaction
              {item.transactions.length !== 1 ? "s" : ""}
            </Text>
          </View>

          <View style={styles.dayTotals}>
            {dayTotals.income > 0 && (
              <View style={styles.dayTotalItem}>
                <Ionicons name="trending-up" size={14} color="#1CC29F" />
                <Text style={[styles.dayTotalText, { color: "#1CC29F" }]}>
                  +{formatCurrency(dayTotals.income)}
                </Text>
              </View>
            )}

            {dayTotals.expenses > 0 && (
              <View style={styles.dayTotalItem}>
                <Ionicons name="trending-down" size={14} color="#FF6B6B" />
                <Text style={[styles.dayTotalText, { color: "#FF6B6B" }]}>
                  -{formatCurrency(dayTotals.expenses)}
                </Text>
              </View>
            )}

            {dayTotals.income > 0 && dayTotals.expenses > 0 && (
              <View style={styles.dayTotalItem}>
                <Ionicons
                  name={
                    dayTotals.netAmount >= 0
                      ? "checkmark-circle"
                      : "close-circle"
                  }
                  size={14}
                  color={dayTotals.netAmount >= 0 ? "#1CC29F" : "#FF6B6B"}
                />
                <Text
                  style={[
                    styles.dayTotalText,
                    { color: dayTotals.netAmount >= 0 ? "#1CC29F" : "#FF6B6B" },
                  ]}
                >
                  {dayTotals.netAmount >= 0 ? "+" : ""}
                  {formatCurrency(dayTotals.netAmount)}
                </Text>
              </View>
            )}
          </View>
        </View>
      )
    }

    // Render transaction item
    return (
      <TransactionItem
        transaction={item}
        accounts={accounts}
        onUpdate={onTransactionUpdate}
        formatCurrency={formatCurrency}
        getTransactionTypeColor={getTransactionTypeColor}
        getTransactionIcon={getTransactionIcon}
        getAccountName={getAccountName}
      />
    )
  }

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="receipt-outline" size={64} color="#9CA3AF" />
      <Text style={styles.emptyTitle}>No Transactions Found</Text>
      <Text style={styles.emptySubtitle}>
        Start by adding your first income or expense
      </Text>
    </View>
  )

  const renderHeader = () => {
    if (transactions.length === 0) return null

    return (
      <View style={styles.listHeader}>
        <Text style={styles.transactionCount}>
          {transactions.length} transaction
          {transactions.length !== 1 ? "s" : ""} found
        </Text>
      </View>
    )
  }

  const ItemSeparator = ({ leadingItem }) => {
    // Don't show separator after date headers or before date headers
    if (leadingItem?.type === "header") return null

    return <View style={styles.separator} />
  }

  return (
    <FlatList
      data={flatListData}
      renderItem={renderItem}
      keyExtractor={(item) =>
        item.id || item._id || `${item.type}-${item.date}`
      }
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
      ListEmptyComponent={renderEmptyComponent}
      ListHeaderComponent={renderHeader}
      ItemSeparatorComponent={ItemSeparator}
      stickySectionHeadersEnabled={false}
    />
  )
}

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: 20,
  },
  listHeader: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  transactionCount: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  separator: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginHorizontal: 24,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#374151",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 24,
  },
  // New styles for date grouping
  dateHeader: {
    backgroundColor: "#F8FBFF",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E8F4FD",
    marginBottom: 0,
  },
  dateHeaderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  transactionCountText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  dayTotals: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  dayTotalItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  dayTotalText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
})

export default TransactionList
