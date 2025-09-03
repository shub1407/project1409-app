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
      }

      await this.db.scheduledTransactions.update(id, scheduleUpdateData)

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
      return Result.fail(
        error.message,
        `Failed to confirm scheduled transaction: ${error.message}`
      )
    }
  }
}
