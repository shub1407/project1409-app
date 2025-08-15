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
    { value: "income", label: "Income", icon: "arrow-down", color: "#10B981" },
    {
      value: "expense",
      label: "Expense",
      icon: "arrow-up",
      color: "#EF4444",
    },
    {
      value: "transfer",
      label: "Transfer",
      icon: "swap-horizontal",
      color: "#1CC29F",
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
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const resetFilters = {
      type: "",
      accountId: "",
      startDate: monthStart.toISOString().split("T")[0],
      endDate: monthEnd.toISOString().split("T")[0],
      dateRange: "month",
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

  const getActiveFiltersCount = () => {
    let count = 0
    if (localFilters.type) count++
    if (localFilters.accountId) count++
    if (localFilters.dateRange !== "month") count++
    return count
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
          {/* Handle */}
          <View style={styles.modalHandle} />

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Filter Transactions</Text>
              {getActiveFiltersCount() > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>
                    {getActiveFiltersCount()}
                  </Text>
                </View>
              )}
            </View>
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
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <Ionicons name="swap-vertical" size={18} color="#1CC29F" />
                </View>
                <Text style={styles.sectionTitle}>Transaction Type</Text>
              </View>
              <View style={styles.optionsGrid}>
                {transactionTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.typeOption,
                      localFilters.type === type.value &&
                        styles.typeOptionActive,
                    ]}
                    onPress={() => handleFilterChange("type", type.value)}
                  >
                    <View style={styles.typeOptionIconContainer}>
                      <Ionicons
                        name={type.icon}
                        size={20}
                        color={
                          localFilters.type === type.value
                            ? "#FFFFFF"
                            : type.color
                        }
                      />
                    </View>
                    <Text
                      style={[
                        styles.typeOptionText,
                        localFilters.type === type.value &&
                          styles.typeOptionTextActive,
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
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <Ionicons name="wallet-outline" size={18} color="#1CC29F" />
                </View>
                <Text style={styles.sectionTitle}>Account</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.accountsScrollView}
                contentContainerStyle={styles.accountsContainer}
              >
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
                        { backgroundColor: account.color || "#6B7280" },
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
              </ScrollView>
            </View>

            {/* Date Range */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <Ionicons name="calendar-outline" size={18} color="#1CC29F" />
                </View>
                <Text style={styles.sectionTitle}>Date Range</Text>
              </View>
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
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconContainer}>
                    <Ionicons name="calendar" size={18} color="#1CC29F" />
                  </View>
                  <Text style={styles.sectionTitle}>Custom Date Range</Text>
                </View>
                <View style={styles.customDateContainer}>
                  <TouchableOpacity
                    style={styles.dateInput}
                    onPress={() => openDatePicker("start")}
                  >
                    <View style={styles.dateInputIconContainer}>
                      <Ionicons
                        name="calendar-outline"
                        size={16}
                        color="#1CC29F"
                      />
                    </View>
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

                  <View style={styles.dateSeparatorContainer}>
                    <Text style={styles.dateSeparator}>to</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.dateInput}
                    onPress={() => openDatePicker("end")}
                  >
                    <View style={styles.dateInputIconContainer}>
                      <Ionicons
                        name="calendar-outline"
                        size={16}
                        color="#1CC29F"
                      />
                    </View>
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
              <Text style={styles.applyButtonText}>
                Apply Filters{" "}
                {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
              </Text>
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
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: "#D1D5DB",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  filterBadge: {
    backgroundColor: "#1CC29F",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  resetButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  resetText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#EF4444",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F9FAFB",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  typeOption: {
    flex: 1,
    minWidth: "48%",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  typeOptionActive: {
    backgroundColor: "#1CC29F",
    borderColor: "#1CC29F",
  },
  typeOptionIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    flex: 1,
  },
  typeOptionTextActive: {
    color: "#FFFFFF",
  },
  accountsScrollView: {
    flexGrow: 0,
  },
  accountsContainer: {
    paddingRight: 20,
  },
  accountOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginRight: 8,
  },
  accountOptionActive: {
    backgroundColor: "#1CC29F",
    borderColor: "#1CC29F",
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
    gap: 8,
  },
  dateRangeOption: {
    flex: 1,
    minWidth: "30%",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  dateRangeOptionActive: {
    backgroundColor: "#1CC29F",
    borderColor: "#1CC29F",
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
    gap: 12,
  },
  dateInput: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  dateInputIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  dateInputText: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  dateSeparatorContainer: {
    paddingHorizontal: 4,
  },
  dateSeparator: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 34,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  applyButton: {
    backgroundColor: "#1CC29F",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#1CC29F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
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
    overflow: "hidden",
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
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
