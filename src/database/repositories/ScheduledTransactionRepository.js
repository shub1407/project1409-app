import { SplitBudgetOperationQueue } from "../../services/sync/SplitBudgetOperationQueue"
import {
  snakifyKey,
  toCamelCase,
  toSnakeCase,
} from "../../utility/caseMapper.js"
import { Logger } from "../../utility/logger"
import { Result } from "../../utility/Result.js"
import { BaseRepository } from "./BaseRepository.js"

export class ScheduledTransactionRepository extends BaseRepository {
  constructor(db) {
    super(db, "schedule_transactions")
  }

  // ✅ Enhanced: Detect CREATE dependencies for scheduled transactions
  detectCreateDependencies(recordData) {
    const dependencies = []

    // Always depends on account
    if (recordData.account_id) {
      dependencies.push({
        tableName: "accounts",
        recordId: recordData.account_id,
        operationType: "CREATE",
      })
    }

    // Depends on category if specified
    if (recordData.category_id) {
      dependencies.push({
        tableName: "categories",
        recordId: recordData.category_id,
        operationType: "CREATE",
      })
    }

    // For transfers, depends on destination account
    if (recordData.to_account_id) {
      dependencies.push({
        tableName: "accounts",
        recordId: recordData.to_account_id,
        operationType: "CREATE",
      })
    }

    return dependencies
  }

  // ✅ Enhanced: Detect UPDATE dependencies for scheduled transactions
  detectUpdateDependencies(updateData, existingData) {
    const dependencies = []

    // Only add dependencies for fields that are being updated
    if (
      updateData.account_id &&
      updateData.account_id !== existingData.account_id
    ) {
      dependencies.push({
        tableName: "accounts",
        recordId: updateData.account_id,
        operationType: "CREATE",
      })
    }

    if (
      updateData.category_id &&
      updateData.category_id !== existingData.category_id
    ) {
      dependencies.push({
        tableName: "categories",
        recordId: updateData.category_id,
        operationType: "CREATE",
      })
    }

    if (
      updateData.to_account_id &&
      updateData.to_account_id !== existingData.to_account_id
    ) {
      dependencies.push({
        tableName: "accounts",
        recordId: updateData.to_account_id,
        operationType: "CREATE",
      })
    }

    return dependencies
  }

  async create(data) {
    try {
      const id = this.generateId()
      const timestamp = Date.now()

      // Handle JSON fields
      const processedData = {
        ...data,
        notificationSettings:
          typeof data.notificationSettings === "object"
            ? JSON.stringify(data.notificationSettings)
            : data.notificationSettings ||
              JSON.stringify({
                enabled: true,
                timing: "on-due-date",
                email: true,
                push: true,
              }),
        metadata:
          typeof data.metadata === "object"
            ? JSON.stringify(data.metadata)
            : data.metadata ||
              JSON.stringify({
                platform: "android",
                source: "manual",
              }),
        executionHistory:
          typeof data.executionHistory === "object"
            ? JSON.stringify(data.executionHistory)
            : data.executionHistory || JSON.stringify([]),
        tags:
          typeof data.tags === "object"
            ? JSON.stringify(data.tags)
            : data.tags || JSON.stringify([]),
      }

      const recordData = toSnakeCase({
        id,
        ...processedData,
        createdAt: timestamp,
        updatedAt: timestamp,
        isDeleted: 0,
        syncStatus: "pending_create",
        version: 1,
      })

      Logger.info(`Creating scheduled transaction: `, recordData)

      const columns = Object.keys(recordData)
      const placeholders = columns.map(() => "?").join(", ")
      const values = columns.map((col) => recordData[col])

      await this.db.runAsync(
        `INSERT INTO ${this.tableName} (${columns.join(
          ", "
        )}) VALUES (${placeholders})`,
        values
      )

      // ✅ Enhanced: Detect dependencies and queue sync operation
      const dependencies = this.detectCreateDependencies(recordData)
      await this.queueSyncOperation("CREATE", id, recordData, dependencies)

      // Convert to camelCase and parse JSON fields for frontend
      const result = this.parseJsonFields(toCamelCase(recordData))
      return Result.ok(result, "Scheduled transaction created successfully")
    } catch (err) {
      Logger.error(err)
      return Result.fail(err.message, "Failed to create scheduled transaction")
    }
  }

  // Override findById to handle JSON fields
  async findById(id) {
    try {
      const query = `
        SELECT st.*,
               c.label as category_label,
               c.icon as category_icon,
               c.color as category_color,
               a.name as account_name,
               a.balance as account_balance,
               a.icon as account_icon,
               a.color as account_color,
               ta.name as to_account_name,
               ta.balance as to_account_balance,
               ta.icon as to_account_icon,
               ta.color as to_account_color,
               CASE
                 WHEN st.next_run_date < ? AND st.status = 'active' AND st.is_active = 1 THEN 1
                 ELSE 0
               END as is_overdue,
               CASE
                 WHEN st.next_run_date BETWEEN ? AND ? THEN 1
                 ELSE 0
               END as is_due_soon
        FROM ${this.tableName} st
        LEFT JOIN categories c ON st.category_id = c.id
        LEFT JOIN accounts a ON st.account_id = a.id
        LEFT JOIN accounts ta ON st.to_account_id = ta.id
        WHERE st.id = ? AND st.is_deleted = 0
      `

      const now = Date.now()
      const soonThreshold = now + 7 * 24 * 60 * 60 * 1000 // 7 days from now

      const row = await this.db.getFirstAsync(query, [
        now,
        now,
        soonThreshold,
        id,
      ])

      if (!row) {
        return Result.ok({}, "Scheduled transaction not found")
      }

      // Parse JSON fields and convert to camelCase
      const result = this.parseJsonFields(toCamelCase(row))

      // Add additional computed fields
      result.nextPaymentDate = result.nextRunDate
      result.isOverdue = Boolean(row.is_overdue)
      result.isDueSoon = Boolean(row.is_due_soon)

      // Calculate days until next payment
      if (result.nextRunDate) {
        const daysUntil = Math.ceil(
          (result.nextRunDate - now) / (1000 * 60 * 60 * 24)
        )
        result.daysUntilNextPayment = daysUntil
        result.paymentStatus =
          daysUntil < 0 ? "overdue" : daysUntil <= 7 ? "due_soon" : "scheduled"
      }

      return Result.ok(
        result,
        "Scheduled transaction with details fetched successfully"
      )
    } catch (err) {
      Logger.error(err)
      return Result.fail(err.message, "Failed to fetch scheduled transaction")
    }
  }

  // Helper method to parse JSON fields
  parseJsonFields(data) {
    if (!data.id) return data

    try {
      // Parse JSON fields back to objects
      if (
        data.notificationSettings &&
        typeof data.notificationSettings === "string"
      ) {
        data.notificationSettings = JSON.parse(data.notificationSettings)
      }
      if (data.metadata && typeof data.metadata === "string") {
        data.metadata = JSON.parse(data.metadata)
      }
      if (data.executionHistory && typeof data.executionHistory === "string") {
        data.executionHistory = JSON.parse(data.executionHistory)
      }
      if (data.tags && typeof data.tags === "string") {
        data.tags = JSON.parse(data.tags)
      }
    } catch (parseErr) {
      Logger.error("Error parsing JSON fields:", parseErr)
    }

    return data
  }

  async findWithOptions(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        type,
        frequency,
        sortBy = "nextRunDate",
        sortOrder = "asc",
      } = options

      // Join with accounts and categories to get labels/names
      let query = `
        SELECT st.*,
               c.label as category_label,
               a.name as account_name,
               ta.name as to_account_name
        FROM ${this.tableName} st
        LEFT JOIN categories c ON st.category_id = c.id
        LEFT JOIN accounts a ON st.account_id = a.id
        LEFT JOIN accounts ta ON st.to_account_id = ta.id
        WHERE st.is_deleted = 0
      `
      const params = []

      // Add filters
      if (status === "active") {
        query += ` AND st.status = 'active' AND st.is_active = 1`
      } else if (status === "inactive") {
        query += ` AND (st.status != 'active' OR st.is_active = 0)`
      } else if (status) {
        query += ` AND st.status = ?`
        params.push(status)
      }

      if (type) {
        query += ` AND st.type = ?`
        params.push(type)
      }

      if (frequency) {
        query += ` AND st.frequency = ?`
        params.push(frequency)
      }

      // Add sorting (prefix with st. for scheduled transaction table)
      const sortColumn = snakifyKey(sortBy)
      query += ` ORDER BY st.${sortColumn} ${sortOrder.toUpperCase()}`

      // Add pagination
      const offset = (page - 1) * limit
      query += ` LIMIT ? OFFSET ?`
      params.push(limit, offset)

      const rows = await this.db.getAllAsync(query, params)

      // Parse JSON fields for all rows and convert to camelCase
      const scheduledTransactions = rows.map((row) =>
        this.parseJsonFields(toCamelCase(row))
      )

      // Get total count (same JOINs for consistency)
      let countQuery = `
        SELECT COUNT(*) as total
        FROM ${this.tableName} st
        LEFT JOIN categories c ON st.category_id = c.id
        LEFT JOIN accounts a ON st.account_id = a.id
        LEFT JOIN accounts ta ON st.to_account_id = ta.id
        WHERE st.is_deleted = 0
      `
      const countParams = []

      // Apply same filters for count
      if (status === "active") {
        countQuery += ` AND st.status = 'active' AND st.is_active = 1`
      } else if (status === "inactive") {
        countQuery += ` AND (st.status != 'active' OR st.is_active = 0)`
      } else if (status) {
        countQuery += ` AND st.status = ?`
        countParams.push(status)
      }
      if (type) {
        countQuery += ` AND st.type = ?`
        countParams.push(type)
      }
      if (frequency) {
        countQuery += ` AND st.frequency = ?`
        countParams.push(frequency)
      }

      const countResult = await this.db.getFirstAsync(countQuery, countParams)
      const total = countResult?.total || 0

      return Result.ok(
        {
          scheduledTransactions,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
        "Scheduled transactions retrieved successfully"
      )
    } catch (err) {
      Logger.error(err)
      return Result.fail(err.message, "Failed to fetch scheduled transactions")
    }
  }

  // Method to add execution history entry
  async addExecutionHistory(id, executionData) {
    try {
      const result = await this.findById(id)
      if (!result.success) return result

      const scheduledTxn = result.data
      const history = scheduledTxn.executionHistory || []

      history.push({
        executedAt: executionData.executedAt || Date.now(),
        transactionId: executionData.transactionId,
        amount: executionData.amount,
        status: executionData.status || "success",
        failureReason: executionData.failureReason,
      })

      const updateData = {
        executionHistory: JSON.stringify(history),
        executionCount: history.length,
        lastExecuted: executionData.executedAt || Date.now(),
      }

      return await this.update(id, updateData)
    } catch (err) {
      Logger.error(err)
      return Result.fail(err.message, "Failed to add execution history")
    }
  }

  // Method to check if should execute
  async shouldExecute(id) {
    try {
      const result = await this.findById(id)
      if (!result.success) return result

      const scheduledTxn = result.data
      const now = Date.now()

      const shouldRun =
        scheduledTxn.status === "active" &&
        scheduledTxn.isActive === 1 &&
        scheduledTxn.nextRunDate <= now &&
        (!scheduledTxn.endDate || now <= scheduledTxn.endDate) &&
        (!scheduledTxn.maxExecutions ||
          scheduledTxn.executionCount < scheduledTxn.maxExecutions)

      return Result.ok(
        {
          shouldExecute: shouldRun,
          scheduledTransaction: scheduledTxn,
        },
        shouldRun ? "Ready for execution" : "Not ready for execution"
      )
    } catch (err) {
      Logger.error(err)
      return Result.fail(err.message, "Failed to check execution status")
    }
  }

  async toggleStatus(id) {
    try {
      const existingResult = await this.findById(id)
      if (!existingResult.success || !existingResult.data.id) {
        return Result.fail(null, "Scheduled transaction not found")
      }

      const currentStatus = existingResult.data.isActive
      const newStatus = currentStatus ? 0 : 1

      return await this.update(id, { isActive: newStatus })
    } catch (err) {
      Logger.error(err)
      return Result.fail(err.message, "Failed to toggle status")
    }
  }

  async getUpcoming(days = 30) {
    try {
      const futureDate = Date.now() + days * 24 * 60 * 60 * 1000

      const rows = await this.db.getAllAsync(
        `SELECT * FROM ${this.tableName}
         WHERE is_active = 1 AND is_deleted = 0
         AND next_run_date <= ? AND next_run_date > ?
         ORDER BY next_run_date ASC`,
        [futureDate, Date.now()]
      )

      return Result.ok(
        toCamelCase(rows),
        "Upcoming scheduled transactions retrieved"
      )
    } catch (err) {
      Logger.error(err)
      return Result.fail(err.message, "Failed to fetch upcoming transactions")
    }
  }

  async getOverdue() {
    try {
      const rows = await this.db.getAllAsync(
        `SELECT * FROM ${this.tableName}
         WHERE is_active = 1 AND is_deleted = 0 AND next_run_date < ?
         ORDER BY next_run_date ASC`,
        [Date.now()]
      )

      return Result.ok(
        toCamelCase(rows),
        "Overdue scheduled transactions retrieved"
      )
    } catch (err) {
      Logger.error(err)
      return Result.fail(err.message, "Failed to fetch overdue transactions")
    }
  }

  async getStats() {
    try {
      const now = Date.now()

      const statsQuery = `
        SELECT
          COUNT(*) as total,
          SUM(CASE WHEN status = 'active' AND is_active = 1 THEN 1 ELSE 0 END) as active,
          SUM(CASE WHEN status = 'paused' OR is_active = 0 THEN 1 ELSE 0 END) as paused,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,

          -- Only include ACTIVE transactions in monthly totals (exclude paused/inactive)
          COALESCE(SUM(CASE
            WHEN (status = 'active' AND is_active = 1) AND type = 'income' AND frequency = 'monthly' THEN amount
            WHEN (status = 'active' AND is_active = 1) AND type = 'income' AND frequency = 'yearly' THEN amount / 12
            WHEN (status = 'active' AND is_active = 1) AND type = 'income' AND frequency = 'weekly' THEN amount * 4.33
            WHEN (status = 'active' AND is_active = 1) AND type = 'income' AND frequency = 'daily' THEN amount * 30
            ELSE 0
          END), 0) as total_monthly_income,

          COALESCE(SUM(CASE
            WHEN (status = 'active' AND is_active = 1) AND type = 'expense' AND frequency = 'monthly' THEN amount
            WHEN (status = 'active' AND is_active = 1) AND type = 'expense' AND frequency = 'yearly' THEN amount / 12
            WHEN (status = 'active' AND is_active = 1) AND type = 'expense' AND frequency = 'weekly' THEN amount * 4.33
            WHEN (status = 'active' AND is_active = 1) AND type = 'expense' AND frequency = 'daily' THEN amount * 30
            ELSE 0
          END), 0) as total_monthly_expenses,

          -- Transaction type counts (only active)
          SUM(CASE WHEN (status = 'active' AND is_active = 1) AND type = 'income' THEN 1 ELSE 0 END) as income_count,
          SUM(CASE WHEN (status = 'active' AND is_active = 1) AND type = 'expense' THEN 1 ELSE 0 END) as expense_count,
          SUM(CASE WHEN (status = 'active' AND is_active = 1) AND type = 'transfer' THEN 1 ELSE 0 END) as transfer_count,

          -- Overdue count (only active transactions can be overdue)
          SUM(CASE WHEN (status = 'active' AND is_active = 1) AND next_run_date < ? THEN 1 ELSE 0 END) as overdue,

          -- Additional useful stats (all transactions)
          AVG(amount) as average_amount,
          MIN(amount) as min_amount,
          MAX(amount) as max_amount

        FROM ${this.tableName}
        WHERE is_deleted = 0`

      const row = await this.db.getFirstAsync(statsQuery, [now])

      if (!row) {
        return Result.ok(
          {
            total: 0,
            active: 0,
            paused: 0,
            completed: 0,
            cancelled: 0,
            totalMonthlyIncome: 0,
            totalMonthlyExpenses: 0,
            netMonthlyFlow: 0,
            incomeCount: 0,
            expenseCount: 0,
            transferCount: 0,
            overdue: 0,
            averageAmount: 0,
            minAmount: 0,
            maxAmount: 0,
          },
          "No scheduled transactions found"
        )
      }

      // Calculate net monthly flow
      const totalMonthlyIncome = row.total_monthly_income || 0
      const totalMonthlyExpenses = row.total_monthly_expenses || 0
      const netMonthlyFlow = totalMonthlyIncome - totalMonthlyExpenses

      const stats = {
        total: row.total || 0,
        active: row.active || 0,
        paused: row.paused || 0,
        completed: row.completed || 0,
        cancelled: row.cancelled || 0,
        totalMonthlyIncome,
        totalMonthlyExpenses,
        netMonthlyFlow,
        incomeCount: row.income_count || 0,
        expenseCount: row.expense_count || 0,
        transferCount: row.transfer_count || 0,
        overdue: row.overdue || 0,
        averageAmount: row.average_amount || 0,
        minAmount: row.min_amount || 0,
        maxAmount: row.max_amount || 0,
      }

      return Result.ok(stats, "Statistics retrieved successfully")
    } catch (err) {
      Logger.error(err)
      return Result.fail(err.message, "Failed to fetch statistics")
    }
  }

  // ✅ Enhanced: recordExecution with proper sync queue and dependencies
  async recordExecution(scheduledTransactionId, executionData) {
    try {
      const {
        transactionId,
        amount,
        status = "success",
        failureReason = null,
        executionType = "manual",
        accountBalanceBefore = null,
        accountBalanceAfter = null,
        toAccountBalanceBefore = null,
        toAccountBalanceAfter = null,
        metadata = {},
      } = executionData

      const executionId = this.generateId()
      const timestamp = Date.now()

      // Record in dedicated execution log table
      const executionRecord = {
        id: executionId,
        scheduledTransactionId,
        transactionId,
        executedAt: timestamp,
        amount,
        status,
        failureReason,
        executionType,
        accountBalanceBefore,
        accountBalanceAfter,
        toAccountBalanceBefore,
        toAccountBalanceAfter,
        metadata: JSON.stringify(metadata),
        createdAt: timestamp,
        updatedAt: timestamp,
        isDeleted: 0,
        syncStatus: "pending_create",
        version: 1,
      }

      const recordData = toSnakeCase(executionRecord)
      const columns = Object.keys(recordData)
      const placeholders = columns.map(() => "?").join(", ")
      const values = columns.map((col) => recordData[col])

      await this.db.runAsync(
        `INSERT INTO scheduled_transaction_executions (${columns.join(
          ", "
        )}) VALUES (${placeholders})`,
        values
      )

      // ✅ Enhanced: Queue sync operation with dependencies
      const dependencies = [
        {
          tableName: "schedule_transactions",
          recordId: scheduledTransactionId,
          operationType: "CREATE",
        },
        {
          tableName: "transactions",
          recordId: transactionId,
          operationType: "CREATE",
        },
      ]

      await this.queueExecutionSyncOperation(
        "CREATE",
        executionId,
        recordData,
        dependencies
      )

      // Also update the scheduled transaction's execution history and count
      await this.addExecutionHistory(scheduledTransactionId, {
        executionId,
        executedAt: timestamp,
        transactionId,
        amount,
        status,
        failureReason,
      })

      return Result.ok(
        { executionId, ...executionData },
        "Execution recorded successfully"
      )
    } catch (err) {
      Logger.error(err)
      return Result.fail(err.message, "Failed to record execution")
    }
  }

  // ✅ Enhanced: Helper method to queue execution sync operations with dependencies
  async queueExecutionSyncOperation(
    operationType,
    recordId,
    recordData,
    dependencies = []
  ) {
    const operationQueue = new SplitBudgetOperationQueue(this.db)
    await operationQueue.addOperation(
      operationType,
      "scheduled_transaction_executions",
      recordId,
      recordData,
      dependencies
    )
  }

  // Get execution history for a scheduled transaction
  async getExecutionHistory(scheduledTransactionId, options = {}) {
    try {
      const { limit = 50, offset = 0, status } = options

      let query = `
        SELECT
          se.*,
          st.name as scheduled_transaction_name,
          st.type as scheduled_transaction_type,
          st.recurrence_rule,
          st.start_date,
          st.frequency,
          a.name as account_name,
          a.icon as account_icon,
          a.color as account_color,
          ta.name as to_account_name,
          ta.icon as to_account_icon,
          ta.color as to_account_color,
          t.description as transaction_description,
          t.date as transaction_date
        FROM scheduled_transaction_executions se
        LEFT JOIN schedule_transactions st ON se.scheduled_transaction_id = st.id
        LEFT JOIN accounts a ON st.account_id = a.id
        LEFT JOIN accounts ta ON st.to_account_id = ta.id
        LEFT JOIN transactions t ON se.transaction_id = t.id
        WHERE se.scheduled_transaction_id = ? AND se.is_deleted = 0
      `
      const params = [scheduledTransactionId]

      if (status) {
        query += ` AND se.status = ?`
        params.push(status)
      }

      query += ` ORDER BY se.executed_at DESC LIMIT ? OFFSET ?`
      params.push(limit, offset)

      const rows = await this.db.getAllAsync(query, params)
      const executions = rows.map((row) =>
        this.parseJsonFields(toCamelCase(row))
      )

      return Result.ok(executions, "Execution history retrieved successfully")
    } catch (err) {
      Logger.error(err)
      return Result.fail(err.message, "Failed to get execution history")
    }
  }

  // Get execution statistics
  async getExecutionStats(scheduledTransactionId) {
    try {
      const statsQuery = `
        SELECT
          COUNT(*) as total_executions,
          SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful_executions,
          SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_executions,
          SUM(CASE WHEN status = 'skipped' THEN 1 ELSE 0 END) as skipped_executions,
          AVG(amount) as average_amount,
          SUM(amount) as total_amount,
          MIN(executed_at) as first_execution,
          MAX(executed_at) as last_execution
        FROM scheduled_transaction_executions
        WHERE scheduled_transaction_id = ? AND is_deleted = 0 AND status = 'success'
      `

      const row = await this.db.getFirstAsync(statsQuery, [
        scheduledTransactionId,
      ])

      return Result.ok(
        toCamelCase(row || {}),
        "Execution statistics retrieved successfully"
      )
    } catch (err) {
      Logger.error(err)
      return Result.fail(err.message, "Failed to get execution statistics")
    }
  }

  async getRecentExecutions(limit = 10) {
    try {
      const query = `
        SELECT
          se.*,
          st.name as scheduled_transaction_name,
          st.type as scheduled_transaction_type,
          t.description as transaction_description,
          a.name as account_name
        FROM scheduled_transaction_executions se
        LEFT JOIN schedule_transactions st ON se.scheduled_transaction_id = st.id
        LEFT JOIN transactions t ON se.transaction_id = t.id
        LEFT JOIN accounts a ON st.account_id = a.id
        WHERE se.is_deleted = 0
        ORDER BY se.executed_at DESC
        LIMIT ?
      `

      const rows = await this.db.getAllAsync(query, [limit])
      const executions = rows.map((row) =>
        this.parseJsonFields(toCamelCase(row))
      )

      return Result.ok(executions, "Recent executions retrieved successfully")
    } catch (err) {
      Logger.error(err)
      return Result.fail(err.message, "Failed to get recent executions")
    }
  }

  // Get execution summary for dashboard
  async getExecutionSummary() {
    try {
      const summaryQuery = `
        SELECT
          COUNT(*) as total_executions,
          SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful_executions,
          SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_executions,
          SUM(CASE WHEN status = 'skipped' THEN 1 ELSE 0 END) as skipped_executions,
          SUM(CASE WHEN status = 'success' THEN amount ELSE 0 END) as total_successful_amount,
          COUNT(DISTINCT scheduled_transaction_id) as active_scheduled_transactions,

          -- Today's executions
          SUM(CASE WHEN date(executed_at/1000, 'unixepoch') = date('now') THEN 1 ELSE 0 END) as today_executions,
          SUM(CASE WHEN date(executed_at/1000, 'unixepoch') = date('now') AND status = 'success' THEN 1 ELSE 0 END) as today_successful,

          -- This week's executions
          SUM(CASE WHEN executed_at >= ? THEN 1 ELSE 0 END) as week_executions,
          SUM(CASE WHEN executed_at >= ? AND status = 'success' THEN 1 ELSE 0 END) as week_successful,

          -- This month's executions
          SUM(CASE WHEN executed_at >= ? THEN 1 ELSE 0 END) as month_executions,
          SUM(CASE WHEN executed_at >= ? AND status = 'success' THEN 1 ELSE 0 END) as month_successful

        FROM scheduled_transaction_executions
        WHERE is_deleted = 0
      `

      const now = Date.now()
      const weekStart = now - 7 * 24 * 60 * 60 * 1000
      const monthStart = now - 30 * 24 * 60 * 60 * 1000

      const row = await this.db.getFirstAsync(summaryQuery, [
        weekStart,
        weekStart,
        monthStart,
        monthStart,
      ])

      const summary = toCamelCase(row || {})

      // Calculate success rates
      summary.overallSuccessRate =
        summary.totalExecutions > 0
          ? (summary.successfulExecutions / summary.totalExecutions) * 100
          : 0
      summary.todaySuccessRate =
        summary.todayExecutions > 0
          ? (summary.todaySuccessful / summary.todayExecutions) * 100
          : 0
      summary.weekSuccessRate =
        summary.weekExecutions > 0
          ? (summary.weekSuccessful / summary.weekExecutions) * 100
          : 0
      summary.monthSuccessRate =
        summary.monthExecutions > 0
          ? (summary.monthSuccessful / summary.monthExecutions) * 100
          : 0

      return Result.ok(summary, "Execution summary retrieved successfully")
    } catch (err) {
      Logger.error(err)
      return Result.fail(err.message, "Failed to get execution summary")
    }
  }
}
