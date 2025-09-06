// repositories/AccountRepository.js

import { BaseRepository } from "./BaseRepository.js"

export class ScheduledTransactionExecutionRepository extends BaseRepository {
  constructor(db) {
    super(db, "scheduled_transaction_executions")
  }

  // ✅ Scheduled Transaction Executions typically don't have dependencies (they're root entities)
  detectCreateDependencies(recordData) {
    return [] // Scheduled Transaction Executions don't depend on other entities
  }

  detectUpdateDependencies(updateData, existingData) {
    return [] // Scheduled Transaction Executions don't create new dependencies
  }
}
