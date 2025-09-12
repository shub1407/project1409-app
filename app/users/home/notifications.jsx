import { Ionicons } from "@expo/vector-icons"
import { useFocusEffect, useRouter } from "expo-router"
import { useCallback, useEffect, useRef, useState } from "react"
import {
  Alert,
  Animated,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler"
import { BackgroundSMSService } from "../../../src/services/sms/BackgroundSMSService"

export default function PendingTransactionsScreen() {
  const router = useRouter()
  const [pendingTransactions, setPendingTransactions] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const swipeableRefs = useRef({})

  useEffect(() => {
    loadPendingTransactions()
  }, [])
  useFocusEffect(
    // Refresh the list when screen is focused
    useCallback(() => {
      loadPendingTransactions()
    }, [])
  )

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

  const closeOtherSwipeables = (currentKey) => {
    Object.keys(swipeableRefs.current).forEach((key) => {
      if (key !== currentKey && swipeableRefs.current[key]) {
        swipeableRefs.current[key].close()
      }
    })
  }

  const handleDelete = (key) => {
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to dismiss this SMS transaction?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await BackgroundSMSService.clearTransaction(key)
              setPendingTransactions((prev) =>
                prev.filter((item) => item.key !== key)
              )

              // Close the swipeable row
              if (swipeableRefs.current[key]) {
                swipeableRefs.current[key].close()
              }
            } catch (error) {
              console.error("Error deleting transaction:", error)
              Alert.alert("Error", "Failed to delete transaction")
            }
          },
        },
      ]
    )
  }

  const renderRightActions = (progress, dragX, itemKey) => {
    // Fixed translation to prevent message going too far left
    const translateX = dragX.interpolate({
      inputRange: [-100, -50, 0],
      outputRange: [0, 10, 75],
      extrapolate: "clamp",
    })

    const scale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 1],
      extrapolate: "clamp",
    })

    return (
      <View style={styles.rightActionsContainer}>
        <Animated.View
          style={[
            styles.deleteAction,
            {
              transform: [{ translateX }, { scale }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(itemKey)}
          >
            <Ionicons name="trash-outline" size={22} color="#FFFFFF" />
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    )
  }

  const renderTransactionItem = ({ item }) => (
    <Swipeable
      ref={(ref) => {
        if (ref) {
          swipeableRefs.current[item.key] = ref
        }
      }}
      renderRightActions={(progress, dragX) =>
        renderRightActions(progress, dragX, item.key)
      }
      onSwipeableWillOpen={() => closeOtherSwipeables(item.key)}
      rightThreshold={40}
      friction={1.5}
      overshootRight={false}
    >
      <View style={styles.transactionCardWrapper}>
        <TouchableOpacity
          style={styles.transactionCard}
          onPress={() => openTransactionModal(item)}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <View style={styles.amountSection}>
              <Text style={styles.amountText}>₹{item.amount}</Text>
              <View
                style={[
                  styles.typeBadge,
                  {
                    backgroundColor:
                      item.type === "expense" ? "#FF6B6B" : "#1CC29F",
                  },
                ]}
              >
                <Text style={styles.typeBadgeText}>
                  {item.type === "expense" ? "💸 Expense" : "💰 Income"}
                </Text>
              </View>
            </View>
            <Text style={styles.timeText}>{item.timestamp}</Text>
          </View>

          <Text style={styles.messageText} numberOfLines={2}>
            {item.message}
          </Text>

          <View style={styles.cardFooter}>
            <View style={styles.phoneContainer}>
              <Ionicons name="phone-portrait-outline" size={16} color="#666" />
              <Text style={styles.phoneText}>From: {item.phone}</Text>
            </View>
            <View style={styles.actionHint}>
              <Text style={styles.tapText}>Tap to add</Text>
              <Ionicons name="chevron-forward" size={16} color="#007AFF" />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </Swipeable>
  )

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={styles.safeArea}>
        {/* Header with consistent styling */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.headerButton}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Pending Transactions</Text>
            {pendingTransactions.length > 0 && (
              <Text style={styles.headerSubtitle}>
                {pendingTransactions.length} SMS transaction
                {pendingTransactions.length > 1 ? "s" : ""} waiting
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={onRefresh}
            style={styles.headerButton}
            disabled={refreshing}
          >
            <Ionicons
              name="refresh"
              size={24}
              color={refreshing ? "#999" : "#007AFF"}
            />
          </TouchableOpacity>
        </View>

        {/* Content */}
        {pendingTransactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="mail-open-outline" size={64} color="#DDD" />
            </View>
            <Text style={styles.emptyTitle}>No Pending Transactions</Text>
            <Text style={styles.emptySubtitle}>
              SMS transactions will appear here automatically when detected
            </Text>
            <TouchableOpacity
              style={styles.refreshEmptyButton}
              onPress={onRefresh}
            >
              <Ionicons name="refresh" size={20} color="#e0ecf8ff" />
              <Text style={styles.refreshEmptyButtonText}>
                Check for new messages
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={pendingTransactions}
            keyExtractor={(item) => item.key}
            renderItem={renderTransactionItem}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#007AFF"]}
                tintColor="#007AFF"
              />
            }
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Swipe Hint */}
        {pendingTransactions.length > 0 && (
          <View style={styles.swipeHint}>
            <Ionicons name="chevron-back" size={16} color="#999" />
            <Text style={styles.swipeHintText}>Swipe left to delete</Text>
          </View>
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  safeArea: {
    flex: 1,
  },

  // Header Styles - Consistent with your app
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },

  // List Styles
  listContainer: {
    padding: 15,
    paddingBottom: 80,
  },
  transactionCardWrapper: {
    marginBottom: 10,
  },
  transactionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  amountSection: {
    flex: 1,
  },
  amountText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 6,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  typeBadgeText: {
    fontSize: 11,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  timeText: {
    fontSize: 11,
    color: "#999",
    textAlign: "right",
    marginTop: 2,
  },
  messageText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  phoneText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 6,
  },
  actionHint: {
    flexDirection: "row",
    alignItems: "center",
  },
  tapText: {
    fontSize: 12,
    color: "#007AFF",
    fontWeight: "500",
    marginRight: 4,
  },

  // Swipe Delete Styles - Fixed positioning
  rightActionsContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingLeft: 10,
  },
  deleteAction: {
    alignItems: "center",
    justifyContent: "center",
    width: 75,
    height: "88%",
    borderRadius: 10,
    marginRight: 5,
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
    width: "100%",
    height: "100%",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 3,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  refreshEmptyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1CC29F",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  refreshEmptyButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "500",
    marginLeft: 8,
  },

  // Swipe Hint
  swipeHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    backgroundColor: "#F8F9FA",
    borderTopWidth: 1,
    borderTopColor: "#E9ECEF",
  },
  swipeHintText: {
    fontSize: 12,
    color: "#999",
    marginLeft: 6,
  },
})
