import { Ionicons } from "@expo/vector-icons"
import DateTimePicker from "@react-native-community/datetimepicker"
import { router, useNavigation } from "expo-router"
import * as SecureStore from "expo-secure-store"
import { useEffect, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
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
  const [selectedAccountId, setSelectedAccountId] = useState("")
  const [customStartDate, setCustomStartDate] = useState(new Date())
  const [customEndDate, setCustomEndDate] = useState(new Date())
  const [showStartDatePicker, setShowStartDatePicker] = useState(false)
  const [showEndDatePicker, setShowEndDatePicker] = useState(false)
  const [showFiltersModal, setShowFiltersModal] = useState(false)
  const [showMonthPicker, setShowMonthPicker] = useState(false)
  const [showWeekPicker, setShowWeekPicker] = useState(false)
  const { accounts } = useAccountsContext()
  const navigation = useNavigation()
  // Updated chart colors matching your app theme
  const chartColors = [
    "#1CC29F", // Primary app color
    "#10B981", // Success green
    "#EF4444", // Error red
    "#F59E0B", // Warning amber
    "#8B5CF6", // Purple
    "#06B6D4", // Cyan
    "#EC4899", // Pink
    "#84CC16", // Lime
    "#F97316", // Orange
    "#6366F1", // Indigo
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

  // Only show past and current years (remove future years)
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 4 + i).filter(
    (year) => year <= currentYear
  )

  useEffect(() => {
    fetchReportData()
  }, [
    filterType,
    selectedYear,
    selectedMonth,
    selectedWeek,
    selectedAccountId,
    customStartDate,
    customEndDate,
    activeTab,
  ])

  const getWeeksInMonth = (year, month) => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const today = new Date()
    const weeks = []

    let weekStart = new Date(firstDay)
    let weekNumber = 1

    while (weekStart <= lastDay) {
      let weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)

      if (weekEnd > lastDay) {
        weekEnd = new Date(lastDay)
      }

      // Only add weeks that are not entirely in the future
      if (weekStart <= today) {
        weeks.push({
          number: weekNumber,
          start: new Date(weekStart),
          end: new Date(weekEnd),
          label: `Week ${weekNumber} (${weekStart.getDate()}-${weekEnd.getDate()})`,
        })
      }

      weekStart.setDate(weekStart.getDate() + 7)
      weekNumber++
    }

    return weeks
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
      return `${new Date(startDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })} - ${new Date(endDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })}`
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

  const getSelectedAccountName = () => {
    if (!selectedAccountId) return "All Accounts"
    const account = accounts.find((acc) => acc.id === selectedAccountId)
    return account?.name || "All Accounts"
  }

  const clearAllFilters = () => {
    const now = new Date()
    setSelectedAccountId("")
    setActiveTab("expense")
    setFilterType("month")
    setSelectedYear(now.getFullYear())
    setSelectedMonth(now.getMonth())
    setSelectedWeek(1)
    setCustomStartDate(now)
    setCustomEndDate(now)
  }

  const hasActiveFilters = () => {
    const now = new Date()
    return (
      selectedAccountId ||
      filterType !== "month" ||
      selectedYear !== now.getFullYear() ||
      selectedMonth !== now.getMonth()
    )
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
        ...(selectedAccountId && { accountId: selectedAccountId }),
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
        ...(selectedAccountId && { accountId: selectedAccountId }),
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
      legendFontColor: "#374151",
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

  const renderHeader = () => (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1CC29F" />
      <SafeAreaView style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push("/(tabs)/records")}
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detailed Reports</Text>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFiltersModal(true)}
          >
            <Ionicons name="options" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  )

  const renderCurrentFilters = () => {
    if (!hasActiveFilters()) return null

    return (
      <View style={styles.currentFiltersContainer}>
        <View style={styles.filtersHeader}>
          <Text style={styles.currentFiltersTitle}>Active Filters:</Text>
          <TouchableOpacity
            style={styles.clearFiltersButton}
            onPress={clearAllFilters}
          >
            <Ionicons name="close-circle" size={16} color="#EF4444" />
            <Text style={styles.clearFiltersText}>Clear All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.filterChips}>
          {selectedAccountId && (
            <View style={styles.filterChip}>
              <Text style={styles.filterChipText}>
                {getSelectedAccountName()}
              </Text>
            </View>
          )}
          <View style={styles.filterChip}>
            <Text style={styles.filterChipText}>{getDisplayPeriod()}</Text>
          </View>
        </View>
      </View>
    )
  }

  const renderFiltersModal = () => (
    <Modal visible={showFiltersModal} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.filtersModal}>
          <View style={styles.modalHandle} />

          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Report Filters</Text>
            <TouchableOpacity
              onPress={() => setShowFiltersModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Account Filter */}
            <View style={styles.filterSection}>
              <View style={styles.filterSectionHeader}>
                <View style={styles.filterSectionIconContainer}>
                  <Ionicons name="wallet-outline" size={18} color="#1CC29F" />
                </View>
                <Text style={styles.filterSectionTitle}>Account</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.accountChips}
              >
                <TouchableOpacity
                  style={[
                    styles.accountChip,
                    !selectedAccountId && styles.selectedChip,
                  ]}
                  onPress={() => setSelectedAccountId("")}
                >
                  <Text
                    style={[
                      styles.accountChipText,
                      !selectedAccountId && styles.selectedChipText,
                    ]}
                  >
                    All Accounts
                  </Text>
                </TouchableOpacity>
                {accounts.map((account) => (
                  <TouchableOpacity
                    key={account.id}
                    style={[
                      styles.accountChip,
                      selectedAccountId === account.id && styles.selectedChip,
                    ]}
                    onPress={() => setSelectedAccountId(account.id)}
                  >
                    <View
                      style={[
                        styles.accountDot,
                        { backgroundColor: account.color || "#6B7280" },
                      ]}
                    />
                    <Text
                      style={[
                        styles.accountChipText,
                        selectedAccountId === account.id &&
                          styles.selectedChipText,
                      ]}
                    >
                      {account.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Time Period */}
            <View style={styles.filterSection}>
              <View style={styles.filterSectionHeader}>
                <View style={styles.filterSectionIconContainer}>
                  <Ionicons name="calendar-outline" size={18} color="#1CC29F" />
                </View>
                <Text style={styles.filterSectionTitle}>Time Period</Text>
              </View>
              <View style={styles.periodButtons}>
                {["month", "week", "custom"].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.periodButton,
                      filterType === type && styles.selectedPeriodButton,
                    ]}
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
                  >
                    <Text
                      style={[
                        styles.periodButtonText,
                        filterType === type && styles.selectedPeriodButtonText,
                      ]}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.periodSelection}
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
                <View style={styles.periodSelectionContent}>
                  <View style={styles.periodSelectionIconContainer}>
                    <Ionicons name="calendar" size={16} color="#1CC29F" />
                  </View>
                  <Text style={styles.periodSelectionText}>
                    {getDisplayPeriod()}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setShowFiltersModal(false)}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Date Pickers */}
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
        </View>
      </View>
    </Modal>
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
              <Ionicons name="close" size={20} color="#6B7280" />
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
                style={[
                  styles.navButton,
                  selectedYear === years[0] &&
                    selectedMonth === 0 &&
                    styles.disabledButton,
                ]}
                disabled={selectedYear === years[0] && selectedMonth === 0}
              >
                <Ionicons
                  name="chevron-back"
                  size={24}
                  color={
                    selectedYear === years[0] && selectedMonth === 0
                      ? "#D1D5DB"
                      : "#1CC29F"
                  }
                />
              </TouchableOpacity>

              <View style={styles.currentPeriodDisplay}>
                <Text style={styles.currentMonthText}>
                  {months[selectedMonth]}
                </Text>
                <Text style={styles.currentYearText}>{selectedYear}</Text>
              </View>

              <TouchableOpacity
                onPress={() => navigateMonth("next")}
                style={[
                  styles.navButton,
                  selectedYear === currentYear &&
                    selectedMonth >= currentMonth &&
                    styles.disabledButton,
                ]}
                disabled={
                  selectedYear === currentYear && selectedMonth >= currentMonth
                }
              >
                <Ionicons
                  name="chevron-forward"
                  size={24}
                  color={
                    selectedYear === currentYear &&
                    selectedMonth >= currentMonth
                      ? "#D1D5DB"
                      : "#1CC29F"
                  }
                />
              </TouchableOpacity>
            </View>

            {/* Year Selection */}
            <View style={styles.yearSection}>
              <Text style={styles.sectionLabel}>Select Year</Text>
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
              <Ionicons name="close" size={20} color="#6B7280" />
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
                      {week.start.toLocaleDateString("en-GB")} -{" "}
                      {week.end.toLocaleDateString("en-GB")}
                    </Text>
                  </View>
                  {selectedWeek === week.number && (
                    <View style={styles.checkIcon}>
                      <Ionicons name="checkmark" size={18} color="white" />
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
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIconContainer}>
            <Ionicons name="trending-up" size={18} color="#1CC29F" />
          </View>
          <Text style={styles.sectionTitle}>Financial Overview</Text>
        </View>

        <View style={styles.cashFlowGrid}>
          <View style={[styles.cashFlowCard, styles.incomeCard]}>
            <View style={styles.cashFlowIconContainer}>
              <Ionicons name="arrow-down" size={18} color="#10B981" />
            </View>
            <Text style={styles.cashFlowLabel}>Income</Text>
            <Text style={[styles.cashFlowAmount, { color: "#10B981" }]}>
              {formatCurrency(totalIncome)}
            </Text>
          </View>

          <View style={[styles.cashFlowCard, styles.expenseCard]}>
            <View style={styles.cashFlowIconContainer}>
              <Ionicons name="arrow-up" size={18} color="#EF4444" />
            </View>
            <Text style={styles.cashFlowLabel}>Expenses</Text>
            <Text style={[styles.cashFlowAmount, { color: "#EF4444" }]}>
              {formatCurrency(totalExpense)}
            </Text>
          </View>

          <View style={[styles.cashFlowCard, styles.netFlowCard]}>
            <View style={styles.cashFlowIconContainer}>
              <Ionicons name="trending-up" size={18} color="#1CC29F" />
            </View>
            <Text style={styles.cashFlowLabel}>Net Flow</Text>
            <Text
              style={[
                styles.cashFlowAmount,
                { color: netCashFlow >= 0 ? "#10B981" : "#EF4444" },
              ]}
            >
              {formatCurrency(netCashFlow)}
            </Text>
          </View>

          <View style={[styles.cashFlowCard, styles.savingsCard]}>
            <View style={styles.cashFlowIconContainer}>
              <Ionicons name="star" size={18} color="#8B5CF6" />
            </View>
            <Text style={styles.cashFlowLabel}>Savings Rate</Text>
            <Text style={[styles.cashFlowAmount, { color: "#8B5CF6" }]}>
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
        <View style={styles.tabIconContainer}>
          <Ionicons
            name="arrow-up"
            size={16}
            color={activeTab === "expense" ? "#FFFFFF" : "#6B7280"}
          />
        </View>
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
        <View style={styles.tabIconContainer}>
          <Ionicons
            name="arrow-down"
            size={16}
            color={activeTab === "income" ? "#FFFFFF" : "#6B7280"}
          />
        </View>
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
            <Ionicons name="pie-chart" size={48} color="#D1D5DB" />
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
        <View style={styles.chartHeader}>
          <View style={styles.chartIconContainer}>
            <Ionicons name="pie-chart" size={18} color="#1CC29F" />
          </View>
          <Text style={styles.chartTitle}>
            {activeTab === "expense" ? "Expense" : "Income"} Breakdown (
            {getSelectedAccountName()})
          </Text>
        </View>

        <PieChart
          data={chartData}
          width={screenWidth - 72}
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
        <View style={styles.categoryHeader}>
          <View style={styles.categoryIconContainer}>
            <Ionicons name="list" size={18} color="#1CC29F" />
          </View>
          <Text style={styles.sectionTitle}>Category Details</Text>
        </View>

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

              <View style={styles.categoryChevron}>
                <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
              </View>
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
            style={styles.transactionBackButton}
          >
            <Ionicons name="chevron-back" size={24} color="#1CC29F" />
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
    <View style={styles.container}>
      {renderHeader()}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderCurrentFilters()}
        {renderCashFlowSummary()}
        {renderCategoryTabs()}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1CC29F" />
            <Text style={styles.loadingText}>Loading insights...</Text>
          </View>
        ) : (
          <>
            {renderPieChart()}
            {renderCategoryList()}
          </>
        )}
      </ScrollView>

      {renderFiltersModal()}
      {renderMonthYearPickerModal()}
      {renderWeekPickerModal()}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },

  // Header
  headerContainer: {
    backgroundColor: "#1CC29F",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 56,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 16,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },

  content: {
    flex: 1,
    padding: 16,
  },

  // Current Filters
  currentFiltersContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  filtersHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  currentFiltersTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  clearFiltersButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#FEF2F2",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  clearFiltersText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#EF4444",
    marginLeft: 4,
  },
  filterChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterChip: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#1CC29F",
  },

  // Filters Modal
  filtersModal: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    paddingBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: "#D1D5DB",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  modalContent: {
    maxHeight: 500,
  },

  // Filter Sections
  filterSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  filterSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  filterSectionIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },

  // Account Filter
  accountChips: {
    flexDirection: "row",
  },
  accountChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  selectedChip: {
    backgroundColor: "#1CC29F",
    borderColor: "#1CC29F",
  },
  accountDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  accountChipText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  selectedChipText: {
    color: "#FFFFFF",
  },

  // Period Buttons
  periodButtons: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  selectedPeriodButton: {
    backgroundColor: "#1CC29F",
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  selectedPeriodButtonText: {
    color: "#FFFFFF",
  },
  periodSelection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
  },
  periodSelectionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  periodSelectionIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
  },
  periodSelectionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },

  // Cash Flow
  cashFlowContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  cashFlowGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  cashFlowCard: {
    flex: 1,
    minWidth: "47%",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  cashFlowIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  incomeCard: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  expenseCard: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  netFlowCard: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  savingsCard: {
    backgroundColor: "#FAF5FF",
    borderWidth: 1,
    borderColor: "#E9D5FF",
  },
  cashFlowLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
    marginBottom: 4,
    textAlign: "center",
  },
  cashFlowAmount: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },

  // Tabs
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  activeTab: {
    backgroundColor: "#1CC29F",
  },
  tabIconContainer: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  activeTabText: {
    color: "#FFFFFF",
  },

  // Chart
  chartContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  chartHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    alignSelf: "flex-start",
  },
  chartIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  // Category List
  categoryListContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  categoryIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
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
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  categoryCount: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  categoryRight: {
    alignItems: "flex-end",
    marginRight: 12,
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  categoryPercentage: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    marginTop: 2,
  },
  categoryChevron: {
    padding: 4,
  },

  // Loading & No Data
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280",
  },
  noDataContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
  },
  noDataIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  noDataText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#6B7280",
    marginBottom: 8,
  },
  noDataSubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    paddingHorizontal: 20,
  },

  // Period Picker Modal
  modernPickerModal: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  pickerContent: {
    maxHeight: 500,
  },

  // Month Navigation
  monthNavigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  disabledButton: {
    backgroundColor: "#F3F4F6",
    borderColor: "#E5E7EB",
  },
  currentPeriodDisplay: {
    alignItems: "center",
  },
  currentMonthText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  currentYearText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280",
    marginTop: 4,
  },

  // Year Section
  yearSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
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
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  selectedYearChip: {
    backgroundColor: "#1CC29F",
    borderColor: "#1CC29F",
  },
  yearChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  selectedYearChipText: {
    color: "#FFFFFF",
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
    backgroundColor: "#F9FAFB",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  selectedWeekCard: {
    backgroundColor: "#1CC29F",
    borderColor: "#1CC29F",
  },
  weekCardContent: {
    flex: 1,
  },
  weekTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  selectedWeekTitle: {
    color: "#FFFFFF",
  },
  weekDate: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  selectedWeekDate: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  checkIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Modal Actions
  modalActions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  applyButton: {
    backgroundColor: "#1CC29F",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#1CC29F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  applyButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  primaryButton: {
    backgroundColor: "#1CC29F",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#1CC29F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },

  // Transaction Modal
  modalContainer: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  transactionModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionBackButton: {
    marginRight: 16,
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#F0FDF4",
  },
  modalTitleContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
})

export default ReportsScreen
