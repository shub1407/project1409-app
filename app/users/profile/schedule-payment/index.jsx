import { Ionicons } from "@expo/vector-icons"
import { router, useFocusEffect } from "expo-router"
import { useCallback, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { useScheduledTransactionContext } from "../../../../src/context/ScheduledTransactionContext"

export default function ScheduledTransactionsScreen() {
  const {
    scheduledTransactions,
    stats,
    loading,
    toggleTransactionStatus,
    deleteScheduledTransaction,
    refreshData,
    fetchScheduledTransactions,
  } = useScheduledTransactionContext()

  const [refreshing, setRefreshing] = useState(false)

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refreshData()
    }, [])
  )

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refreshData()
    } catch (error) {
      console.error("Error refreshing data:", error)
    } finally {
      setRefreshing(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const getFrequencyIcon = (frequency) => {
    switch (frequency) {
      case "daily":
        return "today-outline"
      case "weekly":
        return "calendar-outline"
      case "monthly":
        return "calendar"
      case "yearly":
        return "calendar-sharp"
      case "one-time":
        return "time-outline"
      default:
        return "time-outline"
    }
  }

  const toggleTransaction = async (id) => {
    try {
      await toggleTransactionStatus(id)
    } catch (error) {
      console.error("Error toggling transaction:", error)
      const errorMessage =
        error.response?.data?.message || "Failed to update transaction status"
      Alert.alert("Error", errorMessage)
    }
  }

  const deleteTransaction = (transaction) => {
    Alert.alert(
      "Delete Scheduled Transaction",
      `Are you sure you want to delete "${transaction.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteScheduledTransaction(transaction._id)
            } catch (error) {
              console.error("Error deleting transaction:", error)
              const errorMessage =
                error.response?.data?.message || "Failed to delete transaction"
              Alert.alert("Error", errorMessage)
            }
          },
        },
      ]
    )
  }

  const handleEditTransaction = (transaction) => {
    router.push({
      pathname: `/users/profile/schedule-payment/${transaction._id}`,
    })
  }

  const getStatusColor = (transaction) => {
    if (transaction.status === "paused") return "#F59E0B"
    if (transaction.isOverdue) return "#EF4444"
    return transaction.type === "income" ? "#10B981" : "#EF4444"
  }

  const renderTransaction = (transaction) => (
    <TouchableOpacity
      key={transaction._id}
      style={[
        styles.transactionItem,
        transaction.status === "paused" && styles.transactionItemPaused,
      ]}
      onPress={() => handleEditTransaction(transaction)}
      activeOpacity={0.7}
    >
      <View style={styles.transactionLeft}>
        <View
          style={[
            styles.transactionIcon,
            {
              backgroundColor:
                transaction.type === "income" ? "#D1FAE5" : "#FEE2E2",
            },
          ]}
        >
          <Ionicons
            name={
              transaction.type === "income" ? "trending-up" : "trending-down"
            }
            size={20}
            color={transaction.type === "income" ? "#10B981" : "#EF4444"}
          />
        </View>
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionTitle}>{transaction.name}</Text>
          <Text style={styles.transactionCategory}>
            {transaction.categoryId?.label || "No category"} •{" "}
            {transaction.fromAccountId?.name || "Unknown account"}
          </Text>
          <View style={styles.scheduleInfo}>
            <Ionicons
              name={getFrequencyIcon(transaction.frequency)}
              size={12}
              color="#6B7280"
            />
            <Text style={styles.frequencyText}>
              {transaction.frequency} • Next:{" "}
              {formatDate(transaction.nextDueDate)}
            </Text>
          </View>
          {/* Show execution count for recurring transactions */}
          {transaction.executionCount > 0 && (
            <Text style={styles.executionCount}>
              Executed {transaction.executionCount} time
              {transaction.executionCount !== 1 ? "s" : ""}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.transactionRight}>
        <Text
          style={[
            styles.transactionAmount,
            { color: getStatusColor(transaction) },
          ]}
        >
          {transaction.type === "income" ? "+" : "-"}
          {formatCurrency(transaction.amount)}
        </Text>

        <View style={styles.transactionActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation()
              toggleTransaction(transaction._id)
            }}
          >
            <Ionicons
              name={transaction.status === "active" ? "pause" : "play"}
              size={16}
              color={transaction.status === "active" ? "#F59E0B" : "#10B981"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation()
              deleteTransaction(transaction)
            }}
          >
            <Ionicons name="trash" size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Status Overlays */}
      {transaction.status === "paused" && (
        <View style={[styles.statusOverlay, { backgroundColor: "#F59E0B" }]}>
          <Text style={styles.statusText}>Paused</Text>
        </View>
      )}

      {transaction.isOverdue && (
        <View
          style={[
            styles.statusOverlay,
            { backgroundColor: "#EF4444", top: 32 },
          ]}
        >
          <Text style={styles.statusText}>Overdue</Text>
        </View>
      )}

      {transaction.status === "completed" && (
        <View style={[styles.statusOverlay, { backgroundColor: "#10B981" }]}>
          <Text style={styles.statusText}>Completed</Text>
        </View>
      )}
    </TouchableOpacity>
  )

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
          <Text style={styles.headerTitle}>Scheduled Transactions</Text>
          <TouchableOpacity
            onPress={() => router.push("/users/profile/schedule-payment/add")}
            style={styles.addButton}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#1CC29F"]}
              tintColor="#1CC29F"
            />
          }
        >
          {/* Statistics Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.active || 0}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.paused || 0}</Text>
              <Text style={styles.statLabel}>Paused</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { fontSize: 14 }]}>
                {formatCurrency(stats.totalMonthlyExpenses || 0)}
              </Text>
              <Text style={styles.statLabel}>Monthly Out</Text>
            </View>
          </View>

          {/* Overdue Alert */}
          {stats.overdue > 0 && (
            <View style={styles.overdueAlert}>
              <Ionicons name="warning" size={20} color="#F59E0B" />
              <View>
                <Text style={styles.overdueTitle}>Overdue Transactions</Text>
                <Text style={styles.overdueText}>
                  {stats.overdue} transaction{stats.overdue !== 1 ? "s" : ""}{" "}
                  overdue
                </Text>
              </View>
            </View>
          )}

          {/* Net Flow Card */}
          {(stats.totalMonthlyIncome > 0 || stats.totalMonthlyExpenses > 0) && (
            <View style={styles.netFlowCard}>
              <Text style={styles.netFlowTitle}>Monthly Net Flow</Text>
              <View style={styles.netFlowDetails}>
                <View style={styles.flowItem}>
                  <Text style={styles.flowLabel}>Income</Text>
                  <Text style={[styles.flowValue, { color: "#10B981" }]}>
                    +{formatCurrency(stats.totalMonthlyIncome || 0)}
                  </Text>
                </View>
                <View style={styles.flowItem}>
                  <Text style={styles.flowLabel}>Expenses</Text>
                  <Text style={[styles.flowValue, { color: "#EF4444" }]}>
                    -{formatCurrency(stats.totalMonthlyExpenses || 0)}
                  </Text>
                </View>
                <View style={[styles.flowItem, styles.netFlowItem]}>
                  <Text style={styles.flowLabel}>Net</Text>
                  <Text
                    style={[
                      styles.flowValue,
                      styles.netFlowValue,
                      {
                        color:
                          stats.netMonthlyFlow >= 0 ? "#10B981" : "#EF4444",
                      },
                    ]}
                  >
                    {stats.netMonthlyFlow >= 0 ? "+" : ""}
                    {formatCurrency(stats.netMonthlyFlow || 0)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          <Text style={styles.sectionTitle}>
            Scheduled Transactions ({scheduledTransactions.length})
          </Text>

          {/* Loading State */}
          {loading && scheduledTransactions.length === 0 && (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color="#1CC29F" />
              <Text style={styles.loadingText}>Loading transactions...</Text>
            </View>
          )}

          {/* Transactions List */}
          <View style={styles.transactionsList}>
            {scheduledTransactions.map(renderTransaction)}
          </View>

          {/* Empty State */}
          {scheduledTransactions.length === 0 && !loading && (
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIcon}>
                <Ionicons name="time-outline" size={48} color="#D1D5DB" />
              </View>
              <Text style={styles.emptyText}>No scheduled transactions</Text>
              <Text style={styles.emptySubtext}>
                Add recurring transactions to automate your finances
              </Text>
              <TouchableOpacity
                style={styles.emptyActionButton}
                onPress={() =>
                  router.push("/users/profile/schedule-payment/add")
                }
              >
                <Text style={styles.emptyActionText}>
                  Add Scheduled Transaction
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Filter/Sort Options (Future Enhancement) */}
          {scheduledTransactions.length > 5 && (
            <TouchableOpacity style={styles.filterButton}>
              <Ionicons name="filter-outline" size={16} color="#6B7280" />
              <Text style={styles.filterText}>Filter & Sort</Text>
            </TouchableOpacity>
          )}
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
    textAlign: "center",
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  overdueAlert: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
  },
  overdueTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#D97706",
  },
  overdueText: {
    fontSize: 12,
    color: "#92400E",
  },
  netFlowCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  netFlowTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
    textAlign: "center",
  },
  netFlowDetails: {
    gap: 8,
  },
  flowItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  netFlowItem: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 8,
    marginTop: 8,
  },
  flowLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  flowValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  netFlowValue: {
    fontWeight: "700",
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  loadingState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
  },
  transactionsList: {
    gap: 12,
  },
  transactionItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  transactionItemPaused: {
    backgroundColor: "#FEFBF3",
    borderWidth: 1,
    borderColor: "#FCD34D",
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 16,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  transactionCategory: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 4,
  },
  scheduleInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  frequencyText: {
    fontSize: 12,
    color: "#6B7280",
  },
  executionCount: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 2,
    fontStyle: "italic",
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  transactionActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
  },
  statusOverlay: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  emptyActionButton: {
    backgroundColor: "#1CC29F",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  emptyActionText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
})
