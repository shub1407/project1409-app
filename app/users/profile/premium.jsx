import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useState } from "react"
import {
  Alert,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

const { width: screenWidth } = Dimensions.get("window")

export default function PremiumScreen() {
  const [selectedPlan, setSelectedPlan] = useState("monthly")
  const [loading, setLoading] = useState(false)

  const plans = [
    {
      id: "free",
      name: "Free",
      price: 0,
      originalPrice: 0,
      period: "forever",
      popular: false,
      current: true,
      color: "#6B7280",
      features: [
        "3 Bank Accounts",
        "Basic Transaction Tracking",
        "Simple Reports",
        "Email Support",
        "Manual Data Export",
      ],
      limitations: [
        "Limited to 100 transactions/month",
        "Basic categories only",
        "No scheduled transactions",
        "No multi-currency support",
      ],
    },
    {
      id: "monthly",
      name: "Pro Monthly",
      price: 149,
      originalPrice: 199,
      period: "month",
      popular: true,
      current: false,
      color: "#1CC29F",
      savings: 25,
      features: [
        "Unlimited Bank Accounts",
        "Advanced Analytics & Insights",
        "Custom Categories & Icons",
        "Scheduled Transactions",
        "Multi-Currency Support",
        "Priority Email Support",
        "Advanced Reports & Exports",
        "Budget Planning Tools",
        "Transaction Search & Filters",
        "Data Backup & Sync",
      ],
    },
    {
      id: "yearly",
      name: "Pro Yearly",
      price: 1199,
      originalPrice: 1788,
      period: "year",
      popular: false,
      current: false,
      color: "#7C3AED",
      savings: 33,
      monthlyEquivalent: 99,
      features: [
        "Everything in Pro Monthly",
        "Advanced AI Insights",
        "Investment Portfolio Tracking",
        "Tax Report Generation",
        "24/7 Priority Support",
        "Early Access to New Features",
        "Custom Report Templates",
        "API Access (Coming Soon)",
        "Family Account Sharing",
        "Premium Mobile App Themes",
      ],
    },
  ]

  const whyUpgradeReasons = [
    {
      icon: "analytics-outline",
      title: "Advanced Analytics",
      description:
        "Get detailed insights into your spending patterns and financial habits",
    },
    {
      icon: "infinite-outline",
      title: "No Limits",
      description:
        "Unlimited accounts, transactions, and categories for complete financial freedom",
    },
    {
      icon: "time-outline",
      title: "Save Time",
      description:
        "Automated features like scheduled transactions and smart categorization",
    },
    {
      icon: "shield-checkmark-outline",
      title: "Priority Support",
      description:
        "Get faster response times and dedicated support from our team",
    },
  ]

  const handlePurchase = async (planId) => {
    if (planId === "free") {
      Alert.alert("Current Plan", "You're already on the free plan!")
      return
    }

    setLoading(true)
    try {
      // Simulate purchase process
      await new Promise((resolve) => setTimeout(resolve, 2000))

      Alert.alert(
        "Purchase Successful!",
        `Welcome to SplitBudget ${
          plans.find((p) => p.id === planId)?.name
        }! Your premium features are now active.`,
        [
          {
            text: "Start Using Premium",
            onPress: () => router.back(),
          },
        ]
      )
    } catch (error) {
      Alert.alert("Purchase Failed", "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleRestorePurchases = async () => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      Alert.alert("Restore Complete", "No previous purchases found to restore.")
    } catch (error) {
      Alert.alert(
        "Restore Failed",
        "Unable to restore purchases. Please try again."
      )
    } finally {
      setLoading(false)
    }
  }

  const openTerms = () => {
    router.push("/profile/terms")
  }

  const openPrivacy = () => {
    router.push("/profile/privacy")
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
          <Text style={styles.headerTitle}>Premium Plans</Text>
          <TouchableOpacity
            onPress={handleRestorePurchases}
            style={styles.restoreButton}
          >
            <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.premiumIcon}>
              <Ionicons name="star" size={32} color="#FFB800" />
            </View>
            <Text style={styles.heroTitle}>Unlock Premium Features</Text>
            <Text style={styles.heroSubtitle}>
              Get the most out of your financial management with advanced tools
              and unlimited access
            </Text>
          </View>

          {/* Why Upgrade Section */}
          <View style={styles.whyUpgradeSection}>
            <Text style={styles.sectionTitle}>Why Upgrade?</Text>
            <View style={styles.reasonsGrid}>
              {whyUpgradeReasons.map((reason, index) => (
                <View key={index} style={styles.reasonCard}>
                  <View
                    style={[
                      styles.reasonIcon,
                      { backgroundColor: `${plans[1].color}15` },
                    ]}
                  >
                    <Ionicons
                      name={reason.icon}
                      size={24}
                      color={plans[1].color}
                    />
                  </View>
                  <Text style={styles.reasonTitle}>{reason.title}</Text>
                  <Text style={styles.reasonDescription}>
                    {reason.description}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Pricing Plans */}
          <View style={styles.plansSection}>
            <Text style={styles.sectionTitle}>Choose Your Plan</Text>

            {plans.map((plan) => (
              <View
                key={plan.id}
                style={[
                  styles.planCard,
                  plan.popular && styles.popularPlan,
                  plan.current && styles.currentPlan,
                  selectedPlan === plan.id && styles.selectedPlan,
                ]}
              >
                {plan.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>Most Popular</Text>
                  </View>
                )}

                {plan.current && (
                  <View style={styles.currentBadge}>
                    <Text style={styles.currentText}>Current Plan</Text>
                  </View>
                )}

                <View style={styles.planHeader}>
                  <Text style={[styles.planName, { color: plan.color }]}>
                    {plan.name}
                  </Text>

                  <View style={styles.priceContainer}>
                    <Text style={[styles.price, { color: plan.color }]}>
                      ₹{plan.price === 0 ? "Free" : plan.price}
                    </Text>
                    {plan.price > 0 && (
                      <>
                        <Text style={styles.period}>/{plan.period}</Text>
                        {plan.originalPrice > plan.price && (
                          <Text style={styles.originalPrice}>
                            ₹{plan.originalPrice}
                          </Text>
                        )}
                      </>
                    )}
                  </View>

                  {plan.savings && (
                    <View style={styles.savingsContainer}>
                      <Text style={styles.savingsText}>
                        Save {plan.savings}%
                      </Text>
                    </View>
                  )}

                  {plan.monthlyEquivalent && (
                    <Text style={styles.monthlyEquivalent}>
                      Just ₹{plan.monthlyEquivalent}/month
                    </Text>
                  )}
                </View>

                <View style={styles.featuresContainer}>
                  {plan.features.map((feature, index) => (
                    <View key={index} style={styles.feature}>
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color={plan.color}
                      />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}

                  {plan.limitations && (
                    <>
                      <View style={styles.limitationsHeader}>
                        <Text style={styles.limitationsTitle}>
                          Limitations:
                        </Text>
                      </View>
                      {plan.limitations.map((limitation, index) => (
                        <View key={index} style={styles.limitation}>
                          <Ionicons
                            name="close-circle"
                            size={16}
                            color="#EF4444"
                          />
                          <Text style={styles.limitationText}>
                            {limitation}
                          </Text>
                        </View>
                      ))}
                    </>
                  )}
                </View>

                <TouchableOpacity
                  style={[
                    styles.selectButton,
                    plan.current && styles.currentButton,
                    plan.popular && styles.popularButton,
                    { backgroundColor: plan.current ? "#6B7280" : plan.color },
                  ]}
                  onPress={() => handlePurchase(plan.id)}
                  disabled={plan.current || loading}
                >
                  <Text style={styles.selectButtonText}>
                    {plan.current
                      ? "Current Plan"
                      : loading
                      ? "Processing..."
                      : "Choose Plan"}
                  </Text>
                  {!plan.current && (
                    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Money Back Guarantee */}
          <View style={styles.guaranteeSection}>
            <View style={styles.guaranteeIcon}>
              <Ionicons name="shield-checkmark" size={24} color="#10B981" />
            </View>
            <Text style={styles.guaranteeTitle}>
              30-Day Money Back Guarantee
            </Text>
            <Text style={styles.guaranteeText}>
              Try SplitBudget Premium risk-free. If you're not completely
              satisfied within 30 days, we'll refund your purchase.
            </Text>
          </View>

          {/* FAQ Section */}
          <View style={styles.faqSection}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>Can I cancel anytime?</Text>
              <Text style={styles.faqAnswer}>
                Yes, you can cancel your subscription at any time. You'll
                continue to have access to premium features until the end of
                your billing cycle.
              </Text>
            </View>

            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>
                Do you offer student discounts?
              </Text>
              <Text style={styles.faqAnswer}>
                Yes! Students get 50% off any premium plan. Contact support with
                your student ID for a discount code.
              </Text>
            </View>

            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>
                What payment methods do you accept?
              </Text>
              <Text style={styles.faqAnswer}>
                We accept all major credit cards, debit cards, UPI, and digital
                wallets through secure payment gateways.
              </Text>
            </View>
          </View>

          {/* Legal Links */}
          <View style={styles.legalSection}>
            <TouchableOpacity onPress={openTerms} style={styles.legalLink}>
              <Text style={styles.legalLinkText}>Terms of Service</Text>
            </TouchableOpacity>
            <Text style={styles.legalSeparator}>•</Text>
            <TouchableOpacity onPress={openPrivacy} style={styles.legalLink}>
              <Text style={styles.legalLinkText}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
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
  restoreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },

  // Hero Section
  heroSection: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: "center",
    marginBottom: 24,
  },
  premiumIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
  },

  // Why Upgrade Section
  whyUpgradeSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 20,
  },
  reasonsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  reasonCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    width: (screenWidth - 52) / 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  reasonIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  reasonTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  reasonDescription: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },

  // Plans Section
  plansSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  planCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  popularPlan: {
    borderColor: "#1CC29F",
    transform: [{ scale: 1.02 }],
  },
  currentPlan: {
    borderColor: "#6B7280",
    backgroundColor: "#F9FAFB",
  },
  selectedPlan: {
    borderColor: "#1CC29F",
  },
  popularBadge: {
    position: "absolute",
    top: -12,
    alignSelf: "center",
    backgroundColor: "#1CC29F",
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 20,
  },
  popularText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
  },
  currentBadge: {
    position: "absolute",
    top: -12,
    alignSelf: "center",
    backgroundColor: "#6B7280",
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 20,
  },
  currentText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
  },
  planHeader: {
    marginBottom: 24,
    alignItems: "center",
  },
  planName: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 8,
  },
  price: {
    fontSize: 36,
    fontWeight: "900",
  },
  period: {
    fontSize: 18,
    color: "#6B7280",
    marginLeft: 4,
  },
  originalPrice: {
    fontSize: 16,
    color: "#9CA3AF",
    textDecorationLine: "line-through",
    marginLeft: 12,
  },
  savingsContainer: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  savingsText: {
    color: "#D97706",
    fontWeight: "700",
    fontSize: 14,
  },
  monthlyEquivalent: {
    fontSize: 14,
    color: "#6B7280",
    fontStyle: "italic",
  },
  featuresContainer: {
    marginBottom: 24,
  },
  feature: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  featureText: {
    fontSize: 15,
    color: "#374151",
    marginLeft: 12,
    flex: 1,
  },
  limitationsHeader: {
    marginTop: 16,
    marginBottom: 8,
  },
  limitationsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#EF4444",
  },
  limitation: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  limitationText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 12,
    flex: 1,
  },
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  currentButton: {
    backgroundColor: "#6B7280",
  },
  popularButton: {
    backgroundColor: "#1CC29F",
  },
  selectButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },

  // Guarantee Section
  guaranteeSection: {
    backgroundColor: "#F0FDF4",
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "#10B981",
  },
  guaranteeIcon: {
    marginBottom: 12,
  },
  guaranteeTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  guaranteeText: {
    fontSize: 14,
    color: "#374151",
    textAlign: "center",
    lineHeight: 20,
  },

  // FAQ Section
  faqSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  faqItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },

  // Legal Section
  legalSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  legalLink: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  legalLinkText: {
    fontSize: 13,
    color: "#1CC29F",
    fontWeight: "500",
  },
  legalSeparator: {
    fontSize: 13,
    color: "#9CA3AF",
    marginHorizontal: 8,
  },
  bottomPadding: {
    height: 20,
  },
})
