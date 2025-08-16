import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"

const TransactionItem = ({
  transaction,
  accounts,
  onUpdate,
  formatCurrency,
  getTransactionTypeColor,
  getTransactionIcon,
  getAccountName,
  homePage,
}) => {
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
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year:
          date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      })
    }
  }

  const getTransferDisplay = () => {
    const fromAccount = transaction.accountId.name
    const toAccount = transaction.toAccountId.name
    return `${fromAccount} → ${toAccount}`
  }

  const typeColor = transaction.categoryId
    ? transaction.categoryId.color
    : getTransactionTypeColor(transaction.type)
  const amountColor = getTransactionTypeColor(transaction.type)

  // Format balance for compact display
  const formatCompactBalance = (amount) => {
    if (amount === undefined || amount === null) return null

    return `₹${amount}`
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => {
        console.log("Transaction tapped:", transaction)
        router.push({
          pathname: "/users/records/edit-record",
          params: { transactionId: transaction._id },
        })
      }}
      activeOpacity={0.7}
    >
      <View style={styles.leftSection}>
        <View
          style={[styles.iconContainer, { backgroundColor: `${typeColor}15` }]}
        >
          <Ionicons
            name={
              transaction.categoryId
                ? transaction.categoryId.icon
                : "swap-horizontal"
            }
            size={18}
            color={typeColor}
          />
        </View>

        <View style={styles.details}>
          <View style={styles.topRow}>
            <Text style={styles.category} numberOfLines={1}>
              {transaction?.categoryId?.label || "Transfer"}
            </Text>
          </View>

          <Text style={styles.description} numberOfLines={1}>
            {transaction.description || "No description"}
          </Text>

          <View style={styles.bottomRow}>
            <Text style={styles.accountInfo} numberOfLines={1}>
              {transaction.type === "transfer"
                ? getTransferDisplay()
                : transaction.accountId.name}
            </Text>

            {/* Balance Pills - Only show if values exist */}
            {(transaction.openingBalance !== undefined ||
              transaction.closingBalance !== undefined) &&
              !homePage && (
                <View style={styles.balancePills}>
                  {transaction.openingBalance !== undefined && (
                    <View style={styles.balancePill}>
                      <Text style={styles.balancePillText}>
                        O: {formatCompactBalance(transaction.openingBalance)}
                      </Text>
                    </View>
                  )}
                  {transaction.closingBalance !== undefined && (
                    <View style={styles.balancePill}>
                      <Text style={styles.balancePillText}>
                        C: {formatCompactBalance(transaction.closingBalance)}
                      </Text>
                    </View>
                  )}
                </View>
              )}
          </View>

          {transaction.note && (
            <Text style={styles.note} numberOfLines={1}>
              {transaction.note}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.rightSection}>
        <Text style={[styles.amount, { color: amountColor }]}>
          {transaction.type === "expense" ? "-" : "+"}
          {formatCurrency(transaction.amount)}
        </Text>

        <View style={styles.timeContainer}>
          <Text style={styles.date}>{formatDate(transaction.date)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 0.5,
    borderBottomColor: "#F3F4F6",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  category: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
    marginRight: 8,
  },
  date: {
    fontSize: 11,
    fontWeight: "500",
    color: "#6B7280",
  },
  description: {
    fontSize: 12,
    fontWeight: "400",
    color: "#6B7280",
    marginBottom: 4,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  accountInfo: {
    fontSize: 12,
    color: "#9CA3AF",
    flex: 1,
    marginRight: 8,
  },
  balancePills: {
    flexDirection: "row",
    gap: 4,
  },
  balancePill: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: "#E5E7EB",
  },
  balancePillText: {
    fontSize: 9,
    fontWeight: "500",
    color: "#6B7280",
  },
  note: {
    fontSize: 11,
    color: "#9CA3AF",
    fontStyle: "italic",
    marginTop: 2,
  },
  rightSection: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  amount: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  time: {
    fontSize: 10,
    fontWeight: "400",
    color: "#9CA3AF",
  },
})

export default TransactionItem
