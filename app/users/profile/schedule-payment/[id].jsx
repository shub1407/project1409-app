import { Ionicons } from "@expo/vector-icons"
import DateTimePicker from "@react-native-community/datetimepicker"
import { router, useFocusEffect, useLocalSearchParams } from "expo-router"
import { useCallback, useEffect, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { useAccountsContext } from "../../../../src/context/AccountContext"

import { useScheduledTransaction } from "../../../../src/hooks/useScheduledTransaction"
export default function ScheduledTransactionDetailScreen() {
  const { id } = useLocalSearchParams()

  const { accounts } = useAccountsContext()
  const [transaction, setTransaction] = useState(null)
  const [executionHistory, setExecutionHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmModalVisible, setConfirmModalVisible] = useState(false)
  const [confirmingPayment, setConfirmingPayment] = useState(false)
  const [showAccountDropdown, setShowAccountDropdown] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const {
    getScheduledTransactionById,
    confirmScheduledTransaction,
    getExecutionHistory,
    refreshData,
  } = useScheduledTransaction()
  // Editable confirmation data - Fixed to prevent modal closing
  const [confirmData, setConfirmData] = useState({
    accountId: "",
    amount: "",
    date: new Date(),
    note: "",
  })

  useEffect(() => {
    loadTransactionDetails()
  }, [id])

  useFocusEffect(
    useCallback(() => {
      loadTransactionDetails()
    }, [id])
  )

  const loadTransactionDetails = async () => {
    try {
      setLoading(true)
      const response = await getScheduledTransactionById(id)
      const eHistoryResponse = await getExecutionHistory(id)
      console.log("Execution history hai:: ", eHistoryResponse)
      setExecutionHistory(eHistoryResponse.data || [])
      //console.log("Response from db:: ", response)
      if (response.success) {
        const txn = response.data
        // console.log("Transaction data::: ", txn)
        setTransaction(txn)
        // Initialize confirm data with default values
        setConfirmData({
          accountId: txn?.accountId || "",
          amount: txn.amount?.toString() || "",
          date: new Date(), // Current date as actual payment date
          note: "",
        })
      }
    } catch (error) {
      console.error("Error loading transaction details:", error)
      Alert.alert("Error", "Failed to load transaction details")
      router.back()
    } finally {
      setLoading(false)
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

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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

  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "#10B981"
      case "failed":
        return "#EF4444"
      case "skipped":
        return "#F59E0B"
      default:
        return "#6B7280"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "success":
        return "checkmark-circle"
      case "failed":
        return "close-circle"
      case "skipped":
        return "pause-circle"
      default:
        return "time"
    }
  }

  const isOverdue = () => {
    if (!transaction) return false
    return (
      new Date(transaction.nextDueDate) < new Date() &&
      transaction.status === "active"
    )
  }

  const getDaysUntilDue = () => {
    if (!transaction) return 0
    const now = new Date()
    const dueDate = new Date(transaction.nextPaymentDate)
    const diffTime = dueDate - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const openConfirmModal = () => {
    // Reset confirm data to current transaction values
    setConfirmData({
      accountId: transaction.fromAccountId?._id || "",
      amount: transaction.amount?.toString() || "",
      date: new Date(), // Current date as actual payment date
      note: "",
    })
    setShowAccountDropdown(false)
    setConfirmModalVisible(true)
  }

  // Fixed amount change handler - prevents modal from closing
  const handleAmountChange = (text) => {
    const cleaned = text.replace(/[^\d.]/g, "")
    setConfirmData((prev) => ({ ...prev, amount: cleaned }))
  }

  const getSelectedAccount = () => {
    return accounts.find((acc) => acc.id === confirmData.accountId)
  }

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false)
    if (selectedDate) {
      setConfirmData((prev) => ({ ...prev, date: selectedDate }))
    }
  }

  const handleConfirmPayment = async () => {
    // Validation
    if (!confirmData.accountId) {
      Alert.alert("Error", "Please select an account")
      return
    }
    if (!confirmData.amount || parseFloat(confirmData.amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount")
      return
    }

    setConfirmingPayment(true)
    try {
      await confirmScheduledTransaction(transaction.id, confirmData)

      setConfirmModalVisible(false)
      Alert.alert(
        "Payment Confirmed",
        "Transaction has been recorded successfully!",
        [
          {
            text: "OK",
            onPress: () => {
              refreshData()
              loadTransactionDetails()
            },
          },
        ]
      )
    } catch (error) {
      console.error("Confirm payment error:", error)
      const errorMessage =
        error.response?.data?.message || "Failed to confirm payment"
      Alert.alert("Error", errorMessage)
    } finally {
      setConfirmingPayment(false)
    }
  }

  // Fixed confirmation modal - stable rendering
  const ConfirmationModal = () => (
    <Modal
      visible={confirmModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => !confirmingPayment && setConfirmModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          onPress={() => !confirmingPayment && setConfirmModalVisible(false)}
          activeOpacity={1}
        />
        <View style={styles.confirmModalContent}>
          {/* Fixed Header */}
          <View style={styles.confirmHeader}>
            <Text style={styles.confirmTitle}>Confirm Payment</Text>
            <TouchableOpacity
              onPress={() =>
                !confirmingPayment && setConfirmModalVisible(false)
              }
              style={styles.closeButton}
              disabled={confirmingPayment}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            style={styles.confirmScrollView}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
          >
            {/* Transaction Summary */}
            <View style={styles.confirmSummary}>
              <View style={styles.confirmIcon}>
                <Ionicons
                  name={
                    transaction?.type === "income"
                      ? "trending-up"
                      : "trending-down"
                  }
                  size={32}
                  color={transaction?.type === "income" ? "#10B981" : "#EF4444"}
                />
              </View>

              <Text style={styles.confirmTransactionName}>
                {transaction?.name}
              </Text>
              <Text
                style={[
                  styles.confirmAmount,
                  {
                    color:
                      transaction?.type === "income" ? "#10B981" : "#EF4444",
                  },
                ]}
              >
                {transaction?.type === "income" ? "+" : "-"}
                {formatCurrency(parseFloat(confirmData.amount) || 0)}
              </Text>
            </View>

            {/* Editable Fields */}
            <View style={styles.editableSection}>
              <Text style={styles.editableSectionTitle}>
                Transaction Details
              </Text>

              {/* Account Selection - Simple Dropdown */}
              <View style={styles.editableField}>
                <Text style={styles.fieldLabel}>Account</Text>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setShowAccountDropdown(!showAccountDropdown)}
                  disabled={confirmingPayment}
                >
                  <View style={styles.fieldSelectorContent}>
                    <View
                      style={[
                        styles.accountIcon,
                        {
                          backgroundColor: getSelectedAccount()?.color
                            ? `${getSelectedAccount().color}20`
                            : "#F3F4F6",
                        },
                      ]}
                    >
                      <Ionicons
                        name={getSelectedAccount()?.icon || "wallet-outline"}
                        size={16}
                        color={getSelectedAccount()?.color || "#6B7280"}
                      />
                    </View>
                    <Text style={styles.fieldSelectorText}>
                      {getSelectedAccount()?.name || "Select Account"}
                    </Text>
                  </View>
                  <Ionicons
                    name={showAccountDropdown ? "chevron-up" : "chevron-down"}
                    size={16}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>

                {/* Simple Account Dropdown List */}
                {showAccountDropdown && (
                  <View style={styles.dropdownList}>
                    <ScrollView
                      style={styles.dropdownScrollView}
                      nestedScrollEnabled={true}
                    >
                      {accounts.map((account) => (
                        <TouchableOpacity
                          key={account.id || account._id}
                          style={[
                            styles.dropdownItem,
                            (confirmData.accountId === account.id ||
                              confirmData.accountId === account._id) &&
                              styles.dropdownItemActive,
                          ]}
                          onPress={() => {
                            setConfirmData((prev) => ({
                              ...prev,
                              accountId: account.id || account._id,
                            }))
                            setShowAccountDropdown(false)
                          }}
                        >
                          <View style={styles.dropdownItemContent}>
                            <View
                              style={[
                                styles.accountIcon,
                                { backgroundColor: `${account.color}20` },
                              ]}
                            >
                              <Ionicons
                                name={account.icon}
                                size={16}
                                color={account.color}
                              />
                            </View>
                            <View style={styles.dropdownItemText}>
                              <Text style={styles.dropdownItemName}>
                                {account.name}
                              </Text>
                              <Text style={styles.dropdownItemBalance}>
                                Balance: {formatCurrency(account.balance)}
                              </Text>
                            </View>
                          </View>
                          {(confirmData.accountId === account.id ||
                            confirmData.accountId === account._id) && (
                            <Ionicons
                              name="checkmark-circle"
                              size={16}
                              color="#1CC29F"
                            />
                          )}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* Amount Input - Fixed to prevent modal closing */}
              <View style={styles.editableField}>
                <Text style={styles.fieldLabel}>Amount</Text>
                <View style={styles.amountInputContainer}>
                  <Text style={styles.currencySymbol}>₹</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={confirmData.amount}
                    onChangeText={handleAmountChange}
                    placeholder="0.00"
                    keyboardType="numeric"
                    editable={!confirmingPayment}
                  />
                </View>
              </View>

              {/* Date Selection - Fixed to show selected date */}
              <View style={styles.editableField}>
                <Text style={styles.fieldLabel}>Payment Date (Actual)</Text>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setShowDatePicker(true)}
                  disabled={confirmingPayment}
                >
                  <View style={styles.fieldSelectorContent}>
                    <Ionicons
                      name="calendar-outline"
                      size={16}
                      color="#1CC29F"
                    />
                    <Text style={styles.fieldSelectorText}>
                      {formatDate(confirmData.date.toISOString())}
                    </Text>
                  </View>
                  <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              {/* Note Input */}
              <View style={styles.editableField}>
                <Text style={styles.fieldLabel}>Note (Optional)</Text>
                <TextInput
                  style={styles.noteInput}
                  value={confirmData.note}
                  onChangeText={(text) =>
                    setConfirmData((prev) => ({ ...prev, note: text }))
                  }
                  placeholder="Add a note for this transaction"
                  multiline
                  maxLength={200}
                  editable={!confirmingPayment}
                />
              </View>
            </View>

            {/* Summary */}
            <View style={styles.summarySection}>
              <Text style={styles.summarySectionTitle}>Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Category:</Text>
                <Text style={styles.summaryValue}>
                  {transaction?.categoryLabel || "No Category"}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Type:</Text>
                <Text style={styles.summaryValue}>
                  {transaction?.type?.charAt(0).toUpperCase() +
                    transaction?.type?.slice(1)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Expected Date:</Text>
                <Text style={styles.summaryValue}>
                  {formatDate(transaction?.nextPaymentDate)}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Fixed Actions */}
          <View style={styles.confirmActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setConfirmModalVisible(false)}
              disabled={confirmingPayment}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.confirmButton,
                confirmingPayment && styles.confirmButtonDisabled,
              ]}
              onPress={handleConfirmPayment}
              disabled={confirmingPayment}
            >
              {confirmingPayment ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.confirmButtonText}>Confirm Payment</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={confirmData.date}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
        />
      )}
    </Modal>
  )

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1CC29F" />
          <Text style={styles.loadingText}>Loading transaction details...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (!transaction) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Transaction not found</Text>
        </View>
      </SafeAreaView>
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
          <Text style={styles.headerTitle}>Transaction Details</Text>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/users/profile/schedule-payment/edit",
                params: { id: transaction.id },
              })
            }
            style={styles.editButton}
          >
            <Ionicons name="create-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Transaction Overview Card */}
          <View style={styles.overviewCard}>
            <View style={styles.overviewHeader}>
              <View
                style={[
                  styles.overviewIcon,
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
                  size={28}
                  color={transaction.type === "income" ? "#10B981" : "#EF4444"}
                />
              </View>
              <View style={styles.overviewDetails}>
                <Text style={styles.overviewTitle}>{transaction.name}</Text>
                <Text style={styles.overviewCategory}>
                  {transaction.categoryLabel || "No category"}
                </Text>
                {/* Show assigned account */}
                <Text style={styles.overviewAccount}>
                  Account: {transaction.accountName || "Unknown Account"}
                </Text>
              </View>
              <View style={styles.overviewAmount}>
                <Text
                  style={[
                    styles.amountText,
                    {
                      color:
                        transaction.type === "income" ? "#10B981" : "#EF4444",
                    },
                  ]}
                >
                  {transaction.type === "income" ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </Text>
              </View>
            </View>

            <View style={styles.overviewStats}>
              <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <Ionicons
                    name={getFrequencyIcon(transaction?.frequency)}
                    size={16}
                    color="#1CC29F"
                  />
                </View>
                <Text style={styles.statLabel}>Frequency</Text>
                <Text style={styles.statValue}>
                  {transaction.frequency.charAt(0).toUpperCase() +
                    transaction.frequency.slice(1)}
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="repeat" size={16} color="#1CC29F" />
                </View>
                <Text style={styles.statLabel}>Executed</Text>
                <Text style={styles.statValue}>
                  {transaction.executionCount} times
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <Ionicons
                    name={
                      transaction.status === "active"
                        ? "play-circle"
                        : "pause-circle"
                    }
                    size={16}
                    color={
                      transaction.status === "active" ? "#10B981" : "#F59E0B"
                    }
                  />
                </View>
                <Text style={styles.statLabel}>Status</Text>
                <Text
                  style={[
                    styles.statValue,
                    {
                      color:
                        transaction.status === "active" ? "#10B981" : "#F59E0B",
                    },
                  ]}
                >
                  {transaction.status.charAt(0).toUpperCase() +
                    transaction.status.slice(1)}
                </Text>
              </View>
            </View>
          </View>

          {/* Next Payment Card */}
          {transaction.status === "active" && (
            <View style={styles.nextPaymentCard}>
              <View style={styles.nextPaymentHeader}>
                <View style={styles.nextPaymentLeft}>
                  <Ionicons name="calendar-outline" size={20} color="#1CC29F" />
                  <Text style={styles.nextPaymentTitle}>Next Payment</Text>
                </View>
                {isOverdue() && (
                  <View style={styles.overdueTag}>
                    <Text style={styles.overdueTagText}>Overdue</Text>
                  </View>
                )}
              </View>
              <View style={styles.nextPaymentDetails}>
                <Text style={styles.nextPaymentDate}>
                  {new Date(transaction.nextPaymentDate).toLocaleDateString()}
                </Text>
                <Text style={styles.nextPaymentInfo}>
                  {isOverdue()
                    ? `${Math.abs(getDaysUntilDue())} day${
                        Math.abs(getDaysUntilDue()) !== 1 ? "s" : ""
                      } overdue`
                    : getDaysUntilDue() === 0
                    ? "Due today"
                    : `Due in ${getDaysUntilDue()} day${
                        getDaysUntilDue() !== 1 ? "s" : ""
                      }`}
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.confirmPaymentButton,
                  isOverdue() && styles.confirmPaymentButtonOverdue,
                ]}
                onPress={openConfirmModal}
              >
                <Text style={styles.confirmPaymentButtonText}>
                  {isOverdue() ? "Pay Now" : "Confirm Payment"}
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}

          {/* Payment History */}
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>
              Payment History ({executionHistory?.length || 0})
            </Text>

            {executionHistory && executionHistory.length > 0 ? (
              <View style={styles.historyList}>
                {executionHistory
                  .sort(
                    (a, b) => new Date(b.executedAt) - new Date(a.executedAt)
                  )
                  .map((history, index) => (
                    <View key={index} style={styles.historyItem}>
                      <View style={styles.historyLeft}>
                        <View
                          style={[
                            styles.historyStatusIcon,
                            {
                              backgroundColor: `${getStatusColor(
                                history.status
                              )}20`,
                            },
                          ]}
                        >
                          <Ionicons
                            name={getStatusIcon(history.status)}
                            size={16}
                            color={getStatusColor(history.status)}
                          />
                        </View>
                        <View style={styles.historyDetails}>
                          <Text style={styles.historyDate}>
                            Actual: {formatDateTime(history.executedAt)}
                          </Text>
                          <Text style={styles.historyExpectedDate}>
                            Expected: {formatDate(history.expectedDate)}
                          </Text>
                          <Text
                            style={[
                              styles.historyStatus,
                              { color: getStatusColor(history.status) },
                            ]}
                          >
                            {history.status.charAt(0).toUpperCase() +
                              history.status.slice(1)}
                          </Text>
                          <Text style={styles.historyAccount}>
                            From: {history.accountName || "Unknown Account"}
                          </Text>
                          {history.failureReason && (
                            <Text style={styles.failureReason}>
                              {history.failureReason}
                            </Text>
                          )}
                        </View>
                      </View>
                      <View style={styles.historyRight}>
                        <Text
                          style={[
                            styles.historyAmount,
                            { color: getStatusColor(history.status) },
                          ]}
                        >
                          {transaction.type === "income" ? "+" : "-"}
                          {formatCurrency(history.amount || transaction.amount)}
                        </Text>
                      </View>
                    </View>
                  ))}
              </View>
            ) : (
              <View style={styles.emptyHistory}>
                <Ionicons name="document-outline" size={48} color="#D1D5DB" />
                <Text style={styles.emptyHistoryText}>
                  No payment history yet
                </Text>
                <Text style={styles.emptyHistorySubtext}>
                  Payments will appear here once executed
                </Text>
              </View>
            )}
          </View>

          {/* Transaction Info */}
          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>Transaction Information</Text>
            <View style={styles.infoList}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Account:</Text>
                <Text style={styles.infoValue}>
                  {transaction.accountName || "Unknown Account"}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Created:</Text>
                <Text style={styles.infoValue}>
                  {formatDate(transaction.createdAt)}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Start Date:</Text>
                <Text style={styles.infoValue}>
                  {formatDate(transaction.startDate)}
                </Text>
              </View>
              {transaction.endDate && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>End Date:</Text>
                  <Text style={styles.infoValue}>
                    {formatDate(transaction.endDate)}
                  </Text>
                </View>
              )}
              {transaction.description && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Description:</Text>
                  <Text style={styles.infoValue}>
                    {transaction.description}
                  </Text>
                </View>
              )}
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Notifications:</Text>
                <Text style={styles.infoValue}>
                  {transaction.notificationSettings?.enabled
                    ? transaction.notificationSettings.timing
                        .replace("-", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())
                    : "Disabled"}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <ConfirmationModal />
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
    flex: 1,
    textAlign: "center",
    marginHorizontal: 16,
  },
  editButton: {
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "#EF4444",
  },

  // Overview Card
  overviewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  overviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  overviewIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  overviewDetails: {
    flex: 1,
  },
  overviewTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  overviewCategory: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 2,
  },
  overviewAccount: {
    fontSize: 13,
    color: "#1CC29F",
    fontWeight: "500",
  },
  overviewAmount: {
    alignItems: "flex-end",
  },
  amountText: {
    fontSize: 24,
    fontWeight: "800",
  },
  overviewStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 16,
  },

  // Next Payment Card
  nextPaymentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#1CC29F",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  nextPaymentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  nextPaymentLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  nextPaymentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  overdueTag: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  overdueTagText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#DC2626",
  },
  nextPaymentDetails: {
    marginBottom: 16,
  },
  nextPaymentDate: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  nextPaymentInfo: {
    fontSize: 14,
    color: "#6B7280",
  },
  confirmPaymentButton: {
    backgroundColor: "#1CC29F",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  confirmPaymentButtonOverdue: {
    backgroundColor: "#EF4444",
  },
  confirmPaymentButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  // History Section
  historySection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  historyList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  historyLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  historyStatusIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  historyDetails: {
    flex: 1,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 2,
  },
  historyExpectedDate: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  historyStatus: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 2,
  },
  historyAccount: {
    fontSize: 11,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  failureReason: {
    fontSize: 11,
    color: "#EF4444",
    marginTop: 2,
  },
  historyRight: {
    alignItems: "flex-end",
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
  emptyHistory: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyHistoryText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 12,
    marginBottom: 4,
  },
  emptyHistorySubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },

  // Info Card
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  infoList: {
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  infoLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
    flex: 2,
    textAlign: "right",
  },

  // Confirmation Modal - Fixed Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  confirmModalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    minHeight: "60%",
  },
  confirmHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  confirmScrollView: {
    flex: 1,
  },
  confirmSummary: {
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  confirmIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  confirmTransactionName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  confirmAmount: {
    fontSize: 28,
    fontWeight: "800",
  },

  // Editable Fields - Fixed
  editableSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  editableSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  editableField: {
    marginBottom: 16,
    zIndex: 1,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  dropdownButton: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  fieldSelectorContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  fieldSelectorText: {
    fontSize: 14,
    color: "#111827",
    marginLeft: 12,
  },
  accountIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },

  // Simple Dropdown List - Fixed
  dropdownList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    maxHeight: 150,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 1000,
  },
  dropdownScrollView: {
    maxHeight: 150,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  dropdownItemActive: {
    backgroundColor: "#F0FDF4",
  },
  dropdownItemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  dropdownItemText: {
    marginLeft: 12,
    flex: 1,
  },
  dropdownItemName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  dropdownItemBalance: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },

  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1CC29F",
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  noteInput: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    fontSize: 14,
    color: "#111827",
    minHeight: 60,
    textAlignVertical: "top",
  },

  // Summary Section
  summarySection: {
    padding: 20,
  },
  summarySectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },

  confirmActions: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  confirmButton: {
    flex: 1,
    backgroundColor: "#1CC29F",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
})
