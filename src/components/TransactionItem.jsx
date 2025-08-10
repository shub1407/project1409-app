import { Ionicons } from "@expo/vector-icons"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"

const TransactionItem = ({
  transaction,
  accounts,
  onUpdate,
  formatCurrency,
  getTransactionTypeColor,
  getTransactionIcon,
  getAccountName,
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
  const typeIcon = getTransactionIcon(transaction.type)

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => {
        // Handle transaction tap (edit/view details)
        console.log("Transaction tapped:", transaction)
      }}
      activeOpacity={0.7}
    >
      <View style={styles.leftSection}>
        <View
          style={[styles.iconContainer, { backgroundColor: `${typeColor}20` }]}
        >
          <Ionicons
            name={
              transaction.categoryId
                ? transaction.categoryId.icon
                : "swap-horizontal"
            }
            size={20}
            color={typeColor}
          />
        </View>

        <View style={styles.details}>
          <Text style={styles.category} numberOfLines={1}>
            {transaction?.categoryId?.label || "Transfer"}
          </Text>

          <Text style={styles.description} numberOfLines={1}>
            "{transaction.description || "No description"}"
          </Text>

          <Text style={styles.accountInfo} numberOfLines={1}>
            {transaction.type === "transfer"
              ? getTransferDisplay()
              : transaction.accountId.name}
          </Text>

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

        <Text style={styles.date}>{formatDate(transaction.date)}</Text>

        {/* <Text style={styles.time}>
          {new Date(transaction.date).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })}
        </Text> */}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  details: {
    flex: 1,
  },
  category: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  accountInfo: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 2,
  },
  note: {
    fontSize: 12,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  rightSection: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  amount: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  time: {
    fontSize: 11,
    color: "#9CA3AF",
  },
})

export default TransactionItem
