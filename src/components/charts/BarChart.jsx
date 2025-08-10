import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native"

const { width: screenWidth } = Dimensions.get("window")

const BarChart = ({
  data = [],
  width = screenWidth - 40,
  height = 250,
  showLabels = true,
  showValues = true,
  color = "#1CC29F",
  showGrid = true,
  animated = true,
}) => {
  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { width, height }]}>
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Text style={styles.emptyIconText}>📊</Text>
          </View>
          <Text style={styles.emptyTitle}>No data available</Text>
          <Text style={styles.emptyText}>
            Add some transactions to see your chart
          </Text>
        </View>
      </View>
    )
  }

  const maxValue = Math.max(...data.map((item) => item.value))
  const chartHeight = height - (showLabels ? 80 : 40)
  const chartWidth = width - 40
  const barWidth = Math.max(30, chartWidth / data.length - 12)
  const totalWidth = Math.max(width, data.length * (barWidth + 12))

  // Grid values
  const gridValues = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
    value: Math.round(maxValue * ratio),
    y: chartHeight * (1 - ratio),
  }))

  const formatValue = (value) => {
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`
    return `₹${value}`
  }

  return (
    <View style={[styles.container, { width, height }]}>
      {/* Y-Axis Labels */}
      {showGrid && (
        <View style={styles.yAxisContainer}>
          {gridValues.map((grid, index) => (
            <View key={index} style={[styles.yAxisLabel, { top: grid.y }]}>
              <Text style={styles.yAxisText}>{formatValue(grid.value)}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Chart Area */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chartScrollView}
        contentContainerStyle={{ width: totalWidth }}
      >
        <View style={[styles.chartArea, { height: chartHeight }]}>
          {/* Grid Lines */}
          {showGrid && (
            <View style={styles.gridContainer}>
              {gridValues.map((grid, index) => (
                <View
                  key={index}
                  style={[
                    styles.gridLine,
                    {
                      top: grid.y,
                      width: totalWidth - 20,
                    },
                  ]}
                />
              ))}
            </View>
          )}

          {/* Bars */}
          <View style={styles.barsContainer}>
            {data.map((item, index) => {
              const barHeight = Math.max(
                4,
                (item.value / maxValue) * chartHeight
              )
              const barColor = item.color || color

              return (
                <View key={index} style={styles.barColumn}>
                  {/* Value Label */}
                  {showValues && (
                    <Text style={styles.barValue}>
                      {formatValue(item.value)}
                    </Text>
                  )}

                  {/* Bar */}
                  <View style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: barHeight,
                          width: barWidth,
                          backgroundColor: barColor,
                        },
                      ]}
                    >
                      {/* Gradient Effect (Optional) */}
                      <View
                        style={[
                          styles.barGradient,
                          { backgroundColor: `${barColor}40` },
                        ]}
                      />
                    </View>
                  </View>

                  {/* Label */}
                  {showLabels && (
                    <View style={styles.barLabelContainer}>
                      <Text style={styles.barLabel} numberOfLines={2}>
                        {item.label}
                      </Text>
                    </View>
                  )}
                </View>
              )
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  emptyIconText: {
    fontSize: 24,
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
  yAxisContainer: {
    position: "absolute",
    left: 0,
    top: 16,
    width: 60,
    height: "100%",
  },
  yAxisLabel: {
    position: "absolute",
    left: 0,
    transform: [{ translateY: -8 }],
  },
  yAxisText: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  chartScrollView: {
    marginLeft: 65,
  },
  chartArea: {
    position: "relative",
    paddingTop: 20,
  },
  gridContainer: {
    position: "absolute",
    top: 0,
    left: 10,
    right: 10,
    bottom: 0,
  },
  gridLine: {
    position: "absolute",
    height: 1,
    backgroundColor: "#F3F4F6",
  },
  barsContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: "100%",
    paddingHorizontal: 10,
    gap: 12,
  },
  barColumn: {
    alignItems: "center",
    justifyContent: "flex-end",
    flex: 1,
    minWidth: 30,
  },
  barValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
    textAlign: "center",
  },
  barWrapper: {
    justifyContent: "flex-end",
    alignItems: "center",
    flex: 1,
    minHeight: 20,
  },
  bar: {
    borderRadius: 6,
    minHeight: 4,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  barGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "30%",
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  barLabelContainer: {
    marginTop: 8,
    minHeight: 32,
    justifyContent: "center",
  },
  barLabel: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    fontWeight: "500",
  },
})

export default BarChart
