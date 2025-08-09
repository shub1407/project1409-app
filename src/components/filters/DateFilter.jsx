// src/components/filters/DateFilter.js
import DateTimePicker from "@react-native-community/datetimepicker"
import { useState } from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { colors } from "../../styles/colors"

const DateFilter = ({ startDate, endDate, onDateChange }) => {
  const [showStartPicker, setShowStartPicker] = useState(false)
  const [showEndPicker, setShowEndPicker] = useState(false)

  const formatDate = (date) => {
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const handleStartDateChange = (event, selectedDate) => {
    setShowStartPicker(false)
    if (selectedDate) {
      onDateChange({ startDate: selectedDate, endDate })
    }
  }

  const handleEndDateChange = (event, selectedDate) => {
    setShowEndPicker(false)
    if (selectedDate) {
      onDateChange({ startDate, endDate: selectedDate })
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Date Range</Text>
      <View style={styles.dateRow}>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowStartPicker(true)}
        >
          <Text style={styles.dateText}>From</Text>
          <Text style={styles.dateValue}>{formatDate(startDate)}</Text>
        </TouchableOpacity>

        <View style={styles.dateSeparator} />

        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowEndPicker(true)}
        >
          <Text style={styles.dateText}>To</Text>
          <Text style={styles.dateValue}>{formatDate(endDate)}</Text>
        </TouchableOpacity>
      </View>

      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={handleStartDateChange}
          maximumDate={endDate}
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={handleEndDateChange}
          minimumDate={startDate}
          maximumDate={new Date()}
        />
      )}
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
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateButton: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.primary,
  },
  dateSeparator: {
    width: 12,
  },
})

export default DateFilter
