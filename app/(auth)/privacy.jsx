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
  const currentDate = "September 16, 2025"

  const sections = [
    {
      title: "Information We Collect",
      content: `We collect the following types of information when you use Koiny:

• Personal Information: Email address, name, and authentication data when you create an account or sign in with Google
• Financial Data: Transaction records, account balances, expense categories, and payment information you manually enter
• Device Information: Device type, operating system version, and app performance data
• Usage Data: How you interact with the app, features used, and app preferences
• Local Storage Data: All financial data is stored locally on your device using SQLite database for offline functionality`,
    },
    {
      title: "How We Use Your Information",
      content: `We use your information to:

• Provide and maintain our expense tracking services
• Authenticate your account and enable secure access
• Process and store your financial transactions locally
• Sync your data across your devices (when signed in)
• Improve app functionality and user experience
• Provide customer support and respond to inquiries
• Send important notifications about your account or app updates
• Ensure data security and prevent fraudulent activity`,
    },
    {
      title: "Data Storage and Security",
      content: `We implement comprehensive security measures:

• Local Storage: Your expense data is stored locally on your device using encrypted SQLite database
• Cloud Storage: Only your account information (email, authentication tokens) is stored on our secure servers
• Encryption: All data transmission uses HTTPS/TLS encryption
• Password Security: Passwords are hashed using industry-standard bcrypt
• Access Control: Authentication tokens are stored securely using device keychain/keystore
• No Third-Party Access: We never sell or share your personal financial data with third parties`,
    },
    {
      title: "Data Retention and Deletion",
      content: `Our data retention practices:

• Account Data: Stored on our servers until you delete your account
• Local Data: Remains on your device until you uninstall the app or clear app data
• Automatic Deletion: Account data is automatically deleted within 90 days of account deletion request
• User Control: You can delete your account and request data deletion at any time through app settings
• Backup Data: Any backup data is also deleted within the same timeframe`,
    },
    {
      title: "Third-Party Services",
      content: `We use the following third-party services:

• Google Sign-In: For authentication (subject to Google's privacy policy)
• Firebase/Cloud Services: For account authentication and app functionality
• Analytics Services: For app performance monitoring (anonymized data only)
• No Data Sharing: We do not share your personal financial data with any third-party services
• SDK Compliance: All third-party SDKs are evaluated for privacy compliance`,
    },
    {
      title: "Your Rights and Choices",
      content: `You have the following rights:

• Access: View and export your personal data
• Correction: Update or correct inaccurate information
• Deletion: Request deletion of your account and associated data
• Data Portability: Export your data in a standard format
• Withdraw Consent: Revoke permissions for data processing
• Account Control: Manage your account settings and preferences
• Contact Us: Submit privacy-related questions or requests`,
    },
    {
      title: "Children's Privacy",
      content: `Koiny is not intended for children under 13. We do not knowingly collect personal information from children under 13. If we discover that we have collected information from a child under 13, we will delete it immediately.`,
    },
    {
      title: "International Data Transfers",
      content: `Your data may be processed and stored in countries outside your residence. We ensure appropriate safeguards are in place for international data transfers in compliance with applicable privacy laws.`,
    },
    {
      title: "Changes to This Policy",
      content: `We may update this privacy policy periodically. We will notify you of material changes by:

• Posting updates in the app
• Sending email notifications to registered users  
• Displaying prominent notices in the app
• Providing at least 30 days notice for significant changes

Your continued use after changes indicates acceptance of the updated policy.`,
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
            <View style={styles.iconContainer}>
              <Ionicons name="shield-checkmark" size={32} color="#1CC29F" />
            </View>
            <Text style={styles.introTitle}>Privacy Policy</Text>
            <Text style={styles.introText}>Effective Date: {currentDate}</Text>
            <Text style={styles.introDescription}>
              This privacy policy describes how Koiny ("we", "our", or "us")
              collects, uses, and protects your information when you use our
              personal expense management application.
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
              For privacy-related questions or to exercise your rights, contact
              us:
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

// ... (same styles as before)

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
    alignItems: "center",
  },
  iconContainer: {
    width: 64,
    height: 64,
    backgroundColor: "rgba(28, 194, 159, 0.1)",
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  introText: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
    textAlign: "center",
  },
  introDescription: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
    textAlign: "center",
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
