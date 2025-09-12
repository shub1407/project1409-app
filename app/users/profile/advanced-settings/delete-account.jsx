// screens/DeleteAccountScreen.js
import { Ionicons } from "@expo/vector-icons"
import axios from "axios"
import { router } from "expo-router"
import * as SecureStore from "expo-secure-store"
import { useEffect, useState } from "react"
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { useStyles } from "../../../../src/context/StyleContext"

import { useAuth } from "../../../../src/context/AuthContext"
import { baseUrl } from "../../../../src/utility/constant"

export default function DeleteAccountScreen() {
  const [confirmationText, setConfirmationText] = useState("")
  const [deleteReason, setDeleteReason] = useState("")
  const [additionalComments, setAdditionalComments] = useState("")
  const [loading, setLoading] = useState(false)
  const [isConfirmationValid, setIsConfirmationValid] = useState(false)
  const { signOut } = useAuth()
  const { setStatusBarStyle } = useStyles()

  useEffect(() => {
    setStatusBarStyle({
      backgroundColor: "#EF4444",
      barStyle: "light",
    })
  }, [])

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut()
          router.replace("/(auth)/login")
        },
      },
    ])
  }

  // Check if confirmation text matches exactly
  useEffect(() => {
    setIsConfirmationValid(
      confirmationText.toLowerCase().trim() === "delete my account"
    )
  }, [confirmationText])

  const deleteReasons = [
    {
      value: "not_useful",
      label: "App is not useful for me",
      icon: "thumbs-down-outline",
    },
    {
      value: "too_complex",
      label: "Too complex to use",
      icon: "help-circle-outline",
    },
    {
      value: "privacy_concerns",
      label: "Privacy concerns",
      icon: "shield-outline",
    },
    {
      value: "switching_apps",
      label: "Switching to another app",
      icon: "swap-horizontal-outline",
    },
    {
      value: "temporary_break",
      label: "Taking a temporary break",
      icon: "pause-outline",
    },
    {
      value: "other",
      label: "Other reason",
      icon: "ellipsis-horizontal-outline",
    },
  ]

  const confirmDeleteAccount = async () => {
    if (!isConfirmationValid) {
      Alert.alert(
        "Confirmation Required",
        "Please type 'delete my account' exactly as shown to confirm."
      )
      return
    }

    Alert.alert(
      "Final Confirmation",
      "Are you absolutely sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Forever",
          style: "destructive",
          onPress: performAccountDeletion,
        },
      ]
    )
  }

  const performAccountDeletion = async () => {
    setLoading(true)
    try {
      // Call your API to delete the account
      await axios.delete(`${baseUrl}/auth/delete-account`, {
        data: {
          reason: deleteReason,
          additionalComments: additionalComments,
          confirmationText: confirmationText,
        },
        headers: {
          Authorization: `Bearer ${await SecureStore.getItemAsync(
            "authToken"
          )}`,
        },
      })

      // Clear all stored data
      await SecureStore.deleteItemAsync("authToken")
      await SecureStore.deleteItemAsync("userProfile")

      Alert.alert(
        "Account Deleted",
        "Your account has been successfully deleted. Thank you for using SplitBudget.",
        [
          {
            text: "OK",
            onPress: () => {
              // Navigate to login/onboarding screen
              router.replace("/(auth)/login")
            },
          },
        ]
      )
    } catch (error) {
      console.error("Account deletion error:", error)
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Failed to delete account. Please try again or contact support."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#EF4444" />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Delete Account</Text>
          <View style={styles.placeholder} />
        </View>

        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Warning Section */}
            <View style={styles.warningCard}>
              <View style={styles.warningHeader}>
                <Ionicons name="warning" size={32} color="#EF4444" />
                <Text style={styles.warningTitle}>
                  This action is permanent!
                </Text>
              </View>
              <Text style={styles.warningText}>
                Deleting your account will permanently remove all your data
                including:
              </Text>
              <View style={styles.warningList}>
                <View style={styles.warningItem}>
                  <Ionicons name="receipt-outline" size={16} color="#7F1D1D" />
                  <Text style={styles.warningItemText}>
                    All transactions and expenses
                  </Text>
                </View>
                <View style={styles.warningItem}>
                  <Ionicons name="people-outline" size={16} color="#7F1D1D" />
                  <Text style={styles.warningItemText}>
                    Group memberships and shared expenses
                  </Text>
                </View>
                <View style={styles.warningItem}>
                  <Ionicons
                    name="pie-chart-outline"
                    size={16}
                    color="#7F1D1D"
                  />
                  <Text style={styles.warningItemText}>
                    Budget goals and financial data
                  </Text>
                </View>
                <View style={styles.warningItem}>
                  <Ionicons name="settings-outline" size={16} color="#7F1D1D" />
                  <Text style={styles.warningItemText}>
                    Account settings and preferences
                  </Text>
                </View>
              </View>
            </View>

            {/* Alternative Options */}
            <View style={styles.alternativeCard}>
              <Text style={styles.alternativeTitle}>
                Consider these alternatives:
              </Text>

              <TouchableOpacity
                style={styles.alternativeOption}
                onPress={handleSignOut}
              >
                <Ionicons name="log-out-outline" size={20} color="#1CC29F" />
                <View style={styles.alternativeContent}>
                  <Text style={styles.alternativeOptionTitle}>
                    Sign Out Instead
                  </Text>
                  <Text style={styles.alternativeOptionText}>
                    Keep your data safe and sign back in anytime
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.alternativeOption}>
                <Ionicons
                  name="help-circle-outline"
                  size={20}
                  color="#3B82F6"
                />
                <View style={styles.alternativeContent}>
                  <Text style={styles.alternativeOptionTitle}>
                    Contact Support
                  </Text>
                  <Text style={styles.alternativeOptionText}>
                    Get help with any issues you're experiencing
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.alternativeOption}>
                <Ionicons name="download-outline" size={20} color="#8B5CF6" />
                <View style={styles.alternativeContent}>
                  <Text style={styles.alternativeOptionTitle}>
                    Export Your Data
                  </Text>
                  <Text style={styles.alternativeOptionText}>
                    Download your data before deleting (Coming Soon)
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Deletion Form */}
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>
                Still want to delete your account?
              </Text>

              {/* Reason Selection */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Why are you leaving? (Optional)
                </Text>
                <View style={styles.reasonGrid}>
                  {deleteReasons.map((reason) => (
                    <TouchableOpacity
                      key={reason.value}
                      style={[
                        styles.reasonOption,
                        deleteReason === reason.value && styles.reasonSelected,
                      ]}
                      onPress={() => setDeleteReason(reason.value)}
                    >
                      <Ionicons
                        name={reason.icon}
                        size={20}
                        color={
                          deleteReason === reason.value ? "#EF4444" : "#6B7280"
                        }
                      />
                      <Text
                        style={[
                          styles.reasonText,
                          deleteReason === reason.value &&
                            styles.reasonTextSelected,
                        ]}
                      >
                        {reason.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Additional Comments */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Additional comments (Optional)
                </Text>
                <TextInput
                  style={styles.textArea}
                  value={additionalComments}
                  onChangeText={setAdditionalComments}
                  placeholder="Tell us more about your experience or how we could improve..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  maxLength={500}
                />
              </View>

              {/* Confirmation Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Type "delete my account" to confirm:
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    isConfirmationValid && styles.inputValid,
                    confirmationText &&
                      !isConfirmationValid &&
                      styles.inputInvalid,
                  ]}
                  value={confirmationText}
                  onChangeText={(text) => {
                    console.log("Input text:", text) // Debug log
                    setConfirmationText(text)
                  }}
                  placeholder="delete my account"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="off"
                  spellCheck={false}
                  textContentType="none"
                />
                {confirmationText && !isConfirmationValid && (
                  <Text style={styles.errorText}>
                    Please type exactly: "delete my account"
                  </Text>
                )}
                {isConfirmationValid && (
                  <Text style={styles.successText}>
                    ✓ Confirmation verified
                  </Text>
                )}

                {/* Debug info - remove in production */}
                <Text style={styles.debugText}>
                  Current: "{confirmationText}" | Length:{" "}
                  {confirmationText.length} | Valid:{" "}
                  {isConfirmationValid ? "Yes" : "No"}
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => router.back()}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.deleteButton,
                    (!isConfirmationValid || loading) &&
                      styles.deleteButtonDisabled,
                  ]}
                  onPress={confirmDeleteAccount}
                  disabled={!isConfirmationValid || loading}
                >
                  <Text style={styles.deleteButtonText}>
                    {loading ? "Deleting..." : "Delete Forever"}
                  </Text>
                  {!loading && (
                    <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
    backgroundColor: "#EF4444",
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
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  warningCard: {
    backgroundColor: "#FEF2F2",
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  warningHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  warningTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#DC2626",
    marginTop: 8,
  },
  warningText: {
    fontSize: 16,
    color: "#7F1D1D",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 24,
  },
  warningList: {
    gap: 12,
  },
  warningItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  warningItemText: {
    fontSize: 14,
    color: "#7F1D1D",
    flex: 1,
  },
  alternativeCard: {
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
  alternativeTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  alternativeOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    marginBottom: 12,
  },
  alternativeContent: {
    marginLeft: 12,
    flex: 1,
  },
  alternativeOptionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  alternativeOptionText: {
    fontSize: 14,
    color: "#6B7280",
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    marginBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  reasonGrid: {
    gap: 8,
  },
  reasonOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  reasonSelected: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  reasonText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 12,
    fontWeight: "500",
  },
  reasonTextSelected: {
    color: "#EF4444",
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#111827",
    minHeight: 50,
  },
  inputValid: {
    borderColor: "#1CC29F",
    backgroundColor: "#F0FDF4",
  },
  inputInvalid: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  textArea: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
    height: 100,
    textAlignVertical: "top",
  },
  errorText: {
    fontSize: 14,
    color: "#EF4444",
    marginTop: 8,
    fontWeight: "500",
  },
  successText: {
    fontSize: 14,
    color: "#1CC29F",
    marginTop: 8,
    fontWeight: "500",
  },
  debugText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    fontStyle: "italic",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  deleteButton: {
    flex: 1,
    backgroundColor: "#EF4444",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  deleteButtonDisabled: {
    opacity: 0.4,
    backgroundColor: "#9CA3AF",
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
})
