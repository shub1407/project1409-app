// src/components/filters/FilterChip.js
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import { colors } from "../../styles/colors"

const FilterChip = ({ label, icon, isSelected, onPress, style }) => {
  return (
    <TouchableOpacity
      style={[styles.chip, isSelected && styles.selectedChip, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.chipContent}>
        {icon && (
          <Icon
            name={icon}
            size={16}
            color={isSelected ? colors.surface : colors.text.secondary}
            style={styles.icon}
          />
        )}
        <Text style={[styles.chipText, isSelected && styles.selectedChipText]}>
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  selectedChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 4,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.primary,
  },
  selectedChipText: {
    color: colors.surface,
  },
})

export default FilterChip
