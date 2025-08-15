import { useCallback, useEffect, useRef, useState } from "react"
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { Dropdown } from "react-native-element-dropdown"
import { BarChart } from "react-native-gifted-charts"

const { width: screenWidth } = Dimensions.get("window")

const accounts = [
  { label: "All Wallets", value: "all" },
  { label: "Bank", value: "bank" },
  { label: "Cash", value: "cash" },
  { label: "UPI", value: "upi" },
]

const periods = [
  { label: "Month", value: "month" },
  { label: "Week", value: "week" },
  { label: "Year", value: "year" },
  { label: "Custom", value: "custom" },
]

// Mock data with realistic dates
const mockData = [
  { month: "2024-01", date: "Jan 2024", income: 12000, expense: 8000 },
  { month: "2024-02", date: "Feb 2024", income: 15000, expense: 12000 },
  { month: "2024-03", date: "Mar 2024", income: 16000, expense: 11000 },
  { month: "2024-04", date: "Apr 2024", income: 14000, expense: 9000 },
  { month: "2024-05", date: "May 2024", income: 18000, expense: 14000 },
  { month: "2024-06", date: "Jun 2024", income: 20000, expense: 16000 },
  { month: "2024-07", date: "Jul 2024", income: 22000, expense: 18000 },
  { month: "2024-08", date: "Aug 2024", income: 25000, expense: 20000 },
  { month: "2024-10", date: "Oct 2024", income: 27000, expense: 22000 },
  { month: "2024-11", date: "Nov 2024", income: 24000, expense: 19000 },
  { month: "2024-12", date: "Dec 2024", income: 28000, expense: 23000 },
]

export default function CashFlowOverview() {
  const [selectedAccount, setSelectedAccount] = useState("all")
  const [selectedPeriod, setSelectedPeriod] = useState("month")
  const [selectedMonth, setSelectedMonth] = useState("2024-08")
  const [visibleData, setVisibleData] = useState([])
  const [currentMaxValue, setCurrentMaxValue] = useState(0)
  const scrollViewRef = useRef(null)

  // Modern Professional Color Palette
  const colors = {
    // Income colors - Modern teal/green
    income: "#10B981", // Emerald green
    incomeSelected: "#059669", // Darker emerald for selection
    incomeLight: "#6EE7B7", // Light emerald gradient

    // Expense colors - Modern coral/red
    expense: "#F59E0B", // Amber orange
    expenseSelected: "#D97706", // Darker amber for selection
    expenseLight: "#FCD34D", // Light amber gradient

    // Background and surfaces
    background: "#F8FAFC", // Slate gray background
    surface: "#FFFFFF", // Pure white surface

    // Text colors
    text: "#1E293B", // Slate dark for primary text
    textSecondary: "#64748B", // Slate medium for secondary text
    textLight: "#94A3B8", // Slate light for labels

    // UI elements
    border: "#E2E8F0", // Slate border
    shadow: "#0F172A", // Deep slate shadow
    success: "#059669", // Success emerald
    accent: "#3B82F6", // Blue accent
    cardBg: "#FFFFFF", // Card background
  }

  // Show exactly 6 months at a time
  const itemsPerScreen = 6
  const barWidth = (screenWidth - 120) / (itemsPerScreen * 2.5) // Calculate optimal bar width for 6 months

  // Get visible data for 6 months
  const getVisibleData = useCallback(
    (startIndex = 0) => {
      const endIndex = Math.min(startIndex + itemsPerScreen, mockData.length)
      return mockData.slice(startIndex, endIndex)
    },
    [itemsPerScreen]
  )

  // Calculate dynamic Y-axis maximum for visible data
  const calculateMaxValue = useCallback((data) => {
    const maxValue = Math.max(...data.map((d) => Math.max(d.income, d.expense)))
    return Math.ceil(maxValue / 5000) * 5000 // Round up to nearest 5k for better scaling
  }, [])

  // Initialize visible data
  useEffect(() => {
    const initialData = getVisibleData(0)
    setVisibleData(initialData)
    setCurrentMaxValue(calculateMaxValue(initialData))
  }, [getVisibleData, calculateMaxValue])

  // Format Y-axis values with 'k' suffix
  const formatYAxisLabel = (value) => {
    if (value >= 1000) {
      const kValue = value / 1000
      return `₹${kValue % 1 === 0 ? kValue : kValue.toFixed(1)}k`
    }
    return `₹${value}`
  }

  // Handle month selection
  const handleMonthSelect = (monthData) => {
    setSelectedMonth(monthData.month)
  }

  // Handle scroll events for 6-month view
  const handleScroll = useCallback(
    (event) => {
      const scrollX = event.nativeEvent.contentOffset.x
      const monthWidth = barWidth * 2.5 // Width for one month (2 bars + spacing)
      const startIndex = Math.max(0, Math.floor(scrollX / monthWidth))

      const newVisibleData = getVisibleData(startIndex)
      const newMaxValue = calculateMaxValue(newVisibleData)

      // Only update if data actually changed
      if (
        newVisibleData.length !== visibleData.length ||
        newVisibleData[0]?.month !== visibleData[0]?.month
      ) {
        setVisibleData(newVisibleData)
        setCurrentMaxValue(newMaxValue)
      }
    },
    [getVisibleData, calculateMaxValue, visibleData, barWidth]
  )

  // Get current month data for balance calculation
  const selectedMonthData = mockData.find((d) => d.month === selectedMonth) || {
    income: 0,
    expense: 0,
  }
  const totalBalance = selectedMonthData.income - selectedMonthData.expense

  // Prepare bar chart data with dual bars per month
  const barData = mockData.flatMap((monthData, index) => {
    const isSelected = monthData.month === selectedMonth

    return [
      // Income bar
      {
        value: monthData.income,
        label: "", // Empty label since we'll add custom month labels
        frontColor: isSelected ? colors.incomeSelected : colors.income,
        spacing: 4, // Small gap between income and expense bars
        labelTextStyle: {
          color: colors.text,
          fontSize: 11,
          fontWeight: "600",
        },
        onPress: () => handleMonthSelect(monthData),
        topLabelComponent: () => (
          <Text style={[styles.barLabel, { color: colors.incomeSelected }]}>
            {monthData.income >= 1000
              ? `₹${(monthData.income / 1000).toFixed(0)}k`
              : `₹${monthData.income}`}
          </Text>
        ),
        barBorderRadius: 6,
        gradientColor: colors.incomeLight,
        showGradient: true,
      },
      // Expense bar
      {
        value: monthData.expense,
        label: "", // Empty label
        frontColor: isSelected ? colors.expenseSelected : colors.expense,
        spacing: index === mockData.length - 1 ? 0 : 16, // Gap between months
        onPress: () => handleMonthSelect(monthData),
        topLabelComponent: () => (
          <Text style={[styles.barLabel, { color: colors.expenseSelected }]}>
            {monthData.expense >= 1000
              ? `₹${(monthData.expense / 1000).toFixed(0)}k`
              : `₹${monthData.expense}`}
          </Text>
        ),
        barBorderRadius: 6,
        gradientColor: colors.expenseLight,
        showGradient: true,
      },
    ]
  })

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Top Total Balance */}
      <Text
        style={[
          styles.balance,
          {
            color: totalBalance >= 0 ? colors.success : colors.expenseSelected,
          },
        ]}
      >
        ₹{Math.abs(totalBalance).toLocaleString("en-IN")}
      </Text>
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        {totalBalance >= 0 ? "Net Savings" : "Net Deficit"} •{" "}
        {mockData.find((d) => d.month === selectedMonth)?.date || selectedMonth}
      </Text>

      {/* Filters */}
      <View style={styles.filters}>
        <Dropdown
          data={accounts}
          value={selectedAccount}
          onChange={(item) => setSelectedAccount(item.value)}
          style={[
            styles.dropdown,
            {
              backgroundColor: colors.cardBg,
              borderColor: colors.border,
              shadowColor: colors.shadow,
            },
          ]}
          labelField="label"
          valueField="value"
          placeholder="Account"
          placeholderStyle={[styles.dropdownText, { color: colors.textLight }]}
          selectedTextStyle={[styles.dropdownText, { color: colors.text }]}
          itemTextStyle={{ color: colors.text }}
          containerStyle={{ backgroundColor: colors.cardBg }}
        />
        <Dropdown
          data={periods}
          value={selectedPeriod}
          onChange={(item) => setSelectedPeriod(item.value)}
          style={[
            styles.dropdown,
            {
              backgroundColor: colors.cardBg,
              borderColor: colors.border,
              shadowColor: colors.shadow,
            },
          ]}
          labelField="label"
          valueField="value"
          placeholder="Period"
          placeholderStyle={[styles.dropdownText, { color: colors.textLight }]}
          selectedTextStyle={[styles.dropdownText, { color: colors.text }]}
          itemTextStyle={{ color: colors.text }}
          containerStyle={{ backgroundColor: colors.cardBg }}
        />
      </View>

      {/* Chart Container */}
      <View
        style={[
          styles.chartContainer,
          {
            backgroundColor: colors.background,
            shadowColor: colors.shadow,
          },
        ]}
      >
        <View style={styles.chartWrapper}>
          {/* Fixed Y-Axis */}
          <View style={styles.yAxisContainer}>
            {[...Array(6)].map((_, index) => {
              const value = (currentMaxValue / 5) * (5 - index)
              return (
                <View key={index} style={styles.yAxisItem}>
                  <Text
                    style={[styles.yAxisText, { color: colors.textSecondary }]}
                  >
                    {formatYAxisLabel(value)}
                  </Text>
                </View>
              )
            })}
          </View>

          {/* Scrollable Chart */}
          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chartScroll}
            contentContainerStyle={styles.scrollContent}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            pagingEnabled={false}
            decelerationRate="fast"
          >
            <BarChart
              data={barData}
              width={screenWidth * 2} // Enough width for all months
              height={240}
              barWidth={barWidth}
              minHeight={3}
              barBorderRadius={6}
              spacing={4}
              hideRules={true}
              hideYAxisText={true}
              hideAxes={true}
              xAxisLabelTextStyle={[styles.xAxisText, { color: colors.text }]}
              maxValue={currentMaxValue}
              noOfSections={5}
              backgroundColor="transparent"
              showGradient={true}
              isAnimated={true}
              animationDuration={600}
              disableScroll={true} // Let parent ScrollView handle scrolling
            />
          </ScrollView>
        </View>

        {/* Custom Month Labels */}
        <View style={styles.monthLabelsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEnabled={false}
            contentContainerStyle={styles.monthLabelsContent}
          >
            {mockData.map((monthData, index) => {
              const isSelected = monthData.month === selectedMonth
              return (
                <TouchableOpacity
                  key={monthData.month}
                  style={[
                    styles.monthLabelItem,
                    {
                      width: barWidth * 2 + 20, // Match bar pair width + spacing
                      backgroundColor: isSelected
                        ? `${colors.accent}15`
                        : "transparent",
                    },
                  ]}
                  onPress={() => handleMonthSelect(monthData)}
                >
                  <Text
                    style={[
                      styles.monthLabelText,
                      {
                        color: isSelected
                          ? colors.accent
                          : colors.textSecondary,
                        fontWeight: isSelected ? "700" : "500",
                      },
                    ]}
                  >
                    {monthData.date.split(" ")[0]}
                  </Text>
                  <Text
                    style={[
                      styles.monthYearText,
                      {
                        color: isSelected ? colors.accent : colors.textLight,
                        fontWeight: isSelected ? "600" : "400",
                      },
                    ]}
                  >
                    {monthData.date.split(" ")[1]}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendLeft}>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendColor, { backgroundColor: colors.income }]}
              />
              <Text style={[styles.legendText, { color: colors.text }]}>
                Income
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendColor,
                  { backgroundColor: colors.expense },
                ]}
              />
              <Text style={[styles.legendText, { color: colors.text }]}>
                Expense
              </Text>
            </View>
          </View>

          {selectedMonth && (
            <View
              style={[
                styles.selectedIndicator,
                { backgroundColor: `${colors.accent}15` },
              ]}
            >
              <Text style={[styles.selectedText, { color: colors.accent }]}>
                📊 {mockData.find((d) => d.month === selectedMonth)?.date}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Spending Analysis Button */}
      <TouchableOpacity
        style={[
          styles.analysisBtn,
          {
            backgroundColor: colors.accent,
            shadowColor: colors.accent,
          },
        ]}
        activeOpacity={0.8}
      >
        <Text style={[styles.analysisText, { color: colors.surface }]}>
          📈 Spending Analysis
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  balance: {
    fontSize: 38,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 8,
    letterSpacing: -0.5,
  },
  label: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    fontWeight: "500",
  },
  filters: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 24,
  },
  dropdown: {
    width: 140,
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 18,
    borderWidth: 1,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: "500",
  },
  chartContainer: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  chartWrapper: {
    flexDirection: "row",
    height: 260,
  },
  yAxisContainer: {
    width: 55,
    height: 240,
    justifyContent: "space-between",
    paddingRight: 10,
    paddingTop: 10,
  },
  yAxisItem: {
    height: 40,
    justifyContent: "center",
  },
  yAxisText: {
    fontSize: 11,
    fontWeight: "500",
    textAlign: "right",
  },
  chartScroll: {
    flex: 1,
    marginLeft: 8,
  },
  scrollContent: {
    paddingRight: 30,
    paddingTop: 12,
    paddingBottom: 8,
  },
  monthLabelsContainer: {
    marginTop: 12,
    height: 50,
  },
  monthLabelsContent: {
    paddingHorizontal: 63, // Align with chart bars
  },
  monthLabelItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  monthLabelText: {
    fontSize: 12,
    textAlign: "center",
  },
  monthYearText: {
    fontSize: 10,
    textAlign: "center",
    marginTop: 1,
  },
  xAxisText: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  barLabel: {
    fontSize: 9,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    paddingHorizontal: 8,
  },
  legendLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 13,
    fontWeight: "600",
  },
  selectedIndicator: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  selectedText: {
    fontSize: 12,
    fontWeight: "700",
  },
  analysisBtn: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 28,
    alignItems: "center",
    marginTop: "auto",
    marginBottom: 20,
    elevation: 4,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  analysisText: {
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.5,
  },
})
