import { Ionicons } from "@expo/vector-icons"
import { useFocusEffect } from "@react-navigation/native"
import { router } from "expo-router"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  ActivityIndicator,
  Animated,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import FilterModal from "../../../src/components/FilterModal"
import SummaryCard from "../../../src/components/SummaryCard" // Import the new component
import TransactionList from "../../../src/components/TransactionList"
import { useAccountsContext } from "../../../src/context/AccountContext"
import { useTransaction } from "../../../src/hooks/useTransaction"
export default function RecordsScreen() {
  const [allTransactions, setAllTransactions] = useState([])
  const { getTransactions, findAll } = useTransaction()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)

  const [searchText, setSearchText] = useState("") // typed text
  const [searchQuery, setSearchQuery] = useState("") // debounced search term
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [searchWidth] = useState(new Animated.Value(0))
  const [filters, setFilters] = useState({
    type: "",
    accountId: "",
    startDate: "",
    endDate: "",
    dateRange: "month", // Changed default to "month" instead of "all"
  })

  const lastFetchParams = useRef(null)
  const searchTimeoutRef = useRef(null)

  const { accounts } = useAccountsContext()

  // Initialize with current month date range
  useEffect(() => {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    setFilters((prev) => ({
      ...prev,
      startDate: monthStart.toISOString().split("T")[0],
      endDate: monthEnd.toISOString().split("T")[0],
    }))
  }, [])

  // Debounce search input
  const debouncedSearch = useCallback((text) => {
    setSearchText(text)
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = setTimeout(() => {
      setSearchQuery(text.trim().toLowerCase())
    }, 300)
  }, [])

  // Fetch transactions with filters applied
  const fetchTransactions = useCallback(
    async (showLoadingIndicator = true) => {
      if (showLoadingIndicator) setLoading(true)
      try {
        const options = { page: 1, limit: 100 }
        if (filters.type) options.type = filters.type
        if (filters.accountId) options.accountId = filters.accountId
        if (filters.startDate) options.startDate = filters.startDate
        if (filters.endDate) options.endDate = filters.endDate
        if (filters.dateRange !== "all" && filters.dateRange !== "custom") {
          const range = getDateRangeFromFilter(filters.dateRange)
          if (range.startDate) options.startDate = range.startDate
          if (range.endDate) options.endDate = range.endDate
        }

        const currentParams = JSON.stringify(options)
        if (
          lastFetchParams.current === currentParams &&
          !showLoadingIndicator
        ) {
          return
        }
        lastFetchParams.current = currentParams

        // const result = await transactionService.getTransactions(options)

        const result = await getTransactions(options) // Use local db hook
        const all = await findAll()
        //console.log("Fetched transaction:: ", all)
        console.log("With filters all:", result.data.transactions)

        const indexed = (result.data.transactions || []).map((t) => ({
          ...t,
          _searchString: `${t.description || ""} ${t.note || ""} ${
            accounts.find((a) => a.id === t.accountId)?.name || ""
          }`.toLowerCase(),
        }))
        setAllTransactions(indexed)
      } catch (err) {
        console.error("Error loading transactions:", err)
      } finally {
        setLoading(false)
      }
    },
    [filters, accounts]
  )

  // Filter transactions in memory
  const filteredTransactions = useMemo(() => {
    let filtered = searchQuery
      ? allTransactions.filter((t) => t._searchString.includes(searchQuery))
      : allTransactions

    filtered.sort(
      (a, b) =>
        new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
    )
    return filtered
  }, [allTransactions, searchQuery])

  // Summary calculation
  const transactionSummary = useMemo(() => {
    const income = filteredTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0)
    const expenses = filteredTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0)
    const transfers = filteredTransactions
      .filter((t) => t.type === "transfer")
      .reduce((sum, t) => sum + t.amount, 0)
    return { income, expenses, transfers, balance: income - expenses }
  }, [filteredTransactions])

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    lastFetchParams.current = null
    await fetchTransactions(false)
    setRefreshing(false)
  }, [fetchTransactions])

  // Fetch on focus
  useFocusEffect(
    useCallback(() => {
      fetchTransactions()
    }, [fetchTransactions])
  )

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    }
  }, [])

  const getDateRangeFromFilter = (dateRange) => {
    const now = new Date()
    switch (dateRange) {
      case "today":
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        return {
          startDate: today.toISOString().split("T")[0],
          endDate: today.toISOString().split("T")[0],
        }
      case "week":
        const weekStart = new Date(now)
        weekStart.setDate(now.getDate() - now.getDay())
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        return {
          startDate: weekStart.toISOString().split("T")[0],
          endDate: weekEnd.toISOString().split("T")[0],
        }
      case "month":
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        return {
          startDate: monthStart.toISOString().split("T")[0],
          endDate: monthEnd.toISOString().split("T")[0],
        }
      default:
        return {}
    }
  }

  const toggleSearch = () => {
    if (isSearchExpanded) {
      Animated.timing(searchWidth, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }).start(() => {
        setIsSearchExpanded(false)
        setSearchText("")
        setSearchQuery("")
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
      })
    } else {
      setIsSearchExpanded(true)
      Animated.timing(searchWidth, {
        toValue: 180,
        duration: 250,
        useNativeDriver: false,
      }).start()
    }
  }

  const handleApplyFilters = useCallback((newFilters) => {
    setFilters(newFilters)
    setShowFilterModal(false)
    lastFetchParams.current = null
  }, [])

  const handleClearFilters = useCallback(() => {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    setFilters({
      type: "",
      accountId: "",
      startDate: monthStart.toISOString().split("T")[0],
      endDate: monthEnd.toISOString().split("T")[0],
      dateRange: "month",
    })
    setSearchText("")
    setSearchQuery("")
    if (isSearchExpanded) toggleSearch()
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    lastFetchParams.current = null
  }, [isSearchExpanded])

  // Handler for account change from SummaryCard
  const handleAccountChange = useCallback((accountId) => {
    setFilters((prev) => ({
      ...prev,
      accountId: accountId,
    }))
    lastFetchParams.current = null
  }, [])

  // Handler for period change from SummaryCard
  const handlePeriodChange = useCallback((dateRange) => {
    const range = getDateRangeFromFilter(dateRange)
    setFilters((prev) => ({
      ...prev,
      dateRange: dateRange,
      startDate: range.startDate || prev.startDate,
      endDate: range.endDate || prev.endDate,
    }))
    lastFetchParams.current = null
  }, [])

  const hasActiveFilters = useMemo(() => {
    return (
      filters.type ||
      filters.accountId ||
      filters.dateRange !== "month" ||
      searchQuery.trim()
    )
  }, [filters, searchQuery])

  // Create enhanced TransactionList with SummaryCard
  const TransactionListWithSummary = useCallback(
    ({ transactions, accounts, transactionSummary, ...props }) => {
      return (
        <TransactionList
          transactions={transactions}
          accounts={accounts}
          transactionSummary={transactionSummary}
          ListHeaderComponent={() => (
            <SummaryCard
              transactionSummary={transactionSummary}
              accounts={accounts}
              selectedAccountId={filters.accountId}
              onAccountChange={handleAccountChange}
              filters={filters}
              onPeriodChange={handlePeriodChange}
            />
          )}
          {...props}
        />
      )
    },
    [filters, handleAccountChange, handlePeriodChange]
  )

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1CC29F" />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                router.replace("/users/home")
              }}
            >
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            {!isSearchExpanded && (
              <Text style={styles.headerTitle}>Records</Text>
            )}
          </View>

          <View style={styles.headerRight}>
            {isSearchExpanded && (
              <Animated.View
                style={[styles.searchContainer, { width: searchWidth }]}
              >
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search..."
                  placeholderTextColor="rgba(255, 255, 255, 0.7)"
                  value={searchText}
                  onChangeText={debouncedSearch}
                  autoFocus
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </Animated.View>
            )}

            <TouchableOpacity
              style={styles.actionButton}
              onPress={toggleSearch}
            >
              <Ionicons
                name={isSearchExpanded ? "close" : "search"}
                size={20}
                color="#FFFFFF"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowFilterModal(true)}
            >
              <Ionicons
                name="filter"
                size={20}
                color={hasActiveFilters ? "#FFD700" : "#FFFFFF"}
              />
              {hasActiveFilters && <View style={styles.filterBadge} />}
            </TouchableOpacity>
          </View>
        </View>

        {hasActiveFilters && (
          <View style={styles.clearFiltersContainer}>
            <TouchableOpacity
              style={styles.clearFiltersButton}
              onPress={handleClearFilters}
            >
              <Ionicons name="close-circle" size={16} color="#FF6B6B" />
              <Text style={styles.clearFiltersText}>
                Clear All ({filteredTransactions.length})
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1CC29F" />
            <Text style={styles.loadingText}>Loading transactions...</Text>
          </View>
        ) : (
          <TransactionList
            transactions={filteredTransactions}
            accounts={accounts}
            onTransactionUpdate={() => {
              lastFetchParams.current = null
              fetchTransactions()
            }}
            headerComponent={
              <SummaryCard
                transactionSummary={transactionSummary}
                accounts={accounts}
                selectedAccountId={filters.accountId}
                onAccountChange={handleAccountChange}
                filters={filters}
                onPeriodChange={handlePeriodChange}
              />
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#1CC29F"]}
                tintColor="#1CC29F"
              />
            }
          />
        )}

        <FilterModal
          visible={showFilterModal}
          filters={filters}
          accounts={accounts}
          onApplyFilters={handleApplyFilters}
          onClose={() => setShowFilterModal(false)}
        />
      </SafeAreaView>
    </>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    backgroundColor: "#1CC29F",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 76,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginLeft: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    marginLeft: 8,
  },
  filterBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFD700",
  },
  searchContainer: {
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    justifyContent: "center",
    overflow: "hidden",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  clearFiltersContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  clearFiltersButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#FFF5F5",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FED7D7",
  },
  clearFiltersText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#FF6B6B",
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
})
