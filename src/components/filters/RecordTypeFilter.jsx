// src/components/filters/RecordTypeFilter.js
import { StyleSheet, Text, View } from "react-native"
import { colors } from "../../styles/colors"
import FilterChip from "./FilterChip"

const RecordTypeFilter = ({ selectedTypes, onTypeToggle }) => {
  const recordTypes = [
    { id: "all", name: "All", icon: "view-list" },
    { id: "income", name: "Income", icon: "arrow-up-circle" },
    { id: "expense", name: "Expense", icon: "arrow-down-circle" },
    { id: "transfer", name: "Transfer", icon: "swap-horizontal" },
  ]

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Type</Text>
      <View style={styles.chipContainer}>
        {recordTypes.map((type) => (
          <FilterChip
            key={type.id}
            label={type.name}
            icon={type.icon}
            isSelected={
              type.id === "all"
                ? selectedTypes.length === 0
                : selectedTypes.includes(type.id)
            }
            onPress={() => onTypeToggle(type.id)}
            style={styles.chip}
          />
        ))}
      </View>
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
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  chip: {
    marginHorizontal: 4,
    marginVertical: 4,
  },
})

export default RecordTypeFilter
