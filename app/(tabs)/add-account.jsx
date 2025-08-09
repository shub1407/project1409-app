import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useCallback, useMemo, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Dimensions,
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
import { accountService } from "../../src/services/accountService"

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

export default function AddAccountScreen() {
  const [formData, setFormData] = useState({
    name: "",
    type: "savings",
    balance: "",
    color: "#1CC29F",
    icon: "wallet-outline",
  })
  const [loading, setLoading] = useState(false)
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)
  const [showColorDropdown, setShowColorDropdown] = useState(false)

  // Memoize static data to prevent re-renders
  const accountTypes = useMemo(
    () => [
      { value: "savings", label: "Savings Account", icon: "card-outline" },
      { value: "current", label: "Current Account", icon: "briefcase-outline" },
      { value: "credit", label: "Credit Card", icon: "card" },
      { value: "cash", label: "Cash", icon: "cash-outline" },
      { value: "upi", label: "UPI Wallet", icon: "phone-portrait-outline" },
      { value: "investment", label: "Investment", icon: "trending-up-outline" },
    ],
    []
  )

  const accountColors = useMemo(
    () => [
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
    ],
    []
  )

  const handleSave = useCallback(async () => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "Please enter account name")
      return
    }

    if (!formData.balance || isNaN(parseFloat(formData.balance))) {
      Alert.alert("Error", "Please enter a valid balance")
      return
    }

    setLoading(true)

    try {
      const accountData = {
        name: formData.name.trim(),
        type: formData.type,
        balance: parseFloat(formData.balance),
        color: formData.color,
        icon: formData.icon,
      }

      const result = await accountService.createAccount(accountData)

      if (result.success) {
        Alert.alert("Success", "Account created successfully!", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ])
      } else {
        Alert.alert("Error", result.error)
      }
    } catch (error) {
      Alert.alert("Error", "Failed to create account. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [formData])

  const handleCancel = useCallback(() => {
    if (formData.name || formData.balance) {
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
  }, [formData.name, formData.balance])

  const updateFormData = useCallback((key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }, [])

  const formatAmount = useCallback(
    (text) => {
      const cleaned = text.replace(/[^\d.]/g, "")
      updateFormData("balance", cleaned)
    },
    [updateFormData]
  )

  const getSelectedType = useCallback(() => {
    return accountTypes.find((type) => type.value === formData.type)
  }, [accountTypes, formData.type])

  const getSelectedColor = useCallback(() => {
    return accountColors.find((color) => color.value === formData.color)
  }, [accountColors, formData.color])

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1CC29F" />
      <SafeAreaView style={styles.container}>
        {/* Header with X and Tick */}
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
          removeClippedSubviews={true} // Performance optimization
        >
          <View style={styles.form}>
            {/* Account Details Section */}
            <View style={styles.inputSection}>
              <Text style={styles.sectionTitle}>Account Details</Text>

              {/* Account Name */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Account Name</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter account name (e.g., SBI Savings)"
                  placeholderTextColor="#9CA3AF"
                  value={formData.name}
                  onChangeText={(value) => updateFormData("name", value)}
                  autoCapitalize="words"
                />
              </View>

              {/* Account Type Dropdown */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Account Type</Text>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setShowTypeDropdown(true)}
                >
                  <View style={styles.dropdownContent}>
                    <Ionicons
                      name={getSelectedType()?.icon}
                      size={20}
                      color="#1CC29F"
                      style={styles.dropdownIcon}
                    />
                    <Text style={styles.dropdownText}>
                      {getSelectedType()?.label}
                    </Text>
                  </View>
                  <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              {/* Account Color Dropdown */}
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
                        { backgroundColor: formData.color },
                      ]}
                    />
                    <Text style={styles.dropdownText}>
                      {getSelectedColor()?.label}
                    </Text>
                  </View>
                  <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              {/* Initial Balance */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Initial Balance</Text>
                <View style={styles.amountInputContainer}>
                  <Text style={styles.currencySymbol}>₹</Text>
                  <TextInput
                    style={styles.amountInput}
                    placeholder="0.00"
                    placeholderTextColor="#9CA3AF"
                    value={formData.balance}
                    onChangeText={formatAmount}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            {/* Preview Card */}
            <View style={styles.inputSection}>
              <Text style={styles.sectionTitle}>Preview</Text>
              <View
                style={[
                  styles.previewCard,
                  { backgroundColor: formData.color },
                ]}
              >
                <Ionicons name={formData.icon} size={24} color="#FFFFFF" />
                <View style={styles.previewInfo}>
                  <Text style={styles.previewName}>
                    {formData.name || "Account Name"}
                  </Text>
                  <Text style={styles.previewBalance}>
                    ₹{formData.balance || "0.00"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Account Type Modal - Fixed positioning */}
        <Modal
          visible={showTypeDropdown}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowTypeDropdown(false)}
          statusBarTranslucent={false}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              onPress={() => setShowTypeDropdown(false)}
              activeOpacity={1}
            />
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Account Type</Text>
              <ScrollView showsVerticalScrollIndicator={false}>
                {accountTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.modalOption,
                      formData.type === type.value && styles.modalOptionActive,
                    ]}
                    onPress={() => {
                      updateFormData("type", type.value)
                      updateFormData("icon", type.icon)
                      setShowTypeDropdown(false)
                    }}
                  >
                    <View style={styles.modalOptionContent}>
                      <Ionicons
                        name={type.icon}
                        size={24}
                        color={
                          formData.type === type.value ? "#1CC29F" : "#6B7280"
                        }
                      />
                      <Text
                        style={[
                          styles.modalOptionText,
                          formData.type === type.value &&
                            styles.modalOptionTextActive,
                        ]}
                      >
                        {type.label}
                      </Text>
                    </View>
                    {formData.type === type.value && (
                      <Ionicons name="checkmark" size={20} color="#1CC29F" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Account Color Modal - Fixed positioning */}
        <Modal
          visible={showColorDropdown}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowColorDropdown(false)}
          statusBarTranslucent={false}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              onPress={() => setShowColorDropdown(false)}
              activeOpacity={1}
            />
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Account Color</Text>
              <ScrollView showsVerticalScrollIndicator={false}>
                {accountColors.map((color) => (
                  <TouchableOpacity
                    key={color.value}
                    style={[
                      styles.modalOption,
                      formData.color === color.value &&
                        styles.modalOptionActive,
                    ]}
                    onPress={() => {
                      updateFormData("color", color.value)
                      setShowColorDropdown(false)
                    }}
                  >
                    <View style={styles.modalOptionContent}>
                      <View
                        style={[
                          styles.colorIndicator,
                          { backgroundColor: color.value },
                        ]}
                      />
                      <Text
                        style={[
                          styles.modalOptionText,
                          formData.color === color.value &&
                            styles.modalOptionTextActive,
                        ]}
                      >
                        {color.label}
                      </Text>
                    </View>
                    {formData.color === color.value && (
                      <Ionicons name="checkmark" size={20} color="#1CC29F" />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    marginTop: 20,
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
    shadowOffset: {
      width: 0,
      height: 4,
    },
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
  // Fixed modal styles
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
    width: screenWidth - 48, // Fixed width
    maxHeight: screenHeight * 0.6, // Fixed max height
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
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
