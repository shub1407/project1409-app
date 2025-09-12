// screens/FeedbackHistoryScreen.js
import { Ionicons } from "@expo/vector-icons"
import NetInfo from "@react-native-community/netinfo"
import { router, useFocusEffect } from "expo-router"
import { useCallback, useEffect, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import feedbackService from "../../../../src/services/api/feedbackService"

// Offline Screen Component
const OfflineScreen = ({ onRetry }) => {
  const [bounceAnim] = useState(new Animated.Value(0))

  useEffect(() => {
    const bounceAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    )
    bounceAnimation.start()

    return () => bounceAnimation.stop()
  }, [])

  const translateY = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  })

  return (
    <View style={styles.offlineContainer}>
      <Animated.View
        style={[styles.offlineIconContainer, { transform: [{ translateY }] }]}
      >
        <Ionicons name="cloud-offline-outline" size={80} color="#9CA3AF" />
      </Animated.View>

      <Text style={styles.offlineTitle}>No Internet Connection</Text>
      <Text style={styles.offlineSubtitle}>
        Please check your internet connection and try again.
      </Text>
      <Text style={styles.offlineDescription}>
        You need an active internet connection to view your feedback history.
      </Text>

      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Ionicons name="refresh" size={20} color="#FFFFFF" />
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>

      <View style={styles.offlineHint}>
        <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
        <Text style={styles.offlineHintText}>
          Make sure WiFi or mobile data is turned on
        </Text>
      </View>
    </View>
  )
}

// Connection Status Banner Component
const ConnectionBanner = ({ isConnected, onRetry }) => {
  if (isConnected) return null

  return (
    <View style={styles.connectionBanner}>
      <Ionicons name="wifi-outline" size={16} color="#EF4444" />
      <Text style={styles.connectionBannerText}>No internet connection</Text>
      <TouchableOpacity onPress={onRetry} style={styles.bannerRetryButton}>
        <Text style={styles.bannerRetryText}>Retry</Text>
      </TouchableOpacity>
    </View>
  )
}

export default function FeedbackHistoryScreen() {
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isConnected, setIsConnected] = useState(true)
  const [showOfflineScreen, setShowOfflineScreen] = useState(false)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)

  // Network connectivity listener
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = state.isConnected && state.isInternetReachable
      setIsConnected(connected)

      // Show offline screen only if we haven't loaded any data yet
      if (!connected && feedbacks.length === 0 && !initialLoadComplete) {
        setShowOfflineScreen(true)
      } else if (connected && showOfflineScreen) {
        setShowOfflineScreen(false)
      }
    })

    // Check initial connection
    NetInfo.fetch().then((state) => {
      const connected = state.isConnected && state.isInternetReachable
      setIsConnected(connected)

      if (!connected) {
        setShowOfflineScreen(true)
      }
    })

    return () => unsubscribe()
  }, [feedbacks.length, initialLoadComplete, showOfflineScreen])

  const loadFeedbacks = async (pageNum = 1, isRefresh = false) => {
    if (loading && !isRefresh) return

    // Check connection before making API call
    const netState = await NetInfo.fetch()
    const connected = netState.isConnected && netState.isInternetReachable

    if (!connected) {
      if (feedbacks.length === 0) {
        setShowOfflineScreen(true)
      } else {
        Alert.alert(
          "No Internet Connection",
          "Please check your internet connection and try again.",
          [{ text: "OK" }]
        )
      }
      setRefreshing(false)
      return
    }

    setLoading(true)
    try {
      const result = await feedbackService.getUserFeedback(pageNum, 10)

      if (result.success) {
        const newFeedbacks = result.data.data.feedbacks

        if (isRefresh || pageNum === 1) {
          setFeedbacks(newFeedbacks)
        } else {
          setFeedbacks((prev) => [...prev, ...newFeedbacks])
        }

        setHasMore(result.data.data.pagination.hasNext)
        setPage(pageNum)
        setInitialLoadComplete(true)
        setShowOfflineScreen(false)
      } else {
        Alert.alert("Error", result.error || "Failed to load feedback history")
      }
    } catch (error) {
      console.error("Load feedbacks error:", error)

      // Handle different types of errors
      if (
        error.message?.toLowerCase().includes("network") ||
        error.code === "NETWORK_ERROR" ||
        error.name === "TypeError"
      ) {
        if (feedbacks.length === 0) {
          setShowOfflineScreen(true)
        } else {
          Alert.alert(
            "Connection Error",
            "Unable to load feedback. Please check your internet connection.",
            [{ text: "OK" }]
          )
        }
      } else {
        Alert.alert("Error", "Failed to load feedback history")
      }
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
    if (!loading && hasMore && isConnected) {
      loadFeedbacks(page + 1)
    }
  }

  const handleRetryConnection = async () => {
    const netState = await NetInfo.fetch()
    const connected = netState.isConnected && netState.isInternetReachable

    if (connected) {
      setShowOfflineScreen(false)
      loadFeedbacks(1, true)
    } else {
      Alert.alert(
        "Still Offline",
        "Please check your internet connection and try again.",
        [{ text: "OK" }]
      )
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
      onPress={() => {
        if (isConnected) {
          router.push(`/users/profile/feedback/${item._id}`)
        } else {
          Alert.alert(
            "No Internet Connection",
            "You need an internet connection to view feedback details.",
            [{ text: "OK" }]
          )
        }
      }}
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
        style={[
          styles.addFeedbackButton,
          !isConnected && styles.addFeedbackButtonDisabled,
        ]}
        onPress={() => {
          if (isConnected) {
            router.push("/users/profile/feedback/add")
          } else {
            Alert.alert(
              "No Internet Connection",
              "You need an internet connection to submit feedback.",
              [{ text: "OK" }]
            )
          }
        }}
        disabled={!isConnected}
      >
        <Ionicons
          name="add"
          size={20}
          color={isConnected ? "#FFFFFF" : "#9CA3AF"}
        />
        <Text
          style={[
            styles.addFeedbackText,
            !isConnected && styles.addFeedbackTextDisabled,
          ]}
        >
          Submit Feedback
        </Text>
      </TouchableOpacity>
    </View>
  )

  const renderFooter = () => {
    if (!loading || refreshing) return null
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#1CC29F" />
        <Text style={styles.loadingText}>Loading more...</Text>
      </View>
    )
  }

  // Show offline screen if no connection and no cached data
  if (showOfflineScreen) {
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
            <View style={styles.addButton} />
          </View>
          <OfflineScreen onRetry={handleRetryConnection} />
        </SafeAreaView>
      </>
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
            onPress={() => {
              if (isConnected) {
                router.push("/users/profile/feedback/add")
              } else {
                Alert.alert(
                  "No Internet Connection",
                  "You need an internet connection to submit feedback.",
                  [{ text: "OK" }]
                )
              }
            }}
            style={[styles.addButton, !isConnected && styles.addButtonDisabled]}
            disabled={!isConnected}
          >
            <Ionicons
              name="add"
              size={24}
              color={isConnected ? "#FFFFFF" : "#9CA3AF"}
            />
          </TouchableOpacity>
        </View>

        <ConnectionBanner
          isConnected={isConnected}
          onRetry={handleRetryConnection}
        />

        <FlatList
          data={feedbacks}
          renderItem={renderFeedbackItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={
            feedbacks.length === 0 ? styles.emptyList : styles.list
          }
          ListEmptyComponent={loading ? null : renderEmpty}
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

        {loading && feedbacks.length === 0 && (
          <View style={styles.initialLoadingContainer}>
            <ActivityIndicator size="large" color="#1CC29F" />
            <Text style={styles.initialLoadingText}>Loading feedback...</Text>
          </View>
        )}
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
  addButtonDisabled: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
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

  // Connection Banner Styles
  connectionBanner: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  connectionBannerText: {
    flex: 1,
    fontSize: 14,
    color: "#DC2626",
    fontWeight: "500",
  },
  bannerRetryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#DC2626",
    borderRadius: 6,
  },
  bannerRetryText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
  },

  // Offline Screen Styles
  offlineContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    backgroundColor: "#F9FAFB",
  },
  offlineIconContainer: {
    marginBottom: 24,
  },
  offlineTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  offlineSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 8,
    textAlign: "center",
  },
  offlineDescription: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 32,
    textAlign: "center",
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: "#1CC29F",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 24,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  offlineHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
  },
  offlineHintText: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },

  // Existing styles...
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
  addFeedbackButtonDisabled: {
    backgroundColor: "#E5E7EB",
  },
  addFeedbackText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  addFeedbackTextDisabled: {
    color: "#9CA3AF",
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: "#6B7280",
  },
  initialLoadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(249, 250, 251, 0.8)",
  },
  initialLoadingText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 12,
  },
})
