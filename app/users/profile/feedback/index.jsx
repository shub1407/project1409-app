// screens/FeedbackHistoryScreen.js
import { Ionicons } from "@expo/vector-icons"
import { router, useFocusEffect } from "expo-router"
import { useCallback, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import feedbackService from "../../../../src/services/feedbackService"
export default function FeedbackHistoryScreen() {
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const loadFeedbacks = async (pageNum = 1, isRefresh = false) => {
    if (loading && !isRefresh) return

    setLoading(true)
    try {
      const result = await feedbackService.getUserFeedback(pageNum, 10)

      if (result.success) {
        const newFeedbacks = result.data.data.feedback

        if (isRefresh || pageNum === 1) {
          setFeedbacks(newFeedbacks)
        } else {
          setFeedbacks((prev) => [...prev, ...newFeedbacks])
        }

        setHasMore(result.data.data.pagination.hasNext)
        setPage(pageNum)
      } else {
        Alert.alert("Error", result.error || "Failed to load feedback history")
      }
    } catch (error) {
      console.error("Load feedbacks error:", error)
      Alert.alert("Error", "Failed to load feedback history")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Load feedbacks when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadFeedbacks(1, true)
    }, [])
  )

  const handleRefresh = () => {
    setRefreshing(true)
    loadFeedbacks(1, true)
  }

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadFeedbacks(page + 1)
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

  const getTypeColor = (type) => {
    switch (type) {
      case "bug":
        return "#EF4444"
      case "feature":
        return "#F59E0B"
      case "improvement":
        return "#1CC29F"
      case "other":
        return "#6B7280"
      default:
        return "#6B7280"
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case "bug":
        return "bug-outline"
      case "feature":
        return "bulb-outline"
      case "improvement":
        return "trending-up-outline"
      case "other":
        return "chatbubble-outline"
      default:
        return "help-circle-outline"
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const renderFeedbackItem = ({ item }) => (
    <TouchableOpacity
      style={styles.feedbackItem}
      onPress={() => router.push(`/users/profile/feedback/${item._id}`)}
    >
      <View style={styles.feedbackHeader}>
        <View style={styles.typeContainer}>
          <View
            style={[
              styles.typeIcon,
              { backgroundColor: `${getTypeColor(item.type)}15` },
            ]}
          >
            <Ionicons
              name={getTypeIcon(item.type)}
              size={16}
              color={getTypeColor(item.type)}
            />
          </View>
          <Text style={[styles.typeText, { color: getTypeColor(item.type) }]}>
            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: `${getStatusColor(item.status)}15` },
          ]}
        >
          <Ionicons
            name={getStatusIcon(item.status)}
            size={14}
            color={getStatusColor(item.status)}
          />
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      <Text style={styles.feedbackTitle} numberOfLines={2}>
        {item.title}
      </Text>

      <Text style={styles.feedbackDescription} numberOfLines={3}>
        {item.description}
      </Text>

      <View style={styles.feedbackFooter}>
        <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
        <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  )

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubble-outline" size={64} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>No Feedback Yet</Text>
      <Text style={styles.emptyText}>
        You haven't submitted any feedback yet. Share your thoughts to help us
        improve!
      </Text>
      <TouchableOpacity
        style={styles.addFeedbackButton}
        onPress={() => router.push("/users/profile/feedback/add")}
      >
        <Ionicons name="add" size={20} color="#FFFFFF" />
        <Text style={styles.addFeedbackText}>Submit Feedback</Text>
      </TouchableOpacity>
    </View>
  )

  const renderFooter = () => {
    if (!loading || refreshing) return null
    return (
      <View style={styles.loadingFooter}>
        <Text style={styles.loadingText}>Loading more...</Text>
      </View>
    )
  }

  if (loading) {
    return (
      <ActivityIndicator style={{ flex: 1 }} size="large" color="#1CC29F" />
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
          <Text style={styles.headerTitle}>My Feedback</Text>
          <TouchableOpacity
            onPress={() => router.push("/users/profile/feedback/add")}
            style={styles.addButton}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={feedbacks}
          renderItem={renderFeedbackItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={
            feedbacks.length === 0 ? styles.emptyList : styles.list
          }
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#1CC29F"]}
              tintColor="#1CC29F"
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          showsVerticalScrollIndicator={false}
        />
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  feedbackItem: {
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
  feedbackHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  typeIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  typeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
    lineHeight: 22,
  },
  feedbackDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 16,
  },
  feedbackFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  addFeedbackButton: {
    backgroundColor: "#1CC29F",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  addFeedbackText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    color: "#6B7280",
  },
})
