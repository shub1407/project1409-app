// repositories/ReportRepository.js
import { toCamelCase } from "../../utility/caseMapper.js"
import { Logger } from "../../utility/logger.js"
import { Result } from "../../utility/Result.js"
import { BaseRepository } from "./BaseRepository.js"

export class ReportRepository extends BaseRepository {
  constructor(db) {
    super(db, "reports") // Note: This might not need a physical table
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

  // Get spending by category for a specific period
  async getSpendingByCategory(options = {}) {
    const { startDate, endDate, type = "expense", accountId } = options

    try {
      let whereClause = "t.is_deleted = 0 AND t.type = ?"
      const params = [type]

      if (startDate && endDate) {
        const startTimestamp = this.ensureTimestamp(startDate)
        const endTimestamp = this.ensureTimestamp(endDate)
        whereClause += " AND t.date BETWEEN ? AND ?"
        params.push(startTimestamp, endTimestamp)
      }
      if (accountId) {
        whereClause += " AND (t.account_id = ? OR t.to_account_id = ?)"
        params.push(accountId, accountId)
      }

      const query = `
        SELECT 
          c.id as category_id,
          c.label as category_name,
          c.color as category_color,
          c.icon as category_icon,
          SUM(t.amount) as total_amount,
          COUNT(t.id) as transaction_count,
          AVG(t.amount) as average_amount,
          MIN(t.amount) as min_amount,
          MAX(t.amount) as max_amount
        FROM transactions t
        JOIN categories c ON t.category_id = c.id AND c.is_deleted = 0
        WHERE ${whereClause}
        GROUP BY t.category_id, c.label, c.color, c.icon
        ORDER BY total_amount DESC
      `

      const results = await this.db.getAllAsync(query, params)

      const formattedResults = results.map((row) => ({
        ...row,
        totalAmount: Number(row.total_amount).toFixed(2),
        averageAmount: Number(row.average_amount).toFixed(2),
        minAmount: Number(row.min_amount).toFixed(2),
        maxAmount: Number(row.max_amount).toFixed(2),
        percentage: 0, // Will be calculated after getting total
      }))

      // Calculate percentages
      const totalSpending = formattedResults.reduce(
        (sum, item) => sum + parseFloat(item.totalAmount),
        0
      )
      formattedResults.forEach((item) => {
        item.percentage =
          totalSpending > 0
            ? ((parseFloat(item.totalAmount) / totalSpending) * 100).toFixed(2)
            : 0
      })

      return Result.ok(
        toCamelCase(formattedResults),
        "Category spending report generated successfully"
      )
    } catch (error) {
      Logger.error("ReportRepository.getSpendingByCategory error:", error)
      return Result.fail(
        error.message,
        "Failed to generate category spending report"
      )
    }
  }

  // Get income vs expense summary for a period
  async getIncomeVsExpenseSummary(options = {}) {
    const { startDate, endDate, groupBy = "month" } = options

    try {
      let whereClause = "is_deleted = 0"
      const params = []

      if (startDate && endDate) {
        const startTimestamp = this.ensureTimestamp(startDate)
        const endTimestamp = this.ensureTimestamp(endDate)
        whereClause += " AND date BETWEEN ? AND ?"
        params.push(startTimestamp, endTimestamp)
      }

      // Group by logic for SQLite
      let dateGrouping
      switch (groupBy) {
        case "day":
          dateGrouping =
            "strftime('%Y-%m-%d', datetime(date/1000, 'unixepoch'))"
          break
        case "week":
          dateGrouping = "strftime('%Y-%W', datetime(date/1000, 'unixepoch'))"
          break
        case "year":
          dateGrouping = "strftime('%Y', datetime(date/1000, 'unixepoch'))"
          break
        case "month":
        default:
          dateGrouping = "strftime('%Y-%m', datetime(date/1000, 'unixepoch'))"
          break
      }

      const query = `
        SELECT 
          ${dateGrouping} as period,
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense,
          COUNT(CASE WHEN type = 'income' THEN 1 END) as income_count,
          COUNT(CASE WHEN type = 'expense' THEN 1 END) as expense_count,
          COUNT(*) as total_transactions
        FROM transactions 
        WHERE ${whereClause}
        GROUP BY ${dateGrouping}
        ORDER BY period ASC
      `

      const results = await this.db.getAllAsync(query, params)

      const formattedResults = results.map((row) => ({
        ...row,
        totalIncome: Number(row.total_income).toFixed(2),
        totalExpense: Number(row.total_expense).toFixed(2),
        netIncome: Number(row.total_income - row.total_expense).toFixed(2),
        savingsRate:
          row.total_income > 0
            ? (
                ((row.total_income - row.total_expense) / row.total_income) *
                100
              ).toFixed(2)
            : 0,
      }))

      return Result.ok(
        toCamelCase(formattedResults),
        "Income vs expense summary generated successfully"
      )
    } catch (error) {
      Logger.error("ReportRepository.getIncomeVsExpenseSummary error:", error)
      return Result.fail(
        error.message,
        "Failed to generate income vs expense summary"
      )
    }
  }

  // Get account balance trends over time
  async getAccountBalanceTrends(options = {}) {
    const { accountId, startDate, endDate, groupBy = "day" } = options

    try {
      let whereClause = "t.is_deleted = 0"
      const params = []

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

      // Get initial balances
      const accountsMap = {}
      const accountQuery = accountId
        ? "SELECT id, name, initial_balance FROM accounts WHERE id = ? AND is_deleted = 0"
        : "SELECT id, name, initial_balance FROM accounts WHERE is_deleted = 0"

      const accountParams = accountId ? [accountId] : []
      const accounts = await this.db.getAllAsync(accountQuery, accountParams)

      accounts.forEach((acc) => {
        accountsMap[acc.id] = {
          name: acc.name,
          initialBalance: acc.initial_balance || 0,
        }
      })

      let dateGrouping
      switch (groupBy) {
        case "week":
          dateGrouping = "strftime('%Y-%W', datetime(t.date/1000, 'unixepoch'))"
          break
        case "month":
          dateGrouping = "strftime('%Y-%m', datetime(t.date/1000, 'unixepoch'))"
          break
        case "day":
        default:
          dateGrouping =
            "strftime('%Y-%m-%d', datetime(t.date/1000, 'unixepoch'))"
          break
      }

      const query = `
        SELECT 
          t.account_id,
          ${dateGrouping} as period,
          SUM(
            CASE 
              WHEN t.type = 'income' THEN t.amount
              WHEN t.type = 'expense' THEN -t.amount
              WHEN t.type = 'transfer' AND t.account_id = t.account_id THEN -t.amount
              WHEN t.type = 'transfer' AND t.to_account_id = t.account_id THEN t.amount
              ELSE 0
            END
          ) as period_change,
          COUNT(*) as transaction_count
        FROM transactions t
        WHERE ${whereClause}
        GROUP BY t.account_id, ${dateGrouping}
        ORDER BY t.account_id, period ASC
      `

      const results = await this.db.getAllAsync(query, params)

      // Calculate running balances
      const balancesByAccount = {}
      const formattedResults = []

      results.forEach((row) => {
        const accountInfo = accountsMap[row.account_id]
        if (!accountInfo) return

        if (!balancesByAccount[row.account_id]) {
          balancesByAccount[row.account_id] = accountInfo.initialBalance
        }

        balancesByAccount[row.account_id] += row.period_change

        formattedResults.push({
          ...row,
          accountName: accountInfo.name,
          periodChange: Number(row.period_change).toFixed(2),
          balanceAtEnd: Number(balancesByAccount[row.account_id]).toFixed(2),
        })
      })

      return Result.ok(
        toCamelCase(formattedResults),
        "Account balance trends generated successfully"
      )
    } catch (error) {
      Logger.error("ReportRepository.getAccountBalanceTrends error:", error)
      return Result.fail(
        error.message,
        "Failed to generate account balance trends"
      )
    }
  }

  // Get monthly financial summary
  async getMonthlyFinancialSummary(year, month) {
    try {
      const startDate = new Date(year, month - 1, 1).getTime()
      const endDate = new Date(year, month, 0, 23, 59, 59, 999).getTime()

      const summaryQuery = `
        SELECT 
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense,
          COUNT(CASE WHEN type = 'income' THEN 1 END) as income_transactions,
          COUNT(CASE WHEN type = 'expense' THEN 1 END) as expense_transactions,
          COUNT(CASE WHEN type = 'transfer' THEN 1 END) as transfer_transactions,
          COUNT(*) as total_transactions,
          AVG(CASE WHEN type = 'income' THEN amount END) as avg_income,
          AVG(CASE WHEN type = 'expense' THEN amount END) as avg_expense
        FROM transactions 
        WHERE date BETWEEN ? AND ? AND is_deleted = 0
      `

      const summary = await this.db.getFirstAsync(summaryQuery, [
        startDate,
        endDate,
      ])

      // Get top spending categories
      const topCategoriesQuery = `
        SELECT 
          c.label as category_name,
          c.color as category_color,
          c.icon as category_icon,
          SUM(t.amount) as total_spent,
          COUNT(t.id) as transaction_count
        FROM transactions t
        JOIN categories c ON t.category_id = c.id
        WHERE t.date BETWEEN ? AND ? AND t.type = 'expense' AND t.is_deleted = 0
        GROUP BY t.category_id
        ORDER BY total_spent DESC
        LIMIT 5
      `

      const topCategories = await this.db.getAllAsync(topCategoriesQuery, [
        startDate,
        endDate,
      ])

      // Get daily spending pattern
      const dailyPatternQuery = `
        SELECT 
          strftime('%d', datetime(date/1000, 'unixepoch')) as day,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as daily_expense,
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as daily_income
        FROM transactions 
        WHERE date BETWEEN ? AND ? AND is_deleted = 0
        GROUP BY strftime('%d', datetime(date/1000, 'unixepoch'))
        ORDER BY day ASC
      `

      const dailyPattern = await this.db.getAllAsync(dailyPatternQuery, [
        startDate,
        endDate,
      ])

      const result = {
        summary: {
          ...summary,
          totalIncome: Number(summary.total_income || 0).toFixed(2),
          totalExpense: Number(summary.total_expense || 0).toFixed(2),
          netIncome: Number(
            (summary.total_income || 0) - (summary.total_expense || 0)
          ).toFixed(2),
          avgIncome: Number(summary.avg_income || 0).toFixed(2),
          avgExpense: Number(summary.avg_expense || 0).toFixed(2),
          savingsRate:
            summary.total_income > 0
              ? (
                  ((summary.total_income - summary.total_expense) /
                    summary.total_income) *
                  100
                ).toFixed(2)
              : 0,
        },
        topCategories: topCategories.map((cat) => ({
          ...cat,
          totalSpent: Number(cat.total_spent).toFixed(2),
        })),
        dailyPattern: dailyPattern.map((day) => ({
          ...day,
          dailyExpense: Number(day.daily_expense || 0).toFixed(2),
          dailyIncome: Number(day.daily_income || 0).toFixed(2),
        })),
        period: {
          year,
          month,
          startDate: this.formatDateForFrontend(startDate),
          endDate: this.formatDateForFrontend(endDate),
        },
      }

      return Result.ok(
        toCamelCase(result),
        "Monthly financial summary generated successfully"
      )
    } catch (error) {
      Logger.error("ReportRepository.getMonthlyFinancialSummary error:", error)
      return Result.fail(
        error.message,
        "Failed to generate monthly financial summary"
      )
    }
  }

  // Get budget vs actual spending comparison
  async getBudgetVsActual(options = {}) {
    const { startDate, endDate } = options

    try {
      let whereClause = "t.is_deleted = 0 AND t.type = 'expense'"
      const params = []

      if (startDate && endDate) {
        const startTimestamp = this.ensureTimestamp(startDate)
        const endTimestamp = this.ensureTimestamp(endDate)
        whereClause += " AND t.date BETWEEN ? AND ?"
        params.push(startTimestamp, endTimestamp)
      }

      // Note: This assumes you have a budgets table - adjust as needed
      const query = `
        SELECT 
          c.id as category_id,
          c.label as category_name,
          c.color as category_color,
          COALESCE(SUM(t.amount), 0) as actual_spent,
          0 as budget_amount
        FROM categories c
        LEFT JOIN transactions t ON c.id = t.category_id AND ${whereClause}
        WHERE c.type = 'expense' AND c.is_deleted = 0 AND c.is_active = 1
        GROUP BY c.id, c.label, c.color
        ORDER BY actual_spent DESC
      `

      const results = await this.db.getAllAsync(query, params)

      const formattedResults = results.map((row) => ({
        ...row,
        actualSpent: Number(row.actual_spent).toFixed(2),
        budgetAmount: Number(row.budget_amount).toFixed(2),
        variance: Number(row.budget_amount - row.actual_spent).toFixed(2),
        utilizationRate:
          row.budget_amount > 0
            ? ((row.actual_spent / row.budget_amount) * 100).toFixed(2)
            : 0,
      }))

      return Result.ok(
        toCamelCase(formattedResults),
        "Budget vs actual report generated successfully"
      )
    } catch (error) {
      Logger.error("ReportRepository.getBudgetVsActual error:", error)
      return Result.fail(
        error.message,
        "Failed to generate budget vs actual report"
      )
    }
  }

  // Get cash flow analysis
  async getCashFlowAnalysis(options = {}) {
    const { startDate, endDate, groupBy = "month", accountId } = options

    try {
      let whereClause = "is_deleted = 0"
      const params = []

      if (startDate && endDate) {
        const startTimestamp = this.ensureTimestamp(startDate)
        const endTimestamp = this.ensureTimestamp(endDate)
        whereClause += " AND date BETWEEN ? AND ?"
        params.push(startTimestamp, endTimestamp)
      }
      if (accountId) {
        whereClause += " AND (account_id = ? OR to_account_id = ?)"
        params.push(accountId, accountId)
      }

      let dateGrouping
      switch (groupBy) {
        case "day":
          dateGrouping =
            "strftime('%Y-%m-%d', datetime(date/1000, 'unixepoch'))"
          break
        case "week":
          dateGrouping = "strftime('%Y-%W', datetime(date/1000, 'unixepoch'))"
          break
        case "year":
          dateGrouping = "strftime('%Y', datetime(date/1000, 'unixepoch'))"
          break
        case "month":
        default:
          dateGrouping = "strftime('%Y-%m', datetime(date/1000, 'unixepoch'))"
          break
      }

      const query = `
        SELECT 
          ${dateGrouping} as period,
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as cash_inflow,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as cash_outflow,
          (SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) - 
           SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END)) as net_cash_flow
        FROM transactions 
        WHERE ${whereClause}
        GROUP BY ${dateGrouping}
        ORDER BY period ASC
      `

      const results = await this.db.getAllAsync(query, params)

      // Calculate cumulative cash flow
      let cumulativeCashFlow = 0
      const formattedResults = results.map((row) => {
        cumulativeCashFlow += row.net_cash_flow
        return {
          ...row,
          cashInflow: Number(row.cash_inflow).toFixed(2),
          cashOutflow: Number(row.cash_outflow).toFixed(2),
          netCashFlow: Number(row.net_cash_flow).toFixed(2),
          cumulativeCashFlow: Number(cumulativeCashFlow).toFixed(2),
        }
      })

      return Result.ok(
        toCamelCase(formattedResults),
        "Cash flow analysis generated successfully"
      )
    } catch (error) {
      Logger.error("ReportRepository.getCashFlowAnalysis error:", error)
      return Result.fail(error.message, "Failed to generate cash flow analysis")
    }
  }

  // Get expense trends and patterns
  async getExpenseTrends(options = {}) {
    const { categoryId, startDate, endDate, groupBy = "month" } = options

    try {
      let whereClause = "t.is_deleted = 0 AND t.type = 'expense'"
      const params = []

      if (categoryId) {
        whereClause += " AND t.category_id = ?"
        params.push(categoryId)
      }

      if (startDate && endDate) {
        const startTimestamp = this.ensureTimestamp(startDate)
        const endTimestamp = this.ensureTimestamp(endDate)
        whereClause += " AND t.date BETWEEN ? AND ?"
        params.push(startTimestamp, endTimestamp)
      }

      let dateGrouping
      switch (groupBy) {
        case "day":
          dateGrouping =
            "strftime('%Y-%m-%d', datetime(t.date/1000, 'unixepoch'))"
          break
        case "week":
          dateGrouping = "strftime('%Y-%W', datetime(t.date/1000, 'unixepoch'))"
          break
        case "year":
          dateGrouping = "strftime('%Y', datetime(t.date/1000, 'unixepoch'))"
          break
        case "month":
        default:
          dateGrouping = "strftime('%Y-%m', datetime(t.date/1000, 'unixepoch'))"
          break
      }

      const query = `
        SELECT 
          ${dateGrouping} as period,
          c.label as category_name,
          c.color as category_color,
          SUM(t.amount) as total_amount,
          COUNT(t.id) as transaction_count,
          AVG(t.amount) as average_amount,
          MIN(t.amount) as min_amount,
          MAX(t.amount) as max_amount
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE ${whereClause}
        GROUP BY ${dateGrouping}, t.category_id, c.label, c.color
        ORDER BY period ASC, total_amount DESC
      `

      const results = await this.db.getAllAsync(query, params)

      const formattedResults = results.map((row) => ({
        ...row,
        totalAmount: Number(row.total_amount).toFixed(2),
        averageAmount: Number(row.average_amount).toFixed(2),
        minAmount: Number(row.min_amount).toFixed(2),
        maxAmount: Number(row.max_amount).toFixed(2),
      }))

      return Result.ok(
        toCamelCase(formattedResults),
        "Expense trends generated successfully"
      )
    } catch (error) {
      Logger.error("ReportRepository.getExpenseTrends error:", error)
      return Result.fail(error.message, "Failed to generate expense trends")
    }
  }
  //get stats tos how to profile page
  async getStats() {
    try {
      const totalIncomeQuery = `
        SELECT
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income
        FROM transactions
        WHERE is_deleted = 0
      `

      const totalExpenseQuery = `
        SELECT
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense
        FROM transactions
        WHERE is_deleted = 0
      `
      const totalTransactionQuery = `
        SELECT
          COUNT(*) as total_transactions
        FROM transactions
        WHERE is_deleted = 0
      `
      const totalAccountsQuery = `
        SELECT COUNT(*) as total_accounts,SUM(balance) as total_balance
        FROM accounts
        WHERE is_deleted = 0
      `
      const pendingSyncQuery = `
        SELECT COUNT(*) as pending_sync_operations
        FROM sync_operations
        WHERE status = 'pending' OR status = 'failed' OR status = 'retrying'
      `

      const [
        totalIncomeResult,
        totalExpenseResult,
        totalTransactionResult,
        totalAccountsResult,
        pendingSyncResult,
      ] = await Promise.all([
        this.db.getFirstAsync(totalIncomeQuery),
        this.db.getFirstAsync(totalExpenseQuery),
        this.db.getFirstAsync(totalTransactionQuery),
        this.db.getFirstAsync(totalAccountsQuery),
        this.db.getFirstAsync(pendingSyncQuery),
      ])

      const stats = {
        totalIncome: Number(totalIncomeResult?.total_income || 0).toFixed(2),
        totalExpense: Number(totalExpenseResult?.total_expense || 0).toFixed(2),
        totalTransactions: totalTransactionResult?.total_transactions || 0,
        totalAccounts: totalAccountsResult?.total_accounts || 0,
        totalBalance: Number(totalAccountsResult?.total_balance || 0).toFixed(
          2
        ),
        pendingSyncOperations: pendingSyncResult?.pending_sync_operations || 0,

        balance: (
          Number(totalIncomeResult?.total_income || 0) -
          Number(totalExpenseResult?.total_expense || 0)
        ).toFixed(2),
      }

      return Result.ok(stats, "User stats retrieved successfully")
    } catch (error) {
      Logger.error("ReportRepository.getStats error:", error)
      return Result.fail(error.message, "Failed to retrieve user stats")
    }
  }
}
