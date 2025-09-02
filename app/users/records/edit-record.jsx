import { Ionicons } from "@expo/vector-icons"
import { router, useLocalSearchParams } from "expo-router"
import { useCallback, useEffect, useMemo, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { useAccountsContext } from "../../../src/context/AccountContext"
import { useCategoryContext } from "../../../src/context/CategoryContext"
import { useTransaction } from "../../../src/hooks/useTransaction"
import styles from "../../../src/styles/add"
export default function EditTransactionScreen() {
  const { transactionId } = useLocalSearchParams()
  console.log("Transaction inside edit-record:: ", transactionId)
  const { getTransactionById } = useTransaction()
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

  const [originalTransaction, setOriginalTransaction] = useState(null)
  const [initialLoading, setInitialLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const {
    expenseCategories,
    incomeCategories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategoryContext()
  const { updateTransaction, deleteTransaction } = useTransaction()

  const {
    accounts,
    loading: accountsLoading,
    refreshAccounts,
    error: accountsError,
  } = useAccountsContext()

  const [showTypeModal, setShowTypeModal] = useState(false)
  const [showFromAccountModal, setShowFromAccountModal] = useState(false)
  const [showToAccountModal, setShowToAccountModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showDateModal, setShowDateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Load transaction data
  useEffect(() => {
    const loadTransaction = async () => {
      if (!transactionId) {
        Alert.alert("Error", "Transaction ID not found", [
          { text: "OK", onPress: () => router.back() },
        ])
        return
      }

      try {
        setInitialLoading(true)
        const result = await getTransactionById(transactionId)

        if (result.success && result.data) {
          const transaction = result.data
          console.log("Loaded transaction is: ", transaction)
          setOriginalTransaction(transaction)
          setFormData({
            type: transaction.type || "expense",
            description: transaction.description || "",
            amount: transaction.amount?.toString() || "",
            fromAccount: transaction.accountId || "",
            toAccount: transaction.toAccountId || "",
            category: transaction.categoryId || "",
            date:
              transaction.date?.split("T")[0] ||
              new Date().toISOString().slice(0, 10),
            note: transaction.note || "",
          })
        } else {
          Alert.alert("Error", "Transaction not found", [
            { text: "OK", onPress: () => router.back() },
          ])
        }
      } catch (error) {
        console.error("Error loading transaction:", error)
        Alert.alert("Error", "Failed to load transaction", [
          { text: "OK", onPress: () => router.back() },
        ])
      } finally {
        setInitialLoading(false)
      }
    }

    loadTransaction()
  }, [transactionId])

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

  // Check if form has changes
  const hasChanges = useMemo(() => {
    if (!originalTransaction) return false
    return (
      formData.description !== (originalTransaction.description || "") ||
      parseFloat(formData.amount || "0") !==
        (originalTransaction.amount || 0) ||
      formData.fromAccount !== (originalTransaction.accountId || "") ||
      formData.toAccount !== (originalTransaction.toAccountId || "") ||
      formData.category !== (originalTransaction.categoryId || "") ||
      formData.date !== (originalTransaction.date?.split("T")[0] || "") ||
      formData.note !== (originalTransaction.note || "") ||
      formData.type !== (originalTransaction.type || "expense")
    )
  }, [formData, originalTransaction])

  const handleUpdate = useCallback(async () => {
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

      // Call API to update transaction
      //const result = await transactionService.updateTransaction(
      //   transactionId,
      //   transactionData
      // )
      const result = await updateTransaction(transactionId, transactionData)

      if (result.success) {
        // Refresh accounts
        await refreshAccounts()
        Alert.alert("Success", "Transaction updated successfully!", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ])
      } else {
        Alert.alert("Error", result.error || "Failed to update transaction")
      }
    } catch (error) {
      console.error("Update error:", error)
      Alert.alert("Error", "Failed to update transaction. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [formData, transactionId])

  const handleDelete = useCallback(async () => {
    setDeleteLoading(true)
    try {
      //const result = await transactionService.deleteTransaction(transactionId)
      const result = await deleteTransaction(transactionId)

      if (result.success) {
        // Refresh accounts
        await refreshAccounts()
        Alert.alert("Success", "Transaction deleted successfully!", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ])
      } else {
        Alert.alert("Error", result.error || "Failed to delete transaction")
      }
    } catch (error) {
      console.error("Delete error:", error)
      Alert.alert("Error", "Failed to delete transaction. Please try again.")
    } finally {
      setDeleteLoading(false)
      setShowDeleteModal(false)
    }
  }, [transactionId])

  const handleCancel = useCallback(() => {
    if (hasChanges) {
      Alert.alert(
        "Discard Changes?",
        "Are you sure you want to discard your changes?",
        [
          { text: "Keep Editing", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => {
              router.replace("/users/records")
            },
          },
        ]
      )
    } else {
      router.back()
    }
  }, [hasChanges])

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

  // Show loading while fetching transaction data
  if (initialLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1CC29F" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1CC29F" />
          <Text style={styles.loadingText}>Loading transaction...</Text>
        </View>
      </SafeAreaView>
    )
  }

  // Show error if transaction not found
  if (!originalTransaction) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1CC29F" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#EF4444" />
          <Text style={styles.errorText}>Transaction not found</Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => router.back()}
          >
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={getTypeColor()} />
      <SafeAreaView style={styles.container}>
        {/* Dynamic Header Color */}
        <View style={[styles.header, { backgroundColor: getTypeColor() }]}>
          <TouchableOpacity
            onPress={handleCancel}
            style={styles.headerButton}
            disabled={loading || deleteLoading}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              Edit {getSelectedType()?.label || "Transaction"}
            </Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => setShowDeleteModal(true)}
              style={[styles.headerButton, styles.headerDeleteButton]}
              disabled={loading || deleteLoading}
            >
              {deleteLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="trash" size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleUpdate}
              style={[
                styles.headerButton,
                (!hasChanges || loading) && styles.headerButtonDisabled,
              ]}
              disabled={!hasChanges || loading || deleteLoading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="checkmark" size={24} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Transaction Info */}
          <View style={styles.section}>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Transaction ID</Text>
              <Text style={styles.infoValue}>{transactionId}</Text>

              <Text style={styles.infoLabel}>Created Date</Text>
              <Text style={styles.infoValue}>
                {originalTransaction.createdAt
                  ? new Date(originalTransaction.createdAt).toLocaleDateString(
                      "en-IN"
                    )
                  : "N/A"}
              </Text>
            </View>
          </View>

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

          {/* Date */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.dateCard}
              onPress={() => setShowDateModal(true)}
            >
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
              <Text style={styles.dateText}>{formData.date}</Text>
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

        {/* Delete Confirmation Modal */}
        <Modal
          visible={showDeleteModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowDeleteModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.deleteModalContent}>
              <View style={styles.deleteIconContainer}>
                <Ionicons name="warning" size={48} color="#EF4444" />
              </View>

              <Text style={styles.deleteModalTitle}>Delete Transaction?</Text>
              <Text style={styles.deleteModalSubtitle}>
                This action cannot be undone. The transaction will be
                permanently deleted.
              </Text>

              <View style={styles.deleteModalButtons}>
                <TouchableOpacity
                  style={styles.deleteModalCancelButton}
                  onPress={() => setShowDeleteModal(false)}
                  disabled={deleteLoading}
                >
                  <Text style={styles.deleteModalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteModalDeleteButton}
                  onPress={handleDelete}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.deleteModalDeleteText}>Delete</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* All your existing modals (Type, Account, Category, Date) remain the same */}
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

        {/* Date Modal */}
        <Modal
          visible={showDateModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowDateModal(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              onPress={() => setShowDateModal(false)}
              activeOpacity={1}
            />
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Date</Text>
              <TextInput
                style={styles.dateInput}
                value={formData.date}
                onChangeText={(date) => updateFormData("date", date)}
                placeholder="YYYY-MM-DD"
                keyboardType="numbers-and-punctuation"
              />
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  { backgroundColor: getTypeColor() },
                ]}
                onPress={() => setShowDateModal(false)}
              >
                <Text style={styles.confirmButtonText}>Set Date</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  )
}
