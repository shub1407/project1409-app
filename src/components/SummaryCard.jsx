import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useState } from "react"
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

const { width: screenWidth } = Dimensions.get("window")

const SummaryCard = ({
  transactionSummary,
  accounts,
  selectedAccountId,
  onAccountChange,
  filters,
  onPeriodChange,
}) => {
  const [showAccountModal, setShowAccountModal] = useState(false)
  const [showPeriodModal, setShowPeriodModal] = useState(false)

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getSelectedAccountName = () => {
    if (!selectedAccountId) return "All Accounts"
    const account = accounts.find((acc) => acc.id === selectedAccountId)
    return account?.name || "All Accounts"
  }

  const getPeriodDisplayText = () => {
    switch (filters.dateRange) {
      case "today":
        return "Today"
      case "week":
        return "This Week"
      case "month":
        return "This Month"
      case "custom":
        if (filters.startDate && filters.endDate) {
          const start = new Date(filters.startDate).toLocaleDateString(
            "en-GB",
            {
              day: "2-digit",
              month: "short",
            }
          )
          const end = new Date(filters.endDate).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
          })
          return `${start} - ${end}`
        }
        return "Custom"
      default:
        return "This Month"
    }
  }

  const periodOptions = [
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "custom", label: "Custom Period" },
  ]

  const handleViewDetailAnalysis = () => {
    router.push({
      pathname: "/(tabs)/reports",
      params: {
        accountId: selectedAccountId || "",
        dateRange: filters.dateRange,
        startDate: filters.startDate || "",
        endDate: filters.endDate || "",
      },
    })
  }

  const AccountModal = () => (
    <Modal
      visible={showAccountModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowAccountModal(false)}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          onPress={() => setShowAccountModal(false)}
          activeOpacity={1}
        />
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Account</Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.modalOption,
                !selectedAccountId && styles.modalOptionActive,
              ]}
              onPress={() => {
                onAccountChange("")
                setShowAccountModal(false)
              }}
            >
              <View style={styles.modalOptionContent}>
                <View style={styles.modalOptionIcon}>
                  <Ionicons name="wallet" size={20} color="#6B7280" />
                </View>
                <Text
                  style={[
                    styles.modalOptionText,
                    !selectedAccountId && styles.modalOptionTextActive,
                  ]}
                >
                  All Accounts
                </Text>
              </View>
              {!selectedAccountId && (
                <Ionicons name="checkmark" size={20} color="#1CC29F" />
              )}
            </TouchableOpacity>

            {accounts.map((account) => (
              <TouchableOpacity
                key={account.id}
                style={[
                  styles.modalOption,
                  selectedAccountId === account.id && styles.modalOptionActive,
                ]}
                onPress={() => {
                  onAccountChange(account.id)
                  setShowAccountModal(false)
                }}
              >
                <View style={styles.modalOptionContent}>
                  <View
                    style={[
                      styles.modalAccountIcon,
                      { backgroundColor: account.color || "#6B7280" },
                    ]}
                  >
                    <Ionicons
                      name={account.icon || "wallet"}
                      size={16}
                      color="#FFFFFF"
                    />
                  </View>
                  <Text
                    style={[
                      styles.modalOptionText,
                      selectedAccountId === account.id &&
                        styles.modalOptionTextActive,
                    ]}
                  >
                    {account.name}
                  </Text>
                </View>
                {selectedAccountId === account.id && (
                  <Ionicons name="checkmark" size={20} color="#1CC29F" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  )

  const PeriodModal = () => (
    <Modal
      visible={showPeriodModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowPeriodModal(false)}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          onPress={() => setShowPeriodModal(false)}
          activeOpacity={1}
        />
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Period</Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {periodOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.modalOption,
                  filters.dateRange === option.value &&
                    styles.modalOptionActive,
                ]}
                onPress={() => {
                  onPeriodChange(option.value)
                  setShowPeriodModal(false)
                }}
              >
                <View style={styles.modalOptionContent}>
                  <View style={styles.modalOptionIcon}>
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color="#6B7280"
                    />
                  </View>
                  <Text
                    style={[
                      styles.modalOptionText,
                      filters.dateRange === option.value &&
                        styles.modalOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </View>
                {filters.dateRange === option.value && (
                  <Ionicons name="checkmark" size={20} color="#1CC29F" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  )

  return (
    <View style={styles.container}>
      {/* Compact Filter Row */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={styles.filterChip}
          onPress={() => setShowAccountModal(true)}
        >
          <Ionicons name="wallet" size={14} color="#1CC29F" />
          <Text style={styles.filterText} numberOfLines={1}>
            {getSelectedAccountName()}
          </Text>
          <Ionicons name="chevron-down" size={14} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterChip}
          onPress={() => setShowPeriodModal(true)}
        >
          <Ionicons name="calendar" size={14} color="#1CC29F" />
          <Text style={styles.filterText} numberOfLines={1}>
            {getPeriodDisplayText()}
          </Text>
          <Ionicons name="chevron-down" size={14} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={[styles.iconContainer, styles.incomeIcon]}>
              <Ionicons name="trending-up" size={14} color="#10B981" />
            </View>
            <Text style={styles.summaryLabel}>Income</Text>
          </View>
          <Text style={[styles.summaryAmount, styles.incomeAmount]}>
            {formatCurrency(transactionSummary.income || 0)}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={[styles.iconContainer, styles.expenseIcon]}>
              <Ionicons name="trending-down" size={14} color="#EF4444" />
            </View>
            <Text style={styles.summaryLabel}>Expense</Text>
          </View>
          <Text style={[styles.summaryAmount, styles.expenseAmount]}>
            {formatCurrency(transactionSummary.expenses || 0)}
          </Text>
        </View>
      </View>

      {/* Net Balance */}
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>Net Balance</Text>
        <Text
          style={[
            styles.balanceAmount,
            transactionSummary.balance >= 0
              ? styles.positiveBalance
              : styles.negativeBalance,
          ]}
        >
          {formatCurrency(transactionSummary.balance || 0)}
        </Text>
      </View>

      {/* View Detail Analysis Button */}
      <TouchableOpacity
        style={styles.analysisButton}
        onPress={handleViewDetailAnalysis}
      >
        <Ionicons name="analytics" size={16} color="#FFFFFF" />
        <Text style={styles.analysisButtonText}>View Analysis</Text>
      </TouchableOpacity>

      <AccountModal />
      <PeriodModal />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  // Compact Filter Design
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterText: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "600",
    marginLeft: 6,
    marginRight: 4,
    flex: 1,
  },

  // Summary Cards
  summaryRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 12,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  incomeIcon: {
    backgroundColor: "#D1FAE5",
  },
  expenseIcon: {
    backgroundColor: "#FEE2E2",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  summaryAmount: {
    fontSize: 16,
    fontWeight: "700",
  },
  incomeAmount: {
    color: "#10B981",
  },
  expenseAmount: {
    color: "#EF4444",
  },

  // Balance Container
  balanceContainer: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 2,
  },
  balanceAmount: {
    fontSize: 20,
    fontWeight: "800",
  },
  positiveBalance: {
    color: "#10B981",
  },
  negativeBalance: {
    color: "#EF4444",
  },

  // Analysis Button
  analysisButton: {
    backgroundColor: "#1CC29F",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 12,
    gap: 6,
  },
  analysisButtonText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    width: screenWidth - 48,
    maxHeight: "70%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
    textAlign: "center",
  },
  modalOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  modalOptionActive: {
    backgroundColor: "#F0FDF4",
  },
  modalOptionContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  modalOptionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  modalAccountIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  modalOptionText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
  },
  modalOptionTextActive: {
    color: "#1CC29F",
    fontWeight: "700", // Bold for selected items
  },
})

export default SummaryCard
