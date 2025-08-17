// screens/FeedbackScreen.js
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useState } from "react"
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import feedbackService from "../../../../src/services/feedbackService"

export default function FeedbackScreen() {
  const [feedbackType, setFeedbackType] = useState("bug")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const feedbackTypes = [
    {
      value: "bug",
      label: "Bug Report",
      icon: "bug-outline",
      color: "#EF4444",
    },
    {
      value: "feature",
      label: "Feature Request",
      icon: "bulb-outline",
      color: "#F59E0B",
    },
    {
      value: "improvement",
      label: "Improvement",
      icon: "trending-up-outline",
      color: "#1CC29F",
    },
    {
      value: "other",
      label: "Other",
      icon: "chatbubble-outline",
      color: "#6B7280",
    },
  ]

  const handleSubmit = async () => {
    // Validation
    if (!title.trim() || !description.trim()) {
      Alert.alert("Error", "Please fill in all required fields")
      return
    }

    if (title.length < 5) {
      Alert.alert("Error", "Title must be at least 5 characters long")
      return
    }

    if (description.length < 10) {
      Alert.alert("Error", "Description must be at least 10 characters long")
      return
    }

    setLoading(true)

    try {
      // Check if user is authenticated
      const isAuth = await feedbackService.isAuthenticated()
      if (!isAuth) {
        Alert.alert(
          "Authentication Required",
          "Please log in to submit feedback",
          [{ text: "OK", onPress: () => router.push("/auth/login") }]
        )
        return
      }

      const apiData = {
        type: feedbackType,
        title: title.trim(),
        description: description.trim(),
        email: email.trim() || undefined,
      }

      console.log("Submitting feedback:", apiData)

      // Submit feedback
      const result = await feedbackService.submitFeedback(apiData)

      if (result.success) {
        Alert.alert(
          "Thank You!",
          "Your feedback has been submitted successfully. We appreciate your input!",
          [
            {
              text: "OK",
              onPress: () => {
                // Reset form
                setTitle("")
                setDescription("")
                setEmail("")
                setFeedbackType("bug")
                router.back()
              },
            },
          ]
        )
      } else {
        Alert.alert(
          "Submission Failed",
          result.error || "Failed to submit feedback. Please try again."
        )
      }
    } catch (error) {
      console.error("Feedback submission error:", error)
      Alert.alert(
        "Error",
        "An unexpected error occurred. Please check your internet connection and try again."
      )
    } finally {
      setLoading(false)
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
          <Text style={styles.headerTitle}>Feedback</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.introSection}>
            <Text style={styles.introTitle}>We'd love to hear from you!</Text>
            <Text style={styles.introText}>
              Help us improve SplitBudget by reporting bugs or suggesting new
              features.
            </Text>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Feedback Type</Text>
            <View style={styles.typeSelector}>
              {feedbackTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeOption,
                    feedbackType === type.value && styles.selectedType,
                  ]}
                  onPress={() => setFeedbackType(type.value)}
                >
                  <View
                    style={[
                      styles.typeIcon,
                      { backgroundColor: `${type.color}15` },
                    ]}
                  >
                    <Ionicons name={type.icon} size={20} color={type.color} />
                  </View>
                  <Text
                    style={[
                      styles.typeLabel,
                      feedbackType === type.value && styles.selectedTypeLabel,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Brief summary of your feedback"
                maxLength={100}
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Please provide detailed information about your feedback"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                maxLength={1000}
                editable={!loading}
              />
              <Text style={styles.charCount}>
                {description.length}/1000 characters
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email (Optional)</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
              <Text style={styles.inputHint}>
                We'll only use this to follow up on your feedback
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                loading && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? "Submitting..." : "Submit Feedback"}
              </Text>
              {!loading && <Ionicons name="send" size={18} color="#FFFFFF" />}
            </TouchableOpacity>
          </View>

          <View style={styles.contactSection}>
            <Text style={styles.contactTitle}>Other Ways to Reach Us</Text>

            <TouchableOpacity style={styles.contactItem}>
              <Ionicons name="mail-outline" size={20} color="#1CC29F" />
              <Text style={styles.contactText}>support@splitbudget.com</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem}>
              <Ionicons name="logo-twitter" size={20} color="#1DA1F2" />
              <Text style={styles.contactText}>@splitbudgetapp</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem}>
              <Ionicons name="chatbubbles-outline" size={20} color="#25D366" />
              <Text style={styles.contactText}>WhatsApp Support</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  )
}

// Styles remain the same as in your original code
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
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  introText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  formSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  typeSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  typeOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  selectedType: {
    borderColor: "#1CC29F",
    backgroundColor: "#F0FDF4",
  },
  typeIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  selectedTypeLabel: {
    color: "#1CC29F",
    fontWeight: "600",
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  charCount: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "right",
    marginTop: 4,
  },
  inputHint: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: "#1CC29F",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 16,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  contactSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  contactText: {
    fontSize: 14,
    color: "#6B7280",
  },
})
