import { Ionicons } from "@expo/vector-icons"
import { useEffect, useState } from "react"
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { useAuth } from "../../src/context/AuthContext"

export default function ExpensesScreen() {
  const [expenses, setExpenses] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState("all") // all, today, week, month
  const { user } = useAuth()

  useEffect(() => {
    loadExpenses()
  }, [])

  const loadExpenses = async () => {
    try {
      // Mock data for now
      setExpenses([
        {
          id: 1,
          description: "Grocery Shopping",
          amount: 1250,
          category: "Food",
          date: "2025-08-07",
          type: "expense",
        },
        {
          id: 2,
          description: "Coffee",
          amount: 150,
          category: "Food",
          date: "2025-08-07",
          type: "expense",
        },
        {
          id: 3,
          description: "Uber Ride",
          amount: 300,
          category: "Transport",
          date: "2025-08-06",
          type: "expense",
        },
        {
          id: 4,
          description: "Salary Credit",
          amount: 45000,
          category: "Income",
          date: "2025-08-01",
          type: "income",
        },
        {
          id: 5,
          description: "Netflix Subscription",
          amount: 799,
          category: "Entertainment",
          date: "2025-08-05",
          type: "expense",
        },
      ])
    } catch (error) {
      console.error("Error loading expenses:", error)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadExpenses()
    setRefreshing(false)
  }

  const formatCurrency = (amount) => {
    return `₹${Math.abs(amount).toLocaleString("en-IN")}`
  }

  const getCategoryIcon = (category) => {
    const icons = {
      Food: "restaurant-outline",
      Transport: "car-outline",
      Entertainment: "musical-notes-outline",
      Income: "trending-up-outline",
      Shopping: "bag-outline",
      Bills: "document-text-outline",
    }
    return icons[category] || "cash-outline"
  }

  const getCategoryColor = (category) => {
    const colors = {
      Food: "#FF6B6B",
      Transport: "#4ECDC4",
      Entertainment: "#45B7D1",
      Income: "#96CEB4",
      Shopping: "#FECA57",
      Bills: "#FF9FF3",
    }
    return colors[category] || "#1CC29F"
  }

  const filteredExpenses = expenses.filter((expense) => {
    if (filter === "all") return true
    const today = new Date().toISOString().split("T")[0]
    if (filter === "today") return expense.date === today
    // Add more filter logic as needed
    return true
  })

  const totalExpenses = filteredExpenses
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0)

  const totalIncome = filteredExpenses
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0)

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1CC29F" />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Expenses</Text>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="filter" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={[styles.summaryCard, { backgroundColor: "#FF6B6B" }]}>
            <Text style={styles.summaryLabel}>Total Spent</Text>
            <Text style={styles.summaryAmount}>
              -{formatCurrency(totalExpenses)}
            </Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: "#1CC29F" }]}>
            <Text style={styles.summaryLabel}>Total Earned</Text>
            <Text style={styles.summaryAmount}>
              +{formatCurrency(totalIncome)}
            </Text>
          </View>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          {["all", "today", "week", "month"].map((filterType) => (
            <TouchableOpacity
              key={filterType}
              style={[
                styles.filterTab,
                filter === filterType && styles.filterTabActive,
              ]}
              onPress={() => setFilter(filterType)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  filter === filterType && styles.filterTabTextActive,
                ]}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Expenses List */}
        <ScrollView
          style={styles.expensesList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#1CC29F"]}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {filteredExpenses.map((expense) => (
            <View key={expense.id} style={styles.expenseItem}>
              <View style={styles.expenseLeft}>
                <View
                  style={[
                    styles.categoryIcon,
                    {
                      backgroundColor: `${getCategoryColor(
                        expense.category
                      )}20`,
                    },
                  ]}
                >
                  <Ionicons
                    name={getCategoryIcon(expense.category)}
                    size={24}
                    color={getCategoryColor(expense.category)}
                  />
                </View>
                <View style={styles.expenseDetails}>
                  <Text style={styles.expenseDescription}>
                    {expense.description}
                  </Text>
                  <Text style={styles.expenseCategory}>
                    {expense.category} • {expense.date}
                  </Text>
                </View>
              </View>
              <Text
                style={[
                  styles.expenseAmount,
                  { color: expense.type === "expense" ? "#FF6B6B" : "#1CC29F" },
                ]}
              >
                {expense.type === "expense" ? "-" : "+"}
                {formatCurrency(expense.amount)}
              </Text>
            </View>
          ))}
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
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  summaryContainer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingTop: 20,
    gap: 16,
  },
  summaryCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
  },
  summaryLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    opacity: 0.9,
  },
  summaryAmount: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    marginTop: 24,
    marginBottom: 16,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: "#FFFFFF",
  },
  filterTabActive: {
    backgroundColor: "#1CC29F",
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  filterTabTextActive: {
    color: "#FFFFFF",
  },
  expensesList: {
    flex: 1,
    paddingHorizontal: 24,
  },
  expenseItem: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  expenseLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  expenseDetails: {
    flex: 1,
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  expenseCategory: {
    fontSize: 14,
    color: "#6B7280",
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: "700",
  },
})
