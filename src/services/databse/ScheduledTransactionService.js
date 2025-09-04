// services/ScheduledTransactionService.js
import { calculateNextRunDate } from "../../utility/dateUtils.js"
import { Logger } from "../../utility/logger"
import { Result } from "../../utility/Result.js"

export class ScheduledTransactionService {
  constructor(databaseService) {
    this.db = databaseService
  }

  async createScheduledTransaction(data) {
    try {
      // Validate account exists
      const accountResult = await this.db.accounts.findById(data.accountId)
      if (!accountResult.success) {
        return Result.fail(null, "Account not found")
      }

      // Calculate next run date
      const nextRunDate = calculateNextRunDate(
        data.startDate,
        data.recurrenceRule
      )

      const scheduledTransactionData = {
        ...data,
        nextRunDate,
        isActive: 1,
      }
      console.log(
        "Scheduled transaction data in schedule txn services:: ",
        scheduledTransactionData
      )

      return await this.db.scheduledTransactions.create(
        scheduledTransactionData
      )
    } catch (err) {
      Logger.error(err)
      return Result.fail(err.message, "Failed to create scheduled transaction")
    }
  }

  async getScheduledTransactions(options) {
    return await this.db.scheduledTransactions.findWithOptions(options)
  }

  async getScheduledTransactionById(id) {
    return await this.db.scheduledTransactions.findById(id)
  }

  async updateScheduledTransaction(id, data) {
    try {
      const existingResult = await this.db.scheduledTransactions.findById(id)
      if (!existingResult.success || !existingResult.data.id) {
        return Result.fail(null, "Scheduled transaction not found")
      }

      // Recalculate next run date if needed
      let updateData = { ...data }
      if (data.recurrenceRule || data.startDate) {
        const startDate = data.startDate || existingResult.data.startDate
        const recurrenceRule =
          data.recurrenceRule || existingResult.data.recurrenceRule
        updateData.nextRunDate = calculateNextRunDate(startDate, recurrenceRule)
      }

      return await this.db.scheduledTransactions.update(id, updateData)
    } catch (err) {
      Logger.error(err)
      return Result.fail(err.message, "Failed to update scheduled transaction")
    }
  }

  async toggleScheduledTransactionStatus(id) {
    return await this.db.scheduledTransactions.toggleStatus(id)
  }

  async deleteScheduledTransaction(id) {
    return await this.db.scheduledTransactions.delete(id)
  }

  async getScheduledTransactionStats() {
    return await this.db.scheduledTransactions.getStats()
  }

  async getUpcomingScheduledTransactions(days) {
    return await this.db.scheduledTransactions.getUpcoming(days)
  }

  async getOverdueScheduledTransactions() {
    return await this.db.scheduledTransactions.getOverdue()
  }

  async getAccountBalanceAfterTransaction(id) {
    try {
      const scheduledTxnResult = await this.db.scheduledTransactions.findById(
        id
      )
      if (!scheduledTxnResult.success) {
        return scheduledTxnResult
      }

      const scheduledTxn = scheduledTxnResult.data
      const accountResult = await this.db.accounts.findById(
        scheduledTxn.accountId
      )

      if (!accountResult.success) {
        return Result.fail(null, "Account not found")
      }

      const account = accountResult.data
      let newBalance = account.balance

      if (scheduledTxn.type === "income") {
        newBalance += scheduledTxn.amount
      } else if (scheduledTxn.type === "expense") {
        newBalance -= scheduledTxn.amount
      }

      return Result.ok(
        {
          currentBalance: account.balance,
          transactionAmount: scheduledTxn.amount,
          projectedBalance: newBalance,
          accountName: account.name,
        },
        "Balance preview calculated"
      )
    } catch (err) {
      Logger.error(err)
      return Result.fail(err.message, "Failed to calculate balance preview")
    }
  }
  // services/ScheduledTransactionService.js

  async confirmScheduledTransaction(id, confirmData = {}) {
    console.log("Confirm data: ", confirmData)

    try {
      // Find the scheduled transaction
      const scheduledTxnResult = await this.db.scheduledTransactions.findById(
        id
      )
      if (!scheduledTxnResult.success || !scheduledTxnResult.data.id) {
        throw new Error("Scheduled transaction not found")
      }

      const scheduledTxn = scheduledTxnResult.data
      console.log("confirm data::: ", confirmData)

      // Check if transaction is active
      if (!scheduledTxn.isActive) {
        throw new Error("Cannot confirm inactive scheduled transaction")
      }

      // Get current timestamp
      const now = Date.now()

      // Get account details
      const accountResult = await this.db.accounts.findById(
        scheduledTxn.accountId
      )
      if (!accountResult.success) {
        throw new Error("Source account not found")
      }

      const account = accountResult.data
      let toAccount = null

      // For transfers, get destination account
      if (scheduledTxn.type === "transfer" && scheduledTxn.toAccountId) {
        const toAccountResult = await this.db.accounts.findById(
          scheduledTxn.toAccountId
        )
        if (!toAccountResult.success) {
          throw new Error("Destination account not found")
        }
        toAccount = toAccountResult.data
      }

      // Check sufficient balance for expenses and transfers
      if (
        (scheduledTxn.type === "expense" || scheduledTxn.type === "transfer") &&
        account.balance < scheduledTxn.amount
      ) {
        throw new Error("Insufficient balance in source account")
      }

      // Calculate opening and closing balances
      const openingBalance = account.balance
      let closingBalance = openingBalance
      let toAccountOpeningBalance = toAccount?.balance || 0
      let toAccountClosingBalance = toAccountOpeningBalance

      // Update account balances based on transaction type
      if (scheduledTxn.type === "income") {
        closingBalance = openingBalance + scheduledTxn.amount
      } else if (scheduledTxn.type === "expense") {
        closingBalance = openingBalance - scheduledTxn.amount
      } else if (scheduledTxn.type === "transfer" && toAccount) {
        // Deduct from source account
        closingBalance = openingBalance - scheduledTxn.amount
        // Add to destination account
        toAccountClosingBalance = toAccountOpeningBalance + scheduledTxn.amount
      }

      // Update source account balance
      const updateAccountResult = await this.db.accounts.update(account.id, {
        balance: closingBalance,
      })

      if (!updateAccountResult.success) {
        throw new Error("Failed to update account balance")
      }

      // Update destination account for transfers
      if (scheduledTxn.type === "transfer" && toAccount) {
        const updateToAccountResult = await this.db.accounts.update(
          toAccount.id,
          {
            balance: toAccountClosingBalance,
          }
        )

        if (!updateToAccountResult.success) {
          // Rollback source account balance
          await this.db.accounts.update(account.id, { balance: openingBalance })
          throw new Error("Failed to update destination account balance")
        }
      }

      // Create the actual transaction record
      const transactionData = {
        accountId: scheduledTxn.accountId,
        toAccountId: scheduledTxn.toAccountId || null,
        type: scheduledTxn.type,
        categoryId: scheduledTxn.categoryId || null,
        amount: scheduledTxn.amount,
        description: confirmData.description || scheduledTxn.description,
        note:
          confirmData.note ||
          `Scheduled transaction: ${scheduledTxn.description}`,
        date: now,
        openingBalance: openingBalance,
        closingBalance: closingBalance,
        isRecurring: true,
      }

      const transactionResult = await this.db.transactions.create(
        transactionData
      )

      if (!transactionResult.success) {
        // Rollback account balances
        await this.db.accounts.update(account.id, { balance: openingBalance })
        if (toAccount) {
          await this.db.accounts.update(toAccount.id, {
            balance: toAccountOpeningBalance,
          })
        }
        throw new Error("Failed to create transaction record")
      }

      const transaction = transactionResult.data
      let transferTransaction = null

      // For transfers, create corresponding transaction for the destination account
      if (scheduledTxn.type === "transfer" && toAccount) {
        const transferTransactionData = {
          accountId: scheduledTxn.toAccountId,
          toAccountId: scheduledTxn.accountId,
          type: "transfer",
          categoryId: scheduledTxn.categoryId || null,
          amount: scheduledTxn.amount,
          description: `Transfer from ${account.name}`,
          note: `Transfer from scheduled transaction: ${scheduledTxn.description}`,
          date: now,
          openingBalance: toAccountOpeningBalance,
          closingBalance: toAccountClosingBalance,
          transferReference: transaction.id,
          isRecurring: false,
        }

        const transferResult = await this.db.transactions.create(
          transferTransactionData
        )
        if (transferResult.success) {
          transferTransaction = transferResult.data

          // Update original transaction with transfer reference
          await this.db.transactions.update(transaction.id, {
            transferReference: transferTransaction.id,
          })
        }
      }

      // Calculate next run date
      const nextRunDate = calculateNextRunDate(now, scheduledTxn.recurrenceRule)

      // Check if we should complete the schedule
      let shouldComplete = false

      // If end date is set and next run would be after end date
      if (scheduledTxn.endDate && nextRunDate > scheduledTxn.endDate) {
        shouldComplete = true
      }

      // Update scheduled transaction
      const scheduleUpdateData = {
        nextRunDate: shouldComplete ? null : nextRunDate,
        isActive: shouldComplete ? 0 : scheduledTxn.isActive,
        executionCount: (scheduledTxn.executionCount || 0) + 1,
        lastExecuted: now,
      }

      await this.db.scheduledTransactions.update(id, scheduleUpdateData)

      // Record the successful execution
      const executionRecordResult =
        await this.db.scheduledTransactions.recordExecution(id, {
          transactionId: transaction.id,
          amount: scheduledTxn.amount,
          status: "success",
          executionType: "manual",
          accountBalanceBefore: openingBalance,
          accountBalanceAfter: closingBalance,
          toAccountBalanceBefore: toAccountOpeningBalance,
          toAccountBalanceAfter: toAccountClosingBalance,
          metadata: {
            confirmedBy: "user",
            confirmData,
            platform: "mobile",
            transferTransactionId: transferTransaction?.id,
            accountName: account.name,
            toAccountName: toAccount?.name,
          },
        })

      if (!executionRecordResult.success) {
        Logger.warn(
          "Failed to record execution history:",
          executionRecordResult.message
        )
      }

      return Result.ok(
        {
          scheduledTransaction: { ...scheduledTxn, ...scheduleUpdateData },
          transaction,
          transferTransaction,
          message: "Scheduled transaction confirmed successfully",
          accountUpdate: {
            previousBalance: openingBalance,
            newBalance: closingBalance,
            accountName: account.name,
            ...(toAccount && {
              toAccountPreviousBalance: toAccountOpeningBalance,
              toAccountNewBalance: toAccountClosingBalance,
              toAccountName: toAccount.name,
            }),
          },
        },
        "Scheduled transaction confirmed successfully"
      )
    } catch (error) {
      Logger.error(error)

      // Try to record the failed execution
      try {
        const scheduledTxnResult = await this.db.scheduledTransactions.findById(
          id
        )
        if (scheduledTxnResult.success) {
          await this.db.scheduledTransactions.recordExecution(id, {
            transactionId: null,
            amount: scheduledTxnResult.data?.amount || 0,
            status: "failed",
            failureReason: error.message,
            executionType: "manual",
            metadata: {
              confirmedBy: "user",
              confirmData,
              platform: "mobile",
              errorType: error.constructor.name,
            },
          })
        }
      } catch (recordError) {
        Logger.warn("Failed to record failed execution:", recordError.message)
      }

      return Result.fail(
        error.message,
        `Failed to confirm scheduled transaction: ${error.message}`
      )
    }
  }

  // services/ScheduledTransactionService.js

  async getExecutionHistory(scheduledTransactionId, options = {}) {
    try {
      // Validate scheduledTransactionId
      if (!scheduledTransactionId) {
        return Result.fail(null, "Scheduled transaction ID is required")
      }

      // Get execution history from repository (now includes account names)
      const historyResult =
        await this.db.scheduledTransactions.getExecutionHistory(
          scheduledTransactionId,
          options
        )

      if (!historyResult.success) {
        return historyResult
      }

      // Import dateUtils
      const { calculateNextRunDate } = require("../../utility/dateUtils.js")

      // Enhance the history data with additional computed fields
      const enhancedHistory = historyResult.data.map((execution, index) => {
        // Calculate expected date for this execution
        let expectedDate = null

        if (execution.startDate && execution.recurrenceRule) {
          if (index === 0) {
            // For the most recent execution, calculate based on previous expected date
            const executionNumber = (execution.executionCount || 1) - 1
            expectedDate = execution.startDate

            // Calculate the expected date for this execution number
            for (let i = 0; i < executionNumber; i++) {
              expectedDate = calculateNextRunDate(
                expectedDate,
                execution.recurrenceRule
              )
            }
          } else {
            // For older executions, work backwards
            const recentExecution = historyResult.data[0]
            let baseDate = recentExecution.startDate

            // Calculate expected date by working backwards
            for (let i = 0; i <= index; i++) {
              if (i > 0) {
                baseDate = calculateNextRunDate(
                  baseDate,
                  execution.recurrenceRule
                )
              }
            }
            expectedDate = baseDate
          }
        }

        // Calculate if execution was on time, early, or late
        let executionTiming = "on-time"
        let daysDifference = 0

        if (expectedDate) {
          daysDifference =
            (execution.executedAt - expectedDate) / (1000 * 60 * 60 * 24)

          if (daysDifference > 1) {
            executionTiming = "late"
          } else if (daysDifference < -1) {
            executionTiming = "early"
          }

          daysDifference = Math.abs(Math.round(daysDifference))
        }

        return {
          ...execution,
          // Account information (now available from query)
          accountName: execution.accountName || "Unknown Account",
          toAccountName: execution.toAccountName || null,

          // Expected vs Actual timing
          expectedDate,
          expectedDateFormatted: expectedDate
            ? new Date(expectedDate).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : null,
          executionTiming,
          daysDifference,

          // Calculate execution age
          executionAge: Date.now() - execution.executedAt,

          // Format execution date
          executionDateFormatted: new Date(
            execution.executedAt
          ).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),

          // Success indicator
          isSuccessful: execution.status === "success",

          // Amount formatted
          amountFormatted: `₹${execution.amount.toFixed(2)}`,

          // Timing status for UI
          timingStatusText: this.getTimingStatusText(
            executionTiming,
            daysDifference
          ),
          timingStatusColor: this.getTimingStatusColor(executionTiming),
        }
      })

      return Result.ok(
        enhancedHistory,
        "Execution history retrieved successfully"
      )
    } catch (err) {
      Logger.error(err)
      return Result.fail(err.message, "Failed to get execution history")
    }
  }

  // Helper methods for timing status
  getTimingStatusText(executionTiming, daysDifference) {
    switch (executionTiming) {
      case "early":
        return daysDifference === 1
          ? "1 day early"
          : `${daysDifference} days early`
      case "late":
        return daysDifference === 1
          ? "1 day late"
          : `${daysDifference} days late`
      case "on-time":
      default:
        return "On time"
    }
  }

  getTimingStatusColor(executionTiming) {
    switch (executionTiming) {
      case "early":
        return "#10B981" // Green
      case "late":
        return "#EF4444" // Red
      case "on-time":
      default:
        return "#6B7280" // Gray
    }
  }

  // Helper method to get recurrence interval in milliseconds
  getRecurrenceInterval(recurrenceRule) {
    const intervals = {
      daily: 24 * 60 * 60 * 1000,
      weekly: 7 * 24 * 60 * 60 * 1000,
      monthly: 30 * 24 * 60 * 60 * 1000, // Approximation
      yearly: 365 * 24 * 60 * 60 * 1000,
    }

    return intervals[recurrenceRule?.toLowerCase()] || intervals["monthly"]
  }

  // Helper method to get timing status text
  getTimingStatusText(executionTiming, daysDifference) {
    switch (executionTiming) {
      case "early":
        return daysDifference === 1
          ? "1 day early"
          : `${daysDifference} days early`
      case "late":
        return daysDifference === 1
          ? "1 day late"
          : `${daysDifference} days late`
      case "on-time":
      default:
        return "On time"
    }
  }

  // Helper method to get timing status color
  getTimingStatusColor(executionTiming) {
    switch (executionTiming) {
      case "early":
        return "#10B981" // Green
      case "late":
        return "#EF4444" // Red
      case "on-time":
      default:
        return "#6B7280" // Gray
    }
  }

  async getExecutionStatistics(scheduledTransactionId) {
    try {
      // Validate scheduledTransactionId
      if (!scheduledTransactionId) {
        return Result.fail(null, "Scheduled transaction ID is required")
      }

      // Get statistics from repository
      const statsResult = await this.db.scheduledTransactions.getExecutionStats(
        scheduledTransactionId
      )

      if (!statsResult.success) {
        return statsResult
      }

      const stats = statsResult.data

      // Calculate additional metrics
      const successRate =
        stats.totalExecutions > 0
          ? (stats.successfulExecutions / stats.totalExecutions) * 100
          : 0

      const failureRate =
        stats.totalExecutions > 0
          ? (stats.failedExecutions / stats.totalExecutions) * 100
          : 0

      // Calculate execution frequency (if we have enough data)
      let averageDaysBetweenExecutions = null
      if (
        stats.firstExecution &&
        stats.lastExecution &&
        stats.totalExecutions > 1
      ) {
        const daysDifference =
          (stats.lastExecution - stats.firstExecution) / (1000 * 60 * 60 * 24)
        averageDaysBetweenExecutions =
          daysDifference / (stats.totalExecutions - 1)
      }

      const enhancedStats = {
        ...stats,
        successRate: Math.round(successRate * 100) / 100,
        failureRate: Math.round(failureRate * 100) / 100,
        averageDaysBetweenExecutions,
        // Format dates
        firstExecutionFormatted: stats.firstExecution
          ? new Date(stats.firstExecution).toLocaleDateString()
          : null,
        lastExecutionFormatted: stats.lastExecution
          ? new Date(stats.lastExecution).toLocaleDateString()
          : null,
        // Format amounts
        totalAmountFormatted: `₹${(stats.totalAmount || 0).toFixed(2)}`,
        averageAmountFormatted: `₹${(stats.averageAmount || 0).toFixed(2)}`,
      }

      return Result.ok(
        enhancedStats,
        "Execution statistics retrieved successfully"
      )
    } catch (err) {
      Logger.error(err)
      return Result.fail(err.message, "Failed to get execution statistics")
    }
  }

  async getRecentExecutions(limit = 10) {
    try {
      const recentExecutionsResult =
        await this.db.scheduledTransactions.getRecentExecutions(limit)

      if (!recentExecutionsResult.success) {
        return recentExecutionsResult
      }

      const enhancedExecutions = recentExecutionsResult.data.map(
        (execution) => ({
          ...execution,
          executionAge: Date.now() - execution.executedAt,
          executionDateFormatted: new Date(
            execution.executedAt
          ).toLocaleDateString(),
          isSuccessful: execution.status === "success",
          amountFormatted: `₹${execution.amount.toFixed(2)}`,
        })
      )

      return Result.ok(
        enhancedExecutions,
        "Recent executions retrieved successfully"
      )
    } catch (err) {
      Logger.error(err)
      return Result.fail(err.message, "Failed to get recent executions")
    }
  }
}
