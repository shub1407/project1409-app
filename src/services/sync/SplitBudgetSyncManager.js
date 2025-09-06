// services/sync/SplitBudgetSyncManager.js

import NetInfo from "@react-native-community/netinfo"
import { AppState } from "react-native"
import { Logger } from "../../utility/logger"
import { splitBudgetApiService } from "../api/SplitBudgetApiService"
import { SplitBudgetOperationQueue } from "./SplitBudgetOperationQueue"

export class SplitBudgetSyncManager {
  constructor(db, repositoryFactory) {
    this.db = db
    this.repositoryFactory = repositoryFactory
    this.operationQueue = new SplitBudgetOperationQueue(db)
    this.isSyncing = false
    this.isAppForeground = AppState.currentState === "active"
    this.isConnected = false

    // ✅ Retry configuration
    this.maxRetries = 3
    this.retryDelay = 2000 // 2 seconds base delay
    this.useExponentialBackoff = true

    // Store subscriptions for proper cleanup
    this.appStateSubscription = null
    this.netInfoSubscription = null

    // Callbacks for UI updates
    this.onSyncStart = null
    this.onSyncComplete = null
    this.onSyncError = null
    this.onNetworkChange = null

    // Repository mapping
    this.repositories = {
      accounts: () => this.repositoryFactory.getAccountRepository(),
      categories: () => this.repositoryFactory.getCategoryRepository(),
      transactions: () => this.repositoryFactory.getTransactionRepository(),
      schedule_transactions: () =>
        this.repositoryFactory.getScheduledTransactionRepository(),
    }

    this.setupListeners()
  }

  // ✅ Retry helper function
  async delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  // ✅ Calculate delay with exponential backoff
  calculateRetryDelay(attempt) {
    if (this.useExponentialBackoff) {
      // Exponential backoff: 2s, 4s, 8s, 16s...
      return this.retryDelay * Math.pow(2, attempt - 1)
    }
    // Linear backoff: 2s, 4s, 6s, 8s...
    return this.retryDelay * attempt
  }

  // ✅ Retry operation with configurable strategy
  async retryAsyncOperation(
    operation,
    operationId,
    maxRetries = this.maxRetries
  ) {
    let attempt = 1

    while (attempt <= maxRetries) {
      try {
        console.log(
          `🔄 Attempt ${attempt}/${maxRetries} for operation ${operationId}`
        )
        const result = await operation()

        if (attempt > 1) {
          console.log(
            `✅ Operation ${operationId} succeeded on attempt ${attempt}`
          )
        }

        return result
      } catch (error) {
        console.error(
          `❌ Attempt ${attempt}/${maxRetries} failed for operation ${operationId}:`,
          error.message
        )

        if (attempt >= maxRetries) {
          console.error(
            `🚫 Operation ${operationId} failed after ${maxRetries} attempts`
          )
          throw error
        }

        // ✅ Calculate delay for next attempt
        const delayMs = this.calculateRetryDelay(attempt)
        console.log(`⏱️ Waiting ${delayMs}ms before retry ${attempt + 1}...`)

        await this.delay(delayMs)
        attempt++
      }
    }
  }

  // ✅ Check if error is retryable
  isRetryableError(error) {
    // Network errors - always retry
    if (
      !error.status &&
      (error.code === "NETWORK_ERROR" || error.type === "NETWORK_ERROR")
    ) {
      return true
    }

    // Server errors (5xx) - retry
    if (error.status >= 500 && error.status < 600) {
      return true
    }

    // Rate limiting (429) - retry
    if (error.status === 429) {
      return true
    }

    // Timeout errors - retry
    if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
      return true
    }

    // Client errors (4xx) - don't retry (except 429)
    if (error.status >= 400 && error.status < 500) {
      return false
    }

    // Default: retry for unknown errors
    return true
  }

  setupListeners() {
    try {
      this.appStateSubscription = AppState.addEventListener(
        "change",
        this.handleAppStateChange
      )

      this.netInfoSubscription = NetInfo.addEventListener(
        this.handleNetworkChange
      )

      NetInfo.fetch()
        .then(async (state) => {
          this.isConnected = state.isConnected
          console.log(
            `📡 [SplitBudgetSync] Initial network: ${
              this.isConnected ? "ONLINE" : "OFFLINE"
            }`
          )

          // ✅ Show pending operations with merging info
          this.operationQueue.getPendingOperations().then((operations) => {
            console.log(
              `📤 Found ${operations.length} pending operations after merging`
            )
          })

          this.checkAndSync()
        })
        .catch((error) => {
          console.error("❌ Failed to fetch initial network state:", error)
        })
    } catch (error) {
      console.error("❌ Failed to setup listeners:", error)
    }
  }

  handleAppStateChange = (nextAppState) => {
    const wasBackground = !this.isAppForeground
    this.isAppForeground = nextAppState === "active"
    if (wasBackground && this.isAppForeground) {
      console.log(
        "🌅 [SplitBudgetSync] App returned to foreground - checking sync..."
      )

      setTimeout(() => this.checkAndSync(), 1000)
    }
  }

  handleNetworkChange = (state) => {
    const wasConnected = this.isConnected
    this.isConnected = state.isConnected
    this.onNetworkChange?.(this.isConnected)
    if (!wasConnected && this.isConnected && this.isAppForeground) {
      console.log("🌐 [SplitBudgetSync] Network restored - auto-syncing...")
      setTimeout(() => this.checkAndSync(), 2000)
    }
  }

  checkAndSync() {
    if (this.shouldSync()) {
      this.performSync().catch((error) => {
        console.error("❌ Auto-sync failed:", error)
      })
    }
  }

  shouldSync() {
    const conditions = {
      appForeground: this.isAppForeground,
      connected: this.isConnected,
      notSyncing: !this.isSyncing,
      dbReady: !!this.db,
    }

    const shouldSync = Object.values(conditions).every(Boolean)
    console.log(
      "🔍 [SplitBudgetSync] Sync conditions:",
      conditions,
      "→",
      shouldSync ? "✅ SYNC" : "❌ SKIP"
    )

    return shouldSync
  }

  async performSync() {
    if (this.isSyncing) {
      return { success: false, reason: "already_syncing" }
    }

    try {
      this.isSyncing = true
      console.log("🔄 [SplitBudgetSync] Starting sync...")
      this.onSyncStart?.()

      const syncPromise = this.executeSyncOperations()
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Sync timeout after 60 seconds")),
          60000
        )
      )

      const result = await Promise.race([syncPromise, timeoutPromise])
      console.log("✅ [SplitBudgetSync] Sync completed:", result)
      this.onSyncComplete?.(result)
      return result
    } catch (error) {
      console.error("❌ [SplitBudgetSync] Sync failed:", error)
      const errorResult = {
        success: false,
        error: error.message,
        timestamp: Date.now(),
      }

      this.onSyncError?.(error)
      return errorResult
    } finally {
      this.isSyncing = false
    }
  }

  async executeSyncOperations() {
    const startTime = Date.now()
    const pushResult = await this.pushLocalChanges()
    const pullResult = await this.pullRemoteChanges()

    // Clear completed operations
    await this.db.runAsync(
      `DELETE FROM sync_operations WHERE status = 'completed'`
    )

    const duration = Date.now() - startTime
    return {
      success: true,
      pushedOperations: pushResult.successCount,
      failedOperations: pushResult.failureCount,
      retriedOperations: pushResult.retriedCount || 0,
      pulledEntities: pullResult.entitiesCount,
      hasChanges: pushResult.successCount > 0 || pullResult.entitiesCount > 0,
      duration,
      timestamp: Date.now(),
    }
  }

  // ✅ Enhanced pushLocalChanges with retry support
  async pushLocalChanges() {
    console.log("📤 [SplitBudgetSync] Pushing local changes...")
    try {
      // Get both pending and retryable operations
      const pendingOperations = await this.operationQueue.getPendingOperations()
      const retryableOperations =
        await this.operationQueue.getRetryableOperations(this.maxRetries)

      const allOperations = [...pendingOperations, ...retryableOperations]

      console.log(
        `📤 Found ${pendingOperations.length} pending + ${retryableOperations.length} retryable = ${allOperations.length} total operations`
      )

      if (allOperations.length === 0) {
        return { successCount: 0, failureCount: 0, retriedCount: 0 }
      }

      let successCount = 0
      let failureCount = 0
      let retriedCount = 0

      for (const operation of allOperations) {
        try {
          console.log(
            `📤 Processing ${operation.operation_type} for ${
              operation.table_name
            } ${operation.record_id}${
              operation.retry_count > 0
                ? ` (Retry ${operation.retry_count}/${this.maxRetries})`
                : ""
            }`
          )

          // Check dependencies first
          if (!(await this.checkDependencies(operation.dependencies))) {
            console.log(`⏳ Skipping operation - dependencies not met`)
            continue
          }

          // ✅ Process operation with retry logic
          await this.retryAsyncOperation(
            () => this.processOperation(operation),
            operation.id,
            this.maxRetries - operation.retry_count // Reduce retries based on previous attempts
          )

          await this.operationQueue.markCompleted(operation.id)
          successCount++

          if (operation.retry_count > 0) {
            retriedCount++
            console.log(
              `🔄 Operation ${operation.id} succeeded after ${operation.retry_count} previous failures`
            )
          }
        } catch (error) {
          console.error(`❌ Operation ${operation.id} failed:`, error.message)

          // ✅ Only mark as failed if error is not retryable or max retries exceeded
          if (
            !this.isRetryableError(error) ||
            operation.retry_count >= this.maxRetries
          ) {
            await this.operationQueue.markFailed(operation.id, error.message)
            failureCount++
            console.log(`🚫 Operation ${operation.id} permanently failed`)
          } else {
            await this.operationQueue.markFailed(operation.id, error.message)
            console.log(`🔄 Operation ${operation.id} will be retried later`)
          }
        }
      }

      return { successCount, failureCount, retriedCount }
    } catch (error) {
      console.error("❌ pushLocalChanges failed:", error)
      throw error
    }
  }

  async checkDependencies(dependencies) {
    Logger.debug("Checking dependencies:", dependencies)
    if (!dependencies || dependencies.length === 0) return true

    for (const dep of dependencies) {
      const repo = this.repositories[dep.tableName]?.()
      if (!repo) continue

      const record = await repo.findById(dep.recordId)
      Logger.debug("dependencies:", dep, "\nDependency record:", record)

      if (!record.success || !record.data.cloudId) {
        return false
      }
    }

    return true
  }

  // ✅ Enhanced processOperation - now handles merged operations correctly
  async processOperation(operation) {
    const { operation_type, table_name, record_data } = operation
    const normalizedData =
      table_name === "schedule_transactions"
        ? this.normalizeScheduledTransaction(record_data)
        : record_data

    switch (operation_type) {
      case "CREATE":
        console.log(`🆕 Creating ${table_name} with data:`, record_data)

        const cloudEntity = await splitBudgetApiService.createEntity(
          table_name,
          normalizedData
        )

        Logger.debug("Created remote entity:", cloudEntity.data)
        Logger.debug("cloud id", cloudEntity.data.cloudId)

        await this.markEntityAsSynced(
          table_name,
          record_data.id,
          cloudEntity.data.cloudId
        )
        break

      case "UPDATE":
        // ✅ After merging, UPDATE operations should always have cloud_id
        if (!record_data.cloud_id) {
          console.warn(
            `⚠️ UPDATE operation without cloud_id detected for ${table_name}:${record_data.id}`
          )
          console.log(
            `📝 Converting UPDATE to CREATE for ${table_name}:${record_data.id}`
          )

          const fallbackCloudEntity = await splitBudgetApiService.createEntity(
            table_name,
            normalizedData
          )

          await this.markEntityAsSynced(
            table_name,
            record_data.id,
            fallbackCloudEntity.data.cloudId
          )
        } else {
          // Normal UPDATE flow
          await splitBudgetApiService.updateEntity(
            table_name,
            record_data.cloud_id,
            normalizedData
          )

          await this.markEntityAsSynced(table_name, record_data.id)
        }
        break

      case "DELETE":
        if (record_data.cloud_id) {
          await splitBudgetApiService.deleteEntity(
            table_name,
            record_data.cloud_id
          )
        }
        await this.deleteLocalEntity(table_name, record_data.id)
        break

      default:
        throw new Error(`Unknown operation type: ${operation_type}`)
    }
  }

  async markEntityAsSynced(tableName, localId, cloudId = null) {
    const updateData = {
      sync_status: "synced",
      last_synced: Date.now(),
    }

    if (cloudId) {
      updateData.cloud_id = cloudId
    }

    Logger.debug("Marking entity as synced:", updateData)
    await this.db.runAsync(
      `UPDATE ${tableName} SET sync_status = ?, last_synced = ?${
        cloudId ? ", cloud_id = ?" : ""
      } WHERE id = ?`,
      cloudId
        ? [updateData.sync_status, updateData.last_synced, cloudId, localId]
        : [updateData.sync_status, updateData.last_synced, localId]
    )
  }

  async deleteLocalEntity(tableName, recordId) {
    // Mark as deleted locally instead of actually deleting
    await this.db.runAsync(
      `UPDATE ${tableName} SET is_deleted = 1, updated_at = ? WHERE id = ?`,
      [Date.now(), recordId]
    )
  }

  async pullRemoteChanges() {
    console.log("📥 [SplitBudgetSync] Pulling remote changes...")
    const tableNames = [
      "accounts",
      "categories",
      "transactions",
      "schedule_transactions",
    ]

    let totalChanges = 0
    for (const tableName of tableNames) {
      try {
        const lastSync = await this.getLastSyncTime(tableName)
        const remoteEntities = await splitBudgetApiService.getEntitiesAfter(
          tableName,
          lastSync
        )
        Logger.debug(`Pulled remote changes(${tableName}):`, remoteEntities)

        console.log(`📥 Received ${remoteEntities.length} remote ${tableName}`)
        for (const remoteEntity of remoteEntities) {
          await this.handleRemoteEntity(tableName, remoteEntity)
        }

        if (remoteEntities.length > 0) {
          await this.updateLastSyncTime(tableName, Date.now())
        }

        totalChanges += remoteEntities.length
      } catch (error) {
        console.error(`❌ Failed to pull ${tableName}:`, error)
      }
    }

    return { entitiesCount: totalChanges }
  }

  async handleRemoteEntity(tableName, remoteEntity) {
    const repo = this.repositories[tableName]?.()
    if (!repo) return

    const localEntity = await repo.findByCloudId?.(remoteEntity.id)
    if (!localEntity || !localEntity.success || !localEntity.data.id) {
      console.log(
        `creating local entity for remote ${tableName} ${
          remoteEntity.id
        }:: ${JSON.stringify(remoteEntity)}`
      )
      await this.createLocalFromRemote(tableName, remoteEntity)
    } else {
      await this.resolveConflict(tableName, localEntity.data, remoteEntity)
    }
  }

  async createLocalFromRemote(tableName, remoteEntity) {
    try {
      const columns = await this.getTableColumns(tableName)
      const values = columns.map((col) => {
        if (remoteEntity[col]) return remoteEntity[col]
        else if (remoteEntity[col] === 0) return 0
        else if (col === "is_deleted") return 0
        else if (col === "created_at" || col === "updated_at") return Date.now()
        else return null
      })

      console.log("Creating local entity for remote:", {
        tableName,
        remoteEntity,
      })

      await this.db.runAsync(
        `INSERT OR REPLACE INTO ${tableName} (${columns.join(
          ", "
        )}) VALUES (${columns.map(() => "?").join(", ")})`,
        values
      )

      console.log(`✅ Created local ${tableName} from remote`)
    } catch (error) {
      console.error(`❌ Failed to create local ${tableName}:`, error)
      throw error
    }
  }

  async resolveConflict(tableName, localEntity, remoteEntity) {
    // Simple last-write-wins strategy
    if (remoteEntity.updated_at > localEntity.updatedAt) {
      await this.createLocalFromRemote(tableName, remoteEntity)
    }
  }

  async getLastSyncTime(tableName) {
    const result = await this.db.getFirstAsync(
      `SELECT MAX(last_synced) as last_sync FROM ${tableName} WHERE sync_status = 'synced'`
    )

    console.log("📅 Last sync time for", tableName, "is", result?.last_sync)
    return result?.last_sync || 0
  }

  async updateLastSyncTime(tableName, timestamp) {
    console.log(`📅 [SplitBudgetSync] Last sync for ${tableName}: ${timestamp}`)
    await this.db.runAsync(
      `UPDATE ${tableName} SET last_synced = ? WHERE sync_status = 'synced'`,
      [timestamp]
    )
  }

  async getTableColumns(tableName) {
    // Complete column mappings for all SplitBudget tables
    const columnMappings = {
      accounts: [
        "id",
        "type",
        "name",
        "balance",
        "initial_balance",
        "color",
        "icon",
        "order_index",
        "created_at",
        "updated_at",
        "is_deleted",
        "cloud_id",
        "sync_status",
        "last_synced",
        "version",
      ],
      categories: [
        "id",
        "label",
        "type",
        "icon",
        "color",
        "is_default",
        "is_active",
        "created_at",
        "updated_at",
        "is_deleted",
        "cloud_id",
        "sync_status",
        "last_synced",
        "version",
      ],
      transactions: [
        "id",
        "account_id",
        "to_account_id",
        "type",
        "category_id",
        "amount",
        "description",
        "note",
        "is_recurring",
        "date",
        "opening_balance",
        "closing_balance",
        "transfer_reference",
        "created_at",
        "updated_at",
        "is_deleted",
        "cloud_id",
        "sync_status",
        "last_synced",
        "version",
      ],
      schedule_transactions: [
        "id",
        "name",
        "description",
        "type",
        "category_id",
        "account_id",
        "to_account_id",
        "amount",
        "currency",
        "frequency",
        "is_recurring",
        "recurrence_rule",
        "start_date",
        "end_date",
        "next_run_date",
        "last_executed",
        "execution_count",
        "max_executions",
        "status",
        "notes",
        "tags",
        "notification_settings",
        "metadata",
        "execution_history",
        "is_active",
        "created_at",
        "updated_at",
        "is_deleted",
        "deleted_at",
        "cloud_id",
        "sync_status",
        "last_synced",
        "version",
      ],
      scheduled_transaction_executions: [
        "id",
        "scheduled_transaction_id",
        "transaction_id",
        "executed_at",
        "amount",
        "status",
        "failure_reason",
        "execution_type",
        "account_balance_before",
        "account_balance_after",
        "to_account_balance_before",
        "to_account_balance_after",
        "metadata",
        "created_at",
        "updated_at",
        "is_deleted",
        "cloud_id",
        "sync_status",
        "last_synced",
        "version",
      ],
      sync_operations: [
        "id",
        "operation_type",
        "table_name",
        "record_id",
        "record_data",
        "dependencies",
        "priority",
        "created_at",
        "retry_count",
        "status",
        "error_message",
        "last_attempt",
      ],
    }

    return columnMappings[tableName] || []
  }

  async triggerManualSync() {
    if (!this.isConnected) {
      throw new Error("Cannot sync: no network connection")
    }

    return await this.performSync()
  }

  //helper functions
  normalizeScheduledTransaction(data) {
    let obj = {
      ...data,
      isActive: Boolean(data.isActive),
      isDeleted: Boolean(data.isDeleted),
      isRecurring: Boolean(data.isRecurring),
      tags: Array.isArray(data.tags) ? data.tags : [],
      executionHistory: Array.isArray(data.executionHistory)
        ? data.executionHistory
        : [],
      metadata:
        typeof data.metadata === "string"
          ? JSON.parse(data.metadata)
          : data.metadata,
      notificationSettings:
        typeof data.notificationSettings === "string"
          ? JSON.parse(data.notificationSettings)
          : data.notificationSettings,
    }

    if (!obj.toAccountId) {
      delete obj.toAccountId
    }
    if (!obj.maxExecutions) {
      delete obj.maxExecutions
    }
    if (!obj.endDate) {
      delete obj.endDate
    }

    Logger.debug("Normalized scheduled transaction:", obj)
    return obj
  }

  cleanup() {
    try {
      if (this.appStateSubscription) {
        this.appStateSubscription.remove()
        this.appStateSubscription = null
      }

      if (this.netInfoSubscription) {
        this.netInfoSubscription()
        this.netInfoSubscription = null
      }

      this.isSyncing = false
      this.onSyncStart = null
      this.onSyncComplete = null
      this.onSyncError = null
      this.onNetworkChange = null
      console.log("✅ [SplitBudgetSync] Cleanup completed")
    } catch (error) {
      console.error("❌ Error during cleanup:", error)
    }
  }
}
