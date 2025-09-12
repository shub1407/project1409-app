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

export default function TermsScreen() {
  const sections = [
    {
      title: "Acceptance of Terms",
      content: `By downloading, installing, or using the Koiny app, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our app.

These terms constitute a legally binding agreement between you and Koiny.`,
    },
    {
      title: "Description of Service",
      content: `Koiny is a personal finance and expense management application that allows users to:

• Track personal expenses and income
• Manage multiple accounts and budgets
• Split expenses with groups
• Generate financial reports and analytics
• Set up scheduled transactions and reminders

The service is provided "as is" and may be updated from time to time.`,
    },
    {
      title: "User Accounts and Registration",
      content: `To use Koiny, you must:

• Provide accurate and complete registration information
• Maintain the confidentiality of your account credentials
• Be responsible for all activities under your account
• Notify us immediately of any unauthorized use
• Be at least 18 years old or have parental consent

You are solely responsible for maintaining the accuracy of your financial data.`,
    },
    {
      title: "Acceptable Use",
      content: `You agree not to:

• Use the app for illegal or unauthorized purposes
• Attempt to gain unauthorized access to our systems
• Upload malicious code or conduct cyber attacks
• Share your account credentials with others
• Use the app to process transactions for others commercially
• Violate any applicable laws or regulations

We reserve the right to suspend accounts that violate these terms.`,
    },
    {
      title: "Data and Privacy",
      content: `Your financial data belongs to you. We:

• Do not own your personal financial information
• Will not sell your data to third parties
• Use your data only as described in our Privacy Policy
• Implement security measures to protect your information
• Allow you to export or delete your data at any time

Please review our Privacy Policy for detailed information about data handling.`,
    },
    {
      title: "Subscription and Payments",
      content: `Koiny offers both free and premium features:

• Free features are available without payment
• Premium features require a paid subscription
• Subscriptions automatically renew unless cancelled
• Refunds are handled according to app store policies
• We may change pricing with 30 days notice

You can manage your subscription through your device's app store.`,
    },
    {
      title: "Limitation of Liability",
      content: `Koiny is provided for personal financial tracking only. We:

• Are not a licensed financial advisor or institution
• Do not provide financial, tax, or investment advice
• Are not responsible for financial decisions you make
• Cannot guarantee the app will be error-free or always available
• Limit our liability to the amount you paid for the service

Use the app at your own risk and consult professionals for financial advice.`,
    },
    {
      title: "Termination",
      content: `You may terminate your account at any time by:

• Deleting your account through app settings
• Uninstalling the app from your device
• Contacting our support team

We may terminate accounts that violate these terms. Upon termination:

• Your access to the service will cease
• Your data will be deleted according to our retention policy
• Premium features will no longer be available`,
    },
    {
      title: "Changes to Terms",
      content: `We may modify these terms at any time. Changes will be effective:

• Immediately upon posting in the app
• After providing reasonable notice for material changes
• Upon your continued use of the app after changes

We encourage you to review these terms periodically. If you disagree with changes, you should stop using the app.`,
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
          <Text style={styles.headerTitle}>Terms of Service</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.introSection}>
            <Text style={styles.introTitle}>Terms of Service</Text>
            <Text style={styles.introText}>
              Last updated: September 13, 2025
            </Text>
            <Text style={styles.introDescription}>
              Please read these Terms of Service carefully before using Koiny.
              These terms govern your use of our app and services.
            </Text>
          </View>

          {sections.map((section, index) => (
            <View key={index} style={styles.section}>
              <Text style={styles.sectionTitle}>
                {index + 1}. {section.title}
              </Text>
              <Text style={styles.sectionContent}>{section.content}</Text>
            </View>
          ))}

          <View style={styles.contactSection}>
            <Text style={styles.contactTitle}>
              Questions About These Terms?
            </Text>
            <Text style={styles.contactText}>
              If you have any questions about these Terms of Service, please
              contact us:
            </Text>
            <View style={styles.contactInfo}>
              <View style={styles.contactItem}>
                <Ionicons name="mail-outline" size={18} color="#7C3AED" />
                <Text style={styles.contactDetail}>legal@koiny.in</Text>
              </View>
              <View style={styles.contactItem}>
                <Ionicons name="globe-outline" size={18} color="#7C3AED" />
                <Text style={styles.contactDetail}>www.koiny.in/terms</Text>
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
    backgroundColor: "#F5F3FF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "#7C3AED",
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
    color: "#7C3AED",
    fontWeight: "500",
  },
})
