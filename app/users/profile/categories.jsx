import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useEffect, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { useCategoryContext } from "../../../src/context/CategoryContext"

const { width: screenWidth } = Dimensions.get("window")

export default function CategoriesScreen() {
  const {
    expenseCategories,
    incomeCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    fetchCategories,
    loading: categoryLoading,
  } = useCategoryContext()
  const [activeTab, setActiveTab] = useState("expense")
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [selectedIcon, setSelectedIcon] = useState("apps-outline")
  const [selectedColor, setSelectedColor] = useState("#1CC29F")
  useEffect(() => {
    // Reset state when modal is closed
    fetchCategories()
  }, [])

  const icons = [
    "fast-food-outline",
    "car-outline",
    "home-outline",
    "medical-outline",
    "school-outline",
    "shirt-outline",
    "game-controller-outline",
    "gift-outline",
    "fitness-outline",
    "airplane-outline",
    "business-outline",
    "wallet-outline",
    "restaurant-outline",
    "bus-outline",
    "bed-outline",
    "phone-portrait-outline",
  ]

  const colors = [
    "#1CC29F",
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#FECA57",
    "#FF9FF3",
    "#54A0FF",
    "#5F27CD",
    "#00D2D3",
    "#FF9F43",
    "#A55EEA",
    "#26DE81",
  ]

  const currentCategories =
    activeTab === "expense" ? expenseCategories : incomeCategories

  // Calculate card width to fit screen properly (3 cards per row)
  const getCardWidth = () => {
    const screenPadding = 40 // 20px on each side
    const cardGap = 24 // total gap space for 2 gaps in 3-card row
    const cardsPerRow = 3
    return Math.floor((screenWidth - screenPadding - cardGap) / cardsPerRow)
  }

  // Check if category can be modified (not default and no transactions)
  const canModifyCategory = (category) => {
    return (
      !category.isDefault &&
      (category.transactionCount === 0 || !category.transactionCount)
    )
  }

  const resetModal = () => {
    setShowAddModal(false)
    setEditingCategory(null)
    setNewCategoryName("")
    setSelectedIcon("apps-outline")
    setSelectedColor("#1CC29F")
  }

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert("Error", "Please enter a category name")
      return
    }
    try {
      const categoryData = {
        label: newCategoryName.trim(),
        icon: selectedIcon,
        color: selectedColor,
        type: activeTab,
      }
      await addCategory(categoryData)
      resetModal()
      Alert.alert("Success", "Category added successfully")
    } catch (error) {
      Alert.alert("Error", "Failed to add category")
    }
  }

  const handleEditCategory = (category) => {
    // Check if category can be edited
    if (!canModifyCategory(category)) {
      if (category.isDefault) {
        Alert.alert(
          "Cannot Edit",
          "Default categories cannot be modified. They are required for the app to function properly."
        )
      } else {
        Alert.alert(
          "Cannot Edit",
          `This category has ${category.transactionCount || 0} transaction${
            (category.transactionCount || 0) !== 1 ? "s" : ""
          } and cannot be modified. Delete the transactions first to edit this category.`
        )
      }
      return
    }
    console.log("Editing category:", category)

    setEditingCategory(category)
    setNewCategoryName(category.label)
    setSelectedIcon(category.icon)
    setSelectedColor(category.color)
    setShowAddModal(true)
  }

  const handleUpdateCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert("Error", "Please enter a category name")
      return
    }

    // Double-check before updating
    if (!canModifyCategory(editingCategory)) {
      Alert.alert("Error", "This category cannot be modified")
      return
    }

    try {
      await updateCategory(editingCategory.id, {
        label: newCategoryName.trim(),
        icon: selectedIcon,
        color: selectedColor,
      })
      resetModal()
      Alert.alert("Success", "Category updated successfully")
    } catch (error) {
      Alert.alert("Error", "Failed to update category")
    }
  }

  const handleDeleteCategory = (category) => {
    // Check if category can be deleted
    if (!canModifyCategory(category)) {
      if (category.isDefault) {
        Alert.alert(
          "Cannot Delete",
          "Default categories cannot be deleted. They are required for the app to function properly."
        )
      } else {
        Alert.alert(
          "Cannot Delete",
          `This category has ${category.transactionCount || 0} transaction${
            (category.transactionCount || 0) !== 1 ? "s" : ""
          } and cannot be deleted. Please move or delete the transactions first.`,
          [
            { text: "OK", style: "default" },
            {
              text: "View Transactions",
              onPress: () => {
                // Navigate to transactions filtered by this category
                router.push({
                  pathname: "/(tabs)/records",
                  params: { categoryId: category.id },
                })
              },
            },
          ]
        )
      }
      return
    }

    Alert.alert(
      "Delete Category",
      `Are you sure you want to delete "${category.label}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCategory(category.id)
              await fetchCategories()
              Alert.alert("Success", "Category deleted successfully")
            } catch (error) {
              Alert.alert("Error", "Failed to delete category")
            }
          },
        },
      ]
    )
  }

  if (categoryLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1CC29F" />
      </View>
    )
  }
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1CC29F" />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Categories</Text>
          <TouchableOpacity
            onPress={() => setShowAddModal(true)}
            style={styles.addButton}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "expense" && styles.activeTab]}
            onPress={() => setActiveTab("expense")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "expense" && styles.activeTabText,
              ]}
            >
              Expense Categories
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "income" && styles.activeTab]}
            onPress={() => setActiveTab("income")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "income" && styles.activeTabText,
              ]}
            >
              Income Categories
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.categoriesContainer}>
            {!categoryLoading &&
              currentCategories.map((category, index) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryItem,
                    { width: getCardWidth() },
                    !canModifyCategory(category) && styles.lockedCategoryItem,
                  ]}
                  onPress={() => handleEditCategory(category)}
                  activeOpacity={0.7}
                >
                  {/* Show delete button only for modifiable categories */}
                  {canModifyCategory(category) && (
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteCategory(category)}
                    >
                      <Ionicons name="close-circle" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  )}

                  {/* Show lock icon for protected categories */}
                  {!canModifyCategory(category) && (
                    <View style={styles.lockIndicator}>
                      <Ionicons
                        name={
                          category.isDefault
                            ? "shield-checkmark"
                            : "lock-closed"
                        }
                        size={12}
                        color="#F59E0B"
                      />
                    </View>
                  )}

                  <View
                    style={[
                      styles.categoryIcon,
                      { backgroundColor: `${category.color}20` },
                    ]}
                  >
                    <Ionicons
                      name={category.icon}
                      size={24}
                      color={category.color}
                    />
                  </View>
                  <Text style={styles.categoryName} numberOfLines={2}>
                    {category.label}
                  </Text>

                  {/* Show transaction count if exists */}
                  {typeof category.transactionCount === "number" &&
                    category.transactionCount > 0 && (
                      <Text style={styles.transactionCount}>
                        {category.transactionCount} transaction
                        {category.transactionCount !== 1 ? "s" : ""}
                      </Text>
                    )}

                  {/* Show default badge */}
                  {category.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>Default</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
          </View>

          {currentCategories.length === 0 && (
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIcon}>
                <Ionicons name="apps-outline" size={48} color="#D1D5DB" />
              </View>
              <Text style={styles.emptyText}>No categories found</Text>
              <Text style={styles.emptySubtext}>
                Add your first {activeTab} category
              </Text>
              <TouchableOpacity
                style={styles.emptyActionButton}
                onPress={() => setShowAddModal(true)}
              >
                <Text style={styles.emptyActionText}>Add Category</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Add/Edit Category Modal */}
        <Modal
          visible={showAddModal}
          transparent
          animationType="slide"
          onRequestClose={resetModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {/* Scrollable Content */}
              <ScrollView
                style={styles.modalScrollView}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <Text style={styles.modalTitle}>
                  {editingCategory ? "Edit Category" : "Add Category"}
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Category Name</Text>
                  <TextInput
                    style={styles.input}
                    value={newCategoryName}
                    onChangeText={setNewCategoryName}
                    placeholder="Enter category name"
                    autoFocus
                    maxLength={20}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Select Icon</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.iconSelector}
                    contentContainerStyle={styles.iconSelectorContent}
                  >
                    {icons.map((icon) => (
                      <TouchableOpacity
                        key={icon}
                        style={[
                          styles.iconOption,
                          selectedIcon === icon && styles.selectedIconOption,
                        ]}
                        onPress={() => setSelectedIcon(icon)}
                      >
                        <Ionicons
                          name={icon}
                          size={20}
                          color={selectedIcon === icon ? "#FFFFFF" : "#6B7280"}
                        />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Select Color</Text>
                  <View style={styles.colorSelector}>
                    {colors.map((color) => (
                      <TouchableOpacity
                        key={color}
                        style={[
                          styles.colorOption,
                          { backgroundColor: color },
                          selectedColor === color && styles.selectedColorOption,
                        ]}
                        onPress={() => setSelectedColor(color)}
                      >
                        {selectedColor === color && (
                          <Ionicons
                            name="checkmark"
                            size={14}
                            color="#FFFFFF"
                          />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Preview Section */}
                <View style={styles.previewSection}>
                  <Text style={styles.inputLabel}>Preview</Text>
                  <View style={styles.previewCard}>
                    <View
                      style={[
                        styles.previewIcon,
                        { backgroundColor: `${selectedColor}20` },
                      ]}
                    >
                      <Ionicons
                        name={selectedIcon}
                        size={24}
                        color={selectedColor}
                      />
                    </View>
                    <Text style={styles.previewText}>
                      {newCategoryName || "Category Name"}
                    </Text>
                  </View>
                </View>
              </ScrollView>

              {/* Fixed Action Buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={resetModal}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={
                    editingCategory ? handleUpdateCategory : handleAddCategory
                  }
                >
                  <Text style={styles.saveButtonText}>
                    {editingCategory ? "Update" : "Add"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
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
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#1CC29F",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  categoryItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    aspectRatio: 1, // Makes cards square
    justifyContent: "center",
  },
  lockedCategoryItem: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
    marginBottom: 4,
  },
  deleteButton: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 1,
  },
  lockIndicator: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: "#F59E0B",
    zIndex: 1,
  },
  transactionCount: {
    fontSize: 10,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 2,
  },
  defaultBadge: {
    position: "absolute",
    bottom: -6,
    backgroundColor: "#1CC29F",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  defaultBadgeText: {
    fontSize: 8,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 24,
  },
  emptyActionButton: {
    backgroundColor: "#1CC29F",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  emptyActionText: {
    color: "#FFFFFF",
    fontWeight: "600",
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
    maxHeight: "90%",
    paddingTop: 20,
  },
  modalScrollView: {
    maxHeight: "85%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 20,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  inputGroup: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
  },
  iconSelector: {
    maxHeight: 60,
  },
  iconSelectorContent: {
    paddingRight: 24,
  },
  iconOption: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  selectedIconOption: {
    backgroundColor: "#1CC29F",
    borderColor: "#1CC29F",
  },
  colorSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedColorOption: {
    borderColor: "#FFFFFF",
    borderWidth: 3,
    transform: [{ scale: 1.1 }],
  },
  previewSection: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  previewCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  previewIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  previewText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    backgroundColor: "#FFFFFF",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#1CC29F",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
})
