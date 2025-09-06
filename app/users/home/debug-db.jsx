import { router } from "expo-router"
import { useEffect, useState } from "react"
import {
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { useDatabase } from "../../../src/database/providers/DatabaseProvider"
import { useSplitBudgetSync } from "../../../src/hooks/useSplitBudgetSync"
const DebugDB = () => {
  const { db } = useDatabase()
  const [sqlQuery, setSqlQuery] = useState("")
  const [queryResult, setQueryResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [tables, setTables] = useState([])
  const [selectedTable, setSelectedTable] = useState("")
  const [error, setError] = useState("")
  const { triggerSync } = useSplitBudgetSync()
  // Predefined queries for quick access
  const predefinedQueries = [
    {
      name: "All Tables",
      query: "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;",
    },
    {
      name: "Accounts",
      query:
        "SELECT * FROM accounts WHERE is_deleted = 0 ORDER BY created_at DESC;",
    },
    {
      name: "Categories",
      query:
        "SELECT * FROM categories WHERE is_deleted = 0 ORDER BY created_at DESC;",
    },
    {
      name: "Transactions",
      query:
        "SELECT * FROM transactions WHERE is_deleted = 0 ORDER BY created_at DESC LIMIT 20;",
    },
    {
      name: "Sync Operations",
      query: "SELECT * FROM sync_operations ORDER BY created_at DESC LIMIT 20;",
    },
    {
      name: "Pending Sync Ops",
      query:
        "SELECT * FROM sync_operations WHERE status = 'pending' ORDER BY priority ASC, created_at ASC;",
    },
    {
      name: "Failed Sync Ops",
      query:
        "SELECT * FROM sync_operations WHERE status = 'failed' ORDER BY created_at DESC;",
    },
    {
      name: "Schedule Transactions",
      query:
        "SELECT * FROM schedule_transactions WHERE is_deleted = 0 ORDER BY created_at DESC;",
    },
    {
      name: "Table Schema",
      query: "PRAGMA table_info('accounts');", // Will be updated based on selection
    },
    {
      name: "Sync Status Summary",
      query: `
        SELECT 
          'accounts' as table_name, 
          COUNT(*) as total,
          COUNT(CASE WHEN sync_status = 'synced' THEN 1 END) as synced,
          COUNT(CASE WHEN sync_status = 'pending_create' THEN 1 END) as pending_create,
          COUNT(CASE WHEN sync_status = 'pending_update' THEN 1 END) as pending_update
        FROM accounts WHERE is_deleted = 0
        UNION ALL
        SELECT 
          'categories' as table_name,
          COUNT(*) as total,
          COUNT(CASE WHEN sync_status = 'synced' THEN 1 END) as synced,
          COUNT(CASE WHEN sync_status = 'pending_create' THEN 1 END) as pending_create,
          COUNT(CASE WHEN sync_status = 'pending_update' THEN 1 END) as pending_update
        FROM categories WHERE is_deleted = 0
        UNION ALL
        SELECT 
          'transactions' as table_name,
          COUNT(*) as total,
          COUNT(CASE WHEN sync_status = 'synced' THEN 1 END) as synced,
          COUNT(CASE WHEN sync_status = 'pending_create' THEN 1 END) as pending_create,
          COUNT(CASE WHEN sync_status = 'pending_update' THEN 1 END) as pending_update
        FROM transactions WHERE is_deleted = 0;
      `,
    },
  ]

  useEffect(() => {
    loadTables()
  }, [])

  const loadTables = async () => {
    try {
      if (!db) return

      const result = await db.getAllAsync(
        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
      )
      setTables(result.map((row) => row.name))
    } catch (error) {
      console.error("Failed to load tables:", error)
    }
  }

  const executeQuery = async (query = sqlQuery) => {
    if (!db || !query.trim()) {
      Alert.alert("Error", "Please enter a valid SQL query")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      console.log("🔍 Executing query:", query)

      // Determine if it's a SELECT query or modification query
      const isSelectQuery =
        query.trim().toLowerCase().startsWith("select") ||
        query.trim().toLowerCase().startsWith("pragma")

      let result
      if (isSelectQuery) {
        result = await db.getAllAsync(query)
      } else {
        // For INSERT, UPDATE, DELETE, etc.
        result = await db.runAsync(query)
      }

      setQueryResult({
        query,
        data: result,
        isSelect: isSelectQuery,
        timestamp: new Date().toLocaleTimeString(),
        rowCount: Array.isArray(result) ? result.length : result?.changes || 0,
      })

      console.log("✅ Query executed successfully:", result)

      // If tables might have changed, reload them
      if (!isSelectQuery) {
        loadTables()
      }
    } catch (error) {
      console.error("❌ Query execution failed:", error)
      setError(error.message)
      Alert.alert("Query Error", error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const clearResults = () => {
    setQueryResult(null)
    setError("")
  }
  const handleSync = async () => {
    try {
      await triggerSync()
    } catch (err) {
      console.error("Sync failed:", err)
      Alert.alert("Sync Error", err.message)
    }
  }

  // ✅ Enhanced table rendering with proper column alignment
  const calculateColumnWidth = (column, data) => {
    // Calculate width based on column name and sample data
    const maxContentLength = Math.max(
      column.length,
      ...data.slice(0, 10).map((row) => String(row[column] || "NULL").length)
    )

    // Set minimum and maximum widths
    const minWidth = 80
    const maxWidth = 200
    const calculatedWidth = Math.max(
      minWidth,
      Math.min(maxWidth, maxContentLength * 8)
    )

    return calculatedWidth
  }

  const renderQueryResult = () => {
    if (!queryResult) return null

    if (!queryResult.isSelect) {
      return (
        <View style={styles.resultContainer}>
          <Text style={styles.resultHeader}>
            Query executed at {queryResult.timestamp}
          </Text>
          <Text style={styles.resultText}>
            Rows affected: {queryResult.rowCount}
          </Text>
        </View>
      )
    }

    if (!Array.isArray(queryResult.data) || queryResult.data.length === 0) {
      return (
        <View style={styles.resultContainer}>
          <Text style={styles.resultHeader}>
            Query executed at {queryResult.timestamp}
          </Text>
          <Text style={styles.resultText}>No results found</Text>
        </View>
      )
    }

    const columns = Object.keys(queryResult.data[0])

    // ✅ Calculate column widths for proper alignment
    const columnWidths = {}
    columns.forEach((column) => {
      columnWidths[column] = calculateColumnWidth(column, queryResult.data)
    })

    return (
      <View style={styles.resultContainer}>
        <Text style={styles.resultHeader}>
          Results ({queryResult.data.length} rows) - {queryResult.timestamp}
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={true}
          style={styles.horizontalScroll}
        >
          <View style={styles.tableContainer}>
            {/* ✅ Fixed Header Row */}
            <View style={styles.headerRow}>
              {columns.map((column, index) => (
                <View
                  key={`header-${index}`}
                  style={[styles.headerCell, { width: columnWidths[column] }]}
                >
                  <Text style={styles.headerText} numberOfLines={1}>
                    {column}
                  </Text>
                </View>
              ))}
            </View>

            {/* ✅ Data Rows with matching column widths */}
            <ScrollView
              style={styles.tableScrollView}
              nestedScrollEnabled={true} // ✅ allow nested scroll
              showsVerticalScrollIndicator={true}
            >
              {queryResult.data.map((row, rowIndex) => (
                <View
                  key={`row-${rowIndex}`}
                  style={[
                    styles.dataRow,
                    rowIndex % 2 === 0 ? styles.evenRow : styles.oddRow,
                  ]}
                >
                  {columns.map((column, colIndex) => (
                    <View
                      key={`cell-${rowIndex}-${colIndex}`}
                      style={[styles.dataCell, { width: columnWidths[column] }]}
                    >
                      <Text style={styles.cellText} numberOfLines={3}>
                        {row[column] !== null ? String(row[column]) : "NULL"}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    )
  }

  const renderPredefinedQueries = () => (
    <Modal
      visible={showModal}
      animationType="slide"
      onRequestClose={() => setShowModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Predefined Queries</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowModal(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={predefinedQueries}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.queryItem}
              onPress={() => {
                let query = item.query

                // Handle table schema query
                if (item.name === "Table Schema" && selectedTable) {
                  query = `PRAGMA table_info('${selectedTable}');`
                }

                setSqlQuery(query)
                setShowModal(false)
                executeQuery(query)
              }}
            >
              <Text style={styles.queryName}>{item.name}</Text>
              <Text style={styles.queryPreview} numberOfLines={2}>
                {item.query}
              </Text>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    </Modal>
  )

  const renderTableSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorLabel}>Quick Table Access:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {tables.map((table, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.tableChip,
              selectedTable === table && styles.selectedTableChip,
            ]}
            onPress={() => {
              setSelectedTable(table)
              setSqlQuery(`SELECT * FROM ${table} LIMIT 10;`)
            }}
          >
            <Text
              style={[
                styles.tableChipText,
                selectedTable === table && styles.selectedTableChipText,
              ]}
            >
              {table}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>🗄️ SplitBudget Debug DB</Text>

        {/* Error Display */}
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>❌ {error}</Text>
          </View>
        ) : null}

        {/* Table Selector */}
        {renderTableSelector()}

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => setShowModal(true)}
          >
            <Text style={styles.buttonText}>📋 Predefined Queries</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={clearResults}
          >
            <Text style={styles.buttonText}>🧹 Clear</Text>
          </TouchableOpacity>
        </View>

        {/* SQL Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>SQL Query:</Text>
          <TextInput
            style={styles.textInput}
            multiline
            numberOfLines={4}
            value={sqlQuery}
            onChangeText={setSqlQuery}
            placeholder="Enter your SQL query here..."
            placeholderTextColor="#666"
          />
        </View>

        {/* Execute Button */}
        <TouchableOpacity
          style={[styles.executeButton, isLoading && styles.disabledButton]}
          onPress={() => executeQuery()}
          disabled={isLoading}
        >
          <Text style={styles.executeButtonText}>
            {isLoading ? "⏳ Executing..." : "▶️ Execute Query"}
          </Text>
        </TouchableOpacity>

        {/* Results */}
        {renderQueryResult()}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.quickActionsTitle}>Quick Actions:</Text>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => handleSync()}
          >
            <Text style={styles.quickActionText}>Trigger Sync</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => router.push("/users/home/log-viewer")}
          >
            <Text style={styles.quickActionText}>View Logs</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            💡 Tip: Use PRAGMA table_info('table_name') to see table structure
          </Text>
        </View>
      </ScrollView>

      {renderPredefinedQueries()}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  errorContainer: {
    backgroundColor: "#ffebee",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#f44336",
  },
  errorText: {
    color: "#c62828",
    fontWeight: "500",
  },
  selectorContainer: {
    marginBottom: 16,
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  tableChip: {
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#2196f3",
  },
  selectedTableChip: {
    backgroundColor: "#2196f3",
  },
  tableChipText: {
    fontSize: 12,
    color: "#2196f3",
    fontWeight: "500",
  },
  selectedTableChipText: {
    color: "white",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: "#2196f3",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 0.48,
  },
  secondaryButton: {
    backgroundColor: "#ff9800",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 0.48,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "600",
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "white",
    fontSize: 14,
    fontFamily: "monospace",
    textAlignVertical: "top",
  },
  executeButton: {
    backgroundColor: "#4caf50",
    padding: 14,
    borderRadius: 8,
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  executeButtonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  resultContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  resultHeader: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  resultText: {
    fontSize: 14,
    color: "#666",
  },
  // ✅ Enhanced table styles for proper alignment
  horizontalScroll: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  tableContainer: {
    flexDirection: "column",
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 2,
    borderBottomColor: "#dee2e6",
  },
  headerCell: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: "#dee2e6",
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#495057",
    textAlign: "center",
    fontFamily: "monospace",
  },
  dataRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  dataCell: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: "#e9ecef",
    justifyContent: "center",
  },
  cellText: {
    fontSize: 11,
    color: "#495057",
    fontFamily: "monospace",
    textAlign: "left",
  },
  tableScrollView: {
    maxHeight: 300,
  },
  evenRow: {
    backgroundColor: "#f8f9fa",
  },
  oddRow: {
    backgroundColor: "white",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  closeButton: {
    backgroundColor: "#f44336",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "500",
  },
  queryItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  queryName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#333",
  },
  queryPreview: {
    fontSize: 12,
    color: "#666",
    fontFamily: "monospace",
  },
  quickActions: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "white",
    borderRadius: 8,
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  quickActionButton: {
    backgroundColor: "#e8f5e8",
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#4caf50",
  },
  quickActionText: {
    color: "#2e7d32",
    fontWeight: "500",
  },
  footer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#e3f2fd",
    borderRadius: 8,
  },
  footerText: {
    fontSize: 12,
    color: "#1976d2",
    textAlign: "center",
  },
})

export default DebugDB
