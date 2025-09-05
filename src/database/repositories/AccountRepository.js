// repositories/AccountRepository.js

import { Result } from "../../utility/Result.js"
import { BaseRepository } from "./BaseRepository.js"

export class AccountRepository extends BaseRepository {
  constructor(db) {
    super(db, "accounts")
  }

  // ✅ Accounts typically don't have dependencies (they're root entities)
  detectCreateDependencies(recordData) {
    return [] // Accounts don't depend on other entities
  }

  detectUpdateDependencies(updateData, existingData) {
    return [] // Account updates don't create new dependencies
  }

  // Get accounts by type
  async findByType(type) {
    return await this.findAll({
      where: { clause: "type = ?", params: [type] },
      orderBy: "order_index ASC, name ASC",
    })
  }

  // Update account balance
  async updateBalance(id, newBalance) {
    const account = await this.findById(id)
    if (!account.success || !account.data.id) {
      throw new Error("Account not found")
    }
    return await this.update(id, { balance: newBalance })
  }

  // Get total balance by type
  async getTotalBalanceByType(type) {
    const result = await this.db.getFirstAsync(
      `SELECT SUM(balance) as total FROM accounts WHERE type = ? AND is_deleted = 0`,
      [type]
    )
    return result?.total || 0
  }

  // Reorder accounts
  async reorderAccounts(accountOrders) {
    await this.db.execAsync("BEGIN TRANSACTION")
    try {
      for (const { id, order } of accountOrders) {
        await this.update(id, { order_index: order })
      }
      await this.db.execAsync("COMMIT")
      console.log("Account reordered successfully")
      return Result.ok(null, "Accounts reordered successfully")
    } catch (error) {
      await this.db.execAsync("ROLLBACK")
      return Result.fail("Failed to reorder accounts", error)
    }
  }

  // Get accounts with total count
  async getAccountsWithStats() {
    const accounts = await this.findAll({
      orderBy: "order_index ASC, name ASC",
    })

    const totalBalance = await this.db.getFirstAsync(
      `SELECT SUM(balance) as total FROM accounts WHERE is_deleted = 0`
    )

    return {
      accounts,
      totalBalance: totalBalance?.total || 0,
      count: accounts.length,
    }
  }
}
