// repositories/TransactionRepository.js

import { SplitBudgetOperationQueue } from "../../services/sync/SplitBudgetOperationQueue"
import { toCamelCase, toSnakeCase } from "../../utility/caseMapper.js"
import { Logger } from "../../utility/logger.js"
import { Result } from "../../utility/Result.js"
import { BaseRepository } from "./BaseRepository.js"

export class TransactionRepository extends BaseRepository {
  constructor(db) {
    super(db, "transactions")
  }

  // ✅ Enhanced: Detect CREATE dependencies for transactions
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
    if (recordData.type === "transfer" && recordData.to_account_id) {
      dependencies.push({
        tableName: "accounts",
        recordId: recordData.to_account_id,
        operationType: "CREATE",
      })
    }

    return dependencies
  }

  // ✅ Enhanced: Detect UPDATE dependencies for transactions
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

  // Helper method to ensure timestamp format
  ensureTimestamp(date) {
    if (!date) return Date.now()
    if (typeof date === "number") return date
    if (typeof date === "string") return new Date(date).getTime()
    if (date instanceof Date) return date.getTime()
    return Date.now()
  }

  // Helper method to format dates for frontend
  formatDateForFrontend(timestamp) {
    return new Date(timestamp).toISOString()
  }

  // ✅ Enhanced: Helper method to queue account sync operations
  async queueAccountSyncOperation(operationType, recordId, recordData) {
    const operationQueue = new SplitBudgetOperationQueue(this.db)
    await operationQueue.addOperation(
      operationType,
      "accounts",
      recordId,
      recordData,
      [] // Accounts don't have dependencies
    )
  }

  // ✅ Enhanced: adjustAccountBalance with sync queue
  async adjustAccountBalance(accountId, amount) {
    if (!accountId || amount === 0) return

    const accountName = await this.getAccountName(accountId)
    console.log("adjusting account balance:", accountId, accountName, amount)

    // Get current account data before update
    const currentAccount = await this.db.getFirstAsync(
      `SELECT * FROM accounts WHERE id = ? AND is_deleted = 0`,
      [accountId]
    )

    if (!currentAccount) {
      throw new Error(`Account ${accountId} not found`)
    }

    // Update account balance
    await this.db.runAsync(
      `UPDATE accounts SET
        balance = balance + ?,
        updated_at = ?,
        sync_status = CASE WHEN sync_status = 'synced' THEN 'pending_update' ELSE sync_status END,
        version = version + 1
       WHERE id = ?`,
      [amount, Date.now(), accountId]
    )

    // ✅ Get updated account data and queue sync operation
    const updatedAccount = await this.db.getFirstAsync(
      `SELECT * FROM accounts WHERE id = ? AND is_deleted = 0`,
      [accountId]
    )

    if (updatedAccount) {
      await this.queueAccountSyncOperation("UPDATE", accountId, updatedAccount)
    }
  }

  async getTransactions(options = {}) {
    const {
      page = 1,
      limit = 10,
      type = null,
      categoryId = null,
      accountId = null,
      startDate = null,
      endDate = null,
    } = options

    try {
      let whereClause = "t.is_deleted = 0"
      let params = []

      if (type) {
        whereClause += " AND t.type = ?"
        params.push(type)
      }

      if (categoryId) {
        whereClause += " AND t.category_id = ?"
        params.push(categoryId)
      }

      if (accountId) {
        whereClause += " AND (t.account_id = ? OR t.to_account_id = ?)"
        params.push(accountId, accountId)
      }

      if (startDate && endDate) {
        const startTimestamp = this.ensureTimestamp(startDate)
        const endTimestamp = this.ensureTimestamp(endDate)
        whereClause += " AND t.date BETWEEN ? AND ?"
        params.push(startTimestamp, endTimestamp)
      }

      // Get initial balances for all accounts
      const accountsMap = {}
      const accountQuery = accountId
        ? "SELECT id, initial_balance FROM accounts WHERE id = ? AND is_deleted = 0"
        : "SELECT id, initial_balance FROM accounts WHERE is_deleted = 0"
      const accountParams = accountId ? [accountId] : []
      const accounts = await this.db.getAllAsync(accountQuery, accountParams)
      accounts.forEach((acc) => {
        accountsMap[acc.id] = acc.initial_balance || 0
      })

      // Get transactions with running balance calculation
      const runningBalanceQuery = `
        WITH filtered_transactions AS (
          SELECT
            t.*,
            CASE
              WHEN t.type = 'income' THEN t.amount
              WHEN t.type = 'expense' THEN -t.amount
              WHEN t.type = 'transfer' AND t.to_account_id != t.account_id THEN -t.amount
              ELSE 0
            END as signed_amount
          FROM transactions t
          WHERE ${whereClause}
          AND (
            t.type != 'transfer'
            OR (t.type = 'transfer' AND t.to_account_id != t.account_id)
          )
        ),
        transactions_with_running_total AS (
          SELECT
            *,
            SUM(signed_amount) OVER (
              PARTITION BY account_id
              ORDER BY date ASC, created_at ASC
              ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
            ) as running_total
          FROM filtered_transactions
        )
        SELECT
          t.*,
          t.running_total,
          (t.running_total - t.signed_amount) as opening_balance_calc,
          t.running_total as closing_balance_calc,
          a.name as account_name,
          a.type as account_type,
          a.color as account_color,
          ta.name as to_account_name,
          c.label as category_label,
          c.icon as category_icon,
          c.color as category_color
        FROM transactions_with_running_total t
        LEFT JOIN accounts a ON t.account_id = a.id AND a.is_deleted = 0
        LEFT JOIN accounts ta ON t.to_account_id = ta.id AND ta.is_deleted = 0
        LEFT JOIN categories c ON t.category_id = c.id AND c.is_deleted = 0
        ORDER BY t.date DESC, t.created_at DESC
        LIMIT ? OFFSET ?
      `

      const offset = (page - 1) * limit
      const queryParams = [...params, limit, offset]
      const transactions = await this.db.getAllAsync(
        runningBalanceQuery,
        queryParams
      )

      // Format transactions with correct balances and date formatting
      const formattedTransactions = transactions.map((tx) => {
        const initialBalance = accountsMap[tx.account_id] || 0
        return {
          ...tx,
          openingBalance: Number(
            initialBalance + (tx.opening_balance_calc || 0)
          ).toFixed(2),
          closingBalance: Number(
            initialBalance + (tx.closing_balance_calc || 0)
          ).toFixed(2),
          date: this.formatDateForFrontend(tx.date),
          createdAt: this.formatDateForFrontend(tx.created_at),
          updatedAt: this.formatDateForFrontend(tx.updated_at),
          categoryName: tx.category_label,
          accountName: tx.account_name,
          toAccountName: tx.to_account_name,
          categoryIcon: tx.category_icon,
          categoryColor: tx.category_color,
        }
      })

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM transactions t
        WHERE ${whereClause}
        AND (
          t.type != 'transfer'
          OR (t.type = 'transfer' AND t.to_account_id != t.account_id)
        )
      `

      const countParams = params
      const countResult = await this.db.getFirstAsync(countQuery, countParams)

      return Result.ok(
        {
          transactions: toCamelCase(formattedTransactions),
          totalPages: Math.ceil(countResult.total / limit),
          currentPage: parseInt(page),
          total: countResult.total,
        },
        "Transactions fetched successfully"
      )
    } catch (error) {
      console.error("TransactionRepository.getTransactions error:", error)
      return Result.fail(error.message, "Failed to fetch transactions")
    }
  }

  // ✅ Enhanced: Handle transfer transactions with proper sync queueing
  async createTransfer(transferData) {
    try {
      const { accountId, toAccountId, amount, description, date } = transferData

      if (accountId === toAccountId) {
        return Result.fail("Source and destination accounts cannot be the same")
      }

      // Check source account balance
      const sourceAccount = await this.db.getFirstAsync(
        `SELECT balance FROM accounts WHERE id = ? AND is_deleted = 0`,
        [accountId]
      )

      if (!sourceAccount || sourceAccount.balance < amount) {
        return Result.fail("Insufficient balance in source account")
      }

      const transferRef = this.generateId()
      const timestamp = this.ensureTimestamp(date)

      // Create single transaction record (from account perspective)
      const transaction = await this.create({
        accountId,
        toAccountId,
        type: "transfer",
        amount,
        description: description || "Transfer",
        date: timestamp,
        transferReference: transferRef,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })

      if (transaction.success) {
        // ✅ Use adjustAccountBalance which now queues sync operations
        await this.adjustAccountBalance(accountId, -amount)
        await this.adjustAccountBalance(toAccountId, amount)

        // Return formatted result
        const formattedResult = {
          ...transaction.data,
          date: this.formatDateForFrontend(transaction.data.date),
          createdAt: this.formatDateForFrontend(transaction.data.createdAt),
          updatedAt: this.formatDateForFrontend(transaction.data.updatedAt),
        }

        return Result.ok(formattedResult, "Transfer completed successfully")
      }

      return transaction
    } catch (error) {
      console.error("TransactionRepository.createTransfer error:", error)
      return Result.fail(error.message, "Transfer failed")
    }
  }

  async createTransaction(transactionData) {
    try {
      await this.db.execAsync("BEGIN TRANSACTION")

      // Convert frontend date to timestamp for storage
      const processedData = {
        ...transactionData,
        date: this.ensureTimestamp(transactionData.date),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      if (processedData.type === "transfer") {
        const result = await this.createTransfer(processedData)
        await this.db.execAsync("COMMIT")
        return result
      }

      const result = await this.create(processedData)

      if (result.success) {
        // ✅ Use adjustAccountBalance which now queues sync operations
        const balanceChange =
          processedData.type === "income"
            ? processedData.amount
            : -processedData.amount
        await this.adjustAccountBalance(processedData.accountId, balanceChange)

        await this.db.execAsync("COMMIT")

        // Return data with formatted dates for frontend
        const formattedResult = {
          ...result.data,
          date: this.formatDateForFrontend(result.data.date),
          createdAt: this.formatDateForFrontend(result.data.createdAt),
          updatedAt: this.formatDateForFrontend(result.data.updatedAt),
        }

        return Result.ok(formattedResult, result.message)
      } else {
        await this.db.execAsync("ROLLBACK")
      }

      return result
    } catch (error) {
      await this.db.execAsync("ROLLBACK")
      console.error("TransactionRepository.createTransaction error:", error)
      return Result.fail(error.message, "Failed to create transaction")
    }
  }

  // Update transaction with balance adjustments
  async updateTransaction(id, updateData) {
    try {
      updateData = toSnakeCase(updateData)
      await this.db.execAsync("BEGIN TRANSACTION")

      // Get existing transaction
      const oldTx = await this.db.getFirstAsync(
        `SELECT * FROM transactions WHERE id = ? AND is_deleted = 0`,
        [id]
      )

      if (!oldTx) {
        await this.db.execAsync("ROLLBACK")
        return Result.fail("Transaction not found")
      }

      // Reverse old balance effects
      await this.reverseTransactionBalance(oldTx)

      // Update the transaction
      const result = await this.update(id, {
        ...updateData,
        updatedAt: Date.now(),
        date: updateData.date
          ? this.ensureTimestamp(updateData.date)
          : oldTx.date,
      })

      if (result.success) {
        // Apply new balance effects
        const newTx = { ...oldTx, ...updateData }
        await this.applyTransactionBalance(newTx)

        await this.db.execAsync("COMMIT")

        // Format result for frontend
        const formattedResult = {
          ...result.data,
          date: this.formatDateForFrontend(result.data.date),
          createdAt: this.formatDateForFrontend(result.data.createdAt),
          updatedAt: this.formatDateForFrontend(result.data.updatedAt),
        }

        return Result.ok(formattedResult, result.message)
      } else {
        await this.db.execAsync("ROLLBACK")
      }

      return result
    } catch (error) {
      await this.db.execAsync("ROLLBACK")
      console.error("TransactionRepository.updateTransaction error:", error)
      return Result.fail(error.message, "Failed to update transaction")
    }
  }

  // Delete transaction with balance reversal
  async deleteTransaction(id) {
    try {
      await this.db.execAsync("BEGIN TRANSACTION")

      const tx = await this.db.getFirstAsync(
        `SELECT * FROM transactions WHERE id = ? AND is_deleted = 0`,
        [id]
      )

      if (!tx) {
        await this.db.execAsync("ROLLBACK")
        return Result.fail("Transaction not found")
      }

      // Reverse balance effects
      await this.reverseTransactionBalance(tx)

      // Mark as deleted
      const result = await this.delete(id)

      if (result.success) {
        await this.db.execAsync("COMMIT")
        return Result.ok(result, "Transaction deleted successfully")
      } else {
        await this.db.execAsync("ROLLBACK")
      }

      return result
    } catch (error) {
      await this.db.execAsync("ROLLBACK")
      console.error("TransactionRepository.deleteTransaction error:", error)
      return Result.fail(error.message, "Failed to delete transaction")
    }
  }

  // ✅ Use adjustAccountBalance which now queues sync operations
  async reverseTransactionBalance(tx) {
    Logger.info("Reversing balance for transaction:", tx)
    if (tx.type === "income") {
      await this.adjustAccountBalance(tx.account_id, -tx.amount)
    } else if (tx.type === "expense") {
      await this.adjustAccountBalance(tx.account_id, tx.amount)
    } else if (tx.type === "transfer") {
      await this.adjustAccountBalance(tx.account_id, tx.amount) // refund source
      await this.adjustAccountBalance(tx.to_account_id, -tx.amount) // remove from target
    }
  }

  // ✅ Use adjustAccountBalance which now queues sync operations
  async applyTransactionBalance(tx) {
    if (tx.type === "income") {
      await this.adjustAccountBalance(tx.account_id, tx.amount)
    } else if (tx.type === "expense") {
      await this.adjustAccountBalance(tx.account_id, -tx.amount)
    } else if (tx.type === "transfer") {
      await this.adjustAccountBalance(tx.account_id, -tx.amount) // remove from source
      await this.adjustAccountBalance(tx.to_account_id, tx.amount) // add to target
    }
  }

  async getAccountName(accountId) {
    const row = await this.db.getFirstAsync(
      `SELECT name FROM accounts WHERE id = ?`,
      [accountId]
    )
    return row ? row.name : null
  }

  async getTransactionById(id) {
    try {
      const row = await this.db.getFirstAsync(
        `SELECT * FROM ${this.tableName} WHERE id = ? AND is_deleted = 0`,
        [id]
      )

      if (row) {
        // Format dates for frontend
        const formattedRow = {
          ...row,
          date: this.formatDateForFrontend(row.date),
          created_at: this.formatDateForFrontend(row.created_at),
          updated_at: this.formatDateForFrontend(row.updated_at),
        }

        return Result.ok(
          toCamelCase(formattedRow),
          "Record fetched successfully"
        )
      } else {
        return Result.ok({}, "Record not found")
      }
    } catch (err) {
      Logger.error(err)
      return Result.fail(err.message, "Failed to fetch record")
    }
  }

  // Get transaction statistics
  async getTransactionStats(options = {}) {
    const { startDate, endDate, userId } = options
    try {
      let whereClause = "is_deleted = 0"
      const params = []

      if (startDate && endDate) {
        whereClause += " AND date BETWEEN ? AND ?"
        params.push(
          this.ensureTimestamp(startDate),
          this.ensureTimestamp(endDate)
        )
      }

      const stats = await this.db.getAllAsync(
        `SELECT
          type,
          SUM(amount) as total,
          COUNT(*) as count
        FROM transactions
        WHERE ${whereClause}
        GROUP BY type`,
        params
      )

      const categoryStats = await this.db.getAllAsync(
        `SELECT
          t.type,
          c.label as category,
          SUM(t.amount) as total,
          COUNT(*) as count
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE t.${whereClause}
        GROUP BY t.type, t.category_id, c.label`,
        params
      )

      return Result.ok(
        {
          stats: toCamelCase(stats),
          categoryStats: toCamelCase(categoryStats),
        },
        "Stats fetched successfully"
      )
    } catch (error) {
      console.error("TransactionRepository.getTransactionStats error:", error)
      return Result.fail(error.message, "Failed to fetch stats")
    }
  }

  // Get pending sync operations
  async getPendingSyncOperations() {
    try {
      const operations = await this.db.getAllAsync(
        `SELECT * FROM sync_operations
         WHERE status = 'pending' AND table_name = ?
         ORDER BY created_at ASC`,
        [this.tableName]
      )

      return Result.ok(toCamelCase(operations), "Pending operations fetched")
    } catch (error) {
      return Result.fail(error.message, "Failed to fetch pending operations")
    }
  }

  // Mark sync operation as completed
  async markSyncCompleted(operationId) {
    try {
      await this.db.runAsync(
        `UPDATE sync_operations SET status = 'completed' WHERE id = ?`,
        [operationId]
      )

      return Result.ok(null, "Sync operation marked as completed")
    } catch (error) {
      return Result.fail(error.message, "Failed to mark sync as completed")
    }
  }
}
