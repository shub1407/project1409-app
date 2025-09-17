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
  const currentDate = "September 16, 2025"

  const sections = [
    {
      title: "Acceptance and Eligibility",
      content: `By downloading, installing, accessing, or using the Koiny mobile application ("App"), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service ("Terms").

If you do not agree to these Terms, you must not download, install, or use the App. These Terms constitute a legally binding agreement between you and Koiny ("we," "us," or "our").

Eligibility Requirements:
• You must be at least 18 years old to use this App
• If you are between 13-17 years old, you may use the App only with verifiable parental or guardian consent
• Children under 13 are prohibited from using the App
• You must provide accurate information during registration`,
    },
    {
      title: "Description of Service",
      content: `Koiny is a personal finance management application that provides:

Core Features:
• Personal expense and income tracking
• Budget management and financial planning tools
• Account balance monitoring across multiple accounts
• Transaction categorization and reporting
• Data visualization and financial analytics
• Offline-first functionality with local SQLite data storage
• Optional cloud synchronization across devices (account data only)

Service Availability:
• The App is provided "as is" and may be updated, modified, or discontinued at our sole discretion with 30 days advance notice
• We strive for 99.9% uptime but cannot guarantee uninterrupted service
• Features may vary based on device capabilities and operating system`,
    },
    {
      title: "User Account and Data Management",
      content: `Account Creation Requirements:
• Valid email address for authentication
• Secure password or authentication via Google Sign-In
• Accurate and complete registration information
• Agreement to these Terms and our Privacy Policy

Your Responsibilities:
• Maintain confidentiality of account credentials
• Accept responsibility for all activities under your account
• Immediately notify us of unauthorized access via legal@koiny.in
• Keep account information current and accurate
• Use the App only for personal financial tracking

Account Security:
• We implement industry-standard security measures
• Authentication tokens are stored securely using device keychain/keystore
• We reserve the right to suspend accounts with false information or suspicious activity`,
    },
    {
      title: "Data Collection and Privacy Compliance",
      content: `Data We Access:
• Personal Information: Email, name, authentication data
• Financial Data: Transaction records, balances, categories (stored locally)
• Device Information: Device type, OS version, app performance data
• Usage Data: App interactions, features used, preferences

Data Storage and Security:
• Financial data is stored locally on your device using encrypted SQLite database
• Only account information is stored on our secure servers
• All data transmission uses HTTPS/TLS encryption
• Passwords are hashed using industry-standard bcrypt
• We never sell or share your personal financial data with third parties

Data Retention:
• Account data is stored until you delete your account
• Local data remains on your device until app uninstallation
• Account data is automatically deleted within 1 days of deletion request
• You can export your data before deletion

For complete details, please review our Privacy Policy.`,
    },
    {
      title: "Acceptable Use and Prohibited Activities",
      content: `Permitted Uses:
• Personal expense tracking and budget management
• Storing financial data for personal use
• Using all features as intended for individual financial management

Prohibited Activities - You agree NOT to:
• Use the App for illegal activities, money laundering, or fraudulent purposes
• Use the App for commercial business accounting or professional financial services
• Attempt to gain unauthorized access to our systems or other users' accounts
• Upload malicious code, viruses, or harmful software
• Share your account credentials with third parties
• Reverse engineer, decompile, or disassemble the App
• Violate any applicable laws, regulations, or third-party rights
• Use automated systems to access the App without permission
• Impersonate others or provide false information
• Interfere with the App's functionality or other users' experience

Enforcement:
• Violation of these terms may result in immediate account suspension or termination
• We reserve the right to investigate violations and cooperate with law enforcement`,
    },
    {
      title: "Financial Services Disclaimer",
      content: `Important Legal Disclaimers:

NOT A FINANCIAL INSTITUTION:
• Koiny is NOT a bank, financial institution, or licensed financial advisor
• We do NOT provide financial, investment, tax, or legal advice
• We are NOT licensed to provide financial services in any jurisdiction
• The App is a personal finance tracking tool only

USER RESPONSIBILITY:
• All financial decisions are your sole responsibility
• You are responsible for the accuracy of all data you enter
• You must verify all calculations and data independently
• Consult qualified professionals for financial, tax, or investment advice
• The App is for personal use only, not for business accounting

LIABILITY LIMITATIONS:
• We cannot guarantee error-free calculations or data processing
• We are not responsible for financial losses based on App data
• Use of the App does not create a fiduciary relationship
• We disclaim all responsibility for financial decisions made using the App`,
    },
    {
      title: "Subscription and Payment Terms",
      content: `Service Tiers:
• Free Features: Basic expense tracking, limited categories, local storage
• Premium Features: Enhanced reporting, unlimited categories, advanced analytics, priority support

Subscription Details:
• Premium subscriptions are processed through your device's app store (Google Play Store/Apple App Store)
• Subscriptions automatically renew unless cancelled 24 hours before renewal
• Subscription management occurs through your app store account settings
• Pricing may change with 30 days advance written notice

Refund Policy:
• Refunds are handled according to your app store's policies
• We do not process refunds directly
• Contact your app store's customer service for refund requests
• Failure to pay subscription fees will result in loss of premium features

Payment Processing:
• All payments are processed securely by Google Play Store or Apple App Store
• We do not store payment information on our servers
• Billing questions should be directed to your app store`,
    },
    {
      title: "Data Rights and User Control",
      content: `Your Data Rights:
• Ownership: You own all personal financial data you input
• Access: View and review all your personal data
• Export: Download your data in standard CSV/JSON formats
• Correction: Update or correct inaccurate information
• Deletion: Request complete account and data deletion
• Portability: Transfer your data to other services

Data Control Features:
• Account deletion available in Website
• Data export available through App interface
• Real-time data editing and correction
• Granular privacy controls for data sharing (none by default)

Data Deletion Process:
• Account deletion can be requested through Koiny.in/delete-account or by contacting legal@koiny.in
• Account data is permanently deleted within 1 days
• Local device data remains until App uninstallation
• Deletion confirmation provided via email
• Some data may be retained for legal compliance (anonymized)`,
    },
    {
      title: "Third-Party Services and Integrations",
      content: `Third-Party Services We Use:
• Google Sign-In: For authentication (subject to Google's Privacy Policy)
• Firebase/Google Cloud: For account authentication and app functionality
• Analytics Services: For app performance monitoring (anonymized data only)

Third-Party Policies:
• Google Sign-In users are subject to Google's Terms of Service and Privacy Policy
• Firebase usage is governed by Google's terms and privacy policies
• We evaluate all third-party SDKs for privacy and security compliance

Data Sharing Limitations:
• We do NOT share your personal financial data with any third parties
• Only anonymized, aggregated usage data may be shared for app improvement
• Authentication is handled securely through established OAuth protocols
• No financial data is transmitted to third-party services

Integration Security:
• All third-party integrations use secure, encrypted connections
• We regularly audit third-party services for security compliance
• Users can opt out of analytics data collection in App settings`,
    },
    {
      title: "Intellectual Property and License",
      content: `Our Intellectual Property:
• The App and all content (software, design, text, graphics, logos, trademarks) are owned by Koiny
• Protected by Indian and international intellectual property laws
• All rights not expressly granted are reserved

License to You:
• We grant you a limited, non-exclusive, non-transferable, revocable license
• License is for personal use only
• Valid only while these Terms are in effect

Restrictions:
• You may not copy, modify, distribute, or sell the App or its content
• No reverse engineering, decompiling, or disassembling
• No use of our trademarks or logos without written permission
• No creation of derivative works based on the App
• No commercial use of App content or functionality

User-Generated Content:
• You retain ownership of financial data you input
• You grant us a limited license to process your data as described in our Privacy Policy
• You are responsible for the accuracy of information you provide`,
    },
    {
      title: "Service Availability and Modifications",
      content: `Service Availability:
• We strive to maintain 99.9% uptime but cannot guarantee uninterrupted service
• Planned maintenance will be announced 24 hours in advance when possible
• Emergency maintenance may occur without advance notice
• Service may be temporarily unavailable due to technical issues

App Updates and Modifications:
• We may update the App to improve functionality, security, or compliance
• Updates may be required for continued use
• We may add, modify, or remove features with reasonable notice
• Critical security updates may be mandatory

Service Discontinuation:
• We may discontinue the service with 90 days written notice
• Users will be provided opportunity to export data before discontinuation
• Partial feature discontinuation requires 30 days notice
• Free features will always include basic data export functionality

Compatibility:
• We support current and immediately previous versions of Android and iOS
• Older operating systems may have limited functionality
• Device compatibility requirements are specified in app store listings`,
    },
    {
      title: "Limitation of Liability and Warranties",
      content: `DISCLAIMER OF WARRANTIES:
TO THE MAXIMUM EXTENT PERMITTED BY LAW:
• The App is provided "AS IS" and "AS AVAILABLE"
• We disclaim all warranties, express or implied
• No warranty of merchantability, fitness for particular purpose, or non-infringement
• No guarantee of error-free, uninterrupted, or secure service

LIMITATION OF LIABILITY:
• Our total liability is limited to the amount you paid for the App in the 12 months preceding any claim
• We are not liable for indirect, incidental, special, consequential, or punitive damages
• No liability for data loss, financial losses, or business interruption
• No responsibility for decisions made based on App data
• Some jurisdictions may not allow these limitations

FORCE MAJEURE:
• We are not liable for delays or failures due to circumstances beyond our control
• Includes natural disasters, government actions, internet outages, or third-party service failures

INDEMNIFICATION:
• You agree to indemnify us against claims arising from your use of the App
• Includes violations of these Terms or applicable laws`,
    },
    {
      title: "Account Termination and Suspension",
      content: `User-Initiated Termination:
• You may terminate your account at any time through App settings
• You may also request termination by contacting legal@koiny.in
• Account termination is effective immediately upon request
• Data deletion follows our 90-day retention policy

Service-Initiated Termination:
We may suspend or terminate your account if you:
• Violate these Terms of Service or our Privacy Policy
• Use the App for illegal purposes or fraudulent activity
• Provide false information during registration
• Engage in abusive behavior toward our support team
• Fail to pay subscription fees (for premium features)
• Use the App in ways that could harm our service or other users

Termination Effects:
• Immediate loss of access to your account and App features
• Account data deleted within 90 days according to our Privacy Policy
• Local device data remains until App uninstallation
• Premium subscriptions cancelled (no partial refunds unless required by law)
• You remain liable for charges incurred before termination

Account Recovery:
• Suspended accounts may be recoverable if violations are remedied
• Terminated accounts cannot be recovered
• New account creation allowed unless permanently banned`,
    },
    {
      title: "Updates to Terms and Notification",
      content: `Modification Rights:
• We reserve the right to modify these Terms at any time
• Changes become effective 30 days after notification for material changes
• Non-material changes (typos, clarifications) are effective immediately
• Continued use after changes indicates acceptance

Notification Methods:
• In-app notifications for all users
• Email notifications to registered email addresses
• Prominent notices displayed in the App
• Website posting at koiny.in/terms

User Options:
• If you disagree with changes, stop using the App before they take effect
• You may delete your account if you disagree with modifications
• Contact legal@koiny.in with questions about changes

Version Control:
• Previous versions of Terms are archived and available upon request
• Current version date is always displayed in the App and website
• Material changes are highlighted in notifications`,
    },
    {
      title: "Governing Law and Dispute Resolution",
      content: `Governing Law:
• These Terms are governed by the laws of India
• Any disputes are subject to the exclusive jurisdiction of courts in Jharkhand, India
• Indian law applies regardless of your location

Dispute Resolution Process:
1. Good Faith Negotiation: Contact legal@koiny.in to attempt resolution
2. Mediation: If negotiation fails, disputes may be submitted to mediation
3. Arbitration: Binding arbitration under the Indian Arbitration and Conciliation Act, 2015
4. Court Proceedings: Only if arbitration is unavailable or inappropriate

Class Action Waiver:
• You agree to resolve disputes individually, not as part of class actions
• No consolidation of claims with other users
• Arbitration will be conducted on an individual basis only

Legal Compliance:
• These Terms comply with Indian consumer protection laws
• International users are subject to Indian law for App-related matters
• We cooperate with legal authorities when required by law`,
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
            <View style={styles.iconContainer}>
              <Ionicons name="document-text" size={32} color="#1CC29F" />
            </View>
            <Text style={styles.introTitle}>Terms of Service</Text>
            <Text style={styles.introText}>Effective Date: {currentDate}</Text>
            <Text style={styles.introDescription}>
              Please read these Terms of Service carefully before using Koiny.
              These terms govern your use of our personal finance management
              application and constitute a legally binding agreement.
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
              For legal questions, terms clarification, or dispute resolution,
              please contact us:
            </Text>
            <View style={styles.contactInfo}>
              <View style={styles.contactItem}>
                <Ionicons name="mail-outline" size={18} color="#1CC29F" />
                <Text style={styles.contactDetail}>legal@koiny.in</Text>
              </View>

              <View style={styles.contactItem}>
                <Ionicons name="location-outline" size={18} color="#1CC29F" />
                <Text style={styles.contactDetail}>
                  Hazaribagh, Jharkhand, India
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.legalNotice}>
            <Text style={styles.legalNoticeTitle}>Legal Notice</Text>
            <Text style={styles.legalNoticeText}>
              This document constitutes the complete Terms of Service between
              you and Koiny. These terms were last updated on {currentDate} and
              are effective immediately for new users and 30 days after
              notification for existing users.
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
    marginBottom: 20,
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
  legalNotice: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    borderLeftWidth: 4,
    borderLeftColor: "#1CC29F",
  },
  legalNoticeTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  legalNoticeText: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 20,
    fontStyle: "italic",
  },
})
