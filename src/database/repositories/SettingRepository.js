import { BaseRepository } from "./BaseRepository.js"
export class SettingRepository extends BaseRepository {
  // Other methods...
  constructor(db) {
    super(db, "settings")
  }
  // Settings typically don't have dependencies
  detectCreateDependencies(recordData) {
    return [] // Settings don't depend on other entities
  }

  detectUpdateDependencies(updateData, existingData) {
    return [] // Settings updates don't create new dependencies
  }

  // Get setting by key
  async logout() {
    try {
      await this.db.execAsync("BEGIN TRANSACTION")
      await this.db.execAsync("DELETE FROM accounts")
      await this.db.execAsync("DELETE FROM transactions")
      await this.db.execAsync("DELETE FROM categories WHERE is_default = 0")

      await this.db.execAsync("DELETE FROM schedule_transactions")
      await this.db.execAsync("DELETE FROM scheduled_transaction_executions")
      await this.db.execAsync("DELETE FROM sync_operations")
      await this.db.execAsync("COMMIT")
      return { success: true, message: "All user data deleted successfully" }
    } catch (error) {
      await this.db.execAsync("ROLLBACK")
      console.error("Error logging out:", error)
      return { success: false, message: "Error logging out" }
    }
  }
}
