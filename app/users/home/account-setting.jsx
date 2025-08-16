import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useCallback, useEffect, useState } from "react"
import {
  Alert,
  Animated,
  Dimensions,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import DraggableFlatList, {
  OpacityDecorator,
  ScaleDecorator,
} from "react-native-draggable-flatlist"
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler"
import { useAccountsContext } from "../../../src/context/AccountContext"

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

export default function AccountSettingsScreen() {
  const { accounts, updateAccountOrder, deleteAccount, refreshAccounts } =
    useAccountsContext()
  const [accountList, setAccountList] = useState([])
  const swipeableRefs = useState(new Map())[0]
  const [fadeAnim] = useState(new Animated.Value(0))
  const [slideAnim] = useState(new Animated.Value(-50))

  useEffect(() => {
    if (accounts && accounts.length > 0) {
      setAccountList(
        accounts.map((account, index) => ({
          ...account,
          key: account.id?.toString() || `account_${index}`,
          order: account.order !== undefined ? account.order : index,
          balance: account.balance || 0,
        }))
      )
    } else {
      setAccountList([])
    }

    // Animate screen entry
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start()
  }, [accounts])

  const formatCurrency = (amount) => {
    if (typeof amount !== "number") return "₹0.00"
    return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
  }

  const getAccountIcon = (type) => {
    const iconMap = {
      cash: "wallet",
      bank: "card",
      upi: "phone-portrait",
      credit: "card-outline",
      savings: "archive",
      default: "wallet-outline",
    }
    return iconMap[type?.toLowerCase()] || iconMap.default
  }

  const handleEditAccount = (account) => {
    swipeableRefs.forEach((ref) => ref?.close())
    router.push({
      pathname: "/users/home/edit-account",
      params: { accountId: account.id },
    })
  }

  const handleDeleteAccount = (accountId, accountName) => {
    Alert.alert(
      "Delete Account",
      `Are you sure you want to delete "${accountName}"? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => {
            const ref = swipeableRefs.get(accountId)
            ref?.close()
          },
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAccount(accountId)
              await refreshAccounts()
              swipeableRefs.delete(accountId)
            } catch (error) {
              console.error("Delete error:", error)
              Alert.alert("Error", "Failed to delete account")
            }
          },
        },
      ]
    )
  }

  const handleSaveOrder = async () => {
    try {
      const orderedAccounts = accountList.map((account, index) => ({
        ...account,
        order: index,
      }))

      await updateAccountOrder(orderedAccounts)
      Alert.alert("Success", "Account order saved successfully", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ])
    } catch (error) {
      console.error("Save order error:", error)
      Alert.alert("Error", "Failed to save account order")
    }
  }

  const renderRightActions = useCallback((item) => {
    return (
      <View style={styles.rightActionsContainer}>
        <TouchableOpacity
          style={styles.deleteAction}
          onPress={() => handleDeleteAccount(item.id, item.name)}
          activeOpacity={0.8}
        >
          <Ionicons name="trash" size={20} color="#FFFFFF" />
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    )
  }, [])

  const renderAccountItem = ({ item, drag, isActive }) => {
    const balanceColor = item.balance >= 0 ? "#1CC29F" : "#EF4444"

    return (
      <ScaleDecorator>
        <OpacityDecorator activeOpacity={0.95}>
          <Swipeable
            ref={(ref) => {
              if (ref) {
                swipeableRefs.set(item.id, ref)
              }
            }}
            renderRightActions={() => renderRightActions(item)}
            rightThreshold={40}
            friction={2}
            overshootRight={false}
            overshootLeft={false}
            onSwipeableOpen={() => {
              swipeableRefs.forEach((ref, id) => {
                if (id !== item.id) {
                  ref?.close()
                }
              })
            }}
            containerStyle={styles.swipeableContainer}
          >
            <View
              style={[styles.accountItem, isActive && styles.accountItemActive]}
            >
              <TouchableOpacity
                style={styles.accountContent}
                onPress={() => handleEditAccount(item)}
                activeOpacity={0.7}
              >
                <View style={styles.accountInfo}>
                  {/* Enhanced Account Icon */}
                  <View
                    style={[
                      styles.accountIconContainer,
                      { backgroundColor: item.color || "#1CC29F" },
                    ]}
                  >
                    <Ionicons
                      name={getAccountIcon(item.type)}
                      size={20}
                      color="#FFFFFF"
                    />
                  </View>

                  <View style={styles.accountDetails}>
                    <Text style={styles.accountName} numberOfLines={1}>
                      {item.name || "Unnamed Account"}
                    </Text>
                    <Text
                      style={[styles.accountBalance, { color: balanceColor }]}
                    >
                      {formatCurrency(item.balance)}
                    </Text>
                    {item.type && (
                      <Text style={styles.accountType}>{item.type}</Text>
                    )}
                  </View>
                </View>

                <View style={styles.accountMeta}>
                  <TouchableOpacity
                    style={styles.dragHandle}
                    onLongPress={drag}
                    delayLongPress={100}
                    activeOpacity={0.6}
                  >
                    <Ionicons name="reorder-three" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                  <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
                </View>
              </TouchableOpacity>
            </View>
          </Swipeable>
        </OpacityDecorator>
      </ScaleDecorator>
    )
  }

  const onDragEnd = ({ data }) => {
    setAccountList(data)
  }

  const totalBalance = accountList.reduce(
    (sum, acc) => sum + (acc.balance || 0),
    0
  )

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1CC29F" />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Animated.View
            style={[
              styles.headerContent,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Manage Accounts</Text>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveOrder}
            >
              <Ionicons name="checkmark" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Content Area */}
        <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
          {accountList.length > 0 ? (
            <>
              {/* Compact Stats Header */}
              <View style={styles.statsContainer}>
                <View style={styles.statsContent}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{accountList.length}</Text>
                    <Text style={styles.statLabel}>Accounts</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text
                      style={[
                        styles.statValue,
                        { color: totalBalance >= 0 ? "#1CC29F" : "#EF4444" },
                      ]}
                    >
                      {formatCurrency(totalBalance)}
                    </Text>
                    <Text style={styles.statLabel}>Total Balance</Text>
                  </View>
                </View>
              </View>

              {/* Account List */}
              <View style={styles.listContainer}>
                <DraggableFlatList
                  data={accountList}
                  onDragEnd={onDragEnd}
                  keyExtractor={(item) => item.key}
                  renderItem={renderAccountItem}
                  contentContainerStyle={styles.flatListContent}
                  showsVerticalScrollIndicator={false}
                  scrollEnabled={true}
                  removeClippedSubviews={false}
                />
              </View>
            </>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIcon}>
                <Ionicons name="wallet-outline" size={48} color="#D1D5DB" />
              </View>
              <Text style={styles.emptyStateText}>No accounts found</Text>
              <Text style={styles.emptyStateSubtext}>
                Create your first account to start managing your finances
              </Text>
              <TouchableOpacity
                style={styles.addAccountButton}
                onPress={() => router.push("/users/home/add-account")}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
                <Text style={styles.addAccountButtonText}>Add Account</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </SafeAreaView>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    backgroundColor: "#1CC29F",
    paddingTop: Platform.OS === "ios" ? 0 : StatusBar.currentHeight,
    shadowColor: "#1CC29F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 10,
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
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  contentContainer: {
    flex: 1,
    paddingTop: 16,
  },
  statsContainer: {
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statsContent: {
    flexDirection: "row",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#F3F4F6",
    marginHorizontal: 16,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  flatListContent: {
    paddingBottom: 24,
  },
  swipeableContainer: {
    marginVertical: 6,
  },
  accountItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  accountItemActive: {
    shadowColor: "#1CC29F",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    transform: [{ scale: 1.02 }],
  },
  accountContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  accountInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  accountIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  accountDetails: {
    flex: 1,
    marginRight: 12,
  },
  accountName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  accountBalance: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  accountType: {
    fontSize: 12,
    color: "#6B7280",
    textTransform: "capitalize",
    fontWeight: "500",
  },
  accountMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  dragHandle: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginRight: 8,
  },
  rightActionsContainer: {
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 20,
  },
  deleteAction: {
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: "90%",
    borderRadius: 12,
    marginLeft: 10,
  },
  actionText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 32,
  },
  addAccountButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1CC29F",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: "#1CC29F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addAccountButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
})
