import { Ionicons } from "@expo/vector-icons"
import DateTimePicker from "@react-native-community/datetimepicker"
import { router, useLocalSearchParams } from "expo-router"
import { useEffect, useState } from "react"
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
import { useCategoryContext } from "../../../../src/context/CategoryContext"
import { useScheduledTransaction } from "../../../../src/hooks/useScheduledTransaction"

export default function EditScheduledTransactionScreen() {
  const { id } = useLocalSearchParams()
  const { accounts } = useAccountsContext()
  const { expenseCategories, incomeCategories } = useCategoryContext()

  const {
    updateScheduledTransaction,
    loading: contextLoading,
    getScheduledTransactionById,
  } = useScheduledTransaction()

  const [transaction, setTransaction] = useState(null)
  const [loadingTransaction, setLoadingTransaction] = useState(true)

  const [formData, setFormData] = useState({
    name: "",
    type: "expense",
    categoryId: "",
    fromAccountId: "",
    amount: "",
    frequency: "monthly",
    isRecurring: true,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: "",
    notificationSettings: {
      enabled: true,
      timing: "on-due-date",
      email: true,
      push: true,
    },
    description: "",
    currency: "INR",
    status: "active",
  })

  const [showModals, setShowModals] = useState({
    type: false,
    category: false,
    account: false,
    frequency: false,
    notification: false,
    startDate: false,
    endDate: false,
    status: false,
  })

  const [tempDates, setTempDates] = useState({
    start: new Date(),
    end: new Date(),
  })

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadTransactionDetails()
  }, [id])

  const loadTransactionDetails = async () => {
    try {
      setLoadingTransaction(true)
      const response = await getScheduledTransactionById(id)

      if (response.success) {
        const txn = response.data
        setTransaction(txn)
        console.log("Transaction data::: ", txn)

        // Populate form with existing data - Fixed field mappings
        setFormData({
          name: txn.name || "",
          type: txn.type || "expense",
          categoryId: txn.categoryId || "",
          fromAccountId: txn.accountId || "", // Fixed: was txn.accoountId (typo)
          amount: txn.amount?.toString() || "",
          frequency: txn.frequency || "monthly",
          isRecurring: txn.isRecurring === 1 || txn.isRecurring === true, // Fixed: handle both boolean and integer
          startDate: txn.startDate
            ? typeof txn.startDate === "number"
              ? new Date(txn.startDate).toISOString().slice(0, 10)
              : txn.startDate.slice(0, 10)
            : new Date().toISOString().slice(0, 10),
          endDate: txn.endDate
            ? typeof txn.endDate === "number"
              ? new Date(txn.endDate).toISOString().slice(0, 10)
              : txn.endDate.slice(0, 10)
            : "",
          notificationSettings: {
            enabled: txn.notificationSettings?.enabled !== false,
            timing: txn.notificationSettings?.timing || "on-due-date",
            email: txn.notificationSettings?.email !== false,
            push: txn.notificationSettings?.push !== false,
          },
          description: txn.description || "",
          currency: txn.currency || "INR",
          status: txn.status || "active",
        })
      } else {
        Alert.alert("Error", response.message || "Failed to load transaction")
      }
    } catch (error) {
      console.error("Error loading transaction details:", error)
      Alert.alert("Error", "Failed to load transaction details", [
        { text: "OK", onPress: () => router.back() },
      ])
    } finally {
      setLoadingTransaction(false)
    }
  }

  const transactionTypes = [
    {
      value: "expense",
      label: "Expense",
      icon: "trending-down",
      color: "#EF4444",
    },
    { value: "income", label: "Income", icon: "trending-up", color: "#10B981" },
  ]

  const frequencyOptions = [
    { value: "daily", label: "Daily", icon: "today" },
    { value: "weekly", label: "Weekly", icon: "calendar-outline" },
    { value: "monthly", label: "Monthly", icon: "calendar" },
    { value: "yearly", label: "Yearly", icon: "calendar-sharp" },
  ]

  const notificationOptions = [
    {
      value: "on-due-date",
      label: "On Due Date",
      description: "Notify when payment is due",
    },
    {
      value: "1-day-before",
      label: "1 Day Before",
      description: "Remind 24 hours before due",
    },
    {
      value: "3-days-before",
      label: "3 Days Before",
      description: "Remind 3 days before due",
    },
    {
      value: "1-week-before",
      label: "1 Week Before",
      description: "Remind 7 days before due",
    },
    {
      value: "disabled",
      label: "No Notifications",
      description: "Turn off all reminders",
    },
  ]

  const statusOptions = [
    {
      value: "active",
      label: "Active",
      icon: "play-circle",
      color: "#10B981",
      description: "Transaction will execute automatically",
    },
    {
      value: "paused",
      label: "Paused",
      icon: "pause-circle",
      color: "#F59E0B",
      description: "Transaction is temporarily disabled",
    },
  ]

  const currentCategories =
    formData.type === "expense" ? expenseCategories : incomeCategories

  const updateFormData = (key, value) => {
    setFormData((prev) => {
      const newData = { ...prev }

      if (key === "type") {
        // Reset category when type changes
        newData.categoryId = ""
        newData[key] = value
      } else if (key === "category") {
        // Map category selection to categoryId
        newData.categoryId = value
      } else if (key === "account") {
        // Map account selection to fromAccountId
        newData.fromAccountId = value
      } else if (key === "notification") {
        // Update notification settings
        newData.notificationSettings = {
          ...prev.notificationSettings,
          timing: value,
          enabled: value !== "disabled",
        }
      } else if (key === "isRecurring") {
        newData[key] = value
        if (!value) {
          // Reset end date and frequency for one-time transactions
          newData.endDate = ""
          newData.frequency = "one-time"
        } else {
          newData.frequency = "monthly" // Reset to monthly if recurring is enabled
        }
      } else {
        newData[key] = value
      }

      return newData
    })
  }

  const formatAmount = (text) => {
    const cleaned = text.replace(/[^\d.]/g, "")
    updateFormData("amount", cleaned)
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"

    let date
    if (typeof dateString === "number") {
      date = new Date(dateString)
    } else {
      date = new Date(dateString + "T00:00:00")
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const handleDateChange = (event, selectedDate, dateType) => {
    if (Platform.OS === "android") {
      setShowModals((prev) => ({ ...prev, [dateType]: false }))
      if (selectedDate) {
        const dateString = selectedDate.toISOString().slice(0, 10)
        updateFormData(
          dateType === "startDate" ? "startDate" : "endDate",
          dateString
        )
      }
    } else {
      if (selectedDate) {
        setTempDates((prev) => ({
          ...prev,
          [dateType === "startDate" ? "start" : "end"]: selectedDate,
        }))
      }
    }
  }

  const handleIOSDateConfirm = (dateType) => {
    const dateString = tempDates[dateType === "startDate" ? "start" : "end"]
      .toISOString()
      .slice(0, 10)
    updateFormData(
      dateType === "startDate" ? "startDate" : "endDate",
      dateString
    )
    setShowModals((prev) => ({ ...prev, [dateType]: false }))
  }

  const getSelectedItem = (type) => {
    switch (type) {
      case "type":
        return transactionTypes.find((t) => t.value === formData.type)
      case "category":
        return currentCategories.find((c) => c.id === formData.categoryId) // Fixed: use c.id instead of c._id
      case "account":
        return accounts.find(
          (a) =>
            a.id === formData.fromAccountId || a.id === formData.fromAccountId
        )
      case "frequency":
        return frequencyOptions.find((f) => f.value === formData.frequency)
      case "notification":
        return notificationOptions.find(
          (n) => n.value === formData.notificationSettings.timing
        )
      case "status":
        return statusOptions.find((s) => s.value === formData.status)
      default:
        return null
    }
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "Please enter transaction name")
      return false
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount")
      return false
    }
    if (!formData.fromAccountId) {
      Alert.alert("Error", "Please select an account")
      return false
    }
    if (!formData.categoryId && formData.type !== "transfer") {
      Alert.alert("Error", "Please select a category")
      return false
    }
    if (
      formData.isRecurring &&
      formData.endDate &&
      new Date(formData.endDate) <= new Date(formData.startDate)
    ) {
      Alert.alert("Error", "End date must be after start date")
      return false
    }
    return true
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setLoading(true)
    try {
      // Prepare data for API - match your backend schema exactly like add screen
      const apiData = {
        name: formData.name.trim(),
        description: formData.description || "",
        type: formData.type,
        categoryId: formData.categoryId || undefined,
        accountId: formData.fromAccountId, // Fixed: use accountId to match your schema
        amount: parseFloat(formData.amount),
        recurrenceRule: formData.isRecurring ? formData.frequency : "one-time", // Fixed: use recurrenceRule
        isRecurring: formData.isRecurring ? 1 : 0, // Fixed: convert to integer
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        notificationSettings: {
          enabled: formData.notificationSettings.enabled,
          timing: formData.notificationSettings.timing,
          email: formData.notificationSettings.email,
          push: formData.notificationSettings.push,
        },
        status: formData.status,
        metadata: {
          platform: Platform.OS,
          source: "manual",
        },
      }

      console.log("Updating transaction with data:", apiData) // Debug log

      const result = await updateScheduledTransaction(id, apiData)

      if (result.success) {
        Alert.alert("Success", "Scheduled transaction updated successfully!", [
          { text: "OK", onPress: () => router.back() },
        ])
      } else {
        Alert.alert(
          "Error",
          result.message || "Failed to update scheduled transaction"
        )
      }
    } catch (error) {
      console.error("Error updating scheduled transaction:", error)
      // Extract error message from different error structures
      let errorMessage = "Failed to update scheduled transaction"

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.data?.errors) {
        // Handle validation errors
        const validationErrors = error.response.data.errors
        errorMessage = validationErrors
          .map((err) => err.message || err.msg)
          .join(", ")
      } else if (error.message) {
        errorMessage = error.message
      }

      Alert.alert("Error", errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const renderModal = (
    type,
    title,
    options,
    valueKey = "value",
    labelKey = "label"
  ) => (
    <Modal
      visible={showModals[type]}
      transparent
      animationType="slide"
      onRequestClose={() =>
        setShowModals((prev) => ({ ...prev, [type]: false }))
      }
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          onPress={() => setShowModals((prev) => ({ ...prev, [type]: false }))}
          activeOpacity={1}
        />
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={option[valueKey] || index}
                style={[
                  styles.modalOption,
                  type === "category" || type === "account"
                    ? formData[
                        type === "category" ? "categoryId" : "fromAccountId"
                      ] === option[valueKey] && styles.modalOptionActive
                    : type === "notification"
                    ? formData.notificationSettings.timing ===
                        option[valueKey] && styles.modalOptionActive
                    : formData[type] === option[valueKey] &&
                      styles.modalOptionActive,
                ]}
                onPress={() => {
                  if (type === "category") {
                    updateFormData("category", option[valueKey])
                  } else if (type === "account") {
                    updateFormData("account", option[valueKey])
                  } else if (type === "notification") {
                    updateFormData("notification", option[valueKey])
                  } else {
                    updateFormData(type, option[valueKey])
                  }
                  setShowModals((prev) => ({ ...prev, [type]: false }))
                }}
              >
                <View style={styles.modalOptionContent}>
                  {option.icon && (
                    <View
                      style={[
                        styles.modalOptionIcon,
                        { backgroundColor: `${option.color || "#1CC29F"}20` },
                      ]}
                    >
                      <Ionicons
                        name={option.icon}
                        size={20}
                        color={option.color || "#1CC29F"}
                      />
                    </View>
                  )}
                  <View style={styles.modalOptionText}>
                    <Text style={styles.modalOptionTitle}>
                      {option[labelKey]}
                    </Text>
                    {option.description && (
                      <Text style={styles.modalOptionSubtitle}>
                        {option.description}
                      </Text>
                    )}
                  </View>
                </View>
                {((type === "category" &&
                  formData.categoryId === option[valueKey]) ||
                  (type === "account" &&
                    formData.fromAccountId === option[valueKey]) ||
                  (type === "notification" &&
                    formData.notificationSettings.timing ===
                      option[valueKey]) ||
                  (type !== "category" &&
                    type !== "account" &&
                    type !== "notification" &&
                    formData[type] === option[valueKey])) && (
                  <Ionicons name="checkmark-circle" size={20} color="#1CC29F" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  )

  if (loadingTransaction) {
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
        <View style={styles.loadingContainer}>
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
          <Text style={styles.headerTitle}>Edit Scheduled Transaction</Text>
          <TouchableOpacity
            onPress={handleSave}
            style={[
              styles.saveButton,
              (loading || contextLoading) && styles.saveButtonDisabled,
            ]}
            disabled={loading || contextLoading}
          >
            <Text style={styles.saveButtonText}>
              {loading || contextLoading ? "Saving..." : "Update"}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Transaction Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Transaction Status</Text>
            <TouchableOpacity
              style={styles.selectorCard}
              onPress={() =>
                setShowModals((prev) => ({ ...prev, status: true }))
              }
            >
              <View style={styles.selectorLeft}>
                <View
                  style={[
                    styles.selectorIcon,
                    {
                      backgroundColor: `${getSelectedItem("status")?.color}20`,
                    },
                  ]}
                >
                  <Ionicons
                    name={getSelectedItem("status")?.icon}
                    size={20}
                    color={getSelectedItem("status")?.color}
                  />
                </View>
                <View>
                  <Text style={styles.selectorLabel}>Status</Text>
                  <Text style={styles.selectorValue}>
                    {getSelectedItem("status")?.label}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Transaction Name */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Transaction Details</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="document-text-outline"
                size={20}
                color="#6B7280"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder="Enter transaction name"
                placeholderTextColor="#9CA3AF"
                value={formData.name}
                onChangeText={(value) => updateFormData("name", value)}
                maxLength={100}
              />
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description (Optional)</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="text-outline"
                size={20}
                color="#6B7280"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder="Enter description"
                placeholderTextColor="#9CA3AF"
                value={formData.description}
                onChangeText={(value) => updateFormData("description", value)}
                maxLength={500}
                multiline
              />
            </View>
          </View>

          {/* Type Selection */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.selectorCard}
              onPress={() => setShowModals((prev) => ({ ...prev, type: true }))}
            >
              <View style={styles.selectorLeft}>
                <View
                  style={[
                    styles.selectorIcon,
                    { backgroundColor: `${getSelectedItem("type")?.color}20` },
                  ]}
                >
                  <Ionicons
                    name={getSelectedItem("type")?.icon}
                    size={20}
                    color={getSelectedItem("type")?.color}
                  />
                </View>
                <View>
                  <Text style={styles.selectorLabel}>Type</Text>
                  <Text style={styles.selectorValue}>
                    {getSelectedItem("type")?.label}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Category Selection */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.selectorCard}
              onPress={() =>
                setShowModals((prev) => ({ ...prev, category: true }))
              }
            >
              <View style={styles.selectorLeft}>
                <View
                  style={[
                    styles.selectorIcon,
                    {
                      backgroundColor: getSelectedItem("category")?.color
                        ? `${getSelectedItem("category").color}20`
                        : "#F3F4F6",
                    },
                  ]}
                >
                  <Ionicons
                    name={getSelectedItem("category")?.icon || "apps-outline"}
                    size={20}
                    color={getSelectedItem("category")?.color || "#6B7280"}
                  />
                </View>
                <View>
                  <Text style={styles.selectorLabel}>Category</Text>
                  <Text style={styles.selectorValue}>
                    {getSelectedItem("category")?.label || "Select category"}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Account Selection */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.selectorCard}
              onPress={() =>
                setShowModals((prev) => ({ ...prev, account: true }))
              }
            >
              <View style={styles.selectorLeft}>
                <View
                  style={[
                    styles.selectorIcon,
                    {
                      backgroundColor: getSelectedItem("account")?.color
                        ? `${getSelectedItem("account").color}20`
                        : "#F3F4F6",
                    },
                  ]}
                >
                  <Ionicons
                    name={getSelectedItem("account")?.icon || "wallet-outline"}
                    size={20}
                    color={getSelectedItem("account")?.color || "#6B7280"}
                  />
                </View>
                <View>
                  <Text style={styles.selectorLabel}>Account</Text>
                  <Text style={styles.selectorValue}>
                    {getSelectedItem("account")?.name || "Select account"}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Amount Input */}
          <View style={styles.section}>
            <View style={styles.amountContainer}>
              <Ionicons
                name="cash"
                size={20}
                color="#1CC29F"
                style={styles.inputIcon}
              />
              <Text
                style={[
                  styles.currencySymbol,
                  { color: getSelectedItem("type")?.color },
                ]}
              >
                ₹
              </Text>
              <TextInput
                style={[
                  styles.amountInput,
                  { color: getSelectedItem("type")?.color },
                ]}
                placeholder="0.00"
                placeholderTextColor="#9CA3AF"
                value={formData.amount}
                onChangeText={formatAmount}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Frequency Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Frequency & Schedule</Text>

            {/* Recurring Toggle */}
            <TouchableOpacity
              style={styles.toggleContainer}
              onPress={() =>
                updateFormData("isRecurring", !formData.isRecurring)
              }
            >
              <View style={styles.toggleLeft}>
                <Ionicons name="repeat-outline" size={20} color="#1CC29F" />
                <Text style={styles.toggleLabel}>Recurring Transaction</Text>
              </View>
              <View
                style={[
                  styles.toggleSwitch,
                  formData.isRecurring && styles.toggleSwitchActive,
                ]}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    formData.isRecurring && styles.toggleThumbActive,
                  ]}
                />
              </View>
            </TouchableOpacity>

            {/* Frequency Selection (only if recurring) */}
            {formData.isRecurring && (
              <TouchableOpacity
                style={styles.selectorCard}
                onPress={() =>
                  setShowModals((prev) => ({ ...prev, frequency: true }))
                }
              >
                <View style={styles.selectorLeft}>
                  <View
                    style={[
                      styles.selectorIcon,
                      { backgroundColor: "#1CC29F20" },
                    ]}
                  >
                    <Ionicons
                      name={getSelectedItem("frequency")?.icon}
                      size={20}
                      color="#1CC29F"
                    />
                  </View>
                  <View>
                    <Text style={styles.selectorLabel}>Repeat Every</Text>
                    <Text style={styles.selectorValue}>
                      {getSelectedItem("frequency")?.label}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          {/* Date Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Schedule Dates</Text>

            {/* Start Date */}
            <TouchableOpacity
              style={styles.dateCard}
              onPress={() => {
                setTempDates((prev) => ({
                  ...prev,
                  start: new Date(formData.startDate + "T00:00:00"),
                }))
                setShowModals((prev) => ({ ...prev, startDate: true }))
              }}
            >
              <View style={styles.dateLeft}>
                <View style={styles.dateIconContainer}>
                  <Ionicons name="calendar-outline" size={20} color="#1CC29F" />
                </View>
                <View>
                  <Text style={styles.dateLabel}>Start Date</Text>
                  <Text style={styles.dateValue}>
                    {formatDate(formData.startDate)}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            {/* End Date (only if recurring) */}
            {formData.isRecurring && (
              <TouchableOpacity
                style={styles.dateCard}
                onPress={() => {
                  setTempDates((prev) => ({
                    ...prev,
                    end: formData.endDate
                      ? new Date(formData.endDate + "T00:00:00")
                      : new Date(),
                  }))
                  setShowModals((prev) => ({ ...prev, endDate: true }))
                }}
              >
                <View style={styles.dateLeft}>
                  <View style={styles.dateIconContainer}>
                    <Ionicons name="calendar" size={20} color="#EF4444" />
                  </View>
                  <View>
                    <Text style={styles.dateLabel}>End Date (Optional)</Text>
                    <Text style={styles.dateValue}>
                      {formData.endDate
                        ? formatDate(formData.endDate)
                        : "No end date"}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          {/* Notification Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            <TouchableOpacity
              style={styles.selectorCard}
              onPress={() =>
                setShowModals((prev) => ({ ...prev, notification: true }))
              }
            >
              <View style={styles.selectorLeft}>
                <View
                  style={[
                    styles.selectorIcon,
                    {
                      backgroundColor:
                        formData.notificationSettings.timing === "disabled"
                          ? "#EF444420"
                          : "#1CC29F20",
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      formData.notificationSettings.timing === "disabled"
                        ? "notifications-off-outline"
                        : "notifications-outline"
                    }
                    size={20}
                    color={
                      formData.notificationSettings.timing === "disabled"
                        ? "#EF4444"
                        : "#1CC29F"
                    }
                  />
                </View>
                <View>
                  <Text style={styles.selectorLabel}>Remind Me</Text>
                  <Text style={styles.selectorValue}>
                    {getSelectedItem("notification")?.label}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Transaction Info */}
          {transaction && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Transaction Information</Text>
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Created:</Text>
                  <Text style={styles.infoValue}>
                    {formatDate(transaction.createdAt)}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Executed:</Text>
                  <Text style={styles.infoValue}>
                    {transaction.executionCount || 0} times
                  </Text>
                </View>
                {transaction.lastExecuted && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Last Executed:</Text>
                    <Text style={styles.infoValue}>
                      {formatDate(transaction.lastExecuted)}
                    </Text>
                  </View>
                )}
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Next Due:</Text>
                  <Text style={styles.infoValue}>
                    {formatDate(transaction.nextRunDate)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Preview Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <View style={styles.previewCard}>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Transaction:</Text>
                <Text style={styles.previewValue}>
                  {formData.name || "Unnamed"}
                </Text>
              </View>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Amount:</Text>
                <Text
                  style={[
                    styles.previewValue,
                    { color: getSelectedItem("type")?.color },
                  ]}
                >
                  {getSelectedItem("type")?.value === "income" ? "+" : "-"}₹
                  {formData.amount || "0.00"}
                </Text>
              </View>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Schedule:</Text>
                <Text style={styles.previewValue}>
                  {formData.isRecurring
                    ? getSelectedItem("frequency")?.label
                    : "One-time"}
                </Text>
              </View>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Status:</Text>
                <Text style={styles.previewValue}>
                  {getSelectedItem("status")?.label}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Modals */}
        {renderModal("type", "Select Type", transactionTypes)}
        {renderModal(
          "category",
          "Select Category",
          currentCategories,
          "id", // Fixed: use "id" instead of "_id"
          "label"
        )}
        {renderModal("account", "Select Account", accounts, "id", "name")}
        {renderModal("frequency", "Select Frequency", frequencyOptions)}
        {renderModal(
          "notification",
          "Notification Settings",
          notificationOptions
        )}
        {renderModal("status", "Transaction Status", statusOptions)}

        {/* Date Pickers */}
        {showModals.startDate &&
          (Platform.OS === "ios" ? (
            <Modal visible transparent animationType="fade">
              <View style={styles.datePickerModalOverlay}>
                <View style={styles.datePickerModal}>
                  <View style={styles.datePickerHeader}>
                    <TouchableOpacity
                      onPress={() =>
                        setShowModals((prev) => ({ ...prev, startDate: false }))
                      }
                    >
                      <Text style={styles.datePickerButton}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.datePickerTitle}>Start Date</Text>
                    <TouchableOpacity
                      onPress={() => handleIOSDateConfirm("startDate")}
                    >
                      <Text
                        style={[styles.datePickerButton, { color: "#1CC29F" }]}
                      >
                        Done
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={tempDates.start}
                    mode="date"
                    display="spinner"
                    onChange={(event, date) =>
                      handleDateChange(event, date, "startDate")
                    }
                    minimumDate={new Date()}
                  />
                </View>
              </View>
            </Modal>
          ) : (
            <DateTimePicker
              value={new Date(formData.startDate + "T00:00:00")}
              mode="date"
              display="default"
              onChange={(event, date) =>
                handleDateChange(event, date, "startDate")
              }
              minimumDate={new Date()}
            />
          ))}

        {showModals.endDate &&
          (Platform.OS === "ios" ? (
            <Modal visible transparent animationType="fade">
              <View style={styles.datePickerModalOverlay}>
                <View style={styles.datePickerModal}>
                  <View style={styles.datePickerHeader}>
                    <TouchableOpacity
                      onPress={() =>
                        setShowModals((prev) => ({ ...prev, endDate: false }))
                      }
                    >
                      <Text style={styles.datePickerButton}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.datePickerTitle}>End Date</Text>
                    <TouchableOpacity
                      onPress={() => handleIOSDateConfirm("endDate")}
                    >
                      <Text
                        style={[styles.datePickerButton, { color: "#1CC29F" }]}
                      >
                        Done
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={tempDates.end}
                    mode="date"
                    display="spinner"
                    onChange={(event, date) =>
                      handleDateChange(event, date, "endDate")
                    }
                    minimumDate={new Date(formData.startDate)}
                  />
                </View>
              </View>
            </Modal>
          ) : (
            <DateTimePicker
              value={
                formData.endDate
                  ? new Date(formData.endDate + "T00:00:00")
                  : new Date()
              }
              mode="date"
              display="default"
              onChange={(event, date) =>
                handleDateChange(event, date, "endDate")
              }
              minimumDate={new Date(formData.startDate)}
            />
          ))}
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
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 16,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
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
  errorText: {
    fontSize: 18,
    color: "#EF4444",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: "700",
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
  },
  selectorCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    marginBottom: 8,
  },
  selectorLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  selectorIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  selectorLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  selectorValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    marginBottom: 8,
  },
  toggleLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginLeft: 12,
  },
  toggleSwitch: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  toggleSwitchActive: {
    backgroundColor: "#1CC29F",
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignSelf: "flex-start",
  },
  toggleThumbActive: {
    alignSelf: "flex-end",
  },
  dateCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    marginBottom: 8,
  },
  dateLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#1CC29F20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  dateLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  previewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  previewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  previewLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  previewValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 20,
    textAlign: "center",
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  modalOptionText: {
    flex: 1,
  },
  modalOptionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
  },
  modalOptionSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },

  // Date Picker Modal Styles
  datePickerModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    padding: 20,
  },
  datePickerModal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  datePickerButton: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
})
