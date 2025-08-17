import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import {
  Linking,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

export default function AboutScreen() {
  const features = [
    {
      icon: "wallet-outline",
      title: "Personal Finance",
      description: "Track your income, expenses, and budgets easily",
    },
    {
      icon: "people-outline",
      title: "Expense Splitting",
      description: "Share expenses with friends and family",
    },
    {
      icon: "analytics-outline",
      title: "Smart Analytics",
      description: "Get insights into your spending patterns",
    },
    {
      icon: "sync-outline",
      title: "Multi-device Sync",
      description: "Access your data across all devices",
    },
  ]

  const socialLinks = [
    {
      platform: "Website",
      icon: "globe-outline",
      url: "https://splitbudget.com",
      color: "#1CC29F",
    },
    {
      platform: "Twitter",
      icon: "logo-twitter",
      url: "https://twitter.com/splitbudgetapp",
      color: "#1DA1F2",
    },
    {
      platform: "Instagram",
      icon: "logo-instagram",
      url: "https://instagram.com/splitbudgetapp",
      color: "#E4405F",
    },
    {
      platform: "LinkedIn",
      icon: "logo-linkedin",
      url: "https://linkedin.com/company/splitbudget",
      color: "#0077B5",
    },
  ]

  const openUrl = async (url) => {
    try {
      await Linking.openURL(url)
    } catch (error) {
      console.error("Failed to open URL:", error)
    }
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
          <Text style={styles.headerTitle}>About SplitBudget</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content}>
          {/* App Info */}
          <View style={styles.appInfoSection}>
            <View style={styles.appIcon}>
              <Text style={styles.appIconText}>💰</Text>
            </View>
            <Text style={styles.appName}>SplitBudget</Text>
            <Text style={styles.appTagline}>
              Because adulting is hard enough already
            </Text>
            <Text style={styles.versionInfo}>
              Version 1.0.0 (Build 2025.08.17)
            </Text>
          </View>

          {/* Company Story */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About SplitBudget 🚀</Text>

            <Text style={styles.companyStory}>
              SplitBudget was born in 2025 from a simple but relatable problem:
              juggling multiple apps just to figure out if you could afford that
              packet of Kurkure without going broke 🧡
            </Text>

            <Text style={styles.companyStory}>
              <Text style={styles.highlight}>The real problem?</Text> People
              kept forgetting who paid for what when hanging out with friends,
              and personal budgeting felt like rocket science. So instead of
              accepting the status quo, we decided to build our way out of the
              problem 🤷‍♂️
            </Text>

            <Text style={styles.companyStory}>
              We're a lean, mean, problem-solving machine dedicated to making
              your financial life less chaotic - one expense at a time.
            </Text>
          </View>

          {/* Mission Statement */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Our Mission</Text>
            <Text style={styles.missionText}>
              <Text style={styles.highlight}>Simple:</Text> Make money
              management less painful than watching your savings disappear on
              late-night Maggie runs and Kurkure cravings.
            </Text>
            <Text style={styles.missionText}>
              We believe finance apps should be like good friends - helpful,
              reliable, and they don't judge you for that 2 AM Maggie session
              (we've all been there).
            </Text>
          </View>

          {/* Key Features */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              What SplitBudget Actually Does
            </Text>
            <View style={styles.featuresList}>
              {features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <View style={styles.featureIcon}>
                    <Ionicons name={feature.icon} size={24} color="#1CC29F" />
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>
                      {feature.description}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Origin Story */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>The Origin Story 🦸‍♂️</Text>
            <Text style={styles.storyText}>
              <Text style={styles.highlight}>2024:</Text> A group of friends
              sitting around after sharing a packet of Kurkure, spending 20
              minutes calculating who owes what for snacks. Meanwhile,
              everyone's trying to remember if they've exceeded their monthly
              "Maggie and random cravings" budget.
            </Text>
            <Text style={styles.storyText}>
              <Text style={styles.highlight}>The revelation:</Text> Existing
              apps were either too complicated (like doing taxes), too simple
              (like a calculator), or required a PhD in finance to understand.
            </Text>
            <Text style={styles.storyText}>
              <Text style={styles.highlight}>The solution:</Text> Build
              something that doesn't make you want to throw your phone out the
              window. Hence, SplitBudget was born in 2025 - powered by Maggie,
              Kurkure crunches, and way too many late nights.
            </Text>
          </View>

          {/* Company Values */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What We Stand For</Text>
            <View style={styles.valuesList}>
              <View style={styles.valueItem}>
                <Text style={styles.valueEmoji}>🎯</Text>
                <View style={styles.valueContent}>
                  <Text style={styles.valueTitle}>Simplicity First</Text>
                  <Text style={styles.valueText}>
                    If it takes more than 3 taps, we're doing it wrong
                  </Text>
                </View>
              </View>
              <View style={styles.valueItem}>
                <Text style={styles.valueEmoji}>🤝</Text>
                <View style={styles.valueContent}>
                  <Text style={styles.valueTitle}>No Judgment Zone</Text>
                  <Text style={styles.valueText}>
                    Your 3 AM online shopping spree is safe with us
                  </Text>
                </View>
              </View>
              <View style={styles.valueItem}>
                <Text style={styles.valueEmoji}>🚀</Text>
                <View style={styles.valueContent}>
                  <Text style={styles.valueTitle}>Built for Real People</Text>
                  <Text style={styles.valueText}>
                    By people who actually use the app (and face the same money
                    problems)
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Fun Facts */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fun Facts About Our Journey</Text>
            <View style={styles.funFactsList}>
              <View style={styles.funFact}>
                <Text style={styles.funFactEmoji}>🍜</Text>
                <Text style={styles.funFactText}>
                  Approximately 183 packets of Maggie were consumed during
                  development (2-minute cooking time = perfect debugging breaks)
                </Text>
              </View>
              <View style={styles.funFact}>
                <Text style={styles.funFactEmoji}>🧡</Text>
                <Text style={styles.funFactText}>
                  Kurkure was the official "thinking snack" - crunchy problems
                  need crunchy solutions
                </Text>
              </View>
              <View style={styles.funFact}>
                <Text style={styles.funFactEmoji}>🌙</Text>
                <Text style={styles.funFactText}>
                  85% of the features were built between 11 PM and 3 AM (optimal
                  coding hours with Maggie fuel)
                </Text>
              </View>
              <View style={styles.funFact}>
                <Text style={styles.funFactEmoji}>🐛</Text>
                <Text style={styles.funFactText}>
                  We found and fixed exactly 1,247 bugs (and probably created
                  1,248 new ones in the process)
                </Text>
              </View>
            </View>
          </View>

          {/* Connect */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Let's Connect!</Text>
            <Text style={styles.connectText}>
              Found a bug? Have a feature request? Just want to say hi? We're
              probably awake, coding, and munching on something crunchy anyway
              🤓
            </Text>
            <View style={styles.socialLinks}>
              {socialLinks.map((link, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.socialLink}
                  onPress={() => openUrl(link.url)}
                >
                  <Ionicons name={link.icon} size={20} color={link.color} />
                  <Text style={styles.socialLinkText}>{link.platform}</Text>
                  <Ionicons name="open-outline" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Legal & Support */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>The Boring Legal Stuff</Text>
            <View style={styles.legalLinks}>
              <TouchableOpacity
                style={styles.legalLink}
                onPress={() => router.push("/users/profile/privacy")}
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={18}
                  color="#1CC29F"
                />
                <Text style={styles.legalLinkText}>Privacy Policy</Text>
                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.legalLink}
                onPress={() => router.push("/users/profile/terms")}
              >
                <Ionicons
                  name="document-text-outline"
                  size={18}
                  color="#1CC29F"
                />
                <Text style={styles.legalLinkText}>Terms of Service</Text>
                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.legalLink}
                onPress={() => router.push("/users/profile/feedback")}
              >
                <Ionicons
                  name="help-circle-outline"
                  size={18}
                  color="#1CC29F"
                />
                <Text style={styles.legalLinkText}>Help & Support</Text>
                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Thank You */}
          <View style={styles.thankYouSection}>
            <Text style={styles.thankYouTitle}>
              Thanks for Using SplitBudget! 🙏
            </Text>
            <Text style={styles.thankYouText}>
              You're helping make financial management less chaotic for
              everyone. Together, we're building something that actually works
              for real people with real money problems! 🎉
            </Text>
            <Text style={styles.copyright}>
              © 2025 SplitBudget. Made with ❤️, 🍜, 🧡 and a lot of
              determination.
            </Text>
          </View>
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  appInfoSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 32,
    marginBottom: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  appIconText: {
    fontSize: 32,
  },
  appName: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
  },
  appTagline: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 8,
    fontStyle: "italic",
  },
  versionInfo: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  founderCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#1CC29F",
  },
  founderAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#1CC29F",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  companyStory: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 24,
    marginBottom: 12,
  },
  valuesList: {
    gap: 16,
  },
  valueItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  valueEmoji: {
    fontSize: 24,
    marginRight: 16,
    marginTop: 2,
  },
  valueContent: {
    flex: 1,
  },
  valueTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  valueText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },

  founderInitials: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  founderInfo: {
    flex: 1,
  },
  founderName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  founderTitle: {
    fontSize: 14,
    color: "#1CC29F",
    fontWeight: "600",
    marginBottom: 2,
  },
  founderYear: {
    fontSize: 12,
    color: "#6B7280",
  },
  founderStory: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 24,
    marginBottom: 12,
  },
  highlight: {
    fontWeight: "700",
    color: "#1CC29F",
  },
  missionText: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 24,
    marginBottom: 12,
  },
  featuresList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  storyText: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 24,
    marginBottom: 12,
  },
  funFactsList: {
    gap: 12,
  },
  funFact: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 12,
  },
  funFactEmoji: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  funFactText: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  connectText: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
    marginBottom: 16,
  },
  socialLinks: {
    gap: 12,
  },
  socialLink: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
  },
  socialLinkText: {
    flex: 1,
    fontSize: 15,
    color: "#374151",
    marginLeft: 12,
  },
  legalLinks: {
    gap: 8,
  },
  legalLink: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
  },
  legalLinkText: {
    flex: 1,
    fontSize: 15,
    color: "#374151",
    marginLeft: 12,
  },
  thankYouSection: {
    backgroundColor: "#F0FDF4",
    borderRadius: 16,
    padding: 24,
    marginBottom: 100,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1CC29F",
  },
  thankYouTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  thankYouText: {
    fontSize: 15,
    color: "#374151",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 16,
  },
  copyright: {
    fontSize: 13,
    color: "#9CA3AF",
    textAlign: "center",
  },
})
