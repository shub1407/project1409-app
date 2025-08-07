import { Ionicons } from "@expo/vector-icons"
import axios from "axios"
import { router } from "expo-router"
import { useState } from "react"
import {
  Alert,
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
  const [transactionType, setTransactionType] = useState("expense") // expense or income
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [loading, setLoading] = useState(false)

  const expenseCategories = [
    { name: "Food", icon: "restaurant-outline", color: "#FF6B6B" },
    { name: "Transport", icon: "car-outline", color: "#4ECDC4" },
    { name: "Entertainment", icon: "musical-notes-outline", color: "#45B7D1" },
    { name: "Shopping", icon: "bag-outline", color: "#FECA57" },
    { name: "Bills", icon: "document-text-outline", color: "#FF9FF3" },
    { name: "Health", icon: "medical-outline", color: "#A8E6CF" },
    { name: "Education", icon: "book-outline", color: "#FFB6C1" },
    { name: "Others", icon: "ellipsis-horizontal-outline", color: "#DDA0DD" },
  ]

  const incomeCategories = [
    { name: "Salary", icon: "card-outline", color: "#1CC29F" },
    { name: "Freelance", icon: "laptop-outline", color: "#36CFC9" },
    { name: "Investment", icon: "trending-up-outline", color: "#95DE64" },
    { name: "Gift", icon: "gift-outline", color: "#FFD666" },
    { name: "Others", icon: "ellipsis-horizontal-outline", color: "#B37FEB" },
  ]

  const categories =
    transactionType === "expense" ? expenseCategories : incomeCategories

  const handleSubmit = async () => {
    if (!amount || !description || !category) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount")
      return
    }

    setLoading(true)
    try {
      const response = await axios.post("your-api-endpoint/transactions", {
        type: transactionType,
        amount: parseFloat(amount),
        description,
        category,
        date: new Date().toISOString(),
      })

      if (response.status === 200 || response.status === 201) {
        Alert.alert(
          "Success",
          `${
            transactionType === "expense" ? "Expense" : "Income"
          } added successfully!`,
          [{ text: "OK", onPress: () => router.back() }]
        )
      }
    } catch (error) {
      Alert.alert("Error", "Failed to add transaction. Please try again.")
    }
    setLoading(false)
  }

  const formatAmount = (text) => {
    // Remove any non-digit characters except decimal point
    const cleaned = text.replace(/[^\d.]/g, "")
    setAmount(cleaned)
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1CC29F" />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Transaction</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Transaction Type Toggle */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                transactionType === "expense" && styles.toggleButtonActive,
                {
                  backgroundColor:
                    transactionType === "expense" ? "#FF6B6B" : "#FFFFFF",
                },
              ]}
              onPress={() => {
                setTransactionType("expense")
                setCategory("") // Reset category when switching
              }}
            >
              <Ionicons
                name="trending-down"
                size={20}
                color={transactionType === "expense" ? "#FFFFFF" : "#FF6B6B"}
              />
              <Text
                style={[
                  styles.toggleButtonText,
                  {
                    color:
                      transactionType === "expense" ? "#FFFFFF" : "#FF6B6B",
                  },
                ]}
              >
                Expense
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleButton,
                transactionType === "income" && styles.toggleButtonActive,
                {
                  backgroundColor:
                    transactionType === "income" ? "#1CC29F" : "#FFFFFF",
                },
              ]}
              onPress={() => {
                setTransactionType("income")
                setCategory("") // Reset category when switching
              }}
            >
              <Ionicons
                name="trending-up"
                size={20}
                color={transactionType === "income" ? "#FFFFFF" : "#1CC29F"}
              />
              <Text
                style={[
                  styles.toggleButtonText,
                  {
                    color: transactionType === "income" ? "#FFFFFF" : "#1CC29F",
                  },
                ]}
              >
                Income
              </Text>
            </TouchableOpacity>
          </View>

          {/* Amount Input */}
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Amount</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0"
                placeholderTextColor="#9CA3AF"
                value={amount}
                onChangeText={formatAmount}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Description Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={styles.textInput}
              placeholder={`Enter ${transactionType} description`}
              placeholderTextColor="#9CA3AF"
              value={description}
              onChangeText={setDescription}
              autoCapitalize="words"
            />
          </View>

          {/* Category Selection */}
          <View style={styles.categoryContainer}>
            <Text style={styles.categoryLabel}>Category</Text>
            <View style={styles.categoriesGrid}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.name}
                  style={[
                    styles.categoryItem,
                    category === cat.name && styles.categoryItemActive,
                    {
                      borderColor:
                        category === cat.name ? cat.color : "#E5E7EB",
                    },
                  ]}
                  onPress={() => setCategory(cat.name)}
                >
                  <View
                    style={[
                      styles.categoryIcon,
                      { backgroundColor: `${cat.color}20` },
                    ]}
                  >
                    <Ionicons name={cat.icon} size={24} color={cat.color} />
                  </View>
                  <Text
                    style={[
                      styles.categoryText,
                      { color: category === cat.name ? cat.color : "#6B7280" },
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              {
                backgroundColor:
                  transactionType === "expense" ? "#FF6B6B" : "#1CC29F",
              },
              loading && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading
                ? "Adding..."
                : `Add ${transactionType === "expense" ? "Expense" : "Income"}`}
            </Text>
          </TouchableOpacity>
        </ScrollView>
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
    paddingHorizontal: 24,
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
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 4,
    marginBottom: 32,
  },
  toggleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  amountContainer: {
    marginBottom: 32,
  },
  amountLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1CC29F",
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: "600",
    color: "#111827",
  },
  inputContainer: {
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    color: "#111827",
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  categoryContainer: {
    marginBottom: 40,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  categoryItem: {
    width: "23%",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
  },
  categoryItemActive: {
    shadowColor: "#1CC29F",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
})
