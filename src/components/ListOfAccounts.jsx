import { Ionicons } from "@expo/vector-icons"
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

const { width: screenWidth } = Dimensions.get("window")

const ListOfAccounts = ({
  accounts,
  onAccountPress,
  onAddAccount,
  onSettingsPress,
}) => {
  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`
  }

  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>List of accounts</Text>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={onSettingsPress}
          >
            <Ionicons name="settings-outline" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Accounts Grid */}
        <View style={styles.accountsGrid}>
          {accounts.map((account) => (
            <TouchableOpacity
              key={account.id}
              style={[styles.accountCard, { backgroundColor: account.color }]}
              onPress={() => onAccountPress(account)}
            >
              <Text style={styles.accountName}>{account.name}</Text>
              <Text style={styles.accountBalance}>
                {formatCurrency(account.balance)}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Add Account Card - Now same size as account cards */}
          <TouchableOpacity
            style={styles.addAccountCard}
            onPress={onAddAccount}
          >
            <View style={styles.addAccountContent}>
              <Ionicons name="add" size={20} color="#1CC29F" />
              <Text style={styles.addAccountText}>ADD ACCOUNT</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  outerContainer: {
    marginHorizontal: 0,
    marginTop: 24,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  container: {
    backgroundColor: "#F8FBFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E8F4FD",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    color: "#111827",
    fontWeight: "bold",
  },
  settingsButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  accountsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: 4,
  },
  accountCard: {
    width: (screenWidth - 60) / 2,
    height: 50,
    borderRadius: 12,
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 10,
    marginBottom: 12,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  accountName: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  accountBalance: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  addAccountCard: {
    width: (screenWidth - 60) / 2, // Same width as accountCard
    height: 50, // Same height as accountCard
    borderRadius: 12, // Same border radius as accountCard
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#1CC29F",
    borderStyle: "dashed",
    marginBottom: 12, // Same margin as accountCard
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#1CC29F",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  addAccountContent: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  addAccountText: {
    color: "#1CC29F",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 6,
    letterSpacing: 0.5,
  },
})

export default ListOfAccounts
