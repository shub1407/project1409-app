import { Dimensions, StyleSheet, Text, View } from "react-native"

const { width: screenWidth } = Dimensions.get("window")

const PieChart = ({
  data = [],
  size = 200,
  showLabels = true,
  showPercentages = true,
  centerText = null,
  strokeWidth = 2,
  animated = true,
}) => {
  if (!data || data.length === 0) {
    return (
      <View
        style={[styles.container, { width: size + 40, height: size + 100 }]}
      >
        <View style={styles.emptyState}>
          <View style={styles.emptyCircle}>
            <Text style={styles.emptyIconText}>🥧</Text>
          </View>
          <Text style={styles.emptyTitle}>No data available</Text>
          <Text style={styles.emptyText}>
            Add some transactions to see breakdown
          </Text>
        </View>
      </View>
    )
  }

  const total = data.reduce((sum, item) => sum + item.value, 0)
  const radius = (size - strokeWidth) / 2
  const centerX = size / 2
  const centerY = size / 2

  // Create pie slices
  let cumulativePercentage = 0
  const slices = data.map((item, index) => {
    const percentage = item.value / total
    const startAngle = cumulativePercentage * 360 - 90 // Start from top
    const endAngle = (cumulativePercentage + percentage) * 360 - 90

    cumulativePercentage += percentage

    return {
      ...item,
      percentage: (percentage * 100).toFixed(1),
      startAngle,
      endAngle,
      sweepAngle: percentage * 360,
    }
  })

  const formatValue = (value) => {
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`
    return `₹${value}`
  }

  // Create visual pie using stacked circles
  const renderPieSlices = () => {
    let accumulatedPercentage = 0

    return slices.map((slice, index) => {
      const percentage = slice.value / total
      const rotation = accumulatedPercentage * 360
      accumulatedPercentage += percentage

      return (
        <View
          key={index}
          style={[
            styles.pieSlice,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: slice.color,
              transform: [{ rotate: `${rotation}deg` }],
              position: "absolute",
            },
          ]}
        >
          <View
            style={[
              styles.pieSliceInner,
              {
                width: size * 0.6,
                height: size * 0.6,
                borderRadius: (size * 0.6) / 2,
                backgroundColor: "#FFFFFF",
              },
            ]}
          />
        </View>
      )
    })
  }

  return (
    <View style={[styles.container, { width: size + 40 }]}>
      {/* Modern Donut Chart */}
      <View style={styles.chartContainer}>
        <View style={[styles.pieContainer, { width: size, height: size }]}>
          {/* Background Circle */}
          <View
            style={[
              styles.backgroundCircle,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
              },
            ]}
          />

          {/* Progress Rings */}
          {slices.map((slice, index) => {
            const circumference = 2 * Math.PI * (radius - index * 8)
            const strokeDasharray = circumference
            const strokeDashoffset = circumference * (1 - slice.value / total)

            return (
              <View
                key={index}
                style={[
                  styles.progressRing,
                  {
                    width: size - index * 16,
                    height: size - index * 16,
                    borderRadius: (size - index * 16) / 2,
                    borderWidth: 8,
                    borderColor: slice.color,
                    borderStyle: "solid",
                    position: "absolute",
                    top: index * 8,
                    left: index * 8,
                  },
                ]}
              />
            )
          })}

          {/* Center Content */}
          <View style={styles.centerContent}>
            {centerText ? (
              <Text style={styles.centerText}>{centerText}</Text>
            ) : (
              <>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{formatValue(total)}</Text>
              </>
            )}
          </View>
        </View>
      </View>

      {/* Legend */}
      {showLabels && (
        <View style={styles.legend}>
          {slices.map((slice, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={styles.legendRow}>
                <View
                  style={[styles.legendColor, { backgroundColor: slice.color }]}
                />
                <View style={styles.legendContent}>
                  <Text style={styles.legendLabel}>{slice.label}</Text>
                  <View style={styles.legendStats}>
                    <Text style={styles.legendValue}>
                      {formatValue(slice.value)}
                    </Text>
                    {showPercentages && (
                      <Text style={styles.legendPercentage}>
                        ({slice.percentage}%)
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  emptyCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  emptyIconText: {
    fontSize: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  chartContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  pieContainer: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundCircle: {
    backgroundColor: "#F9FAFB",
    position: "absolute",
  },
  progressRing: {
    borderStyle: "solid",
    transform: [{ rotate: "-90deg" }],
  },
  centerContent: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  centerText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
  },
  totalLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  legend: {
    width: "100%",
    gap: 12,
  },
  legendItem: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  legendContent: {
    flex: 1,
  },
  legendLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  legendStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1CC29F",
  },
  legendPercentage: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
})

export default PieChart
