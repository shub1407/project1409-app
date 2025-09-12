// components/InitialSyncScreen.jsx
import { Ionicons } from "@expo/vector-icons"
import { useEffect, useState } from "react"
import {
  Animated,
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native"

const { width, height } = Dimensions.get("window")

export default function InitialSyncScreen({ syncState, onSyncComplete }) {
  const [progress] = useState(new Animated.Value(0))
  const [currentStep, setCurrentStep] = useState(0)
  const [downloadedItems, setDownloadedItems] = useState(0)
  const [totalItems, setTotalItems] = useState(100) // This should come from syncState

  const syncSteps = [
    { id: 1, title: "Connecting to server", icon: "wifi", completed: false },
    { id: 2, title: "Downloading accounts", icon: "wallet", completed: false },
    {
      id: 3,
      title: "Syncing transactions",
      icon: "swap-horizontal",
      completed: false,
    },
    { id: 4, title: "Loading categories", icon: "apps", completed: false },
    {
      id: 5,
      title: "Finalizing setup",
      icon: "checkmark-circle",
      completed: false,
    },
  ]

  const [steps, setSteps] = useState(syncSteps)

  useEffect(() => {
    if (syncState.lastSyncResult?.downloadProgress) {
      const progressPercent =
        (syncState.lastSyncResult.downloadProgress / 100) * 100

      Animated.timing(progress, {
        toValue: progressPercent,
        duration: 300,
        useNativeDriver: false,
      }).start()

      // Update current step based on progress
      const stepIndex = Math.floor((progressPercent / 100) * steps.length)
      if (stepIndex !== currentStep) {
        setCurrentStep(stepIndex)
        updateStepCompletion(stepIndex)
      }
    }

    if (syncState.lastSyncResult?.completed) {
      completeAllSteps()
      setTimeout(() => onSyncComplete(), 1000)
    }
  }, [syncState])

  const updateStepCompletion = (completedIndex) => {
    setSteps((prevSteps) =>
      prevSteps.map((step, index) => ({
        ...step,
        completed: index <= completedIndex,
      }))
    )
  }

  const completeAllSteps = () => {
    setSteps((prevSteps) =>
      prevSteps.map((step) => ({ ...step, completed: true }))
    )
    setCurrentStep(steps.length)
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D9488" />

      {/* Background */}
      <View style={styles.background}>
        <View style={styles.backgroundPattern}>
          <View style={[styles.circle, styles.circle1]} />
          <View style={[styles.circle, styles.circle2]} />
          <View style={[styles.circle, styles.circle3]} />
        </View>
      </View>

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Ionicons name="wallet" size={32} color="#FFFFFF" />
            </View>
          </View>
          <Text style={styles.title}>Setting up your account</Text>
          <Text style={styles.subtitle}>
            We're downloading your financial data securely...
          </Text>
        </View>

        {/* Progress Section */}
        <View style={styles.progressSection}>
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBackground}>
              <Animated.View
                style={[
                  styles.progressBarFill,
                  {
                    width: progress.interpolate({
                      inputRange: [0, 100],
                      outputRange: ["0%", "100%"],
                    }),
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(progress._value || 0)}% Complete
            </Text>
          </View>

          {/* Download Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="download" size={20} color="#1CC29F" />
              <Text style={styles.statText}>
                {downloadedItems}/{totalItems} items
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time" size={20} color="#64748B" />
              <Text style={styles.statText}>
                {syncState.isSyncing ? "Syncing..." : "Preparing..."}
              </Text>
            </View>
          </View>

          {/* Steps List */}
          <View style={styles.stepsList}>
            {steps.map((step, index) => {
              const isActive = index === currentStep && !step.completed
              const isCompleted = step.completed
              const isPending = index > currentStep

              return (
                <View key={step.id} style={styles.stepItem}>
                  <View
                    style={[
                      styles.stepIcon,
                      isCompleted && styles.stepIconCompleted,
                      isActive && styles.stepIconActive,
                      isPending && styles.stepIconPending,
                    ]}
                  >
                    {isCompleted ? (
                      <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                    ) : isActive ? (
                      <View style={styles.loadingDot}>
                        <Animated.View style={styles.pulseDot} />
                      </View>
                    ) : (
                      <Ionicons name={step.icon} size={18} color="#9CA3AF" />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.stepText,
                      isActive && styles.stepTextActive,
                      isCompleted && styles.stepTextCompleted,
                    ]}
                  >
                    {step.title}
                  </Text>
                  {isCompleted && (
                    <Ionicons name="checkmark" size={16} color="#1CC29F" />
                  )}
                </View>
              )
            })}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.securityBadge}>
            <Ionicons name="shield-checkmark" size={20} color="#1CC29F" />
            <Text style={styles.securityText}>
              Your data is encrypted and secure
            </Text>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D9488",
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundPattern: {
    flex: 1,
    position: "relative",
  },
  circle: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 100,
  },
  circle1: {
    width: 200,
    height: 200,
    top: -100,
    right: -50,
  },
  circle2: {
    width: 150,
    height: 150,
    top: height * 0.3,
    left: -75,
  },
  circle3: {
    width: 100,
    height: 100,
    bottom: 100,
    right: 50,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 60,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logo: {
    width: 80,
    height: 80,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    lineHeight: 24,
  },
  progressSection: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 24,
    padding: 32,
    marginBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  progressContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  progressBarBackground: {
    width: "100%",
    height: 8,
    backgroundColor: "#F1F5F9",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 16,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#1CC29F",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1CC29F",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 32,
    paddingVertical: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
    marginLeft: 8,
  },
  stepsList: {
    gap: 20,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  stepIconCompleted: {
    backgroundColor: "#1CC29F",
  },
  stepIconActive: {
    backgroundColor: "#1CC29F",
  },
  stepIconPending: {
    backgroundColor: "#F3F4F6",
  },
  stepText: {
    fontSize: 16,
    color: "#64748B",
    fontWeight: "500",
    flex: 1,
  },
  stepTextActive: {
    color: "#1F2937",
    fontWeight: "600",
  },
  stepTextCompleted: {
    color: "#1CC29F",
    fontWeight: "600",
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
  },
  footer: {
    alignItems: "center",
  },
  securityBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  securityText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 8,
  },
})
