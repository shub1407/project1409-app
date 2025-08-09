// src/components/filters/AccountFilter.js
import { ScrollView, StyleSheet, Text, View } from "react-native"
import { colors } from "../../styles/colors"
import FilterChip from "./FilterChip"

const AccountFilter = ({ accounts, selectedAccounts, onAccountToggle }) => {
  const allOption = { id: "all", name: "All Accounts", type: "all" }
  const accountOptions = [allOption, ...accounts]

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Account</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipContainer}
      >
        {accountOptions.map((account) => (
          <FilterChip
            key={account.id}
            label={account.name}
            isSelected={
              account.id === "all"
                ? selectedAccounts.length === 0
                : selectedAccounts.includes(account.id)
            }
            onPress={() => onAccountToggle(account.id)}
            style={styles.chip}
          />
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 8,
  },
  chipContainer: {
    paddingHorizontal: 2,
  },
  chip: {
    marginRight: 8,
  },
})

export default AccountFilter
