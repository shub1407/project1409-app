import { Feather } from "@expo/vector-icons"
import DateTimePicker from "@react-native-community/datetimepicker"
import * as SecureStore from "expo-secure-store"
import { useEffect, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { PieChart } from "react-native-chart-kit"
import TransactionList from "../../src/components/TransactionList"
import { useAccountsContext } from "../../src/context/AccountContext"
import { baseUrl } from "../../src/utility/constant"

const screenWidth = Dimensions.get("window").width

const ReportsScreen = () => {
  const [reportData, setReportData] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [activeTab, setActiveTab] = useState("expense")
  const [filterType, setFilterType] = useState("month")
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedWeek, setSelectedWeek] = useState(1)
  const [customStartDate, setCustomStartDate] = useState(new Date())
  const [customEndDate, setCustomEndDate] = useState(new Date())
  const [showStartDatePicker, setShowStartDatePicker] = useState(false)
  const [showEndDatePicker, setShowEndDatePicker] = useState(false)
  const [showMonthPicker, setShowMonthPicker] = useState(false)
  const [showWeekPicker, setShowWeekPicker] = useState(false)
  const { accounts } = useAccountsContext()

  // Chart colors matching your app theme
  const chartColors = [
    "#007AFF",
    "#34C759",
    "#FF3B30",
    "#FF9500",
    "#AF52DE",
    "#5AC8FA",
    "#FFCC00",
    "#FF2D92",
    "#30D158",
    "#64D2FF",
  ]

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

  useEffect(() => {
    fetchReportData()
  }, [
    filterType,
    selectedYear,
    selectedMonth,
    selectedWeek,
    customStartDate,
    customEndDate,
    activeTab,
  ])

  const getWeeksInMonth = (year, month) => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const weeks = []

    let weekStart = new Date(firstDay)
    let weekNumber = 1

    while (weekStart <= lastDay) {
      let weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)

      if (weekEnd > lastDay) {
        weekEnd = new Date(lastDay)
      }

      weeks.push({
        number: weekNumber,
        start: new Date(weekStart),
        end: new Date(weekEnd),
        label: `Week ${weekNumber} (${weekStart.getDate()}-${weekEnd.getDate()})`,
      })

      weekStart.setDate(weekStart.getDate() + 7)
      weekNumber++
    }

    return weeks
  }

  const canNavigateToFuture = () => {
    if (filterType === "month") {
      return (
        selectedYear < currentYear ||
        (selectedYear === currentYear && selectedMonth < currentMonth)
      )
    }
    return selectedYear < currentYear
  }

  const getDateRange = () => {
    if (filterType === "custom") {
      return {
        startDate: customStartDate.toISOString().split("T")[0],
        endDate: customEndDate.toISOString().split("T")[0],
      }
    }

    if (filterType === "week") {
      const weeks = getWeeksInMonth(selectedYear, selectedMonth)
      const selectedWeekData = weeks[selectedWeek - 1]

      if (selectedWeekData) {
        return {
          startDate: selectedWeekData.start.toISOString().split("T")[0],
          endDate: selectedWeekData.end.toISOString().split("T")[0],
        }
      }
    }

    const startDate = new Date(selectedYear, selectedMonth, 1)
    const endDate = new Date(selectedYear, selectedMonth + 1, 0)

    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    }
  }

  const getDisplayPeriod = () => {
    const { startDate, endDate } = getDateRange()

    if (filterType === "custom") {
      return `${new Date(startDate).toLocaleDateString()} - ${new Date(
        endDate
      ).toLocaleDateString()}`
    }

    if (filterType === "week") {
      const weeks = getWeeksInMonth(selectedYear, selectedMonth)
      const selectedWeekData = weeks[selectedWeek - 1]
      return `${months[selectedMonth]} ${selectedYear} - ${
        selectedWeekData?.label || "Week 1"
      }`
    }

    return `${months[selectedMonth]} ${selectedYear}`
  }

  const fetchReportData = async () => {
    setLoading(true)
    try {
      const { startDate, endDate } = getDateRange()
      const token = await SecureStore.getItemAsync("userToken")

      const queryParams = new URLSearchParams({
        type: activeTab,
        limit: "10",
        ...(startDate && endDate && { startDate, endDate }),
      })

      const response = await fetch(
        `${baseUrl}/reports/top-categories?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setReportData(data)
      } else {
        Alert.alert("Error", "Failed to fetch report data")
      }
    } catch (error) {
      console.error("Error fetching report data:", error)
      Alert.alert("Error", "Network error occurred")
    } finally {
      setLoading(false)
    }
  }

  const fetchCategoryTransactions = async (categoryId) => {
    try {
      const { startDate, endDate } = getDateRange()
      const token = await SecureStore.getItemAsync("userToken")

      const queryParams = new URLSearchParams({
        categoryId,
        type: activeTab,
        ...(startDate && endDate && { startDate, endDate }),
      })

      const response = await fetch(`${baseUrl}/transactions?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setTransactions(data.transactions || [])
      }
    } catch (error) {
      console.error("Error fetching category transactions:", error)
    }
  }

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId)
    fetchCategoryTransactions(categoryId)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getPieChartData = () => {
    if (!reportData?.topCategories) return []

    const total = reportData.topCategories.reduce(
      (sum, cat) => sum + cat.total,
      0
    )

    return reportData.topCategories.map((category, index) => ({
      name: category.categoryInfo?.label || "Unknown",
      population: category.total,
      color: chartColors[index % chartColors.length],
      legendFontColor: "#1C1C1E",
      legendFontSize: 12,
      percentage: ((category.total / total) * 100).toFixed(1),
    }))
  }

  const navigateMonth = (direction) => {
    if (direction === "next") {
      if (selectedMonth === 11) {
        if (selectedYear < currentYear) {
          setSelectedYear(selectedYear + 1)
          setSelectedMonth(0)
        }
      } else if (
        selectedYear < currentYear ||
        (selectedYear === currentYear && selectedMonth < currentMonth)
      ) {
        setSelectedMonth(selectedMonth + 1)
      }
    } else {
      if (selectedMonth === 0) {
        if (selectedYear > years[0]) {
          setSelectedYear(selectedYear - 1)
          setSelectedMonth(11)
        }
      } else {
        setSelectedMonth(selectedMonth - 1)
      }
    }
  }

  const onDateChange = (event, date, type) => {
    if (type === "start") {
      setShowStartDatePicker(false)
      if (date && date <= new Date()) {
        setCustomStartDate(date)
        setTimeout(() => setShowEndDatePicker(true), 100)
      }
    } else if (type === "end") {
      setShowEndDatePicker(false)
      if (date && date <= new Date() && date >= customStartDate) {
        setCustomEndDate(date)
      }
    }
  }

  const renderPeriodDisplay = () => (
    <View style={styles.periodDisplayContainer}>
      <View style={styles.periodHeader}>
        <Feather name="calendar" size={18} color="#007AFF" />
        <Text style={styles.periodText}>Report Period</Text>
      </View>
      <Text style={styles.periodValue}>{getDisplayPeriod()}</Text>
    </View>
  )

  const renderFilterSection = () => (
    <View style={styles.filterContainer}>
      <View style={styles.filterHeader}>
        <Feather name="filter" size={20} color="#007AFF" />
        <Text style={styles.sectionTitle}>Period Filter</Text>
      </View>

      <View style={styles.filterButtons}>
        {["month", "week", "custom"].map((type) => (
          <TouchableOpacity
            key={type}
            onPress={() => {
              setFilterType(type)
              if (type === "month") {
                setShowMonthPicker(true)
              } else if (type === "week") {
                setShowMonthPicker(true)
              } else if (type === "custom") {
                setShowStartDatePicker(true)
              }
            }}
            style={[
              styles.filterButton,
              filterType === type && styles.activeFilterButton,
            ]}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterType === type && styles.activeFilterButtonText,
              ]}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filterType && (
        <TouchableOpacity
          style={styles.currentSelectionButton}
          onPress={() => {
            if (filterType === "month") {
              setShowMonthPicker(true)
            } else if (filterType === "week") {
              setShowMonthPicker(true)
            } else if (filterType === "custom") {
              setShowStartDatePicker(true)
            }
          }}
        >
          <View style={styles.selectionContent}>
            <Feather name="calendar" size={16} color="#007AFF" />
            <Text style={styles.currentSelectionText}>
              {getDisplayPeriod()}
            </Text>
          </View>
          <Feather name="chevron-right" size={16} color="#8E8E93" />
        </TouchableOpacity>
      )}

      {/* Date Pickers for Custom */}
      {showStartDatePicker && filterType === "custom" && (
        <DateTimePicker
          value={customStartDate}
          mode="date"
          display="default"
          maximumDate={new Date()}
          onChange={(event, date) => onDateChange(event, date, "start")}
        />
      )}
      {showEndDatePicker && filterType === "custom" && (
        <DateTimePicker
          value={customEndDate}
          mode="date"
          display="default"
          minimumDate={customStartDate}
          maximumDate={new Date()}
          onChange={(event, date) => onDateChange(event, date, "end")}
        />
      )}

      {renderMonthYearPickerModal()}
      {renderWeekPickerModal()}
    </View>
  )

  const renderMonthYearPickerModal = () => (
    <Modal visible={showMonthPicker} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modernPickerModal}>
          <View style={styles.modalHandle} />

          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>
              {filterType === "week"
                ? "Select Month for Week"
                : "Select Period"}
            </Text>
            <TouchableOpacity
              onPress={() => setShowMonthPicker(false)}
              style={styles.closeButton}
            >
              <Feather name="x" size={20} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.pickerContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Month Navigation */}
            <View style={styles.monthNavigation}>
              <TouchableOpacity
                onPress={() => navigateMonth("prev")}
                style={[styles.navButton, styles.prevButton]}
                disabled={selectedYear === years[0] && selectedMonth === 0}
              >
                <Feather name="chevron-left" size={24} color="#007AFF" />
              </TouchableOpacity>

              <View style={styles.currentPeriodDisplay}>
                <Text style={styles.currentMonthText}>
                  {months[selectedMonth]}
                </Text>
                <Text style={styles.currentYearText}>{selectedYear}</Text>
              </View>

              <TouchableOpacity
                onPress={() => navigateMonth("next")}
                style={[styles.navButton, styles.nextButton]}
                disabled={
                  selectedYear === currentYear && selectedMonth >= currentMonth
                }
              >
                <Feather name="chevron-right" size={24} color="#007AFF" />
              </TouchableOpacity>
            </View>

            {/* Year Selection */}
            <View style={styles.yearSection}>
              <Text style={styles.sectionLabel}>Quick Year Selection</Text>
              <View style={styles.yearGrid}>
                {years.map((year) => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.yearChip,
                      selectedYear === year && styles.selectedYearChip,
                    ]}
                    onPress={() => setSelectedYear(year)}
                  >
                    <Text
                      style={[
                        styles.yearChipText,
                        selectedYear === year && styles.selectedYearChipText,
                      ]}
                    >
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => {
                  setShowMonthPicker(false)
                  if (filterType === "week") {
                    setTimeout(() => setShowWeekPicker(true), 200)
                  }
                }}
              >
                <Text style={styles.primaryButtonText}>
                  {filterType === "week" ? "Select Week" : "Apply"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  )

  const renderWeekPickerModal = () => (
    <Modal visible={showWeekPicker} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modernPickerModal}>
          <View style={styles.modalHandle} />

          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>
              Select Week - {months[selectedMonth]} {selectedYear}
            </Text>
            <TouchableOpacity
              onPress={() => setShowWeekPicker(false)}
              style={styles.closeButton}
            >
              <Feather name="x" size={20} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.pickerContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.weeksList}>
              {getWeeksInMonth(selectedYear, selectedMonth).map((week) => (
                <TouchableOpacity
                  key={week.number}
                  style={[
                    styles.weekCard,
                    selectedWeek === week.number && styles.selectedWeekCard,
                  ]}
                  onPress={() => {
                    setSelectedWeek(week.number)
                    setShowWeekPicker(false)
                  }}
                >
                  <View style={styles.weekCardContent}>
                    <Text
                      style={[
                        styles.weekTitle,
                        selectedWeek === week.number &&
                          styles.selectedWeekTitle,
                      ]}
                    >
                      {week.label}
                    </Text>
                    <Text
                      style={[
                        styles.weekDate,
                        selectedWeek === week.number && styles.selectedWeekDate,
                      ]}
                    >
                      {week.start.toLocaleDateString()} -{" "}
                      {week.end.toLocaleDateString()}
                    </Text>
                  </View>
                  {selectedWeek === week.number && (
                    <View style={styles.checkIcon}>
                      <Feather name="check" size={18} color="white" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  )

  const renderCashFlowSummary = () => {
    if (!reportData?.cashFlowSummary) return null

    const { totalIncome, totalExpense, netCashFlow, savingsRate } =
      reportData.cashFlowSummary

    return (
      <View style={styles.cashFlowContainer}>
        <Text style={styles.sectionTitle}>Financial Overview</Text>

        <View style={styles.cashFlowGrid}>
          <View style={[styles.cashFlowCard, styles.incomeCard]}>
            <View style={styles.cashFlowIconContainer}>
              <Feather name="arrow-down-left" size={20} color="#34C759" />
            </View>
            <Text style={styles.cashFlowLabel}>Income</Text>
            <Text style={[styles.cashFlowAmount, { color: "#34C759" }]}>
              {formatCurrency(totalIncome)}
            </Text>
          </View>

          <View style={[styles.cashFlowCard, styles.expenseCard]}>
            <View style={styles.cashFlowIconContainer}>
              <Feather name="arrow-up-right" size={20} color="#FF3B30" />
            </View>
            <Text style={styles.cashFlowLabel}>Expenses</Text>
            <Text style={[styles.cashFlowAmount, { color: "#FF3B30" }]}>
              {formatCurrency(totalExpense)}
            </Text>
          </View>

          <View style={[styles.cashFlowCard, styles.netFlowCard]}>
            <View style={styles.cashFlowIconContainer}>
              <Feather name="trending-up" size={20} color="#007AFF" />
            </View>
            <Text style={styles.cashFlowLabel}>Net Flow</Text>
            <Text
              style={[
                styles.cashFlowAmount,
                { color: netCashFlow >= 0 ? "#34C759" : "#FF3B30" },
              ]}
            >
              {formatCurrency(netCashFlow)}
            </Text>
          </View>

          <View style={[styles.cashFlowCard, styles.savingsCard]}>
            <View style={styles.cashFlowIconContainer}>
              <Feather name="target" size={20} color="#AF52DE" />
            </View>
            <Text style={styles.cashFlowLabel}>Savings Rate</Text>
            <Text style={[styles.cashFlowAmount, { color: "#AF52DE" }]}>
              {savingsRate}%
            </Text>
          </View>
        </View>
      </View>
    )
  }

  const renderCategoryTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        onPress={() => setActiveTab("expense")}
        style={[styles.tab, activeTab === "expense" && styles.activeTab]}
      >
        <Feather
          name="arrow-up-right"
          size={16}
          color={activeTab === "expense" ? "white" : "#8E8E93"}
        />
        <Text
          style={[
            styles.tabText,
            activeTab === "expense" && styles.activeTabText,
          ]}
        >
          Expenses
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setActiveTab("income")}
        style={[styles.tab, activeTab === "income" && styles.activeTab]}
      >
        <Feather
          name="arrow-down-left"
          size={16}
          color={activeTab === "income" ? "white" : "#8E8E93"}
        />
        <Text
          style={[
            styles.tabText,
            activeTab === "income" && styles.activeTabText,
          ]}
        >
          Income
        </Text>
      </TouchableOpacity>
    </View>
  )

  const renderPieChart = () => {
    const chartData = getPieChartData()

    if (chartData.length === 0) {
      return (
        <View style={styles.noDataContainer}>
          <View style={styles.noDataIcon}>
            <Feather name="pie-chart" size={48} color="#C7C7CC" />
          </View>
          <Text style={styles.noDataText}>No Data Available</Text>
          <Text style={styles.noDataSubtext}>
            Add some {activeTab === "expense" ? "expenses" : "income"} to see
            insights
          </Text>
        </View>
      )
    }

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>
          {activeTab === "expense" ? "Expense" : "Income"} Breakdown
        </Text>

        <PieChart
          data={chartData}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>
    )
  }

  const renderCategoryList = () => {
    if (!reportData?.topCategories) return null

    const total = reportData.topCategories.reduce(
      (sum, cat) => sum + cat.total,
      0
    )

    return (
      <View style={styles.categoryListContainer}>
        <Text style={styles.sectionTitle}>Category Details</Text>

        {reportData.topCategories.map((category, index) => {
          const percentage = ((category.total / total) * 100).toFixed(1)

          return (
            <TouchableOpacity
              key={category._id}
              style={styles.categoryItem}
              onPress={() => handleCategoryClick(category._id)}
            >
              <View style={styles.categoryLeft}>
                <View
                  style={[
                    styles.categoryDot,
                    {
                      backgroundColor: chartColors[index % chartColors.length],
                    },
                  ]}
                />
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>
                    {category.categoryInfo?.label || "Unknown"}
                  </Text>
                  <Text style={styles.categoryCount}>
                    {category.count} transaction
                    {category.count !== 1 ? "s" : ""}
                  </Text>
                </View>
              </View>

              <View style={styles.categoryRight}>
                <Text style={styles.categoryAmount}>
                  {formatCurrency(category.total)}
                </Text>
                <Text style={styles.categoryPercentage}>{percentage}%</Text>
              </View>

              <Feather name="chevron-right" size={16} color="#C7C7CC" />
            </TouchableOpacity>
          )
        })}
      </View>
    )
  }

  const renderTransactionModal = () => {
    if (!selectedCategory) return null

    const categoryData = reportData?.topCategories.find(
      (cat) => cat._id === selectedCategory
    )

    return (
      <View style={styles.modalContainer}>
        <View style={styles.transactionModalHeader}>
          <TouchableOpacity
            onPress={() => setSelectedCategory(null)}
            style={styles.backButton}
          >
            <Feather name="chevron-left" size={24} color="#007AFF" />
          </TouchableOpacity>
          <View style={styles.modalTitleContainer}>
            <Text style={styles.modalTitle}>
              {categoryData?.categoryInfo?.label || "Category"} Transactions
            </Text>
            <Text style={styles.modalSubtitle}>{getDisplayPeriod()}</Text>
          </View>
        </View>

        <TransactionList
          transactions={transactions}
          accounts={accounts}
          onTransactionUpdate={() =>
            fetchCategoryTransactions(selectedCategory)
          }
        />
      </View>
    )
  }

  if (selectedCategory) {
    return renderTransactionModal()
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderFilterSection()}
      {renderPeriodDisplay()}
      {renderCashFlowSummary()}
      {renderCategoryTabs()}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading insights...</Text>
        </View>
      ) : (
        <>
          {renderPieChart()}
          {renderCategoryList()}
        </>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
    padding: 16,
  },

  // Filter Section
  filterContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1C1C1E",
    marginLeft: 8,
  },
  filterButtons: {
    flexDirection: "row",
    backgroundColor: "#F2F2F7",
    borderRadius: 8,
    padding: 2,
    marginBottom: 12,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  activeFilterButton: {
    backgroundColor: "#007AFF",
  },
  filterButtonText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#8E8E93",
  },
  activeFilterButtonText: {
    color: "white",
  },
  currentSelectionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 8,
    backgroundColor: "#FAFAFA",
  },
  selectionContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  currentSelectionText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1C1C1E",
    marginLeft: 8,
  },

  // Period Display
  periodDisplayContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  periodHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  periodText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#8E8E93",
    marginLeft: 8,
  },
  periodValue: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1C1C1E",
  },

  // Cash Flow
  cashFlowContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cashFlowGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  cashFlowCard: {
    flex: 1,
    minWidth: "47%",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cashFlowIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  incomeCard: {
    backgroundColor: "#E8F5E8",
  },
  expenseCard: {
    backgroundColor: "#FFE8E6",
  },
  netFlowCard: {
    backgroundColor: "#E6F3FF",
  },
  savingsCard: {
    backgroundColor: "#F0E6FF",
  },
  cashFlowLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#8E8E93",
    marginBottom: 4,
    textAlign: "center",
  },
  cashFlowAmount: {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },

  // Tabs
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  activeTab: {
    backgroundColor: "#007AFF",
  },
  tabText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#8E8E93",
  },
  activeTabText: {
    color: "white",
  },

  // Chart
  chartContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 16,
  },

  // Category List
  categoryListContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E5EA",
  },
  categoryLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1C1C1E",
  },
  categoryCount: {
    fontSize: 13,
    color: "#8E8E93",
    marginTop: 1,
  },
  categoryRight: {
    alignItems: "flex-end",
    marginRight: 8,
  },
  categoryAmount: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  categoryPercentage: {
    fontSize: 13,
    fontWeight: "500",
    color: "#8E8E93",
  },

  // Loading & No Data
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: "500",
    color: "#8E8E93",
  },
  noDataContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 12,
  },
  noDataIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F2F2F7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  noDataText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#8E8E93",
    marginBottom: 4,
  },
  noDataSubtext: {
    fontSize: 15,
    color: "#C7C7CC",
    textAlign: "center",
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  modernPickerModal: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "75%",
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: "#C7C7CC",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 12,
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E5EA",
  },
  pickerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  closeButton: {
    padding: 4,
  },
  pickerContent: {
    maxHeight: 400,
  },

  // Month Navigation
  monthNavigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F2F2F7",
    alignItems: "center",
    justifyContent: "center",
  },
  currentPeriodDisplay: {
    alignItems: "center",
  },
  currentMonthText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  currentYearText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#8E8E93",
    marginTop: 2,
  },

  // Year Section
  yearSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#8E8E93",
    marginBottom: 12,
  },
  yearGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  yearChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "#F2F2F7",
  },
  selectedYearChip: {
    backgroundColor: "#007AFF",
  },
  yearChipText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1C1C1E",
  },
  selectedYearChipText: {
    color: "white",
  },

  // Week List
  weeksList: {
    padding: 20,
  },
  weekCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#F2F2F7",
    marginBottom: 8,
  },
  selectedWeekCard: {
    backgroundColor: "#007AFF",
  },
  weekCardContent: {
    flex: 1,
  },
  weekTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1C1C1E",
  },
  selectedWeekTitle: {
    color: "white",
  },
  weekDate: {
    fontSize: 13,
    color: "#8E8E93",
    marginTop: 2,
  },
  selectedWeekDate: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Modal Actions
  modalActions: {
    padding: 20,
  },
  primaryButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "600",
  },

  // Transaction Modal
  modalContainer: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  transactionModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E5EA",
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  modalTitleContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  modalSubtitle: {
    fontSize: 15,
    color: "#8E8E93",
    marginTop: 2,
  },
})

export default ReportsScreen
