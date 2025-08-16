import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useState } from "react"
import {
  Alert,
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

export default function CategoriesScreen() {
  const {
    expenseCategories,
    incomeCategories,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useCategoryContext()
  const [activeTab, setActiveTab] = useState("expense")
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [selectedIcon, setSelectedIcon] = useState("apps-outline")
  const [selectedColor, setSelectedColor] = useState("#1CC29F")

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

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert("Error", "Please enter a category name")
      return
    }

    try {
      await addCategory({
        label: newCategoryName.trim(),
        icon: selectedIcon,
        color: selectedColor,
        type: activeTab,
      })
      setShowAddModal(false)
      setNewCategoryName("")
      setSelectedIcon("apps-outline")
      setSelectedColor("#1CC29F")
    } catch (error) {
      Alert.alert("Error", "Failed to add category")
    }
  }

  const handleEditCategory = (category) => {
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

    try {
      await updateCategory(editingCategory._id, {
        label: newCategoryName.trim(),
        icon: selectedIcon,
        color: selectedColor,
      })
      setShowAddModal(false)
      setEditingCategory(null)
      setNewCategoryName("")
      setSelectedIcon("apps-outline")
      setSelectedColor("#1CC29F")
    } catch (error) {
      Alert.alert("Error", "Failed to update category")
    }
  }

  const handleDeleteCategory = (category) => {
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
              await deleteCategory(category._id)
            } catch (error) {
              Alert.alert("Error", "Failed to delete category")
            }
          },
        },
      ]
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

        <ScrollView style={styles.content}>
          <View style={styles.categoriesContainer}>
            {currentCategories.map((category, index) => (
              <TouchableOpacity
                key={category._id}
                style={styles.categoryItem}
                onLongPress={() => handleEditCategory(category)}
              >
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
                <Text style={styles.categoryName}>{category.label}</Text>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteCategory(category)}
                >
                  <Ionicons name="close-circle" size={20} color="#EF4444" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>

          {currentCategories.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="apps-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>No categories found</Text>
              <Text style={styles.emptySubtext}>
                Add your first {activeTab} category
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Add/Edit Category Modal */}
        <Modal
          visible={showAddModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAddModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {editingCategory ? "Edit Category" : "Add Category"}
              </Text>

              <Text style={styles.inputLabel}>Category Name</Text>
              <TextInput
                style={styles.input}
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                placeholder="Enter category name"
                autoFocus
              />

              <Text style={styles.inputLabel}>Select Icon</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.iconSelector}
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
                      size={24}
                      color={selectedIcon === icon ? "#FFFFFF" : "#6B7280"}
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>

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
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowAddModal(false)
                    setEditingCategory(null)
                    setNewCategoryName("")
                    setSelectedIcon("apps-outline")
                    setSelectedColor("#1CC29F")
                  }}
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
    gap: 12,
  },
  categoryItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    minWidth: 100,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
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
  },
  deleteButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 20,
    textAlign: "center",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginTop: 16,
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
    marginBottom: 8,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 12,
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
    marginBottom: 16,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedColorOption: {
    borderColor: "#FFFFFF",
    borderWidth: 3,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
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
