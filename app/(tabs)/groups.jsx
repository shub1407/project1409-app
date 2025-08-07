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

export default function GroupsScreen() {
  const [groups, setGroups] = useState([])
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadGroups()
  }, [])

  const loadGroups = async () => {
    // Mock data
    setGroups([
      {
        id: 1,
        name: "Trip to Goa",
        members: ["You", "John", "Sarah", "Mike"],
        totalExpense: 15000,
        yourShare: 3750,
        balance: -1200,
        lastActivity: "2 hours ago",
        color: "#FF6B6B",
      },
      {
        id: 2,
        name: "Office Lunch",
        members: ["You", "Alice", "Bob"],
        totalExpense: 2400,
        yourShare: 800,
        balance: 400,
        lastActivity: "1 day ago",
        color: "#4ECDC4",
      },
      {
        id: 3,
        name: "Apartment Bills",
        members: ["You", "Roommate"],
        totalExpense: 8000,
        yourShare: 4000,
        balance: 0,
        lastActivity: "3 days ago",
        color: "#45B7D1",
      },
    ])
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadGroups()
    setRefreshing(false)
  }

  const formatCurrency = (amount) => {
    return `₹${Math.abs(amount).toLocaleString("en-IN")}`
  }

  const getBalanceColor = (balance) => {
    if (balance > 0) return "#1CC29F" // You are owed money
    if (balance < 0) return "#FF6B6B" // You owe money
    return "#6B7280" // All settled
  }

  const getBalanceText = (balance) => {
    if (balance > 0) return `You are owed ${formatCurrency(balance)}`
    if (balance < 0) return `You owe ${formatCurrency(balance)}`
    return "All settled up"
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1CC29F" />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Groups</Text>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Overall Balance Summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Balance</Text>
            <Text style={[styles.summaryAmount, { color: "#1CC29F" }]}>
              {formatCurrency(800)}
            </Text>
            <Text style={styles.summarySubtext}>You are owed overall</Text>
          </View>
        </View>

        <ScrollView
          style={styles.groupsList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#1CC29F"]}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {groups.map((group) => (
            <TouchableOpacity key={group.id} style={styles.groupItem}>
              <View style={styles.groupLeft}>
                <View
                  style={[styles.groupAvatar, { backgroundColor: group.color }]}
                >
                  <Ionicons name="people" size={24} color="#FFFFFF" />
                </View>
                <View style={styles.groupDetails}>
                  <Text style={styles.groupName}>{group.name}</Text>
                  <Text style={styles.groupMembers}>
                    {group.members.length} members • {group.lastActivity}
                  </Text>
                  <Text style={styles.totalExpense}>
                    Total: {formatCurrency(group.totalExpense)}
                  </Text>
                </View>
              </View>
              <View style={styles.groupRight}>
                <Text
                  style={[
                    styles.balanceAmount,
                    { color: getBalanceColor(group.balance) },
                  ]}
                >
                  {group.balance !== 0 && (group.balance > 0 ? "+" : "-")}
                  {group.balance !== 0 ? formatCurrency(group.balance) : "₹0"}
                </Text>
                <Text
                  style={[
                    styles.balanceText,
                    { color: getBalanceColor(group.balance) },
                  ]}
                >
                  {getBalanceText(group.balance).replace(
                    `₹${Math.abs(group.balance).toLocaleString("en-IN")}`,
                    ""
                  )}
                </Text>
              </View>
            </TouchableOpacity>
          ))}

          {/* Add New Group Button */}
          <TouchableOpacity style={styles.addGroupButton}>
            <Ionicons name="add-circle-outline" size={32} color="#1CC29F" />
            <Text style={styles.addGroupText}>Create New Group</Text>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  summaryContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 16,
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
  summaryLabel: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 4,
  },
  summarySubtext: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  groupsList: {
    flex: 1,
    paddingHorizontal: 24,
    marginTop: 24,
  },
  groupItem: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
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
  groupLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  groupAvatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  groupDetails: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  groupMembers: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  totalExpense: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  groupRight: {
    alignItems: "flex-end",
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  balanceText: {
    fontSize: 12,
    fontWeight: "500",
  },
  addGroupButton: {
    backgroundColor: "#FFFFFF",
    padding: 32,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
  },
  addGroupText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1CC29F",
    marginTop: 12,
  },
})
