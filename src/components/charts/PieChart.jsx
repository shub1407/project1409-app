import { Dimensions, StyleSheet, Text, View } from "react-native"
import Svg, { Path } from "react-native-svg"

const { width: screenWidth } = Dimensions.get("window")

const PieChart = ({
  data = [],
  size = 200,
  showLabels = true,
  showPercentages = true,
  centerText = null,
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
  const radius = size / 2
  let cumulativeAngle = -90 // Start from top

  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    let angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    }
  }

  const createPieSlice = (startAngle, sweepAngle, color) => {
    const start = polarToCartesian(radius, radius, radius, startAngle)
    const end = polarToCartesian(
      radius,
      radius,
      radius,
      startAngle + sweepAngle
    )
    const largeArcFlag = sweepAngle > 180 ? 1 : 0

    const d = [
      `M ${radius} ${radius}`,
      `L ${start.x} ${start.y}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
      "Z",
    ].join(" ")

    return <Path key={startAngle} d={d} fill={color} />
  }

  const slices = data.map((item) => {
    const percentage = (item.value / total) * 100
    const sweepAngle = (percentage / 100) * 360
    const path = createPieSlice(cumulativeAngle, sweepAngle, item.color)
    cumulativeAngle += sweepAngle
    return {
      path,
      label: item.label,
      percentage: percentage.toFixed(1),
      value: item.value,
      color: item.color,
    }
  })

  const formatValue = (value) => {
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`
    return `₹${value}`
  }

  return (
    <View style={[styles.container, { width: size + 40 }]}>
      {/* Original Solid Pie Chart */}
      <View style={styles.chartContainer}>
        <Svg width={size} height={size}>
          {slices.map((s) => s.path)}
        </Svg>

        {/* Center Content */}
        <View style={[styles.centerContent, { width: size, height: size }]}>
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
  container: { alignItems: "center", padding: 20 },
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
  emptyIconText: { fontSize: 32 },
  emptyTitle: { fontSize: 18, fontWeight: "600", color: "#1F2937" },
  emptyText: { fontSize: 14, color: "#6B7280", textAlign: "center" },
  chartContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  centerContent: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
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
  totalValue: { fontSize: 20, fontWeight: "700", color: "#1F2937" },
  legend: { width: "100%", gap: 12 },
  legendItem: { backgroundColor: "#F9FAFB", borderRadius: 12, padding: 12 },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  legendColor: { width: 16, height: 16, borderRadius: 8 },
  legendContent: { flex: 1 },
  legendLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  legendStats: { flexDirection: "row", alignItems: "center", gap: 8 },
  legendValue: { fontSize: 16, fontWeight: "700", color: "#1CC29F" },
  legendPercentage: { fontSize: 14, color: "#6B7280", fontWeight: "500" },
})

export default PieChart
