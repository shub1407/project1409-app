import { RepositoryFactory } from "../../database/repositories/RepositoryFactory.js"

export class DatabaseService {
  constructor(db) {
    this.repositoryFactory = new RepositoryFactory(db)
  }

  get accounts() {
    return this.repositoryFactory.getAccountRepository()
  }

  get categories() {
    return this.repositoryFactory.getCategoryRepository()
  }

  get transactions() {
    return this.repositoryFactory.getTransactionRepository()
  }
  get report() {
    return this.repositoryFactory.getReportRepository()
  }
}
