import { Ionicons } from "@expo/vector-icons"
import { router, useLocalSearchParams } from "expo-router"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { DeleteConfirmationModal } from "../../../src/components/DeleteModal" // Import the component
import { useAccountsContext } from "../../../src/context/AccountContext"

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

/* -------------------------
   Static data (stable references)
   ------------------------- */
const ACCOUNT_TYPES = [
  { value: "savings", label: "Savings Account", icon: "card-outline" },
  { value: "current", label: "Current Account", icon: "briefcase-outline" },
  { value: "credit", label: "Credit Card", icon: "card" },
  { value: "cash", label: "Cash", icon: "cash-outline" },
  { value: "upi", label: "UPI Wallet", icon: "phone-portrait-outline" },
  { value: "investment", label: "Investment", icon: "trending-up-outline" },
]

const ACCOUNT_COLORS = [
  { value: "#1CC29F", label: "Green" },
  { value: "#FF6B6B", label: "Red" },
  { value: "#4ECDC4", label: "Teal" },
  { value: "#45B7D1", label: "Blue" },
  { value: "#FECA57", label: "Yellow" },
  { value: "#FF9FF3", label: "Pink" },
  { value: "#54A0FF", label: "Light Blue" },
  { value: "#5F27CD", label: "Purple" },
  { value: "#00D2D3", label: "Cyan" },
  { value: "#FF9F43", label: "Orange" },
  { value: "#A55EEA", label: "Violet" },
  { value: "#26DE81", label: "Mint" },
]

/* -------------------------
   Row components (memoized with shallow comparison)
   ------------------------- */
const ColorRow = React.memo(
  function ColorRow({ item, selected, onPress }) {
    return (
      <TouchableOpacity
        onPress={() => onPress(item.value)}
        activeOpacity={0.7}
        style={[styles.modalOption, selected && styles.modalOptionActive]}
      >
        <View style={styles.modalOptionContent}>
          <View
            style={[styles.colorIndicator, { backgroundColor: item.value }]}
          />
          <Text
            style={[
              styles.modalOptionText,
              selected && styles.modalOptionTextActive,
            ]}
          >
            {item.label}
          </Text>
        </View>
        {selected && <Ionicons name="checkmark" size={20} color="#1CC29F" />}
      </TouchableOpacity>
    )
  },
  (prev, next) =>
    prev.selected === next.selected && prev.item.value === next.item.value
)

const TypeRow = React.memo(
  function TypeRow({ item, selected, onPress }) {
    return (
      <TouchableOpacity
        onPress={() => onPress(item.value, item.icon)}
        activeOpacity={0.7}
        style={[styles.modalOption, selected && styles.modalOptionActive]}
      >
        <View style={styles.modalOptionContent}>
          <Ionicons
            name={item.icon}
            size={24}
            color={selected ? "#1CC29F" : "#6B7280"}
          />
          <Text
            style={[
              styles.modalOptionText,
              selected && styles.modalOptionTextActive,
            ]}
          >
            {item.label}
          </Text>
        </View>
        {selected && <Ionicons name="checkmark" size={20} color="#1CC29F" />}
      </TouchableOpacity>
    )
  },
  (prev, next) =>
    prev.selected === next.selected && prev.item.value === next.item.value
)

/* -------------------------
   Preview card (pure, memoized)
   ------------------------- */
const PreviewCard = React.memo(function PreviewCard({
  name,
  balance,
  color,
  icon,
}) {
  return (
    <View style={[styles.previewCard, { backgroundColor: color }]}>
      <Ionicons name={icon} size={24} color="#FFFFFF" />
      <View style={styles.previewInfo}>
        <Text style={styles.previewName}>{name || "Account Name"}</Text>
        <Text style={styles.previewBalance}>₹{balance || "0.00"}</Text>
      </View>
    </View>
  )
})

/* -------------------------
   ColorModal (optimized FlatList)
   ------------------------- */
function ColorModal({ visible, selectedColor, onSelect, onClose }) {
  const keyExtractor = useCallback((it) => it.value, [])

  const renderItem = useCallback(
    ({ item }) => (
      <ColorRow
        item={item}
        selected={selectedColor === item.value}
        onPress={onSelect}
      />
    ),
    [onSelect, selectedColor]
  )

  const getItemLayout = useCallback(
    (_data, index) => ({ length: 64, offset: 64 * index, index }),
    []
  )

  if (!visible) return null

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          onPress={onClose}
          activeOpacity={1}
        />
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Account Color</Text>
          <FlatList
            data={ACCOUNT_COLORS}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            extraData={selectedColor}
            initialNumToRender={6}
            maxToRenderPerBatch={8}
            windowSize={5}
            removeClippedSubviews
            getItemLayout={getItemLayout}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      </View>
    </Modal>
  )
}

/* -------------------------
   TypeModal (optimized FlatList)
   ------------------------- */
function TypeModal({ visible, selectedType, onSelect, onClose }) {
  const keyExtractor = useCallback((it) => it.value, [])

  const renderItem = useCallback(
    ({ item }) => (
      <TypeRow
        item={item}
        selected={selectedType === item.value}
        onPress={onSelect}
      />
    ),
    [onSelect, selectedType]
  )

  const getItemLayout = useCallback(
    (_data, index) => ({ length: 64, offset: 64 * index, index }),
    []
  )

  if (!visible) return null
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          onPress={onClose}
          activeOpacity={1}
        />
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Account Type</Text>
          <FlatList
            data={ACCOUNT_TYPES}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            extraData={selectedType}
            initialNumToRender={6}
            maxToRenderPerBatch={6}
            windowSize={5}
            removeClippedSubviews
            getItemLayout={getItemLayout}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      </View>
    </Modal>
  )
}

/* -------------------------
   Main screen
   ------------------------- */
export default function EditAccountScreen() {
  const { accountId } = useLocalSearchParams()
  const { accounts, refreshAccounts, deleteAccount, updateAccount } =
    useAccountsContext()
  console.log("accounts in edit account:: ", accounts)
  // Form state
  const [name, setName] = useState("")
  const [type, setType] = useState("savings")
  const [initialBalance, setInitialBalance] = useState("")
  const [color, setColor] = useState("#1CC29F")
  const [icon, setIcon] = useState("wallet-outline")
  // const [initialBalance, setInitialBalance] = useState("")

  // UI state
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)
  const [showColorDropdown, setShowColorDropdown] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Original account data for comparison
  const [originalAccount, setOriginalAccount] = useState(null)

  // Load account data
  useEffect(() => {
    const loadAccount = () => {
      if (!accountId || !accounts.length) {
        setInitialLoading(false)
        return
      }

      const account = accounts.find((acc) => acc.id === accountId)
      if (account) {
        setOriginalAccount(account)
        setName(account.name || "")
        setType(account.type || "savings")
        setInitialBalance(account.initialBalance?.toString() || "0")
        setColor(account.color || "#1CC29F")
        setIcon(account.icon || "wallet-outline")
      }

      setInitialLoading(false)
    }

    loadAccount()
  }, [accountId, accounts])

  // Memoized selected lookups
  const selectedType = useMemo(
    () => ACCOUNT_TYPES.find((t) => t.value === type) || ACCOUNT_TYPES[0],
    [type]
  )
  const selectedColor = useMemo(
    () => ACCOUNT_COLORS.find((c) => c.value === color) || ACCOUNT_COLORS,
    [color]
  )

  // Check if form has changes
  const hasChanges = useMemo(() => {
    if (!originalAccount) return false
    return (
      name !== (originalAccount.name || "") ||
      type !== (originalAccount.type || "savings") ||
      parseFloat(initialBalance || "0") !== (originalAccount.balance || 0) ||
      color !== (originalAccount.color || "#1CC29F") ||
      icon !== (originalAccount.icon || "wallet-outline")
    )
  }, [name, type, initialBalance, color, icon, originalAccount])

  /* handlers */
  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter account name")
      return
    }
    if (!initialBalance || isNaN(parseFloat(initialBalance))) {
      Alert.alert("Error", "Please enter a valid balance")
      return
    }

    setLoading(true)
    try {
      const balChange =
        parseFloat(initialBalance) - parseFloat(originalAccount.initialBalance)
      const updatedBal = parseFloat(originalAccount.balance || 0) + balChange
      const accountData = {
        name: name.trim(),
        type,
        initialBalance: parseFloat(initialBalance),
        color,
        icon,
        balance: updatedBal,
      }
      console.log("Saving account data:", accountData)

      const result = await updateAccount(accountId, accountData)
      if (result?.success) {
        Alert.alert("Success", "Account updated successfully!", [
          { text: "OK", onPress: () => router.back() },
        ])
      } else {
        Alert.alert("Error", result?.error || "Unknown error")
      }
    } catch (err) {
      console.error(err)
      Alert.alert("Error", "Failed to update account. Please try again.")
    } finally {
      await refreshAccounts() // refresh accounts context
      setLoading(false)
    }
  }, [name, type, initialBalance, color, icon, accountId])

  const handleDelete = useCallback(async () => {
    if (!originalAccount) return

    setDeleteLoading(true)
    try {
      const result = await deleteAccount(accountId)
      if (result?.success) {
        Alert.alert("Success", "Account deleted successfully!", [
          {
            text: "OK",
            onPress: () => {
              router.back()
            },
          },
        ])
      } else {
        Alert.alert("Error", result?.error || "Failed to delete account")
      }
    } catch (err) {
      console.error(err)
      Alert.alert("Error", "Failed to delete account. Please try again.")
    } finally {
      await refreshAccounts()
      setDeleteLoading(false)
      setShowDeleteModal(false)
    }
  }, [accountId, originalAccount, deleteAccount])

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
            onPress: () => router.back(),
          },
        ]
      )
    } else {
      router.back()
    }
  }, [hasChanges])

  const handleBalanceChange = useCallback((text) => {
    // lightweight cleaning
    setInitialBalance(text.replace(/[^\d.]/g, ""))
  }, [])

  const onSelectColor = useCallback((colorValue) => {
    setColor(colorValue)
    setShowColorDropdown(false)
  }, [])

  const onSelectType = useCallback((typeValue, iconName) => {
    setType(typeValue)
    setIcon(iconName || "wallet-outline")
    setShowTypeDropdown(false)
  }, [])

  // Memoized preview card
  const previewCard = useMemo(
    () => (
      <PreviewCard
        name={name}
        balance={initialBalance}
        color={color}
        icon={icon}
      />
    ),
    [name, initialBalance, color, icon]
  )

  // Show loading while fetching account data
  if (initialLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1CC29F" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1CC29F" />
          <Text style={styles.loadingText}>Loading account...</Text>
        </View>
      </SafeAreaView>
    )
  }

  // Show error if account not found
  if (!originalAccount) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1CC29F" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#EF4444" />
          <Text style={styles.errorText}>Account not found</Text>
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
      <StatusBar barStyle="light-content" backgroundColor="#1CC29F" />
      <SafeAreaView style={styles.container}>
        {/* Modified Header with Delete Button */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleCancel}
            style={styles.headerButton}
            disabled={loading || deleteLoading}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Edit Account</Text>

          <View style={styles.headerRightButtons}>
            <TouchableOpacity
              onPress={() => setShowDeleteModal(true)}
              style={[styles.headerButton, styles.deleteHeaderButton]}
              disabled={loading || deleteLoading}
            >
              <Ionicons name="trash" size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              style={[
                styles.headerButton,
                (!hasChanges || loading || deleteLoading) &&
                  styles.headerButtonDisabled,
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
          removeClippedSubviews
        >
          <View style={styles.form}>
            <View style={styles.inputSection}>
              <Text style={styles.sectionTitle}>Account Details</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Account Name</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter account name (e.g., SBI Savings)"
                  placeholderTextColor="#9CA3AF"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Account Type</Text>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setShowTypeDropdown(true)}
                >
                  <View style={styles.dropdownContent}>
                    <Ionicons
                      name={selectedType.icon}
                      size={20}
                      color="#1CC29F"
                      style={styles.dropdownIcon}
                    />
                    <Text style={styles.dropdownText}>
                      {selectedType.label}
                    </Text>
                  </View>
                  <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Account Color</Text>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setShowColorDropdown(true)}
                >
                  <View style={styles.dropdownContent}>
                    <View
                      style={[
                        styles.colorIndicator,
                        { backgroundColor: color },
                      ]}
                    />
                    <Text style={styles.dropdownText}>
                      {selectedColor.label}
                    </Text>
                  </View>
                  <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Initial Balance</Text>
                <View style={styles.amountInputContainer}>
                  <Text style={styles.currencySymbol}>₹</Text>
                  <TextInput
                    style={styles.amountInput}
                    placeholder="0.00"
                    placeholderTextColor="#9CA3AF"
                    value={initialBalance}
                    onChangeText={handleBalanceChange}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.sectionTitle}>Preview</Text>
              {previewCard}
            </View>

            {/* Account Info */}
            <View style={styles.inputSection}>
              <Text style={styles.sectionTitle}>Account Information</Text>
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>Account ID</Text>
                <Text style={styles.infoValue}>{accountId}</Text>

                <Text style={styles.infoLabel}>Created Date</Text>
                <Text style={styles.infoValue}>
                  {originalAccount.createdAt
                    ? new Date(originalAccount.createdAt).toLocaleDateString(
                        "en-IN"
                      )
                    : "N/A"}
                </Text>

                <Text style={styles.infoLabel}>Initial Balance</Text>
                <Text style={styles.infoValue}>
                  ₹{originalAccount.initialBalance?.toFixed(2) || "0.00"}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Modular modals */}
        <TypeModal
          visible={showTypeDropdown}
          selectedType={type}
          onSelect={onSelectType}
          onClose={() => setShowTypeDropdown(false)}
        />
        <ColorModal
          visible={showColorDropdown}
          selectedColor={color}
          onSelect={onSelectColor}
          onClose={() => setShowColorDropdown(false)}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          visible={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          title="Delete Account"
          message={`Are you sure you want to delete "${
            originalAccount?.name || "this account"
          }"?`}
          warningMessage="All transactions associated with this account will be permanently deleted. This action cannot be undone."
          confirmText="Delete Account"
          loading={deleteLoading}
        />
      </SafeAreaView>
    </>
  )
}

/* -------------------------
   Styles
   ------------------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    marginTop: 0,
  },
  header: {
    backgroundColor: "#1CC29F",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerRightButtons: {
    flexDirection: "row",
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteHeaderButton: {
    backgroundColor: "rgba(239, 68, 68, 0.3)",
  },
  headerButtonDisabled: {
    opacity: 0.5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 24,
  },
  inputSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
  },
  dropdownButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  dropdownIcon: {
    marginRight: 12,
  },
  dropdownText: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
  },
  colorIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1CC29F",
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    fontWeight: "600",
  },
  previewCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  previewInfo: {
    marginLeft: 16,
  },
  previewName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  previewBalance: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 4,
    marginTop: 12,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginTop: 16,
    marginBottom: 24,
  },
  errorButton: {
    backgroundColor: "#1CC29F",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  errorButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  /* modal */
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
    maxHeight: screenHeight * 0.6,
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
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    height: 64,
  },
  modalOptionActive: {
    backgroundColor: "#F0FDF4",
  },
  modalOptionContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  modalOptionText: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
    marginLeft: 12,
  },
  modalOptionTextActive: {
    color: "#1CC29F",
    fontWeight: "600",
  },
})
