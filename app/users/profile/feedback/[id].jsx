// screens/FeedbackDetailsScreen.js
import { Ionicons } from "@expo/vector-icons"
import { router, useLocalSearchParams } from "expo-router"
import { useEffect, useState } from "react"
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
import feedbackService from "../../../../src/services/api/feedbackService"

export default function FeedbackDetailsScreen() {
  const { id } = useLocalSearchParams()
  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFeedbackDetails()
  }, [id])

  const loadFeedbackDetails = async () => {
    try {
      const result = await feedbackService.getFeedbackById(id)
      if (result.success) {
        setFeedback(result.data.data)
      } else {
        Alert.alert("Error", result.error || "Failed to load feedback details")
        router.back()
      }
    } catch (error) {
      console.error("Load feedback details error:", error)
      Alert.alert("Error", "Failed to load feedback details")
      router.back()
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#F59E0B"
      case "in-progress":
        return "#3B82F6"
      case "resolved":
        return "#1CC29F"
      case "rejected":
        return "#EF4444"
      default:
        return "#6B7280"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return "time-outline"
      case "in-progress":
        return "sync-outline"
      case "resolved":
        return "checkmark-circle-outline"
      case "rejected":
        return "close-circle-outline"
      default:
        return "help-circle-outline"
    }
  }

  const getStatusMessage = (status) => {
    switch (status) {
      case "pending":
        return "Your feedback has been received and is waiting for review."
      case "in-progress":
        return "Our team is actively working on this feedback."
      case "resolved":
        return "This feedback has been addressed and implemented."
      case "rejected":
        return "This feedback was reviewed but cannot be implemented at this time."
      default:
        return "Status unknown."
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1CC29F" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (!feedback) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1CC29F" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Feedback not found</Text>
        </View>
      </SafeAreaView>
    )
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
          <Text style={styles.headerTitle}>Feedback Details</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content}>
          {/* Status Card */}
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <View
                style={[
                  styles.statusIcon,
                  { backgroundColor: `${getStatusColor(feedback.status)}15` },
                ]}
              >
                <Ionicons
                  name={getStatusIcon(feedback.status)}
                  size={24}
                  color={getStatusColor(feedback.status)}
                />
              </View>
              <View style={styles.statusInfo}>
                <Text
                  style={[
                    styles.statusTitle,
                    { color: getStatusColor(feedback.status) },
                  ]}
                >
                  {feedback.status.charAt(0).toUpperCase() +
                    feedback.status.slice(1)}
                </Text>
                <Text style={styles.statusMessage}>
                  {getStatusMessage(feedback.status)}
                </Text>
              </View>
            </View>
          </View>

          {/* Feedback Details */}
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Type</Text>
              <Text style={styles.detailValue}>
                {feedback.type.charAt(0).toUpperCase() + feedback.type.slice(1)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Title</Text>
              <Text style={styles.detailValue}>{feedback.title}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Description</Text>
              <Text style={[styles.detailValue, styles.descriptionText]}>
                {feedback.description}
              </Text>
            </View>

            {feedback.email && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Contact Email</Text>
                <Text style={styles.detailValue}>{feedback.email}</Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Submitted</Text>
              <Text style={styles.detailValue}>
                {formatDate(feedback.createdAt)}
              </Text>
            </View>

            {feedback.updatedAt &&
              feedback.updatedAt !== feedback.createdAt && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Last Updated</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(feedback.updatedAt)}
                  </Text>
                </View>
              )}

            {feedback.resolvedAt && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Resolved</Text>
                <Text style={styles.detailValue}>
                  {formatDate(feedback.resolvedAt)}
                </Text>
              </View>
            )}
          </View>

          {/* Admin Notes */}
          {feedback.adminNotes && (
            <View style={styles.adminNotesCard}>
              <Text style={styles.adminNotesTitle}>Response from our team</Text>
              <Text style={styles.adminNotesText}>{feedback.adminNotes}</Text>
            </View>
          )}

          {/* Action Buttons */}
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
  statusCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  statusMessage: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  detailsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  detailRow: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  detailValue: {
    fontSize: 16,
    color: "#111827",
    lineHeight: 22,
  },
  descriptionText: {
    lineHeight: 24,
  },
  adminNotesCard: {
    backgroundColor: "#F0FDF4",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#1CC29F",
  },
  adminNotesTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#059669",
    marginBottom: 12,
  },
  adminNotesText: {
    fontSize: 14,
    color: "#047857",
    lineHeight: 20,
  },
  actionButtons: {
    marginBottom: 40,
  },
  editButton: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#1CC29F",
    gap: 8,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1CC29F",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
  },
})
