import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

export default function PrivacyPolicyScreen() {
  const sections = [
    {
      title: "Information We Collect",
      content: `We collect information you provide directly to us, such as when you create an account, add transactions, or contact us for support. This may include:

• Personal information (name, email, phone number)
• Financial data (account balances, transactions, categories)
• Usage data (app interactions, preferences)
• Device information (device type, operating system)`,
    },
    {
      title: "How We Use Your Information",
      content: `We use the information we collect to:

• Provide and maintain our services
• Process transactions and maintain account balances
• Send you notifications and updates
• Improve our app and develop new features
• Provide customer support
• Comply with legal obligations`,
    },
    {
      title: "Information Sharing",
      content: `We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:

• With your explicit consent
• To comply with legal obligations
• To protect our rights and prevent fraud
• With service providers who help us operate our app`,
    },
    {
      title: "Data Security",
      content: `We implement appropriate security measures to protect your information:

• Data encryption in transit and at rest
• Regular security assessments
• Access controls and authentication
• Secure data storage practices

However, no method of transmission over the internet is 100% secure.`,
    },
    {
      title: "Data Retention",
      content: `We retain your personal information for as long as necessary to:

• Provide our services
• Comply with legal obligations
• Resolve disputes
• Enforce our agreements

You can request deletion of your account and data at any time through the app settings.`,
    },
    {
      title: "Your Rights",
      content: `You have the right to:

• Access your personal information
• Correct inaccurate information
• Delete your account and data
• Export your data
• Withdraw consent
• File complaints with data protection authorities`,
    },
    {
      title: "Changes to This Policy",
      content: `We may update this privacy policy from time to time. We will notify you of any material changes by:

• Posting the updated policy in the app
• Sending an email notification
• Displaying a prominent notice

Your continued use of the app after changes constitutes acceptance of the updated policy.`,
    },
  ]

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
          <Text style={styles.headerTitle}>Privacy Policy</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.introSection}>
            <Text style={styles.introTitle}>Your Privacy Matters</Text>
            <Text style={styles.introText}>
              Last updated: September 13, 2025
            </Text>
            <Text style={styles.introDescription}>
              This privacy policy explains how Koiny collects, uses, and
              protects your personal information when you use our app.
            </Text>
          </View>

          {sections.map((section, index) => (
            <View key={index} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionContent}>{section.content}</Text>
            </View>
          ))}

          <View style={styles.contactSection}>
            <Text style={styles.contactTitle}>Contact Us</Text>
            <Text style={styles.contactText}>
              If you have any questions about this privacy policy or our data
              practices, please contact us:
            </Text>
            <View style={styles.contactInfo}>
              <View style={styles.contactItem}>
                <Ionicons name="mail-outline" size={18} color="#1CC29F" />
                <Text style={styles.contactDetail}>privacy@koiny.in</Text>
              </View>
              <View style={styles.contactItem}>
                <Ionicons name="location-outline" size={18} color="#1CC29F" />
                <Text style={styles.contactDetail}>
                  Hazaribagh, Jharkhand, India
                </Text>
              </View>
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
  introSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
  },
  introText: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
  },
  introDescription: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
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
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 24,
  },
  contactSection: {
    backgroundColor: "#F0FDF4",
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "#1CC29F",
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  contactText: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
    marginBottom: 16,
  },
  contactInfo: {
    gap: 12,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  contactDetail: {
    fontSize: 15,
    color: "#1CC29F",
    fontWeight: "500",
  },
})
