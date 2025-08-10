import { Ionicons } from "@expo/vector-icons"
import { useFocusEffect } from "@react-navigation/native"
import { useCallback, useState } from "react"
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import BarChart from "../../src/components/charts/BarChart"
import DualBarChart from "../../src/components/charts/DualBarChart"
import PieChart from "../../src/components/charts/PieChart"
import ReportFilters from "../../src/components/filters/ReportFilters"
import { useReportsContext } from "../../src/context/ReportContext"

const { width: screenWidth } = Dimensions.get("window")

export default function ReportsScreen() {
  const {
    reportData,
    monthlyComparison,
    loading,
    error,
    filters,
    updateFilters,
    refreshReportData,
    fetchReportStats,
  } = useReportsContext()
  if (!loading) {
  }

  const [refreshing, setRefreshing] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState("month")

  useFocusEffect(
    useCallback(() => {
      refreshReportData()
    }, [refreshReportData])
  )

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await refreshReportData()
    setRefreshing(false)
  }, [refreshReportData])

  const handleFiltersApply = useCallback(
    async (newFilters) => {
      await fetchReportStats(newFilters)
    },
    [fetchReportStats]
  )

  const formatCurrency = (amount) => {
    return `₹${Math.abs(amount).toLocaleString("en-IN")}`
  }

  const formatCashFlowSummary = () => {
    if (!reportData?.cashFlowSummary) return null

    const { totalIncome, totalExpense, netCashFlow, savingsRate } =
      reportData.cashFlowSummary

    return {
      income: totalIncome,
      expense: totalExpense,
      netFlow: netCashFlow,
      savingsRate: parseFloat(savingsRate),
      isProfit: netCashFlow >= 0,
    }
  }

  const prepareCategoryChartData = (type = "expense") => {
    if (!reportData?.categoryStats) return []

    return reportData.categoryStats
      .filter((item) => item._id.type === type && item._id.categoryName)
      .slice(0, 8) // Top 8 categories
      .map((item) => ({
        label: item._id.categoryName,
        value: item.total,
        color:
          item._id.categoryColor ||
          (type === "expense" ? "#FF6B6B" : "#1CC29F"),
      }))
  }

  const prepareMonthlyChartData = () => {
    if (!monthlyComparison) return []

    return monthlyComparison.map((item) => ({
      label: item.monthName,
      income: item.income || 0,
      expense: item.expense || 0,
      savings: item.savings || 0,
    }))
  }

  const prepareAccountChartData = () => {
    if (!reportData?.accountStats) return []

    return reportData.accountStats.map((item) => ({
      label: item._id.accountName,
      value: Math.abs(item.expense) || item.total,
      color: item._id.accountColor || "#1CC29F",
    }))
  }

  if (loading && !reportData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1CC29F" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1CC29F" />
          <Text style={styles.loadingText}>Loading reports...</Text>
        </View>
      </SafeAreaView>
    )
  }

  const cashFlowData = formatCashFlowSummary()
  const expenseCategoryData = prepareCategoryChartData("expense")
  const incomeCategoryData = prepareCategoryChartData("income")
  const monthlyData = prepareMonthlyChartData()
  const accountData = prepareAccountChartData()

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1CC29F" />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Reports & Analytics</Text>
            <Text style={styles.headerSubtitle}>
              Track your financial patterns
            </Text>
          </View>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="download-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#1CC29F"]}
              tintColor="#1CC29F"
            />
          }
        >
          {/* Filters */}
          <ReportFilters
            filters={filters}
            onFiltersChange={updateFilters}
            onApply={handleFiltersApply}
          />

          {/* Cash Flow Summary */}
          {cashFlowData && (
            <View style={styles.summaryCard}>
              <Text style={styles.cardTitle}>Cash Flow Summary</Text>
              <View style={styles.summaryStats}>
                <View style={styles.summaryItem}>
                  <View
                    style={[
                      styles.summaryIcon,
                      { backgroundColor: "#1CC29F20" },
                    ]}
                  >
                    <Ionicons name="trending-up" size={20} color="#1CC29F" />
                  </View>
                  <View style={styles.summaryDetails}>
                    <Text style={styles.summaryLabel}>Income</Text>
                    <Text style={[styles.summaryValue, { color: "#1CC29F" }]}>
                      {formatCurrency(cashFlowData.income)}
                    </Text>
                  </View>
                </View>

                <View style={styles.summaryItem}>
                  <View
                    style={[
                      styles.summaryIcon,
                      { backgroundColor: "#FF6B6B20" },
                    ]}
                  >
                    <Ionicons name="trending-down" size={20} color="#FF6B6B" />
                  </View>
                  <View style={styles.summaryDetails}>
                    <Text style={styles.summaryLabel}>Expenses</Text>
                    <Text style={[styles.summaryValue, { color: "#FF6B6B" }]}>
                      {formatCurrency(cashFlowData.expense)}
                    </Text>
                  </View>
                </View>

                <View style={styles.summaryItem}>
                  <View
                    style={[
                      styles.summaryIcon,
                      {
                        backgroundColor: cashFlowData.isProfit
                          ? "#1CC29F20"
                          : "#FF6B6B20",
                      },
                    ]}
                  >
                    <Ionicons
                      name={
                        cashFlowData.isProfit ? "trending-up" : "trending-down"
                      }
                      size={20}
                      color={cashFlowData.isProfit ? "#1CC29F" : "#FF6B6B"}
                    />
                  </View>
                  <View style={styles.summaryDetails}>
                    <Text style={styles.summaryLabel}>Net Flow</Text>
                    <Text
                      style={[
                        styles.summaryValue,
                        {
                          color: cashFlowData.isProfit ? "#1CC29F" : "#FF6B6B",
                        },
                      ]}
                    >
                      {cashFlowData.isProfit ? "+" : ""}
                      {formatCurrency(cashFlowData.netFlow)}
                    </Text>
                  </View>
                </View>

                <View style={styles.savingsRate}>
                  <Text style={styles.savingsRateLabel}>Savings Rate</Text>
                  <Text
                    style={[
                      styles.savingsRateValue,
                      {
                        color:
                          cashFlowData.savingsRate >= 20
                            ? "#1CC29F"
                            : "#F59E0B",
                      },
                    ]}
                  >
                    {cashFlowData.savingsRate}%
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Monthly Comparison */}
          {monthlyData.length > 0 && (
            <View style={styles.chartCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Income vs Expense Trends</Text>
                <View style={styles.periodSelector}>
                  {["6m", "12m", "24m"].map((period) => (
                    <TouchableOpacity
                      key={period}
                      style={[
                        styles.periodButton,
                        selectedPeriod === period && styles.periodButtonActive,
                      ]}
                      onPress={() => setSelectedPeriod(period)}
                    >
                      <Text
                        style={[
                          styles.periodText,
                          selectedPeriod === period && styles.periodTextActive,
                        ]}
                      >
                        {period}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <DualBarChart
                data={monthlyData}
                height={280}
                showValues={true}
                showGrid={true}
                incomeColor="#1CC29F"
                expenseColor="#FF6B6B"
              />
            </View>
          )}

          {/* Expense Categories */}
          {expenseCategoryData.length > 0 && (
            <View style={styles.chartCard}>
              <Text style={styles.cardTitle}>Expense Breakdown</Text>
              <PieChart
                data={expenseCategoryData}
                size={screenWidth - 120}
                showLabels={true}
                showPercentages={true}
                centerText={`${expenseCategoryData.length} Categories`}
              />
            </View>
          )}

          {/* Income Categories */}
          {incomeCategoryData.length > 0 && (
            <View style={styles.chartCard}>
              <Text style={styles.cardTitle}>Income Sources</Text>
              <PieChart
                data={incomeCategoryData}
                size={screenWidth - 120}
                showLabels={true}
                showPercentages={true}
                centerText={`${incomeCategoryData.length} Sources`}
              />
            </View>
          )}

          {/* Account Usage */}
          {accountData.length > 0 && (
            <View style={styles.chartCard}>
              <Text style={styles.cardTitle}>Account Usage</Text>
              <BarChart
                data={accountData}
                height={200}
                color="#45B7D1"
                showValues={true}
                showLabels={true}
              />
            </View>
          )}

          {/* Error State */}
          {error && (
            <View style={styles.errorCard}>
              <Ionicons name="alert-circle" size={48} color="#FF6B6B" />
              <Text style={styles.errorTitle}>Failed to load reports</Text>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={refreshReportData}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Empty State */}
          {!loading &&
            !error &&
            (!reportData || !reportData.cashFlowSummary) && (
              <View style={styles.emptyCard}>
                <Ionicons name="bar-chart-outline" size={64} color="#9CA3AF" />
                <Text style={styles.emptyTitle}>No data available</Text>
                <Text style={styles.emptyText}>
                  Start adding transactions to see your financial reports
                </Text>
              </View>
            )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  header: {
    backgroundColor: "#1CC29F",
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  summaryStats: {
    gap: 16,
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  summaryDetails: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  savingsRate: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  savingsRateLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  savingsRateValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  chartCard: {
    backgroundColor: "#FFFFFF",
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  periodSelector: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 2,
  },
  periodButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  periodButtonActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  periodText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  periodTextActive: {
    color: "#1CC29F",
  },
  errorCard: {
    backgroundColor: "#FFFFFF",
    margin: 16,
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#1CC29F",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    margin: 16,
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
})
