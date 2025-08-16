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
  const teamMembers = [
    { name: "John Doe", role: "Founder & CEO", icon: "person-outline" },
    { name: "Jane Smith", role: "CTO", icon: "code-outline" },
    {
      name: "Mike Johnson",
      role: "Lead Designer",
      icon: "color-palette-outline",
    },
  ]

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
      url: "https://twitter.com/splitbudget",
      color: "#1DA1F2",
    },
    {
      platform: "Instagram",
      icon: "logo-instagram",
      url: "https://instagram.com/splitbudget",
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
          <Text style={styles.headerTitle}>About Us</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content}>
          {/* App Info */}
          <View style={styles.appInfoSection}>
            <View style={styles.appIcon}>
              <Text style={styles.appIconText}>💰</Text>
            </View>
            <Text style={styles.appName}>SplitBudget</Text>
            <Text style={styles.appTagline}>Smart Finance Management</Text>
            <Text style={styles.versionInfo}>
              Version 1.0.0 (Build 2025.08.16)
            </Text>
          </View>

          {/* Mission Statement */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Our Mission</Text>
            <Text style={styles.missionText}>
              We believe that managing money shouldn't be complicated.
              SplitBudget is designed to make personal finance simple,
              intuitive, and accessible to everyone.
            </Text>
            <Text style={styles.missionText}>
              Whether you're tracking personal expenses or splitting costs with
              friends, our app provides the tools you need to stay on top of
              your finances.
            </Text>
          </View>

          {/* Key Features */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Features</Text>
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

          {/* Our Story */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Our Story</Text>
            <Text style={styles.storyText}>
              SplitBudget was born out of frustration with existing finance apps
              that were either too complex or too simple. We wanted to create
              something that strikes the perfect balance - powerful enough for
              serious budgeting, yet simple enough for everyday use.
            </Text>
            <Text style={styles.storyText}>
              Founded in 2024 by a team of finance enthusiasts and tech experts,
              we've been on a mission to help people take control of their
              financial lives through smart, user-friendly technology.
            </Text>
          </View>

          {/* Team */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Meet the Team</Text>
            <View style={styles.teamList}>
              {teamMembers.map((member, index) => (
                <View key={index} style={styles.teamMember}>
                  <View style={styles.memberAvatar}>
                    <Ionicons name={member.icon} size={20} color="#1CC29F" />
                  </View>
                  <View>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <Text style={styles.memberRole}>{member.role}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Contact & Social */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Connect With Us</Text>
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
            <Text style={styles.sectionTitle}>Support & Legal</Text>
            <View style={styles.legalLinks}>
              <TouchableOpacity
                style={styles.legalLink}
                onPress={() => router.push("/profile/privacy")}
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
                onPress={() => router.push("/profile/terms")}
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
                onPress={() => router.push("/profile/feedback")}
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
            <Text style={styles.thankYouTitle}>Thank You!</Text>
            <Text style={styles.thankYouText}>
              Thank you for choosing SplitBudget. We're committed to helping you
              achieve your financial goals and making money management a breeze.
            </Text>
            <Text style={styles.copyright}>
              © 2024 SplitBudget. All rights reserved.
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
  teamList: {
    gap: 12,
  },
  teamMember: {
    flexDirection: "row",
    alignItems: "center",
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  memberRole: {
    fontSize: 14,
    color: "#6B7280",
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
    marginBottom: 32,
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
