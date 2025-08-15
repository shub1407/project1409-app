import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useState } from "react"
import {
  Dimensions,
  Modal,
  Pressable,
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

  // In SummaryCard.js, update the getPeriodDisplayText function:
  const getPeriodDisplayText = () => {
    switch (filters.dateRange) {
      case "today":
        return `Today • ${new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
        })}`
      case "week":
        const weekStart = new Date()
        weekStart.setDate(weekStart.getDate() - weekStart.getDay())
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        return `This Week • ${weekStart.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
        })} - ${weekEnd.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
        })}`
      case "month":
        const monthName = new Date().toLocaleDateString("en-GB", {
          month: "long",
          year: "numeric",
        })
        return `${monthName}`
      case "custom":
        if (filters.startDate && filters.endDate) {
          const start = new Date(filters.startDate).toLocaleDateString(
            "en-GB",
            {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }
          )
          const end = new Date(filters.endDate).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
          return `${start} - ${end}`
        }
        return "Custom Period"
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
    // Navigate to analysis page with current filters
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
      <Pressable
        style={styles.modalOverlay}
        onPress={() => setShowAccountModal(false)}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Account</Text>
            <TouchableOpacity onPress={() => setShowAccountModal(false)}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.optionsList}>
            <TouchableOpacity
              style={[
                styles.optionItem,
                !selectedAccountId && styles.selectedOption,
              ]}
              onPress={() => {
                onAccountChange("")
                setShowAccountModal(false)
              }}
            >
              <Text
                style={[
                  styles.optionText,
                  !selectedAccountId && styles.selectedOptionText,
                ]}
              >
                All Accounts
              </Text>
              {!selectedAccountId && (
                <Ionicons name="checkmark" size={20} color="#1CC29F" />
              )}
            </TouchableOpacity>

            {accounts.map((account) => (
              <TouchableOpacity
                key={account.id}
                style={[
                  styles.optionItem,
                  selectedAccountId === account.id && styles.selectedOption,
                ]}
                onPress={() => {
                  onAccountChange(account.id)
                  setShowAccountModal(false)
                }}
              >
                <View style={styles.accountOption}>
                  <View
                    style={[
                      styles.accountIcon,
                      { backgroundColor: account.color || "#6B7280" },
                    ]}
                  />
                  <Text
                    style={[
                      styles.optionText,
                      selectedAccountId === account.id &&
                        styles.selectedOptionText,
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
      </Pressable>
    </Modal>
  )

  const PeriodModal = () => (
    <Modal
      visible={showPeriodModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowPeriodModal(false)}
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={() => setShowPeriodModal(false)}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Period</Text>
            <TouchableOpacity onPress={() => setShowPeriodModal(false)}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.optionsList}>
            {periodOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionItem,
                  filters.dateRange === option.value && styles.selectedOption,
                ]}
                onPress={() => {
                  onPeriodChange(option.value)
                  setShowPeriodModal(false)
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    filters.dateRange === option.value &&
                      styles.selectedOptionText,
                  ]}
                >
                  {option.label}
                </Text>
                {filters.dateRange === option.value && (
                  <Ionicons name="checkmark" size={20} color="#1CC29F" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  )

  return (
    <View style={styles.container}>
      {/* Dropdowns Row */}
      <View style={styles.dropdownRow}>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowAccountModal(true)}
        >
          <View style={styles.dropdownContent}>
            <Ionicons name="wallet-outline" size={16} color="#6B7280" />
            <Text style={styles.dropdownText} numberOfLines={1}>
              {getSelectedAccountName()}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={16} color="#6B7280" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowPeriodModal(true)}
        >
          <View style={styles.dropdownContent}>
            <Ionicons name="calendar-outline" size={16} color="#6B7280" />
            <Text style={styles.dropdownText} numberOfLines={1}>
              {getPeriodDisplayText()}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={16} color="#6B7280" />
        </TouchableOpacity>
      </View>
      <View>
        <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 16 }}>
          {getSelectedAccountName() + " " + getPeriodDisplayText()}
        </Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={[styles.iconContainer, styles.incomeIcon]}>
              <Ionicons name="arrow-down" size={16} color="#10B981" />
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
              <Ionicons name="arrow-up" size={16} color="#EF4444" />
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
        <Text style={styles.analysisButtonText}>View Detail Analysis</Text>
        <Ionicons name="analytics-outline" size={18} color="#FFFFFF" />
      </TouchableOpacity>

      <AccountModal />
      <PeriodModal />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dropdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 12,
  },
  dropdown: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  dropdownContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  dropdownText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
    marginLeft: 8,
    flex: 1,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  incomeIcon: {
    backgroundColor: "#D1FAE5",
  },
  expenseIcon: {
    backgroundColor: "#FEE2E2",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: "700",
  },
  incomeAmount: {
    color: "#10B981",
  },
  expenseAmount: {
    color: "#EF4444",
  },
  balanceContainer: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: "800",
  },
  positiveBalance: {
    color: "#10B981",
  },
  negativeBalance: {
    color: "#EF4444",
  },
  analysisButton: {
    backgroundColor: "#1CC29F",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  analysisButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    width: screenWidth - 40,
    maxHeight: "70%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  optionsList: {
    maxHeight: 400,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  selectedOption: {
    backgroundColor: "#F0FDF4",
  },
  optionText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
  },
  selectedOptionText: {
    color: "#1CC29F",
    fontWeight: "600",
  },
  accountOption: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  accountIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
})

export default SummaryCard
