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

export default function ScheduledTransactionsScreen() {
  const [scheduledTransactions, setScheduledTransactions] = useState([
    {
      id: 1,
      title: "Rent Payment",
      amount: 15000,
      type: "expense",
      frequency: "monthly",
      nextDue: "2025-09-01",
      category: "Housing",
      active: true,
    },
    {
      id: 2,
      title: "Salary",
      amount: 75000,
      type: "income",
      frequency: "monthly",
      nextDue: "2025-08-30",
      category: "Salary",
      active: true,
    },
    {
      id: 3,
      title: "Netflix Subscription",
      amount: 499,
      type: "expense",
      frequency: "monthly",
      nextDue: "2025-08-25",
      category: "Entertainment",
      active: false,
    },
  ])

  const [showAddModal, setShowAddModal] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)

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
      default:
        return "time-outline"
    }
  }

  const toggleTransaction = (id) => {
    setScheduledTransactions((prev) =>
      prev.map((transaction) =>
        transaction.id === id
          ? { ...transaction, active: !transaction.active }
          : transaction
      )
    )
  }

  const deleteTransaction = (id) => {
    Alert.alert(
      "Delete Scheduled Transaction",
      "Are you sure you want to delete this scheduled transaction?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setScheduledTransactions((prev) => prev.filter((t) => t.id !== id))
          },
        },
      ]
    )
  }

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
            onPress={() => setShowAddModal(true)}
            style={styles.addButton}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {scheduledTransactions.filter((t) => t.active).length}
              </Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {scheduledTransactions.filter((t) => !t.active).length}
              </Text>
              <Text style={styles.statLabel}>Paused</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {formatCurrency(
                  scheduledTransactions
                    .filter((t) => t.active && t.type === "expense")
                    .reduce((sum, t) => sum + t.amount, 0)
                )}
              </Text>
              <Text style={styles.statLabel}>Monthly Out</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Scheduled Transactions</Text>
          <View style={styles.transactionsList}>
            {scheduledTransactions.map((transaction) => (
              <View key={transaction.id} style={styles.transactionItem}>
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
                        transaction.type === "income"
                          ? "trending-up"
                          : "trending-down"
                      }
                      size={20}
                      color={
                        transaction.type === "income" ? "#10B981" : "#EF4444"
                      }
                    />
                  </View>
                  <View style={styles.transactionDetails}>
                    <Text style={styles.transactionTitle}>
                      {transaction.title}
                    </Text>
                    <Text style={styles.transactionCategory}>
                      {transaction.category}
                    </Text>
                    <View style={styles.scheduleInfo}>
                      <Ionicons
                        name={getFrequencyIcon(transaction.frequency)}
                        size={12}
                        color="#6B7280"
                      />
                      <Text style={styles.frequencyText}>
                        {transaction.frequency} • Next:{" "}
                        {formatDate(transaction.nextDue)}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.transactionRight}>
                  <Text
                    style={[
                      styles.transactionAmount,
                      {
                        color:
                          transaction.type === "income" ? "#10B981" : "#EF4444",
                      },
                    ]}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </Text>

                  <View style={styles.transactionActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => toggleTransaction(transaction.id)}
                    >
                      <Ionicons
                        name={transaction.active ? "pause" : "play"}
                        size={16}
                        color={transaction.active ? "#F59E0B" : "#10B981"}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => deleteTransaction(transaction.id)}
                    >
                      <Ionicons name="trash" size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>

                {!transaction.active && (
                  <View style={styles.pausedOverlay}>
                    <Text style={styles.pausedText}>Paused</Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          {scheduledTransactions.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>No scheduled transactions</Text>
              <Text style={styles.emptySubtext}>
                Add recurring transactions to automate your finances
              </Text>
              <TouchableOpacity
                style={styles.emptyActionButton}
                onPress={() => setShowAddModal(true)}
              >
                <Text style={styles.emptyActionText}>
                  Add Scheduled Transaction
                </Text>
              </TouchableOpacity>
            </View>
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
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
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
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
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
  pausedOverlay: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#F59E0B",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pausedText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginTop: 16,
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
})
