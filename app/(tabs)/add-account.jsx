import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import React, { useCallback, useMemo, useState } from "react"
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
import { useAccountsContext } from "../../src/context/AccountContext" // adjust path if needed
import { accountService } from "../../src/services/accountService" // adjust path if needed
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

  // renderItem is stable and only depends on onSelect and selectedColor through closure
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
            extraData={selectedColor} // tells FlatList which rows might need updating
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
export default function AddAccountScreen() {
  // split state
  const [name, setName] = useState("")
  const [type, setType] = useState("savings")
  const [balance, setBalance] = useState("")
  const [color, setColor] = useState("#1CC29F")
  const [icon, setIcon] = useState("wallet-outline")

  // UI state
  const [loading, setLoading] = useState(false)
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)
  const [showColorDropdown, setShowColorDropdown] = useState(false)

  // memoized selected lookups
  const selectedType = useMemo(
    () => ACCOUNT_TYPES.find((t) => t.value === type) || ACCOUNT_TYPES[0],
    [type]
  )
  const selectedColor = useMemo(
    () => ACCOUNT_COLORS.find((c) => c.value === color) || ACCOUNT_COLORS[0],
    [color]
  )
  const {
    refreshAccounts,
    accounts,
    loading: accountsLoading,
    error: accountsError,
  } = useAccountsContext()

  const resetForm = () => {
    setName("")
    setType("")
    setBalance("")
  }

  /* handlers */
  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter account name")
      return
    }
    if (!balance || isNaN(parseFloat(balance))) {
      Alert.alert("Error", "Please enter a valid balance")
      return
    }

    setLoading(true)
    try {
      const accountData = {
        name: name.trim(),
        type,
        balance: parseFloat(balance),
        color,
        icon,
      }
      const result = await accountService.createAccount(accountData)
      if (result?.success) {
        Alert.alert("Success", "Account created successfully!", [
          {
            text: "OK",
            onPress: () => {
              setName("")
              setBalance(0)
              router.back()
            },
          },
        ])
        //reset form
      } else {
        Alert.alert("Error", result?.error || "Unknown error")
      }
    } catch (err) {
      console.error(err)
      Alert.alert("Error", "Failed to create account. Please try again.")
    } finally {
      refreshAccounts() // refresh accounts context
      setLoading(false)
    }
  }, [name, type, balance, color, icon])

  const handleCancel = useCallback(() => {
    if (name || balance) {
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
  }, [name, balance])

  const handleBalanceChange = useCallback((text) => {
    // lightweight cleaning
    setBalance(text.replace(/[^\d.]/g, ""))
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

  // memoized preview card (pure component prevents unnecessary recalculations)
  const previewCard = useMemo(
    () => (
      <PreviewCard name={name} balance={balance} color={color} icon={icon} />
    ),
    [name, balance, color, icon]
  )

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1CC29F" />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleCancel}
            style={styles.headerButton}
            disabled={loading}
          >
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Account</Text>
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
                    value={balance}
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
          </View>
        </ScrollView>

        {/* modular modals (only mounted when visible) */}
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
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
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
