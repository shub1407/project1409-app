import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { BackgroundSMSService } from "../../../src/services/sms/BackgroundSMSService"

export default function PendingTransactionsScreen() {
  const router = useRouter()
  const [pendingTransactions, setPendingTransactions] = useState([])
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadPendingTransactions()
  }, [])

  const loadPendingTransactions = async () => {
    try {
      const pending = await BackgroundSMSService.checkPendingTransactions()
      setPendingTransactions(pending)
    } catch (error) {
      console.error("Error loading pending transactions:", error)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadPendingTransactions()
    setRefreshing(false)
  }

  const openTransactionModal = (transaction) => {
    router.push({
      pathname: "/users/add-record",
      params: { transaction: JSON.stringify(transaction) },
    })
  }

  const renderTransactionItem = ({ item }) => (
    <TouchableOpacity
      style={styles.transactionCard}
      onPress={() => openTransactionModal(item)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.amountText}>
          ₹{item.amount} {item.type === "expense" ? "💸" : "💰"}
        </Text>
        <Text style={styles.timeText}>{item.timestamp}</Text>
      </View>

      <Text style={styles.messageText} numberOfLines={2}>
        {item.message}
      </Text>

      <View style={styles.cardFooter}>
        <Text style={styles.phoneText}>From: {item.phone}</Text>
        <Text style={styles.tapText}>Tap to add →</Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      {pendingTransactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyTitle}>No Pending Transactions</Text>
          <Text style={styles.emptySubtitle}>
            SMS transactions will appear here automatically
          </Text>
        </View>
      ) : (
        <FlatList
          data={pendingTransactions}
          keyExtractor={(item) => item.key}
          renderItem={renderTransactionItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  listContainer: {
    padding: 15,
  },
  transactionCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  amountText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  timeText: {
    fontSize: 12,
    color: "#888",
  },
  messageText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  phoneText: {
    fontSize: 12,
    color: "#888",
  },
  tapText: {
    fontSize: 12,
    color: "#007AFF",
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
})
