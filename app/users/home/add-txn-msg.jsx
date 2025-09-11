import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useState } from "react"
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { BackgroundSMSService } from "../../../src/services/sms/BackgroundSMSService"

export default function AddTransactionModal() {
  const router = useRouter()
  const params = useLocalSearchParams()

  const [transaction, setTransaction] = useState(null)
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState("expense")

  const categories = {
    expense: [
      "Food & Dining",
      "Shopping",
      "Transportation",
      "Bills & Utilities",
      "Entertainment",
      "Healthcare",
      "Others",
    ],
    income: ["Salary", "Business", "Investment", "Gift", "Others"],
  }

  useEffect(() => {
    if (params.transaction) {
      const txn = JSON.parse(params.transaction)
      setTransaction(txn)
      setAmount(txn.amount || "")
      setType(txn.type || "expense")
      setDescription(`Auto-detected: ${txn.message?.substring(0, 50)}...`)
    }
  }, [params])

  const handleAdd = async () => {
    if (!amount || !category) {
      Alert.alert("Error", "Please fill in amount and category")
      return
    }

    const newTransaction = {
      id: Date.now().toString(),
      amount: parseFloat(amount),
      type,
      category,
      description,
      date: new Date().toISOString(),
      source: "sms",
      originalMessage: transaction?.message,
      phone: transaction?.phone,
    }

    try {
      // Add to your app's transaction storage
      console.log("Adding transaction:", newTransaction)

      // Clear from pending list if it exists
      if (transaction?.key) {
        await BackgroundSMSService.clearTransaction(transaction.key)
      }

      Alert.alert("Success! 🎉", `₹${amount} ${type} added to ${category}`, [
        { text: "Great!", onPress: () => router.back() },
      ])
    } catch (error) {
      Alert.alert("Error", "Failed to add transaction")
    }
  }

  const handleDismiss = async () => {
    try {
      if (transaction?.key) {
        await BackgroundSMSService.clearTransaction(transaction.key)
      }
      router.back()
    } catch (error) {
      console.error("Error dismissing transaction:", error)
      router.back()
    }
  }

  return (
    <ScrollView style={styles.container}>
      {/* Original Message Display */}
      {transaction && (
        <View style={styles.messageContainer}>
          <Text style={styles.messageLabel}>Original SMS:</Text>
          <Text style={styles.messageText}>{transaction.message}</Text>
          <Text style={styles.fromText}>From: {transaction.phone}</Text>
        </View>
      )}

      {/* Transaction Type Toggle */}
      <View style={styles.section}>
        <Text style={styles.label}>Transaction Type</Text>
        <View style={styles.typeContainer}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === "expense" && styles.typeButtonActive,
            ]}
            onPress={() => setType("expense")}
          >
            <Text
              style={[
                styles.typeText,
                type === "expense" && styles.typeTextActive,
              ]}
            >
              💸 Expense
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === "income" && styles.typeButtonActive,
            ]}
            onPress={() => setType("income")}
          >
            <Text
              style={[
                styles.typeText,
                type === "income" && styles.typeTextActive,
              ]}
            >
              💰 Income
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Amount Input */}
      <View style={styles.section}>
        <Text style={styles.label}>Amount (₹)</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          placeholder="Enter amount"
          keyboardType="numeric"
        />
      </View>

      {/* Category Selection */}
      <View style={styles.section}>
        <Text style={styles.label}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.categoryContainer}>
            {categories[type].map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryButton,
                  category === cat && styles.categoryButtonActive,
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    category === cat && styles.categoryTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Description Input */}
      <View style={styles.section}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Add description..."
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.dismissButton} onPress={handleDismiss}>
          <Text style={styles.dismissText}>Dismiss</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Text style={styles.addText}>Add Transaction</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  messageContainer: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  messageLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 5,
  },
  messageText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 5,
  },
  fromText: {
    fontSize: 12,
    color: "#888",
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  typeContainer: {
    flexDirection: "row",
    gap: 10,
  },
  typeButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "white",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e9ecef",
  },
  typeButtonActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  typeText: {
    color: "#666",
    fontWeight: "bold",
    fontSize: 16,
  },
  typeTextActive: {
    color: "white",
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  categoryContainer: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 5,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  categoryButtonActive: {
    backgroundColor: "#28a745",
    borderColor: "#28a745",
  },
  categoryText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
  },
  categoryTextActive: {
    color: "white",
  },
  actionContainer: {
    flexDirection: "row",
    gap: 15,
    marginTop: 30,
    marginBottom: 40,
  },
  dismissButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#6c757d",
    alignItems: "center",
  },
  dismissText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  addButton: {
    flex: 2,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#28a745",
    alignItems: "center",
  },
  addText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
})
