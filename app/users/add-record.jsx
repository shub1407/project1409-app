import { Ionicons } from "@expo/vector-icons"
import DateTimePicker from "@react-native-community/datetimepicker"
import { router } from "expo-router"
import { useCallback, useMemo, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { useAccountsContext } from "../../src/context/AccountContext"
import { useCategoryContext } from "../../src/context/CategoryContext"
import { useTransaction } from "../../src/hooks/useTransaction"
import styles from "../../src/styles/add"

export default function AddTransactionScreen() {
  const { createTransaction, getTransactions, updateTransaction } =
    useTransaction()
  const [formData, setFormData] = useState({
    type: "expense",
    description: "",
    amount: "",
    fromAccount: "",
    toAccount: "",
    category: "",
    date: new Date().toISOString().slice(0, 10),
    note: "",
  })

  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [tempDate, setTempDate] = useState(new Date())

  const {
    expenseCategories,
    incomeCategories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategoryContext()

  const {
    accounts,
    loading: accountsLoading,
    refreshAccounts,
    error: accountsError,
  } = useAccountsContext()

  const [loading, setLoading] = useState(false)
  const [showTypeModal, setShowTypeModal] = useState(false)
  const [showFromAccountModal, setShowFromAccountModal] = useState(false)
  const [showToAccountModal, setShowToAccountModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showDateModal, setShowDateModal] = useState(false)

  const resetForm = useCallback(() => {
    setFormData({
      type: "income",
      description: "",
      amount: "",
      fromAccount: "",
      toAccount: "",
      category: "",
      date: new Date().toISOString().slice(0, 10),
      note: "",
    })
  }, [])

  // Transaction Types
  const transactionTypes = useMemo(
    () => [
      {
        value: "expense",
        label: "Expense",
        icon: "trending-down",
        color: "#FF6B6B",
        description: "Money spent",
      },
      {
        value: "income",
        label: "Income",
        icon: "trending-up",
        color: "#1CC29F",
        description: "Money received",
      },
      {
        value: "transfer",
        label: "Transfer",
        icon: "swap-horizontal",
        color: "#45B7D1",
        description: "Move between accounts",
      },
    ],
    []
  )

  // Bank Accounts
  const accountOptions = useMemo(
    () =>
      accounts.map((account) => ({
        id: account.id,
        label: account.name,
        icon: account.icon || "wallet-outline",
        color: account.color || "#1CC29F",
        balance: account.balance,
        type: account.type,
      })),
    [accounts]
  )

  // Categories based on transaction type
  const categories =
    formData.type === "expense"
      ? expenseCategories
      : formData.type === "income"
      ? incomeCategories
      : []

  // Date picker handlers
  const formatDateLocal = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false)
      if (selectedDate) {
        const dateString = formatDateLocal(selectedDate)
        updateFormData("date", dateString)
      }
    } else {
      if (selectedDate) {
        setTempDate(selectedDate)
      }
    }
  }

  const handleIOSDateConfirm = () => {
    const dateString = formatDateLocal(tempDate)
    updateFormData("date", dateString)
    setShowDatePicker(false)
  }

  const formatDateForDisplay = (dateString) => {
    const date = new Date(dateString + "T00:00:00")
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    }
  }

  const handleSave = useCallback(async () => {
    // Validation
    if (!formData.description.trim()) {
      Alert.alert("Error", "Please enter description")
      return
    }

    if (!formData.amount || isNaN(parseFloat(formData.amount))) {
      Alert.alert("Error", "Please enter a valid amount")
      return
    }

    if (!formData.fromAccount) {
      Alert.alert(
        "Error",
        `Please select ${formData.type === "transfer" ? "from" : ""} account`
      )
      return
    }

    if (formData.type === "transfer" && !formData.toAccount) {
      Alert.alert("Error", "Please select destination account")
      return
    }

    if (
      formData.type === "transfer" &&
      formData.fromAccount === formData.toAccount
    ) {
      Alert.alert("Error", "From and To accounts cannot be the same")
      return
    }

    if (formData.type !== "transfer" && !formData.category) {
      Alert.alert("Error", "Please select category")
      return
    }

    setLoading(true)
    try {
      const transactionData = {
        accountId: formData.fromAccount,
        toAccountId: formData.toAccount || null,
        type: formData.type,
        categoryId: formData.category || null,
        amount: parseFloat(formData.amount),
        description: formData.description.trim(),
        date: formData.date,
        note: formData.note.trim(),
      }
      console.log("Transfer data: ", transactionData)

      // Call API to save transaction
      //await transactionService.createTransaction(transactionData)
      //call to local db
      const result = await createTransaction(transactionData)
      console.log("Local DB result: ", result)
      // Refresh accounts and reset form
      await refreshAccounts()
      resetForm()
      Alert.alert(
        "Success",
        `${
          formData.type.charAt(0).toUpperCase() + formData.type.slice(1)
        } added successfully!`,
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      )
    } catch (error) {
      Alert.alert("Error", "Failed to add transaction. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [formData])

  const handleCancel = useCallback(() => {
    const hasChanges = formData.description || formData.amount || formData.note
    if (hasChanges) {
      Alert.alert(
        "Discard Changes?",
        "Are you sure you want to discard your changes?",
        [
          { text: "Keep Editing", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => router.back(),
          },
        ]
      )
    } else {
      router.back()
    }
  }, [formData])

  const updateFormData = useCallback((key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "type" && { category: "", toAccount: "" }),
    }))
  }, [])

  const formatAmount = useCallback(
    (text) => {
      const cleaned = text.replace(/[^\d.]/g, "")
      updateFormData("amount", cleaned)
    },
    [updateFormData]
  )

  const getSelectedType = () =>
    transactionTypes.find((type) => type.value === formData.type)
  const getSelectedFromAccount = () =>
    accountOptions.find((acc) => acc.id === formData.fromAccount)
  const getSelectedToAccount = () =>
    accountOptions.find((acc) => acc.id === formData.toAccount)
  const getSelectedCategory = () =>
    categories.find((cat) => cat.id === formData.category)

  const getTypeColor = () => getSelectedType()?.color || "#1CC29F"

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={getTypeColor()} />
      <SafeAreaView style={styles.container}>
        {/* Dynamic Header Color */}
        <View style={[styles.header, { backgroundColor: getTypeColor() }]}>
          <TouchableOpacity
            onPress={handleCancel}
            style={styles.headerButton}
            disabled={loading}
          >
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            Add {getSelectedType()?.label || "Transaction"}
          </Text>
          <TouchableOpacity
            onPress={handleSave}
            style={[
              styles.headerButton,
              loading && styles.headerButtonDisabled,
            ]}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="checkmark" size={24} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Transaction Type Selector */}
          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.selectorCard, { borderColor: getTypeColor() }]}
              onPress={() => setShowTypeModal(true)}
            >
              <View style={styles.selectorLeft}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: `${getTypeColor()}20` },
                  ]}
                >
                  <Ionicons
                    name={getSelectedType()?.icon}
                    size={24}
                    color={getTypeColor()}
                  />
                </View>
                <View>
                  <Text style={styles.selectorTitle}>
                    {getSelectedType()?.label}
                  </Text>
                  <Text style={styles.selectorSubtitle}>
                    {getSelectedType()?.description}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Amount Input - With Rupee Symbol Only */}
          <View style={styles.section}>
            <View style={styles.amountContainer}>
              <Ionicons
                name="cash"
                size={24}
                color={getTypeColor()}
                style={styles.amountIcon}
              />
              <Text style={[styles.currencySymbol, { color: getTypeColor() }]}>
                ₹
              </Text>
              <TextInput
                style={[styles.amountInput, { color: getTypeColor() }]}
                placeholder="0.00"
                placeholderTextColor="#9CA3AF"
                value={formData.amount}
                onChangeText={formatAmount}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Description Input - With Notes Icon Only */}
          <View style={styles.section}>
            <View style={styles.descriptionContainer}>
              <Ionicons
                name="document-text"
                size={20}
                color="#6B7280"
                style={styles.descriptionIcon}
              />
              <TextInput
                style={styles.descriptionInput}
                placeholder={`What was this ${formData.type} for?`}
                placeholderTextColor="#9CA3AF"
                value={formData.description}
                onChangeText={(value) => updateFormData("description", value)}
                autoCapitalize="sentences"
              />
            </View>
          </View>

          {/* Account Selection - With Arrow for Transfer */}
          {formData.type === "transfer" ? (
            <View style={styles.section}>
              <View style={styles.transferContainer}>
                {/* From Account */}
                <TouchableOpacity
                  style={styles.transferAccount}
                  onPress={() => {
                    if (!accountsLoading && !accountsError) {
                      if (accounts.length === 0) {
                        Alert.alert(
                          "No Accounts",
                          "Please add an account first.",
                          [
                            {
                              text: "Add Account",
                              onPress: () =>
                                router.push("/users/home/add-account"),
                            },
                            { text: "Cancel", style: "cancel" },
                          ]
                        )
                        return
                      }
                    }
                    setShowFromAccountModal(true)
                  }}
                >
                  {getSelectedFromAccount() ? (
                    <View style={styles.accountInfo}>
                      <View
                        style={[
                          styles.accountIcon,
                          { backgroundColor: getSelectedFromAccount()?.color },
                        ]}
                      >
                        <Ionicons
                          name={getSelectedFromAccount()?.icon}
                          size={16}
                          color="#FFFFFF"
                        />
                      </View>
                      <View style={styles.accountDetails}>
                        <Text style={styles.accountName}>
                          {getSelectedFromAccount()?.label}
                        </Text>
                        <Text style={styles.accountBalance}>
                          ₹{getSelectedFromAccount()?.balance?.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.accountInfo}>
                      <View style={styles.accountIconPlaceholder}>
                        <Ionicons name="add" size={16} color="#9CA3AF" />
                      </View>
                      <Text style={styles.accountPlaceholder}>From</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Arrow */}
                <View style={styles.arrowContainer}>
                  <Ionicons
                    name="arrow-forward"
                    size={24}
                    color={getTypeColor()}
                  />
                </View>

                {/* To Account */}
                <TouchableOpacity
                  style={styles.transferAccount}
                  onPress={() => {
                    if (!accountsLoading && !accountsError) {
                      if (accounts.length === 0) {
                        Alert.alert(
                          "No Accounts",
                          "Please add an account first.",
                          [
                            {
                              text: "Add Account",
                              onPress: () =>
                                router.push("/users/home/add-account"),
                            },
                            { text: "Cancel", style: "cancel" },
                          ]
                        )
                        return
                      }
                    }
                    setShowToAccountModal(true)
                  }}
                >
                  {getSelectedToAccount() ? (
                    <View style={styles.accountInfo}>
                      <View
                        style={[
                          styles.accountIcon,
                          { backgroundColor: getSelectedToAccount()?.color },
                        ]}
                      >
                        <Ionicons
                          name={getSelectedToAccount()?.icon}
                          size={16}
                          color="#FFFFFF"
                        />
                      </View>
                      <View style={styles.accountDetails}>
                        <Text style={styles.accountName}>
                          {getSelectedToAccount()?.label}
                        </Text>
                        <Text style={styles.accountBalance}>
                          ₹{getSelectedToAccount()?.balance?.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.accountInfo}>
                      <View style={styles.accountIconPlaceholder}>
                        <Ionicons name="add" size={16} color="#9CA3AF" />
                      </View>
                      <Text style={styles.accountPlaceholder}>To</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.accountCard}
                onPress={() => {
                  if (!accountsLoading && !accountsError) {
                    if (accounts.length === 0) {
                      Alert.alert(
                        "No Accounts",
                        "Please add an account first.",
                        [
                          {
                            text: "Add Account",
                            onPress: () =>
                              router.push("/users/home/add-account"),
                          },
                          { text: "Cancel", style: "cancel" },
                        ]
                      )
                      return
                    }
                  }
                  setShowFromAccountModal(true)
                }}
              >
                {getSelectedFromAccount() ? (
                  <View style={styles.accountInfo}>
                    <View
                      style={[
                        styles.accountIcon,
                        { backgroundColor: getSelectedFromAccount()?.color },
                      ]}
                    >
                      <Ionicons
                        name={getSelectedFromAccount()?.icon}
                        size={20}
                        color="#FFFFFF"
                      />
                    </View>
                    <View style={styles.accountDetails}>
                      <Text style={styles.accountName}>
                        {getSelectedFromAccount()?.label}
                      </Text>
                      <Text style={styles.accountBalance}>
                        Balance: ₹
                        {getSelectedFromAccount()?.balance?.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.accountInfo}>
                    <View style={styles.accountIconPlaceholder}>
                      <Ionicons name="add" size={20} color="#9CA3AF" />
                    </View>
                    <Text style={styles.accountPlaceholder}>
                      Select account
                    </Text>
                  </View>
                )}
                <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          )}

          {/* Category (Expense/Income only) */}
          {formData.type !== "transfer" && (
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.categoryCard}
                onPress={() => setShowCategoryModal(true)}
              >
                {getSelectedCategory() ? (
                  <View style={styles.categoryInfo}>
                    <View
                      style={[
                        styles.categoryIcon,
                        {
                          backgroundColor: `${getSelectedCategory()?.color}20`,
                        },
                      ]}
                    >
                      <Ionicons
                        name={getSelectedCategory()?.icon}
                        size={20}
                        color={getSelectedCategory()?.color}
                      />
                    </View>
                    <Text style={styles.categoryName}>
                      {getSelectedCategory()?.label}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.categoryInfo}>
                    <View style={styles.categoryIconPlaceholder}>
                      <Ionicons name="apps-outline" size={20} color="#9CA3AF" />
                    </View>
                    <Text style={styles.categoryPlaceholder}>
                      Select category
                    </Text>
                  </View>
                )}
                <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          )}

          {/* Enhanced Date Picker */}
          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.dateCard, { borderColor: `${getTypeColor()}30` }]}
              onPress={() => {
                setTempDate(new Date(formData.date + "T00:00:00"))
                setShowDatePicker(true)
              }}
            >
              <View style={styles.dateLeft}>
                <View
                  style={[
                    styles.dateIconContainer,
                    { backgroundColor: `${getTypeColor()}20` },
                  ]}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={getTypeColor()}
                  />
                </View>
                <View style={styles.dateInfo}>
                  <Text style={styles.dateLabel}>Date</Text>
                  <Text style={[styles.dateText, { color: getTypeColor() }]}>
                    {formatDateForDisplay(formData.date)}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Note */}
          <View style={styles.section}>
            <View style={styles.noteContainer}>
              <Ionicons
                name="create-outline"
                size={20}
                color="#6B7280"
                style={styles.noteIcon}
              />
              <TextInput
                style={styles.noteInput}
                placeholder="Add any additional notes..."
                placeholderTextColor="#9CA3AF"
                value={formData.note}
                onChangeText={(value) => updateFormData("note", value)}
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>
        </ScrollView>

        {/* Native Date Picker */}
        {showDatePicker &&
          (Platform.OS === "ios" ? (
            <Modal
              visible={showDatePicker}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setShowDatePicker(false)}
            >
              <View style={styles.modalOverlay}>
                <TouchableOpacity
                  style={styles.modalBackdrop}
                  onPress={() => setShowDatePicker(false)}
                  activeOpacity={1}
                />
                <View style={styles.datePickerModalContent}>
                  <View style={styles.datePickerHeader}>
                    <TouchableOpacity
                      onPress={() => setShowDatePicker(false)}
                      style={styles.datePickerButton}
                    >
                      <Text style={styles.datePickerButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.datePickerTitle}>Select Date</Text>
                    <TouchableOpacity
                      onPress={handleIOSDateConfirm}
                      style={[
                        styles.datePickerButton,
                        { backgroundColor: getTypeColor() },
                      ]}
                    >
                      <Text
                        style={[
                          styles.datePickerButtonText,
                          { color: "#FFFFFF" },
                        ]}
                      >
                        Done
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={tempDate}
                    mode="date"
                    display="spinner"
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                    textColor={getTypeColor()}
                  />
                </View>
              </View>
            </Modal>
          ) : (
            <DateTimePicker
              value={new Date(formData.date + "T00:00:00")}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          ))}

        {/* All existing modals remain the same */}
        {/* Transaction Type Modal */}
        <Modal
          visible={showTypeModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowTypeModal(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              onPress={() => setShowTypeModal(false)}
              activeOpacity={1}
            />
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Transaction Type</Text>
              {transactionTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.modalOption,
                    formData.type === type.value && styles.modalOptionActive,
                  ]}
                  onPress={() => {
                    updateFormData("type", type.value)
                    setShowTypeModal(false)
                  }}
                >
                  <View style={styles.modalOptionContent}>
                    <View
                      style={[
                        styles.modalOptionIcon,
                        { backgroundColor: `${type.color}20` },
                      ]}
                    >
                      <Ionicons name={type.icon} size={24} color={type.color} />
                    </View>
                    <View style={styles.modalOptionText}>
                      <Text style={styles.modalOptionTitle}>{type.label}</Text>
                      <Text style={styles.modalOptionSubtitle}>
                        {type.description}
                      </Text>
                    </View>
                  </View>
                  {formData.type === type.value && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={type.color}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Modal>

        {/* From Account Modal */}
        <Modal
          visible={showFromAccountModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowFromAccountModal(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              onPress={() => setShowFromAccountModal(false)}
              activeOpacity={1}
            />
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                Select {formData.type === "transfer" ? "From" : ""} Account
              </Text>

              {accountsLoading ? (
                <ActivityIndicator size="large" color="#1CC29F" />
              ) : accountsError ? (
                <Text style={styles.errorText}>Failed to load accounts</Text>
              ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                  {accountOptions.map((account) => (
                    <TouchableOpacity
                      key={account.id}
                      style={[
                        styles.modalOption,
                        formData.fromAccount === account.id &&
                          styles.modalOptionActive,
                      ]}
                      onPress={() => {
                        updateFormData("fromAccount", account.id)
                        setShowFromAccountModal(false)
                      }}
                    >
                      <View style={styles.modalOptionContent}>
                        <View
                          style={[
                            styles.modalAccountIcon,
                            { backgroundColor: account.color },
                          ]}
                        >
                          <Ionicons
                            name={account.icon}
                            size={20}
                            color="#FFFFFF"
                          />
                        </View>
                        <View style={styles.modalOptionText}>
                          <Text style={styles.modalOptionTitle}>
                            {account.label}
                          </Text>
                          <Text style={styles.modalOptionSubtitle}>
                            {account.type.charAt(0).toUpperCase() +
                              account.type.slice(1)}{" "}
                            • Balance: ₹{account.balance.toFixed(2)}
                          </Text>
                        </View>
                      </View>
                      {formData.fromAccount === account.id && (
                        <Ionicons
                          name="checkmark-circle"
                          size={24}
                          color="#1CC29F"
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>

        {/* To Account Modal (Transfer only) */}
        <Modal
          visible={showToAccountModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowToAccountModal(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              onPress={() => setShowToAccountModal(false)}
              activeOpacity={1}
            />
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Destination Account</Text>
              <ScrollView showsVerticalScrollIndicator={false}>
                {accountOptions
                  .filter((account) => account.id !== formData.fromAccount)
                  .map((account) => (
                    <TouchableOpacity
                      key={account.id}
                      style={[
                        styles.modalOption,
                        formData.toAccount === account.id &&
                          styles.modalOptionActive,
                      ]}
                      onPress={() => {
                        updateFormData("toAccount", account.id)
                        setShowToAccountModal(false)
                      }}
                    >
                      <View style={styles.modalOptionContent}>
                        <View
                          style={[
                            styles.modalAccountIcon,
                            { backgroundColor: account.color },
                          ]}
                        >
                          <Ionicons
                            name={account.icon}
                            size={20}
                            color="#FFFFFF"
                          />
                        </View>
                        <View style={styles.modalOptionText}>
                          <Text style={styles.modalOptionTitle}>
                            {account.label}
                          </Text>
                          <Text style={styles.modalOptionSubtitle}>
                            Balance: ₹{account.balance.toFixed(2)}
                          </Text>
                        </View>
                      </View>
                      {formData.toAccount === account.id && (
                        <Ionicons
                          name="checkmark-circle"
                          size={24}
                          color="#1CC29F"
                        />
                      )}
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Category Modal */}
        <Modal
          visible={showCategoryModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowCategoryModal(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              onPress={() => setShowCategoryModal(false)}
              activeOpacity={1}
            />
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <ScrollView showsVerticalScrollIndicator={false}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.modalOption,
                      formData.category === category.id &&
                        styles.modalOptionActive,
                    ]}
                    onPress={() => {
                      updateFormData("category", category.id)
                      setShowCategoryModal(false)
                    }}
                  >
                    <View style={styles.modalOptionContent}>
                      <View
                        style={[
                          styles.modalOptionIcon,
                          { backgroundColor: `${category.color}20` },
                        ]}
                      >
                        <Ionicons
                          name={category.icon}
                          size={20}
                          color={category.color}
                        />
                      </View>
                      <Text style={styles.modalOptionTitle}>
                        {category.label}
                      </Text>
                    </View>
                    {formData.category === category.id && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color={category.color}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  )
}
