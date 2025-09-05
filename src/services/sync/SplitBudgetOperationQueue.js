// services/sync/SplitBudgetOperationQueue.js

export class SplitBudgetOperationQueue {
  constructor(db) {
    this.db = db
  }

  // ✅ Enhanced addOperation with dependency tracking
  async addOperation(
    operationType,
    tableName,
    recordId,
    recordData,
    dependencies = []
  ) {
    const operation = {
      id: this.generateId(),
      operation_type: operationType, // CREATE, UPDATE, DELETE
      table_name: tableName, // accounts, categories, transactions, schedule_transactions
      record_id: String(recordId),
      record_data: JSON.stringify(recordData),
      dependencies: JSON.stringify(dependencies), // For referential integrity
      created_at: Date.now(),
      status: "pending",
      retry_count: 0,
      priority: this.getPriority(tableName),
    }

    await this.db.runAsync(
      `INSERT INTO sync_operations (id, operation_type, table_name, record_id, record_data, dependencies, created_at, status, retry_count, priority)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        operation.id,
        operation.operation_type,
        operation.table_name,
        operation.record_id,
        operation.record_data,
        operation.dependencies,
        operation.created_at,
        operation.status,
        operation.retry_count,
        operation.priority,
      ]
    )

    console.log(
      `✅ Queued ${operationType} operation for ${tableName}:${recordId} with ${dependencies.length} dependencies`
    )

    return operation.id
  }

  // ✅ Priority system ensures proper sync order
  getPriority(tableName) {
    const priorities = {
      accounts: 1, // Sync first (other entities depend on accounts)
      categories: 2, // Sync second (transactions depend on categories)
      transactions: 3, // Sync third (schedules depend on transactions)
      schedule_transactions: 4, // Sync fourth
      scheduled_transaction_executions: 5, // Sync last
    }

    return priorities[tableName] || 10
  }

  // ✅ Enhanced: Get operations ordered by priority and dependencies WITH MERGING
  async getPendingOperations() {
    const operations = await this.db.getAllAsync(
      `SELECT * FROM sync_operations
       WHERE status = 'pending'
       ORDER BY priority ASC, created_at ASC` // Priority first, then chronological
    )

    const parsedOps = operations.map((op) => ({
      ...op,
      record_data: JSON.parse(op.record_data),
      dependencies: JSON.parse(op.dependencies || "[]"),
    }))

    // ✅ Apply operation merging
    const mergedOps = await this.mergeOperations(parsedOps)

    return mergedOps
  }

  // ✅ NEW: Merge Operations Logic
  async mergeOperations(operations) {
    const mergedOpsMap = new Map()
    const operationsToComplete = []

    for (const op of operations) {
      const key = `${op.table_name}:${op.record_id}`

      if (!mergedOpsMap.has(key)) {
        // First operation for this record
        mergedOpsMap.set(key, op)
      } else {
        const existing = mergedOpsMap.get(key)

        // ✅ Merge CREATE + UPDATE operations
        if (
          existing.operation_type === "CREATE" &&
          op.operation_type === "UPDATE"
        ) {
          console.log(
            `🔄 Merging CREATE + UPDATE for ${op.table_name}:${op.record_id}`
          )

          // Keep CREATE operation but use merged data from UPDATE
          existing.record_data = {
            ...existing.record_data,
            ...op.record_data,
            // Preserve original creation fields that shouldn't be overwritten
            id: existing.record_data.id,
            created_at: existing.record_data.created_at,
          }

          // Keep the earliest creation time
          existing.created_at = Math.min(existing.created_at, op.created_at)

          // Mark the UPDATE operation for completion since we merged it
          operationsToComplete.push(op.id)
        }
        // ✅ Merge CREATE + DELETE operations
        else if (
          existing.operation_type === "CREATE" &&
          op.operation_type === "DELETE"
        ) {
          console.log(
            `🗑️ Merging CREATE + DELETE for ${op.table_name}:${op.record_id} - removing both`
          )

          // Record was created and deleted offline - no need to sync either operation
          operationsToComplete.push(existing.id, op.id)
          mergedOpsMap.delete(key)
        }
        // ✅ Merge multiple UPDATE operations
        else if (
          existing.operation_type === "UPDATE" &&
          op.operation_type === "UPDATE"
        ) {
          console.log(
            `📝 Merging UPDATE + UPDATE for ${op.table_name}:${op.record_id}`
          )

          // Merge multiple updates - keep latest data
          existing.record_data = {
            ...existing.record_data,
            ...op.record_data,
          }

          // Use the latest timestamp
          existing.created_at = Math.max(existing.created_at, op.created_at)

          // Mark older UPDATE as completed
          operationsToComplete.push(op.id)
        }
        // ✅ Merge UPDATE + DELETE operations
        else if (
          existing.operation_type === "UPDATE" &&
          op.operation_type === "DELETE"
        ) {
          console.log(
            `🗑️ Merging UPDATE + DELETE for ${op.table_name}:${op.record_id}`
          )

          // Replace UPDATE with DELETE operation
          mergedOpsMap.set(key, {
            ...op,
            // Use the latest data for the delete operation
            record_data: existing.record_data,
          })

          // Mark the UPDATE operation as completed
          operationsToComplete.push(existing.id)
        }
      }
    }

    // ✅ Mark merged operations as completed
    for (const opId of operationsToComplete) {
      await this.markCompleted(opId)
    }

    console.log(
      `📋 Merged ${operations.length} operations into ${mergedOpsMap.size} operations`
    )
    console.log(
      `🧹 Marked ${operationsToComplete.length} operations as completed through merging`
    )

    return Array.from(mergedOpsMap.values())
  }

  // ✅ Check if operation dependencies are satisfied
  async areDependenciesSatisfied(dependencies) {
    if (!dependencies || dependencies.length === 0) return true

    for (const dep of dependencies) {
      const dependentOp = await this.db.getFirstAsync(
        `SELECT status FROM sync_operations
         WHERE table_name = ? AND record_id = ? AND operation_type = ?`,
        [dep.tableName, dep.recordId, dep.operationType || "CREATE"]
      )

      // If dependency operation exists but isn't completed, wait
      if (dependentOp && dependentOp.status !== "completed") {
        return false
      }

      // Check if the dependent record has cloud_id (successfully synced)
      const recordExists = await this.db.getFirstAsync(
        `SELECT cloud_id FROM ${dep.tableName} WHERE id = ?`,
        [dep.recordId]
      )

      if (!recordExists || !recordExists.cloud_id) {
        return false
      }
    }

    return true
  }

  async markCompleted(operationId) {
    await this.db.runAsync(
      `UPDATE sync_operations SET status = 'completed' WHERE id = ?`,
      [operationId]
    )

    console.log(`✅ Operation ${operationId} completed`)
  }

  async markFailed(operationId, errorMessage) {
    await this.db.runAsync(
      `UPDATE sync_operations SET status = 'failed', retry_count = retry_count + 1, error_message = ?, last_attempt = ? WHERE id = ?`,
      [errorMessage, Date.now(), operationId]
    )

    console.log(`❌ Operation ${operationId} failed: ${errorMessage}`)
  }

  // ✅ Get failed operations that can be retried
  async getRetryableOperations(maxRetries = 3) {
    const operations = await this.db.getAllAsync(
      `SELECT * FROM sync_operations
       WHERE status = 'failed' AND retry_count < ?
       ORDER BY priority ASC, created_at ASC`,
      [maxRetries]
    )

    return operations.map((op) => ({
      ...op,
      record_data: JSON.parse(op.record_data),
      dependencies: JSON.parse(op.dependencies || "[]"),
    }))
  }

  // ✅ Clean up completed operations
  async clearCompleted() {
    const result = await this.db.runAsync(
      `DELETE FROM sync_operations WHERE status = 'completed'`
    )

    console.log(`🧹 Cleaned up ${result.changes} completed operations`)
  }

  generateId() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c == "x" ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }
}
