import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import {
  Modal,
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
  const [tempFilters, setTempFilters] = useState(filters)

  const { accounts } = useAccountsContext()
  const { expenseCategories, incomeCategories } = useCategoryContext()

  const allCategories = [...expenseCategories, ...incomeCategories]

  const handleApplyFilters = () => {
    onFiltersChange(tempFilters)
    onApply?.(tempFilters)
    setShowModal(false)
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
    let count = 0
    if (filters.type !== "all") count++
    if (filters.accountId) count++
    if (filters.categoryId) count++
    if (filters.groupBy !== "month") count++
    return count
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setShowModal(true)}
      >
        <Ionicons name="options-outline" size={20} color="#1CC29F" />
        <Text style={styles.filterButtonText}>Filters</Text>
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
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Reports</Text>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
            >
              {/* Date Range */}
              <View style={styles.filterSection}>
                <Text style={styles.sectionTitle}>Date Range</Text>
                <View style={styles.dateRow}>
                  <View style={styles.dateField}>
                    <Text style={styles.fieldLabel}>Start Date</Text>
                    <TextInput
                      style={styles.dateInput}
                      value={tempFilters.startDate}
                      onChangeText={(value) =>
                        setTempFilters((prev) => ({
                          ...prev,
                          startDate: value,
                        }))
                      }
                      placeholder="YYYY-MM-DD"
                    />
                  </View>
                  <View style={styles.dateField}>
                    <Text style={styles.fieldLabel}>End Date</Text>
                    <TextInput
                      style={styles.dateInput}
                      value={tempFilters.endDate}
                      onChangeText={(value) =>
                        setTempFilters((prev) => ({ ...prev, endDate: value }))
                      }
                      placeholder="YYYY-MM-DD"
                    />
                  </View>
                </View>
              </View>

              {/* Group By */}
              <View style={styles.filterSection}>
                <Text style={styles.sectionTitle}>Group By</Text>
                <View style={styles.optionsRow}>
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
                <Text style={styles.sectionTitle}>Transaction Type</Text>
                <View style={styles.optionsRow}>
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
                <Text style={styles.sectionTitle}>Account</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.horizontalOptions}>
                    <TouchableOpacity
                      style={[
                        styles.accountOption,
                        !tempFilters.accountId && styles.accountOptionActive,
                      ]}
                      onPress={() =>
                        setTempFilters((prev) => ({ ...prev, accountId: "" }))
                      }
                    >
                      <Text
                        style={[
                          styles.accountOptionText,
                          !tempFilters.accountId &&
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
                          tempFilters.accountId === account.id &&
                            styles.accountOptionActive,
                        ]}
                        onPress={() =>
                          setTempFilters((prev) => ({
                            ...prev,
                            accountId: account.id,
                          }))
                        }
                      >
                        <View
                          style={[
                            styles.accountColor,
                            { backgroundColor: account.color },
                          ]}
                        />
                        <Text
                          style={[
                            styles.accountOptionText,
                            tempFilters.accountId === account.id &&
                              styles.accountOptionTextActive,
                          ]}
                        >
                          {account.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Category Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.sectionTitle}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.horizontalOptions}>
                    <TouchableOpacity
                      style={[
                        styles.categoryOption,
                        !tempFilters.categoryId && styles.categoryOptionActive,
                      ]}
                      onPress={() =>
                        setTempFilters((prev) => ({ ...prev, categoryId: "" }))
                      }
                    >
                      <Text
                        style={[
                          styles.categoryOptionText,
                          !tempFilters.categoryId &&
                            styles.categoryOptionTextActive,
                        ]}
                      >
                        All Categories
                      </Text>
                    </TouchableOpacity>
                    {allCategories.map((category) => (
                      <TouchableOpacity
                        key={category._id}
                        style={[
                          styles.categoryOption,
                          tempFilters.categoryId === category._id &&
                            styles.categoryOptionActive,
                        ]}
                        onPress={() =>
                          setTempFilters((prev) => ({
                            ...prev,
                            categoryId: category._id,
                          }))
                        }
                      >
                        <Ionicons
                          name={category.icon}
                          size={16}
                          color={category.color}
                          style={styles.categoryIcon}
                        />
                        <Text
                          style={[
                            styles.categoryOptionText,
                            tempFilters.categoryId === category._id &&
                              styles.categoryOptionTextActive,
                          ]}
                        >
                          {category.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={resetFilters}
              >
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={handleApplyFilters}
              >
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
    marginVertical: 8,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 8,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1CC29F",
  },
  filterBadge: {
    backgroundColor: "#EF4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: "auto",
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
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: "row",
    gap: 12,
  },
  dateField: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    marginBottom: 6,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
  },
  optionsRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  optionButtonActive: {
    backgroundColor: "#1CC29F",
    borderColor: "#1CC29F",
  },
  optionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  optionTextActive: {
    color: "#FFFFFF",
  },
  horizontalOptions: {
    flexDirection: "row",
    gap: 8,
  },
  accountOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    gap: 6,
  },
  accountOptionActive: {
    backgroundColor: "#1CC29F",
    borderColor: "#1CC29F",
  },
  accountColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  accountOptionText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
  },
  accountOptionTextActive: {
    color: "#FFFFFF",
  },
  categoryOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    gap: 6,
  },
  categoryOptionActive: {
    backgroundColor: "#1CC29F",
    borderColor: "#1CC29F",
  },
  categoryIcon: {
    marginRight: 2,
  },
  categoryOptionText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
  },
  categoryOptionTextActive: {
    color: "#FFFFFF",
  },
  modalFooter: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    gap: 12,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  applyButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#1CC29F",
    alignItems: "center",
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
})

export default ReportFilters
