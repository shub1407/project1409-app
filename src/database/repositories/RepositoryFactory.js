// repositories/RepositoryFactory.js
import { AccountRepository } from "./AccountRepository.js"
import { CategoryRepository } from "./CategoryRepository.js"
import { ReportRepository } from "./ReportRepository.js"
import { ScheduledTransactionRepository } from "./ScheduledTransactionRepository.js"
import { TransactionRepository } from "./TransactionRepository.js"
export class RepositoryFactory {
  constructor(db) {
    this.db = db
    this._repositories = {}
  }

  getAccountRepository() {
    if (!this._repositories.accounts) {
      this._repositories.accounts = new AccountRepository(this.db)
    }
    return this._repositories.accounts
  }

  getCategoryRepository() {
    if (!this._repositories.categories) {
      this._repositories.categories = new CategoryRepository(this.db)
    }
    return this._repositories.categories
  }

  getTransactionRepository() {
    if (!this._repositories.transactions) {
      this._repositories.transactions = new TransactionRepository(this.db)
    }
    return this._repositories.transactions
  }

  getReportRepository() {
    if (!this._repositories.reports) {
      this._repositories.reports = new ReportRepository(this.db)
    }
    return this._repositories.reports
  }
  getScheduledTransactionRepository() {
    if (!this._repositories.scheduledTransactions) {
      this._repositories.scheduledTransactions =
        new ScheduledTransactionRepository(this.db)
    }
    return this._repositories.scheduledTransactions
  }
}
