import { Ionicons } from "@expo/vector-icons"
import { BlurView } from "expo-blur"
import { useEffect, useRef } from "react"
import {
  Animated,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

export default function SMSTransactionModal({
  visible,
  transactions = [], // Changed to accept array of transactions
  currentIndex = 0, // Current transaction index
  onDismiss,
  onNext,
  onPrevious,
  onViewAll,
  onAddNow,
  onSkipCurrent,
}) {
  const slideAnim = useRef(new Animated.Value(screenHeight)).current
  const scaleAnim = useRef(new Animated.Value(0.8)).current
  const opacityAnim = useRef(new Animated.Value(0)).current
  const contentSlideAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [visible])

  // Animate content when switching between transactions
  const animateContentChange = () => {
    Animated.sequence([
      Animated.timing(contentSlideAnim, {
        toValue: -50,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(contentSlideAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start()
  }

  const handleNext = () => {
    if (onNext) {
      animateContentChange()
      onNext()
    }
  }

  const handlePrevious = () => {
    if (onPrevious) {
      animateContentChange()
      onPrevious()
    }
  }

  if (!transactions.length) return null

  const currentTransaction = transactions[currentIndex]
  const hasNext = currentIndex < transactions.length - 1
  const hasPrevious = currentIndex > 0

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <BlurView intensity={20} style={styles.blurOverlay}>
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={onDismiss}
          />

          <Animated.View
            style={[
              styles.modalContainer,
              {
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
                opacity: opacityAnim,
              },
            ]}
          >
            {/* Enhanced Header with Counter */}
            <View style={styles.header}>
              <View style={styles.headerTop}>
                <View style={styles.counterContainer}>
                  <Text style={styles.counterText}>
                    {currentIndex + 1} of {transactions.length}
                  </Text>
                  <Text style={styles.counterSubtext}>SMS Transactions</Text>
                </View>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onDismiss}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={20} color="#999" />
                </TouchableOpacity>
              </View>

              <View style={styles.headerIconContainer}>
                <View style={styles.headerIcon}>
                  <Ionicons name="card" size={28} color="#1CC29F" />
                </View>
                <View style={styles.pulseRing} />
              </View>

              <Text style={styles.headerTitle}>New Transaction Detected!</Text>
              <Text style={styles.headerSubtitle}>
                SMS automatically parsed
              </Text>
            </View>

            {/* Transaction Details Card with Animation */}
            <Animated.View
              style={[
                styles.transactionCard,
                {
                  transform: [{ translateY: contentSlideAnim }],
                },
              ]}
            >
              <View style={styles.transactionHeader}>
                <View style={styles.amountSection}>
                  <Text style={styles.currencySymbol}>₹</Text>
                  <Text style={styles.amount}>{currentTransaction.amount}</Text>
                </View>
                <View
                  style={[
                    styles.typeBadge,
                    {
                      backgroundColor:
                        currentTransaction.type === "expense"
                          ? "#FF6B6B"
                          : "#1CC29F",
                    },
                  ]}
                >
                  <Text style={styles.typeBadgeText}>
                    {currentTransaction.type === "expense"
                      ? "💸 Expense"
                      : "💰 Income"}
                  </Text>
                </View>
              </View>

              <View style={styles.transactionDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="business" size={16} color="#666" />
                  <Text style={styles.detailText} numberOfLines={1}>
                    {currentTransaction.merchant || "Transaction"}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="phone-portrait" size={16} color="#666" />
                  <Text style={styles.detailText}>
                    From: {currentTransaction.phone}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="time" size={16} color="#666" />
                  <Text style={styles.detailText}>
                    {currentTransaction.timestamp}
                  </Text>
                </View>
              </View>

              {/* SMS Preview */}
              <View style={styles.smsPreview}>
                <Text style={styles.smsLabel}>Original SMS:</Text>
                <Text style={styles.smsText} numberOfLines={2}>
                  {currentTransaction.message}
                </Text>
              </View>
            </Animated.View>

            {/* Navigation Controls */}
            {transactions.length > 1 && (
              <View style={styles.navigationContainer}>
                <TouchableOpacity
                  style={[
                    styles.navButton,
                    !hasPrevious && styles.navButtonDisabled,
                  ]}
                  onPress={handlePrevious}
                  disabled={!hasPrevious}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="chevron-back"
                    size={20}
                    color={hasPrevious ? "#007AFF" : "#CCC"}
                  />
                  <Text
                    style={[
                      styles.navButtonText,
                      !hasPrevious && styles.navButtonTextDisabled,
                    ]}
                  >
                    Previous
                  </Text>
                </TouchableOpacity>

                <View style={styles.dotsContainer}>
                  {transactions.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.dot,
                        index === currentIndex && styles.activeDot,
                      ]}
                    />
                  ))}
                </View>

                <TouchableOpacity
                  style={[
                    styles.navButton,
                    !hasNext && styles.navButtonDisabled,
                  ]}
                  onPress={handleNext}
                  disabled={!hasNext}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.navButtonText,
                      !hasNext && styles.navButtonTextDisabled,
                    ]}
                  >
                    Next
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={hasNext ? "#007AFF" : "#CCC"}
                  />
                </TouchableOpacity>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.dismissButton}
                onPress={onSkipCurrent}
                activeOpacity={0.8}
              >
                <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
                <Text style={styles.dismissButtonText}>Dismiss</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={onViewAll}
                activeOpacity={0.8}
              >
                <Ionicons name="list" size={18} color="#007AFF" />
                <Text style={styles.viewAllButtonText}>View All</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.addNowButton}
                onPress={() => onAddNow(currentTransaction)}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
                <Text style={styles.addNowButtonText}>Add Now</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </BlurView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  blurOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    width: screenWidth - 40,
    maxWidth: 420,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 40,
    elevation: 20,
  },

  // Enhanced Header Styles
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  headerTop: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  counterContainer: {
    alignItems: "flex-start",
  },
  counterText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  counterSubtext: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F3F4",
    justifyContent: "center",
    alignItems: "center",
  },
  headerIconContainer: {
    position: "relative",
    marginBottom: 16,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#1CC29F",
  },
  pulseRing: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#1CC29F",
    opacity: 0.3,
    top: -8,
    left: -8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },

  // Transaction Card Styles
  transactionCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  amountSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1CC29F",
    marginRight: 4,
  },
  amount: {
    fontSize: 32,
    fontWeight: "800",
    color: "#333",
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  typeBadgeText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  transactionDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#555",
    marginLeft: 8,
    flex: 1,
  },
  smsPreview: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  smsLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginBottom: 6,
  },
  smsText: {
    fontSize: 13,
    color: "#444",
    lineHeight: 18,
  },

  // Navigation Controls
  navigationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
    marginHorizontal: 6,
  },
  navButtonTextDisabled: {
    color: "#CCC",
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E9ECEF",
  },
  activeDot: {
    backgroundColor: "#1CC29F",
    width: 24,
    borderRadius: 4,
  },

  // Action Buttons - Enhanced Dismiss Button
  actionButtons: {
    flexDirection: "row",
    gap: 10,
  },
  dismissButton: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#FF6B6B",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  dismissButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  viewAllButton: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  viewAllButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#007AFF",
  },
  addNowButton: {
    flex: 1.2,
    flexDirection: "row",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#1CC29F",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    shadowColor: "#1CC29F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addNowButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
})
