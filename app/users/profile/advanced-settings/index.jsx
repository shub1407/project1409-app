// screens/AdvancedSettingsScreen.js
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

export default function AdvancedSettingsScreen() {
  const handleDataExport = (type) => {
    Alert.alert(
      "Coming Soon! 🚀",
      `${type} export feature is coming soon. We're working hard to bring you the best data export experience!`,
      [{ text: "OK" }]
    )
  }

  const handleDataImport = () => {
    Alert.alert(
      "Coming Soon! 📥",
      "Data import feature is coming soon. You'll be able to import your financial data from various formats including CSV and Excel!",
      [{ text: "OK" }]
    )
  }

  const handleDeleteAccount = () => {
    router.push("/users/profile/advanced-settings/delete-account")
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
          <Text style={styles.headerTitle}>Advanced Settings</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Data Management Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Management</Text>
            <Text style={styles.sectionSubtitle}>
              Manage your personal finance data
            </Text>

            {/* Export Options */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                  <Ionicons name="download-outline" size={24} color="#1CC29F" />
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>Export Data</Text>
                  <Text style={styles.cardDescription}>
                    Download your financial data in various formats
                  </Text>
                </View>
              </View>

              <View style={styles.exportOptions}>
                <TouchableOpacity
                  style={styles.exportButton}
                  onPress={() => handleDataExport("Full Data")}
                >
                  <Ionicons name="folder-outline" size={20} color="#3B82F6" />
                  <Text style={styles.exportButtonText}>Full Data</Text>
                  <View style={styles.comingSoonBadge}>
                    <Text style={styles.comingSoonText}>Soon</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.exportButton}
                  onPress={() => handleDataExport("Transactions")}
                >
                  <Ionicons name="receipt-outline" size={20} color="#F59E0B" />
                  <Text style={styles.exportButtonText}>Transactions</Text>
                  <View style={styles.comingSoonBadge}>
                    <Text style={styles.comingSoonText}>Soon</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.exportButton}
                  onPress={() => handleDataExport("Groups")}
                >
                  <Ionicons name="people-outline" size={20} color="#8B5CF6" />
                  <Text style={styles.exportButtonText}>Groups</Text>
                  <View style={styles.comingSoonBadge}>
                    <Text style={styles.comingSoonText}>Soon</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.exportButton}
                  onPress={() => handleDataExport("Budgets")}
                >
                  <Ionicons
                    name="pie-chart-outline"
                    size={20}
                    color="#EF4444"
                  />
                  <Text style={styles.exportButtonText}>Budgets</Text>
                  <View style={styles.comingSoonBadge}>
                    <Text style={styles.comingSoonText}>Soon</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Import Data */}
            <TouchableOpacity style={styles.card} onPress={handleDataImport}>
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                  <Ionicons
                    name="cloud-upload-outline"
                    size={24}
                    color="#8B5CF6"
                  />
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>Import Data</Text>
                  <Text style={styles.cardDescription}>
                    Import financial data from CSV, Excel, or other apps
                  </Text>
                </View>
                <View style={styles.comingSoonBadge}>
                  <Text style={styles.comingSoonText}>Soon</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Privacy & Security Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy & Security</Text>
            <Text style={styles.sectionSubtitle}>
              Manage your account and privacy settings
            </Text>

            {/* Delete Account */}
            <TouchableOpacity
              style={[styles.card, styles.dangerCard]}
              onPress={handleDeleteAccount}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, styles.dangerIcon]}>
                  <Ionicons name="trash-outline" size={24} color="#EF4444" />
                </View>
                <View style={styles.cardContent}>
                  <Text style={[styles.cardTitle, styles.dangerText]}>
                    Delete Account
                  </Text>
                  <Text style={styles.cardDescription}>
                    Permanently delete your account and all data
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#EF4444" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Help Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Need Help?</Text>

            <TouchableOpacity
              style={styles.helpCard}
              onPress={() => {
                router.push("/users/profile/feedback")
              }}
            >
              <Ionicons name="help-circle-outline" size={24} color="#1CC29F" />
              <View style={styles.helpContent}>
                <Text style={styles.helpTitle}>Contact Support</Text>
                <Text style={styles.helpDescription}>
                  Get help with data management and account settings
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.helpCard}
              onPress={() => {
                router.push("/users/profile/privacy")
              }}
            >
              <Ionicons
                name="document-text-outline"
                size={24}
                color="#6B7280"
              />
              <View style={styles.helpContent}>
                <Text style={styles.helpTitle}>Privacy Policy</Text>
                <Text style={styles.helpDescription}>
                  Learn how we protect your data
                </Text>
              </View>
            </TouchableOpacity>
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 20,
  },
  card: {
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
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  exportOptions: {
    marginTop: 16,
    gap: 12,
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  exportButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    marginLeft: 12,
    flex: 1,
  },
  comingSoonBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  comingSoonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#D97706",
  },
  dangerCard: {
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  dangerIcon: {
    backgroundColor: "#FEF2F2",
  },
  dangerText: {
    color: "#EF4444",
  },
  helpCard: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  helpContent: {
    marginLeft: 16,
    flex: 1,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  helpDescription: {
    fontSize: 14,
    color: "#6B7280",
  },
})
