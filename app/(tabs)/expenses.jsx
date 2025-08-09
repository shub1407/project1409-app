import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useState } from "react"
import {
  ActivityIndicator,
  Alert,
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

export default function AddExpenseScreen() {
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    account: "",
    category: "",
    date: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
    note: "",
  })
  const [loading, setLoading] = useState(false)
  const [showAccountModal, setShowAccountModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showDateModal, setShowDateModal] = useState(false)

  // Example options
  const accountOptions = [
    { id: "cash", label: "Cash", color: "#1CC29F" },
    { id: "pnb", label: "PNB", color: "#8B4513" },
    { id: "bob", label: "BOB", color: "#FF6B6B" },
  ]
  const categoryOptions = [
    { id: "food", label: "Food", icon: "restaurant-outline", color: "#FF9F43" },
    {
      id: "shopping",
      label: "Shopping",
      icon: "bag-outline",
      color: "#54A0FF",
    },
    {
      id: "transport",
      label: "Transport",
      icon: "car-outline",
      color: "#45B7D1",
    },
    {
      id: "bills",
      label: "Bills",
      icon: "document-text-outline",
      color: "#FF6B6B",
    },
    // Add more as needed
  ]

  const handleSave = async () => {
    if (
      !formData.description.trim() ||
      !formData.amount.trim() ||
      !formData.account ||
      !formData.category ||
      isNaN(Number(formData.amount))
    ) {
      Alert.alert("Error", "Please fill all required fields with valid values")
      return
    }
    setLoading(true)
    // Replace with your actual expenseService call
    try {
      // await expenseService.createExpense({...formData, amount: Number(formData.amount)});
      Alert.alert("Success", "Expense added successfully!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ])
    } catch (e) {
      Alert.alert("Error", "Failed to add expense.")
    } finally {
      setLoading(false)
    }
  }

  const handleField = (key, value) =>
    setFormData((prev) => ({ ...prev, [key]: value }))

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1CC29F" />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.headerButton}
            disabled={loading}
          >
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Expense</Text>
          <TouchableOpacity
            onPress={handleSave}
            style={styles.headerButton}
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
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Description Field */}
          <View style={styles.fieldContainer}>
            <View style={styles.iconBox}>
              <Ionicons name="receipt-outline" size={20} color="#1CC29F" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Enter description"
              placeholderTextColor="#9CA3AF"
              value={formData.description}
              onChangeText={(v) => handleField("description", v)}
            />
          </View>
          {/* Amount Field */}
          <View style={styles.fieldContainer}>
            <View style={styles.iconBox}>
              <Ionicons name="pricetag-outline" size={20} color="#1CC29F" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Amount"
              placeholderTextColor="#9CA3AF"
              value={formData.amount}
              keyboardType="numeric"
              onChangeText={(v) =>
                handleField("amount", v.replace(/[^\d.]/g, ""))
              }
            />
          </View>
          {/* Account Selector */}
          <TouchableOpacity
            style={styles.fieldContainer}
            onPress={() => setShowAccountModal(true)}
          >
            <View style={styles.iconBox}>
              <Ionicons name="wallet-outline" size={20} color="#1CC29F" />
            </View>
            <Text
              style={[styles.input, !formData.account && { color: "#9CA3AF" }]}
            >
              {formData.account
                ? accountOptions.find((a) => a.id === formData.account)?.label
                : "Select Account"}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          {/* Category Selector */}
          <TouchableOpacity
            style={styles.fieldContainer}
            onPress={() => setShowCategoryModal(true)}
          >
            <View style={styles.iconBox}>
              <Ionicons
                name={
                  formData.category
                    ? categoryOptions.find((c) => c.id === formData.category)
                        ?.icon
                    : "apps-outline"
                }
                size={20}
                color="#1CC29F"
              />
            </View>
            <Text
              style={[styles.input, !formData.category && { color: "#9CA3AF" }]}
            >
              {formData.category
                ? categoryOptions.find((c) => c.id === formData.category)?.label
                : "Select Category"}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          {/* Note Field */}
          <View style={styles.fieldContainer}>
            <View style={styles.iconBox}>
              <Ionicons
                name="document-text-outline"
                size={20}
                color="#1CC29F"
              />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Add note (optional)"
              placeholderTextColor="#9CA3AF"
              value={formData.note}
              onChangeText={(v) => handleField("note", v)}
            />
          </View>
          {/* Date Picker */}
          <TouchableOpacity
            style={styles.metaRow}
            onPress={() => setShowDateModal(true)}
          >
            <Ionicons name="calendar-outline" size={18} color="#1CC29F" />
            <Text style={styles.metaText}>Date: {formData.date}</Text>
          </TouchableOpacity>
        </ScrollView>
        {/* Account Modal */}
        <Modal
          visible={showAccountModal}
          transparent
          onRequestClose={() => setShowAccountModal(false)}
          animationType="fade"
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            onPress={() => setShowAccountModal(false)}
            activeOpacity={1}
          >
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Select Account</Text>
              {accountOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={styles.modalOption}
                  onPress={() => {
                    handleField("account", opt.id)
                    setShowAccountModal(false)
                  }}
                >
                  <View
                    style={[styles.colourDot, { backgroundColor: opt.color }]}
                  />
                  <Text style={styles.modalOptionText}>{opt.label}</Text>
                  {formData.account === opt.id && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#1CC29F"
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
        {/* Category Modal */}
        <Modal
          visible={showCategoryModal}
          transparent
          onRequestClose={() => setShowCategoryModal(false)}
          animationType="fade"
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            onPress={() => setShowCategoryModal(false)}
            activeOpacity={1}
          >
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Select Category</Text>
              {categoryOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={styles.modalOption}
                  onPress={() => {
                    handleField("category", opt.id)
                    setShowCategoryModal(false)
                  }}
                >
                  <Ionicons
                    name={opt.icon}
                    size={18}
                    color={opt.color}
                    style={{ marginRight: 10 }}
                  />
                  <Text style={styles.modalOptionText}>{opt.label}</Text>
                  {formData.category === opt.id && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#1CC29F"
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
        {/* Date Picker Modal (Native implementation recommended) */}
        {/* You can use @react-native-community/datetimepicker for better UX */}
        <Modal
          visible={showDateModal}
          transparent
          onRequestClose={() => setShowDateModal(false)}
          animationType="fade"
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            onPress={() => setShowDateModal(false)}
            activeOpacity={1}
          >
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Select Date</Text>
              <TextInput
                value={formData.date}
                onChangeText={(date) => handleField("date", date)}
                style={styles.textInput}
                placeholder="YYYY-MM-DD"
                keyboardType="numbers-and-punctuation"
              />
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => setShowDateModal(false)}
              >
                <Text style={styles.selectButtonText}>Set Date</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1CC29F",
    paddingTop: 20,
    paddingBottom: 18,
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.13)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 24,
  },
  fieldContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 18,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#374151",
    fontWeight: "500",
    height: 32,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 22,
    marginLeft: 4,
  },
  metaText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 24,
    width: "80%",
    maxWidth: 400,
    shadowColor: "#1CC29F",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    color: "#111827",
    marginBottom: 22,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 8,
    paddingHorizontal: 3,
    marginBottom: 6,
  },
  colourDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  modalOptionText: {
    flex: 1,
    fontSize: 16,
    color: "#222",
    fontWeight: "500",
  },
  selectButton: {
    marginTop: 18,
    alignSelf: "flex-end",
    backgroundColor: "#1CC29F",
    borderRadius: 8,
    paddingHorizontal: 22,
    paddingVertical: 10,
  },
  selectButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
})
