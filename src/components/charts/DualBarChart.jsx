import { LinearGradient } from "expo-linear-gradient"
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native"

const { width: screenWidth } = Dimensions.get("window")

const DualBarChart = ({
  data = [],
  width = screenWidth - 32,
  height = 320,
  showValues = true,
  showGrid = true,
  incomeColor = "#1CC29F",
  expenseColor = "#FF6B6B",
}) => {
  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { width, height }]}>
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Text style={styles.emptyIconText}>📊</Text>
          </View>
          <Text style={styles.emptyTitle}>No monthly data available</Text>
          <Text style={styles.emptyText}>
            Add transactions to see income vs expense trends
          </Text>
        </View>
      </View>
    )
  }

  // Calculate max value for scaling with padding
  const maxIncome = Math.max(...data.map((item) => item.income || 0))
  const maxExpense = Math.max(...data.map((item) => item.expense || 0))
  const maxValue = Math.max(maxIncome, maxExpense) * 1.1 // Add 10% padding

  const legendHeight = 60
  const chartTopPadding = 40
  const chartBottomPadding = 50
  const yAxisWidth = 60
  const chartHeight =
    height - legendHeight - chartTopPadding - chartBottomPadding
  const chartWidth = width - yAxisWidth - 32 // Account for padding

  // Dynamic bar sizing
  const minBarWidth = 24
  const maxBarWidth = 40
  const groupSpacing = 20
  const barSpacing = 6

  const availableWidth = chartWidth - (data.length - 1) * groupSpacing
  const dynamicBarWidth = Math.min(
    maxBarWidth,
    Math.max(minBarWidth, availableWidth / (data.length * 2))
  )
  const groupWidth = dynamicBarWidth * 2 + barSpacing

  const totalContentWidth = Math.max(
    chartWidth,
    (groupWidth + groupSpacing) * data.length - groupSpacing + 40
  )

  // Grid values
  const gridLevels = 5
  const gridValues = Array.from({ length: gridLevels }, (_, i) => {
    const ratio = i / (gridLevels - 1)
    return {
      value: Math.round(maxValue * ratio),
      y: chartHeight * (1 - ratio),
    }
  })

  const formatValue = (value) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`
    return `₹${value}`
  }

  const formatShortValue = (value) => {
    if (value >= 10000000) return `${(value / 10000000).toFixed(1)}Cr`
    if (value >= 100000) return `${(value / 100000).toFixed(1)}L`
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
    return value.toString()
  }

  return (
    <View style={styles.outerContainer}>
      {/* Enhanced Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendIndicator, styles.incomeIndicator]} />
          <Text style={styles.legendText}>Income</Text>
          <View style={styles.legendBadge}>
            <Text style={styles.legendBadgeText}>{formatValue(maxIncome)}</Text>
          </View>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendIndicator, styles.expenseIndicator]} />
          <Text style={styles.legendText}>Expense</Text>
          <View style={styles.legendBadge}>
            <Text style={styles.legendBadgeText}>
              {formatValue(maxExpense)}
            </Text>
          </View>
        </View>
      </View>

      {/* Chart Container */}
      <View style={[styles.chartContainer, { height: height - legendHeight }]}>
        {/* Y-Axis */}
        {showGrid && (
          <View
            style={[
              styles.yAxisContainer,
              { height: chartHeight + chartTopPadding },
            ]}
          >
            {gridValues.map((grid, index) => (
              <View
                key={index}
                style={[styles.yAxisLabel, { top: grid.y + chartTopPadding }]}
              >
                <Text style={styles.yAxisText}>{formatValue(grid.value)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Scrollable Chart Area */}
        <View style={styles.chartWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[
              styles.scrollContent,
              { width: Math.max(chartWidth, totalContentWidth) },
            ]}
            style={styles.chartScrollView}
          >
            <View
              style={[
                styles.chartArea,
                {
                  height: chartHeight + chartTopPadding + chartBottomPadding,
                  width: totalContentWidth,
                },
              ]}
            >
              {/* Grid Lines */}
              {showGrid && (
                <View
                  style={[
                    styles.gridContainer,
                    {
                      top: chartTopPadding,
                      height: chartHeight,
                      width: totalContentWidth,
                    },
                  ]}
                >
                  {gridValues.map((grid, index) => (
                    <View
                      key={index}
                      style={[
                        styles.gridLine,
                        {
                          top: grid.y,
                          width: "100%",
                        },
                      ]}
                    />
                  ))}
                </View>
              )}

              {/* Bars Container */}
              <View
                style={[
                  styles.barsContainer,
                  {
                    paddingTop: chartTopPadding,
                    paddingBottom: chartBottomPadding,
                    height: chartHeight + chartTopPadding + chartBottomPadding,
                  },
                ]}
              >
                {data.map((monthData, index) => {
                  const incomeHeight = Math.max(
                    4,
                    (monthData.income / maxValue) * chartHeight
                  )
                  const expenseHeight = Math.max(
                    4,
                    (monthData.expense / maxValue) * chartHeight
                  )

                  return (
                    <View
                      key={index}
                      style={[
                        styles.barGroup,
                        {
                          width: groupWidth,
                          marginRight:
                            index < data.length - 1 ? groupSpacing : 0,
                        },
                      ]}
                    >
                      {/* Bar Pair Container */}
                      <View style={styles.barPairContainer}>
                        {/* Income Bar */}
                        <View style={styles.barColumn}>
                          {showValues && monthData.income > 0 && (
                            <Text
                              style={[styles.barValue, { color: incomeColor }]}
                            >
                              {formatShortValue(monthData.income)}
                            </Text>
                          )}
                          <View
                            style={[styles.barWrapper, { height: chartHeight }]}
                          >
                            <View
                              style={[
                                styles.bar,
                                styles.incomeBar,
                                {
                                  height: incomeHeight,
                                  width: dynamicBarWidth,
                                  backgroundColor: incomeColor,
                                },
                              ]}
                            >
                              {/* Enhanced gradient effect */}
                              <LinearGradient
                                colors={[
                                  `${incomeColor}80`,
                                  `${incomeColor}20`,
                                ]}
                                style={styles.barGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 0, y: 1 }}
                              />
                            </View>
                          </View>
                        </View>

                        {/* Expense Bar */}
                        <View style={styles.barColumn}>
                          {showValues && monthData.expense > 0 && (
                            <Text
                              style={[styles.barValue, { color: expenseColor }]}
                            >
                              {formatShortValue(monthData.expense)}
                            </Text>
                          )}
                          <View
                            style={[styles.barWrapper, { height: chartHeight }]}
                          >
                            <View
                              style={[
                                styles.bar,
                                styles.expenseBar,
                                {
                                  height: expenseHeight,
                                  width: dynamicBarWidth,
                                  backgroundColor: expenseColor,
                                },
                              ]}
                            >
                              {/* Enhanced gradient effect */}
                              <LinearGradient
                                colors={[
                                  `${expenseColor}80`,
                                  `${expenseColor}20`,
                                ]}
                                style={styles.barGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 0, y: 1 }}
                              />
                            </View>
                          </View>
                        </View>
                      </View>

                      {/* Month Label */}
                      <View style={styles.monthLabelContainer}>
                        <Text style={styles.monthLabel}>
                          {monthData.monthName || monthData.label}
                        </Text>
                      </View>

                      {/* Net Balance Indicator */}
                      {monthData.income !== undefined &&
                        monthData.expense !== undefined && (
                          <View
                            style={[
                              styles.netIndicator,
                              {
                                backgroundColor:
                                  monthData.income >= monthData.expense
                                    ? `${incomeColor}15`
                                    : `${expenseColor}15`,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.netText,
                                {
                                  color:
                                    monthData.income >= monthData.expense
                                      ? incomeColor
                                      : expenseColor,
                                },
                              ]}
                            >
                              {monthData.income >= monthData.expense
                                ? "+"
                                : "-"}
                              {formatShortValue(
                                Math.abs(monthData.income - monthData.expense)
                              )}
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
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    overflow: "hidden",
  },
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  emptyIcon: {
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
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#F8FAFC",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    justifyContent: "center",
  },
  legendIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  incomeIndicator: {
    backgroundColor: "#1CC29F",
  },
  expenseIndicator: {
    backgroundColor: "#FF6B6B",
  },
  legendText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  legendBadge: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  legendBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  chartContainer: {
    flexDirection: "row",
  },
  yAxisContainer: {
    width: 60,
    position: "relative",
    paddingRight: 8,
  },
  yAxisLabel: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "flex-end",
    transform: [{ translateY: -8 }],
  },
  yAxisText: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "600",
    textAlign: "right",
  },
  chartWrapper: {
    flex: 1,
  },
  chartScrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  chartArea: {
    position: "relative",
  },
  gridContainer: {
    position: "absolute",
    left: 16,
    right: 16,
  },
  gridLine: {
    position: "absolute",
    height: 1,
    backgroundColor: "#F1F5F9",
    opacity: 0.8,
  },
  barsContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
  },
  barGroup: {
    alignItems: "center",
    justifyContent: "flex-end",
  },
  barPairContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
    flex: 1,
  },
  barColumn: {
    alignItems: "center",
    justifyContent: "flex-end",
    flex: 1,
  },
  barValue: {
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
  },
  barWrapper: {
    justifyContent: "flex-end",
    alignItems: "center",
    width: "100%",
  },
  bar: {
    borderRadius: 6,
    minHeight: 4,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  incomeBar: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  expenseBar: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  barGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  monthLabelContainer: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  monthLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4B5563",
    textAlign: "center",
  },
  netIndicator: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 50,
    alignItems: "center",
  },
  netText: {
    fontSize: 11,
    fontWeight: "700",
  },
})

export default DualBarChart
