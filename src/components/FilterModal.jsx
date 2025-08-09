import { Ionicons } from "@expo/vector-icons"
import DateTimePicker from "@react-native-community/datetimepicker"
import { useState } from "react"
import {
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

const FilterModal = ({
  visible,
  filters,
  accounts,
  onApplyFilters,
  onClose,
}) => {
  const [localFilters, setLocalFilters] = useState(filters)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [datePickerType, setDatePickerType] = useState("start") // 'start' or 'end'
  const [tempDate, setTempDate] = useState(new Date())

  const transactionTypes = [
    { value: "", label: "All Types", icon: "list-outline", color: "#6B7280" },
    { value: "income", label: "Income", icon: "trending-up", color: "#1CC29F" },
    {
      value: "expense",
      label: "Expense",
      icon: "trending-down",
      color: "#FF6B6B",
    },
    {
      value: "transfer",
      label: "Transfer",
      icon: "swap-horizontal",
      color: "#45B7D1",
    },
  ]

  const dateRanges = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "custom", label: "Custom Range" },
  ]

  const handleFilterChange = (key, value) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleApply = () => {
    onApplyFilters(localFilters)
  }

  const handleReset = () => {
    const resetFilters = {
      type: "",
      accountId: "",
      startDate: "",
      endDate: "",
      dateRange: "all",
    }
    setLocalFilters(resetFilters)
  }

  const openDatePicker = (type) => {
    setDatePickerType(type)

    // Set initial date based on existing filter or current date
    let initialDate = new Date()
    if (type === "start" && localFilters.startDate) {
      initialDate = new Date(localFilters.startDate)
    } else if (type === "end" && localFilters.endDate) {
      initialDate = new Date(localFilters.endDate)
    }

    setTempDate(initialDate)
    setShowDatePicker(true)
  }

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false)
      if (event.type === "set" && selectedDate) {
        handleDateSelect(selectedDate)
      }
    } else if (selectedDate) {
      setTempDate(selectedDate)
    }
  }

  const handleDateSelect = (date) => {
    const dateString = date.toISOString().split("T")[0]
    if (datePickerType === "start") {
      handleFilterChange("startDate", dateString)
    } else {
      handleFilterChange("endDate", dateString)
    }

    if (Platform.OS === "ios") {
      setShowDatePicker(false)
    }
  }

  const formatDateDisplay = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={false}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          onPress={onClose}
          activeOpacity={1}
        />
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.title}>Filter Transactions</Text>
            <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Transaction Type */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Transaction Type</Text>
              <View style={styles.optionsGrid}>
                {transactionTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.typeOption,
                      localFilters.type === type.value &&
                        styles.typeOptionActive,
                      {
                        borderColor:
                          localFilters.type === type.value
                            ? type.color
                            : "#E5E7EB",
                      },
                    ]}
                    onPress={() => handleFilterChange("type", type.value)}
                  >
                    <Ionicons
                      name={type.icon}
                      size={20}
                      color={
                        localFilters.type === type.value
                          ? type.color
                          : "#9CA3AF"
                      }
                    />
                    <Text
                      style={[
                        styles.typeOptionText,
                        {
                          color:
                            localFilters.type === type.value
                              ? type.color
                              : "#6B7280",
                        },
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Account Filter */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account</Text>
              <View style={styles.accountsGrid}>
                <TouchableOpacity
                  style={[
                    styles.accountOption,
                    localFilters.accountId === "" && styles.accountOptionActive,
                  ]}
                  onPress={() => handleFilterChange("accountId", "")}
                >
                  <Text
                    style={[
                      styles.accountOptionText,
                      localFilters.accountId === "" &&
                        styles.accountOptionTextActive,
                    ]}
                  >
                    All Accounts
                  </Text>
                </TouchableOpacity>

                {accounts.map((account) => (
                  <TouchableOpacity
                    key={account.id}
                    style={[
                      styles.accountOption,
                      localFilters.accountId === account.id &&
                        styles.accountOptionActive,
                    ]}
                    onPress={() => handleFilterChange("accountId", account.id)}
                  >
                    <View
                      style={[
                        styles.accountDot,
                        { backgroundColor: account.color },
                      ]}
                    />
                    <Text
                      style={[
                        styles.accountOptionText,
                        localFilters.accountId === account.id &&
                          styles.accountOptionTextActive,
                      ]}
                    >
                      {account.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Date Range */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Date Range</Text>
              <View style={styles.dateRangeContainer}>
                {dateRanges.map((range) => (
                  <TouchableOpacity
                    key={range.value}
                    style={[
                      styles.dateRangeOption,
                      localFilters.dateRange === range.value &&
                        styles.dateRangeOptionActive,
                    ]}
                    onPress={() => handleFilterChange("dateRange", range.value)}
                  >
                    <Text
                      style={[
                        styles.dateRangeText,
                        localFilters.dateRange === range.value &&
                          styles.dateRangeTextActive,
                      ]}
                    >
                      {range.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Custom Date Range */}
            {localFilters.dateRange === "custom" && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Custom Date Range</Text>
                <View style={styles.customDateContainer}>
                  <TouchableOpacity
                    style={styles.dateInput}
                    onPress={() => openDatePicker("start")}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color="#6B7280"
                    />
                    <Text
                      style={[
                        styles.dateInputText,
                        {
                          color: localFilters.startDate ? "#111827" : "#9CA3AF",
                        },
                      ]}
                    >
                      {formatDateDisplay(localFilters.startDate) ||
                        "Start Date"}
                    </Text>
                  </TouchableOpacity>

                  <Text style={styles.dateSeparator}>to</Text>

                  <TouchableOpacity
                    style={styles.dateInput}
                    onPress={() => openDatePicker("end")}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color="#6B7280"
                    />
                    <Text
                      style={[
                        styles.dateInputText,
                        { color: localFilters.endDate ? "#111827" : "#9CA3AF" },
                      ]}
                    >
                      {formatDateDisplay(localFilters.endDate) || "End Date"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Date Picker Modal */}
        {showDatePicker && (
          <Modal
            transparent={true}
            visible={showDatePicker}
            onRequestClose={() => setShowDatePicker(false)}
          >
            <View style={styles.datePickerOverlay}>
              <View style={styles.datePickerContainer}>
                <View style={styles.datePickerHeader}>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(false)}
                    style={styles.datePickerButton}
                  >
                    <Text style={styles.datePickerButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <Text style={styles.datePickerTitle}>
                    Select {datePickerType === "start" ? "Start" : "End"} Date
                  </Text>

                  {Platform.OS === "ios" && (
                    <TouchableOpacity
                      onPress={() => handleDateSelect(tempDate)}
                      style={styles.datePickerButton}
                    >
                      <Text
                        style={[
                          styles.datePickerButtonText,
                          { color: "#1CC29F" },
                        ]}
                      >
                        Done
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                  style={styles.datePicker}
                />
              </View>
            </View>
          </Modal>
        )}
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: screenHeight * 0.85,
    minHeight: screenHeight * 0.6,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  resetButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resetText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1CC29F",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  section: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F9FAFB",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 16,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  typeOption: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: "#FAFAFA",
    marginBottom: 12,
  },
  typeOptionActive: {
    backgroundColor: "#F0FDF4",
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  accountsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  accountOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    marginRight: 12,
    marginBottom: 12,
  },
  accountOptionActive: {
    backgroundColor: "#1CC29F",
  },
  accountDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  accountOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  accountOptionTextActive: {
    color: "#FFFFFF",
  },
  dateRangeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  dateRangeOption: {
    width: "48%",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    marginBottom: 12,
  },
  dateRangeOptionActive: {
    backgroundColor: "#1CC29F",
  },
  dateRangeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  dateRangeTextActive: {
    color: "#FFFFFF",
  },
  customDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateInput: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  dateInputText: {
    fontSize: 14,
    marginLeft: 8,
    fontWeight: "500",
  },
  dateSeparator: {
    fontSize: 14,
    color: "#9CA3AF",
    marginHorizontal: 12,
    fontWeight: "500",
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 34,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  applyButton: {
    backgroundColor: "#1CC29F",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  // Date Picker Styles
  datePickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  datePickerContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginHorizontal: 20,
    maxWidth: 400,
    width: "90%",
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  datePickerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  datePickerButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  datePicker: {
    height: Platform.OS === "ios" ? 200 : "auto",
    width: "100%",
  },
})

export default FilterModal
