import { Ionicons } from "@expo/vector-icons"
import { StyleSheet, Text, View } from "react-native"

const TransactionSummary = ({ summary }) => {
  const formatCurrency = (amount) => {
    return `₹${Math.abs(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  return (
    <View style={styles.container}>
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <View style={[styles.summaryIcon, { backgroundColor: "#E6FFFA" }]}>
            <Ionicons name="trending-up" size={20} color="#1CC29F" />
          </View>
          <View style={styles.summaryDetails}>
            <Text style={styles.summaryLabel}>Income</Text>
            <Text style={[styles.summaryAmount, { color: "#1CC29F" }]}>
              +{formatCurrency(summary.income)}
            </Text>
          </View>
        </View>

        <View style={styles.summaryItem}>
          <View style={[styles.summaryIcon, { backgroundColor: "#FEF2F2" }]}>
            <Ionicons name="trending-down" size={20} color="#FF6B6B" />
          </View>
          <View style={styles.summaryDetails}>
            <Text style={styles.summaryLabel}>Expenses</Text>
            <Text style={[styles.summaryAmount, { color: "#FF6B6B" }]}>
              -{formatCurrency(summary.expenses)}
            </Text>
          </View>
        </View>

        <View style={styles.summaryItem}>
          <View style={[styles.summaryIcon, { backgroundColor: "#EFF6FF" }]}>
            <Ionicons name="swap-horizontal" size={20} color="#45B7D1" />
          </View>
          <View style={styles.summaryDetails}>
            <Text style={styles.summaryLabel}>Transfers</Text>
            <Text style={[styles.summaryAmount, { color: "#45B7D1" }]}>
              {formatCurrency(summary.transfers)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Net Balance</Text>
        <Text
          style={[
            styles.balanceAmount,
            { color: summary.balance >= 0 ? "#1CC29F" : "#FF6B6B" },
          ]}
        >
          {summary.balance >= 0 ? "+" : "-"}
          {formatCurrency(summary.balance)}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  summaryDetails: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: "700",
  },
  balanceCard: {
    backgroundColor: "#F8FBFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8F4FD",
  },
  balanceLabel: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: "800",
  },
})

export default TransactionSummary
