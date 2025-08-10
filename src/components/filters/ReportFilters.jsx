import { Ionicons } from "@expo/vector-icons"
import { useEffect, useState } from "react"
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { useAccountsContext } from "../../context/AccountContext"
import { useCategoryContext } from "../../context/CategoryContext"

const ReportFilters = ({ filters, onFiltersChange, onApply }) => {
  const [showModal, setShowModal] = useState(false)
  const [tempFilters, setTempFilters] = useState(filters || {})

  const { accounts } = useAccountsContext()
  const { expenseCategories, incomeCategories } = useCategoryContext()

  const allCategories = [
    ...(expenseCategories || []),
    ...(incomeCategories || []),
  ]

  // Initialize filters if not provided
  useEffect(() => {
    if (!filters || Object.keys(filters).length === 0) {
      const defaultFilters = {
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          .toISOString()
          .split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
        groupBy: "month",
        type: "all",
        accountId: "",
        categoryId: "",
      }
      setTempFilters(defaultFilters)
      onFiltersChange?.(defaultFilters)
    } else {
      setTempFilters(filters)
    }
  }, [filters])

  const handleApplyFilters = () => {
    onFiltersChange(tempFilters)
    onApply?.(tempFilters)
    setShowModal(false)

    // Optional: Show success feedback
    if (Platform.OS === "ios" || Platform.OS === "android") {
      Alert.alert("Filters Applied", "Your report filters have been updated.")
    }
  }

  const resetFilters = () => {
    const defaultFilters = {
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString()
        .split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
      groupBy: "month",
      type: "all",
      accountId: "",
      categoryId: "",
    }
    setTempFilters(defaultFilters)
  }

  const getActiveFiltersCount = () => {
    if (!filters) return 0
    let count = 0
    if (filters.type !== "all") count++
    if (filters.accountId) count++
    if (filters.categoryId) count++
    if (filters.groupBy !== "month") count++
    return count
  }

  const getFilterSummary = () => {
    if (!filters) return "All data"

    const parts = []
    if (filters.type !== "all") parts.push(filters.type)
    if (filters.accountId && accounts) {
      const account = accounts.find((a) => a.id === filters.accountId)
      if (account) parts.push(account.name)
    }
    if (filters.categoryId && allCategories) {
      const category = allCategories.find((c) => c._id === filters.categoryId)
      if (category) parts.push(category.label)
    }
    return parts.length > 0 ? parts.join(" • ") : "All data"
  }

  // Debug logging
  const handleOpenModal = () => {
    console.log("Opening filter modal...")
    setShowModal(true)
  }

  const handleCloseModal = () => {
    console.log("Closing filter modal...")
    setShowModal(false)
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.filterButton,
          getActiveFiltersCount() > 0 && styles.filterButtonActive,
        ]}
        onPress={handleOpenModal}
        activeOpacity={0.7}
      >
        <View style={styles.filterContent}>
          <Ionicons
            name="funnel-outline"
            size={20}
            color={getActiveFiltersCount() > 0 ? "#1CC29F" : "#6B7280"}
          />
          <View style={styles.filterTextContainer}>
            <Text
              style={[
                styles.filterButtonText,
                getActiveFiltersCount() > 0 && styles.filterButtonTextActive,
              ]}
            >
              Filters
            </Text>
            <Text style={styles.filterSummary}>{getFilterSummary()}</Text>
          </View>
        </View>
        {getActiveFiltersCount() > 0 && (
          <View style={styles.filterBadge}>
            <Text style={styles.filterBadgeText}>
              {getActiveFiltersCount()}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseModal}
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            onPress={handleCloseModal}
            activeOpacity={1}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Reports</Text>
              <TouchableOpacity
                onPress={handleCloseModal}
                style={styles.closeButton}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              bounces={false}
            >
              {/* Date Range */}
              <View style={styles.filterSection}>
                <Text style={styles.sectionTitle}>📅 Date Range</Text>
                <View style={styles.dateRow}>
                  <View style={styles.dateField}>
                    <Text style={styles.fieldLabel}>Start Date</Text>
                    <TextInput
                      style={styles.dateInput}
                      value={tempFilters.startDate || ""}
                      onChangeText={(value) =>
                        setTempFilters((prev) => ({
                          ...prev,
                          startDate: value,
                        }))
                      }
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                  <View style={styles.dateField}>
                    <Text style={styles.fieldLabel}>End Date</Text>
                    <TextInput
                      style={styles.dateInput}
                      value={tempFilters.endDate || ""}
                      onChangeText={(value) =>
                        setTempFilters((prev) => ({ ...prev, endDate: value }))
                      }
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>
              </View>

              {/* Group By */}
              <View style={styles.filterSection}>
                <Text style={styles.sectionTitle}>📊 Group By</Text>
                <View style={styles.optionsGrid}>
                  {["week", "month", "year"].map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.optionButton,
                        tempFilters.groupBy === option &&
                          styles.optionButtonActive,
                      ]}
                      onPress={() =>
                        setTempFilters((prev) => ({ ...prev, groupBy: option }))
                      }
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          tempFilters.groupBy === option &&
                            styles.optionTextActive,
                        ]}
                      >
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Transaction Type */}
              <View style={styles.filterSection}>
                <Text style={styles.sectionTitle}>💰 Transaction Type</Text>
                <View style={styles.optionsGrid}>
                  {["all", "income", "expense", "transfer"].map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.optionButton,
                        tempFilters.type === option &&
                          styles.optionButtonActive,
                      ]}
                      onPress={() =>
                        setTempFilters((prev) => ({ ...prev, type: option }))
                      }
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          tempFilters.type === option &&
                            styles.optionTextActive,
                        ]}
                      >
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Account Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.sectionTitle}>🏦 Account</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalScroll}
                >
                  <TouchableOpacity
                    style={[
                      styles.accountChip,
                      !tempFilters.accountId && styles.accountChipActive,
                    ]}
                    onPress={() =>
                      setTempFilters((prev) => ({ ...prev, accountId: "" }))
                    }
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.accountChipText,
                        !tempFilters.accountId && styles.accountChipTextActive,
                      ]}
                    >
                      All Accounts
                    </Text>
                  </TouchableOpacity>
                  {accounts &&
                    accounts.map((account) => (
                      <TouchableOpacity
                        key={account.id}
                        style={[
                          styles.accountChip,
                          tempFilters.accountId === account.id &&
                            styles.accountChipActive,
                        ]}
                        onPress={() =>
                          setTempFilters((prev) => ({
                            ...prev,
                            accountId: account.id,
                          }))
                        }
                        activeOpacity={0.7}
                      >
                        <View
                          style={[
                            styles.accountColor,
                            { backgroundColor: account.color || "#1CC29F" },
                          ]}
                        />
                        <Text
                          style={[
                            styles.accountChipText,
                            tempFilters.accountId === account.id &&
                              styles.accountChipTextActive,
                          ]}
                        >
                          {account.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                </ScrollView>
              </View>

              {/* Category Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.sectionTitle}>🏷️ Category</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalScroll}
                >
                  <TouchableOpacity
                    style={[
                      styles.categoryChip,
                      !tempFilters.categoryId && styles.categoryChipActive,
                    ]}
                    onPress={() =>
                      setTempFilters((prev) => ({ ...prev, categoryId: "" }))
                    }
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        !tempFilters.categoryId &&
                          styles.categoryChipTextActive,
                      ]}
                    >
                      All Categories
                    </Text>
                  </TouchableOpacity>
                  {allCategories &&
                    allCategories.map((category) => (
                      <TouchableOpacity
                        key={category._id}
                        style={[
                          styles.categoryChip,
                          tempFilters.categoryId === category._id &&
                            styles.categoryChipActive,
                        ]}
                        onPress={() =>
                          setTempFilters((prev) => ({
                            ...prev,
                            categoryId: category._id,
                          }))
                        }
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={category.icon || "pricetag"}
                          size={14}
                          color={category.color || "#6B7280"}
                          style={styles.categoryIcon}
                        />
                        <Text
                          style={[
                            styles.categoryChipText,
                            tempFilters.categoryId === category._id &&
                              styles.categoryChipTextActive,
                          ]}
                        >
                          {category.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                </ScrollView>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={resetFilters}
                activeOpacity={0.7}
              >
                <Ionicons name="refresh-outline" size={16} color="#6B7280" />
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={handleApplyFilters}
                activeOpacity={0.7}
              >
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
    zIndex: 1,
  },
  filterButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  filterButtonActive: {
    borderColor: "#1CC29F",
    backgroundColor: "#F0FDF4",
  },
  filterContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  filterTextContainer: {
    flex: 1,
  },
  filterButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#6B7280",
  },
  filterButtonTextActive: {
    color: "#1CC29F",
  },
  filterSummary: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 2,
  },
  filterBadge: {
    backgroundColor: "#1CC29F",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
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
    maxHeight: "90%",
    minHeight: "60%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  closeButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
  },
  modalBody: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  filterSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 16,
  },
  dateRow: {
    flexDirection: "row",
    gap: 16,
  },
  dateField: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 8,
  },
  dateInput: {
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
    backgroundColor: "#F9FAFB",
  },
  optionsGrid: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  optionButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  optionButtonActive: {
    backgroundColor: "#1CC29F",
    borderColor: "#1CC29F",
  },
  optionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  optionTextActive: {
    color: "#FFFFFF",
  },
  horizontalScroll: {
    paddingRight: 24,
  },
  accountChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    marginRight: 12,
    gap: 8,
  },
  accountChipActive: {
    backgroundColor: "#1CC29F",
    borderColor: "#1CC29F",
  },
  accountColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  accountChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  accountChipTextActive: {
    color: "#FFFFFF",
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    marginRight: 12,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: "#1CC29F",
    borderColor: "#1CC29F",
  },
  categoryIcon: {
    marginRight: 2,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  categoryChipTextActive: {
    color: "#FFFFFF",
  },
  modalFooter: {
    flexDirection: "row",
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    gap: 16,
  },
  resetButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    gap: 8,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#6B7280",
  },
  applyButton: {
    flex: 2,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: "#1CC29F",
    gap: 8,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
})

export default ReportFilters
