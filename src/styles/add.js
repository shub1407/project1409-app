import { Dimensions, StyleSheet } from "react-native"
const { width: screenWidth, height: screenHeight } = Dimensions.get("window")
export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 16,
    textAlign: "center",
    paddingVertical: 20,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    marginBottom: 20,
    paddingBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerButtonDisabled: {
    opacity: 0.5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 20,
  },
  selectorCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  selectorLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  selectorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  selectorSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  // Amount Container - No title, just icon and input
  amountContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  amountIcon: {
    marginRight: 12,
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: "700",
    marginRight: 12,
  },
  amountInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: "600",
  },
  // Description Container - No title, just icon and input
  descriptionContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  descriptionIcon: {
    marginRight: 12,
  },
  descriptionInput: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
  },
  // Transfer Container - Horizontal layout with arrow
  transferContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  transferAccount: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
  },
  arrowContainer: {
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  accountCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  accountInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  accountIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  accountIconPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  accountDetails: {
    flex: 1,
  },
  accountName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  accountBalance: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  accountPlaceholder: {
    fontSize: 14,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  categoryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  categoryIconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  categoryPlaceholder: {
    fontSize: 16,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  dateCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
    marginLeft: 12,
  },
  // Note Container - No title, just icon and input
  noteContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  noteIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  noteInput: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
    minHeight: 60,
    textAlignVertical: "top",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    width: screenWidth - 48,
    maxHeight: screenHeight * 0.7,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 20,
    textAlign: "center",
  },
  modalOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  modalOptionActive: {
    backgroundColor: "#F0FDF4",
  },
  modalOptionContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  modalOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  modalAccountIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  modalOptionText: {
    flex: 1,
  },
  modalOptionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  modalOptionSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  dateInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
    marginBottom: 20,
  },
  confirmButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  //date modal
  // Add these new styles to your existing styles object
  dateModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    width: screenWidth - 40,
    maxWidth: 380,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
    overflow: "hidden",
  },

  dateModalHeader: {
    padding: 24,
    alignItems: "center",
  },

  selectedDayText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    opacity: 0.9,
  },

  selectedDateText: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "700",
    marginVertical: 4,
  },

  selectedYearText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "500",
    opacity: 0.9,
  },

  calendarNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },

  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },

  monthYearText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  dayHeaders: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#F9FAFB",
  },

  dayHeaderText: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },

  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 24,
    paddingVertical: 12,
  },

  calendarDay: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderRadius: 8,
  },

  todayDay: {
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#F59E0B",
  },

  calendarDayText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },

  selectedDayNum: {
    color: "#FFFFFF",
  },

  todayDayText: {
    color: "#F59E0B",
    fontWeight: "700",
  },

  quickActions: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },

  quickActionButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    alignItems: "center",
  },

  quickActionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },

  dateModalActions: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },

  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    alignItems: "center",
  },

  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  // Add these styles to your existing styles object in src/styles/add.js

  headerCenter: {
    flex: 1,
    alignItems: "center",
  },

  headerActions: {
    flexDirection: "row",
    gap: 8,
  },

  headerDeleteButton: {
    backgroundColor: "rgba(239, 68, 68, 0.3)",
  },

  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },

  infoLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 4,
    marginTop: 8,
  },

  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
  },

  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },

  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginTop: 16,
    marginBottom: 24,
  },

  errorButton: {
    backgroundColor: "#1CC29F",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },

  errorButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  deleteModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    margin: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
  },

  deleteIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  deleteModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },

  deleteModalSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },

  deleteModalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },

  deleteModalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },

  deleteModalCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },

  deleteModalDeleteButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
  },

  deleteModalDeleteText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  // Add these styles to your existing styles object:

  dateCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 2,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  dateLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  dateIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },

  dateInfo: {
    flex: 1,
  },

  dateLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 2,
  },

  dateText: {
    fontSize: 16,
    fontWeight: "600",
  },

  datePickerModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginHorizontal: 20,
    marginVertical: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
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
    fontWeight: "600",
    color: "#111827",
  },

  datePickerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },

  datePickerButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#FFFFFF",
    opacity: 0.8,
    marginTop: 2,
  },
  smsMessageContainer: {
    backgroundColor: "#F8F9FA",
    margin: 15,
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  smsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  smsLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginLeft: 6,
    flex: 1,
  },
  balanceChip: {
    backgroundColor: "#E8F5E8",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  balanceText: {
    fontSize: 10,
    color: "#1CC29F",
    fontWeight: "600",
  },
  smsMessage: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    marginBottom: 8,
  },
  smsFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  smsTime: {
    fontSize: 11,
    color: "#888",
  },
  smsAccount: {
    fontSize: 11,
    color: "#888",
  },
  selectorRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  categoryRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  autoDetectedBadge: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 35,
    alignItems: "center",
  },
  autoDetectedText: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  suggestionText: {
    fontSize: 12,
    color: "#FF9500",
    fontStyle: "italic",
    marginTop: 4,
    marginLeft: 30,
  },
  suggestionBanner: {
    backgroundColor: "#FFF3E0",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  suggestionBannerText: {
    fontSize: 14,
    color: "#FF9500",
    fontWeight: "500",
    marginLeft: 8,
  },
  suggestedCategoryOption: {
    borderWidth: 1,
    borderColor: "#FF9500",
    backgroundColor: "#FFF3E0",
  },
  suggestionBadge: {
    marginLeft: "auto",
  },
  suggestionBadgeText: {
    fontSize: 16,
  },
  debugContainer: {
    backgroundColor: "#F0F0F0",
    margin: 15,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 5,
  },
  debugText: {
    fontSize: 10,
    color: "#444",
    fontFamily: "monospace",
  },
})

// Add these new styles to your existing styles object
