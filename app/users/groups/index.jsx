import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import {
  Dimensions,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

const { width, height } = Dimensions.get("window")

export default function GroupsScreen() {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1CC29F" />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Groups</Text>
        </View>

        {/* Scrollable Main Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Illustration Section */}
          <View style={styles.illustrationSection}>
            <View style={styles.iconContainer}>
              <View style={styles.mainIcon}>
                <Ionicons name="people" size={48} color="#1CC29F" />
              </View>

              {/* Floating Elements */}
              <View style={[styles.floatingIcon, styles.icon1]}>
                <Ionicons name="receipt-outline" size={18} color="#1CC29F" />
              </View>
              <View style={[styles.floatingIcon, styles.icon2]}>
                <Ionicons
                  name="swap-horizontal-outline"
                  size={18}
                  color="#45B7D1"
                />
              </View>
              <View style={[styles.floatingIcon, styles.icon3]}>
                <Ionicons name="calculator-outline" size={18} color="#FF6B6B" />
              </View>
            </View>
          </View>

          {/* Content Section */}
          <View style={styles.contentSection}>
            <View style={styles.titleContainer}>
              <Text style={styles.mainTitle}>Group Splitting</Text>
              <View style={styles.comingSoonBadge}>
                <Text style={styles.badgeText}>COMING SOON</Text>
              </View>
            </View>

            <Text style={styles.description}>
              Split expenses seamlessly with friends, family, and roommates.
              Create groups, track shared bills, and calculate fair splits with
              smart debt simplification.
            </Text>

            {/* Features Grid */}
            <View style={styles.featuresGrid}>
              <View style={styles.featureRow}>
                <View style={styles.feature}>
                  <View style={styles.featureIconContainer}>
                    <Ionicons name="people-outline" size={20} color="#1CC29F" />
                  </View>
                  <Text style={styles.featureTitle}>Create Groups</Text>
                  <Text style={styles.featureDesc}>
                    Organize expenses by trips, events, or roommates
                  </Text>
                </View>

                <View style={styles.feature}>
                  <View style={styles.featureIconContainer}>
                    <Ionicons
                      name="calculator-outline"
                      size={20}
                      color="#1CC29F"
                    />
                  </View>
                  <Text style={styles.featureTitle}>Smart Splitting</Text>
                  <Text style={styles.featureDesc}>
                    Auto-calculate equal or custom splits
                  </Text>
                </View>
              </View>

              <View style={styles.featureRow}>
                <View style={styles.feature}>
                  <View style={styles.featureIconContainer}>
                    <Ionicons
                      name="swap-horizontal-outline"
                      size={20}
                      color="#1CC29F"
                    />
                  </View>
                  <Text style={styles.featureTitle}>Debt Simplify</Text>
                  <Text style={styles.featureDesc}>
                    Minimize payments with smart settlements
                  </Text>
                </View>

                <View style={styles.feature}>
                  <View style={styles.featureIconContainer}>
                    <Ionicons
                      name="receipt-outline"
                      size={20}
                      color="#1CC29F"
                    />
                  </View>
                  <Text style={styles.featureTitle}>Expense Tracking</Text>
                  <Text style={styles.featureDesc}>
                    Keep detailed records of shared expenses
                  </Text>
                </View>
              </View>
            </View>

            {/* Additional Features List */}
            <View style={styles.additionalFeatures}>
              <Text style={styles.featuresTitle}>What's Coming</Text>

              <View style={styles.featureItem}>
                <View style={styles.checkIcon}>
                  <Ionicons name="checkmark" size={16} color="#1CC29F" />
                </View>
                <Text style={styles.featureText}>
                  Multi-member group creation
                </Text>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.checkIcon}>
                  <Ionicons name="checkmark" size={16} color="#1CC29F" />
                </View>
                <Text style={styles.featureText}>
                  Real-time expense splitting
                </Text>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.checkIcon}>
                  <Ionicons name="checkmark" size={16} color="#1CC29F" />
                </View>
                <Text style={styles.featureText}>
                  Balance tracking & notifications
                </Text>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.checkIcon}>
                  <Ionicons name="checkmark" size={16} color="#1CC29F" />
                </View>
                <Text style={styles.featureText}>Detailed expense history</Text>
              </View>
            </View>

            {/* Launch Date */}
            <View style={styles.launchContainer}>
              <View style={styles.launchIcon}>
                <Ionicons name="calendar-outline" size={20} color="#1CC29F" />
              </View>
              <View style={styles.launchText}>
                <Text style={styles.launchLabel}>Expected Launch</Text>
                <Text style={styles.launchDate}>October 2025</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionContainer}>
              <TouchableOpacity
                style={styles.exploreButton}
                onPress={() => {
                  // Navigate to the personal expenses tracking screen
                  router.replace("/users/home")
                }}
              >
                <Text style={styles.exploreText}>Track Personal Expenses</Text>
                <Ionicons name="arrow-forward" size={16} color="#1CC29F" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    backgroundColor: "#1CC29F",
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 12 : 16,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 32,
    paddingBottom: 24,
  },
  illustrationSection: {
    alignItems: "center",
    paddingBottom: 40,
  },
  iconContainer: {
    position: "relative",
    alignItems: "center",
  },
  mainIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#1CC29F",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  floatingIcon: {
    position: "absolute",
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  icon1: {
    top: -10,
    left: -50,
  },
  icon2: {
    top: 15,
    right: -50,
  },
  icon3: {
    bottom: 5,
    left: -25,
  },
  contentSection: {
    paddingHorizontal: 24,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
    textAlign: "center",
  },
  comingSoonBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F59E0B",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#F59E0B",
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  featuresGrid: {
    marginBottom: 32,
  },
  featureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  feature: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
    textAlign: "center",
  },
  featureDesc: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 16,
  },
  additionalFeatures: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 16,
    textAlign: "center",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  featureText: {
    fontSize: 15,
    color: "#374151",
    fontWeight: "500",
    flex: 1,
  },
  launchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  launchIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  launchText: {
    alignItems: "flex-start",
  },
  launchLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  launchDate: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  actionContainer: {
    gap: 12,
  },
  notifyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1CC29F",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: "#1CC29F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  notifyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  exploreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#1CC29F",
  },
  exploreText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1CC29F",
    marginRight: 8,
  },
})
