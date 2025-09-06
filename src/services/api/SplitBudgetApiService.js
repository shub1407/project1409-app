// services/api/SplitBudgetApiService.js
import { toCamelCase, toSnakeCase } from "../../utility/caseMapper"
import { Logger } from "../../utility/logger"
import apiClient from "./apiClient"
class SplitBudgetApiService {
  constructor() {
    // Define API endpoints for each entity type
    this.endpoints = {
      accounts: "/accounts",
      categories: "/categories",
      transactions: "/transactions",
      schedule_transactions: "/scheduled-transactions",
      scheduled_transaction_executions: "/scheduled-executions",
    }
  }

  /**
   * Create a new entity
   * @param {string} tableName - The table/entity type
   * @param {object} entityData - The entity data to create
   * @returns {Promise<object>} The created entity with cloud_id
   */
  async createEntity(tableName, entityData) {
    entityData = toCamelCase(entityData)
    try {
      const endpoint = this.endpoints[tableName]
      if (!endpoint) {
        throw new Error(`Unknown entity type: ${tableName}`)
      }

      Logger.info(
        `[SplitBudgetApiService]🔄 Creating ${tableName}:`,
        entityData
      )

      const response = await apiClient.post(endpoint, entityData)

      if (!response.success) {
        throw new Error(response.error || `Failed to create ${tableName}`)
      }

      Logger.info(`✅ Created ${tableName}:`, response.data)
      return response.data
    } catch (error) {
      Logger.error(`❌ Failed to create ${tableName}:`, error)
      throw this.handleApiError(error, `create ${tableName}`)
    }
  }
  /**
   * Batch create multiple entities (for bulk operations)
   * @param {string} tableName - The table/entity type
   * @param {Array} entitiesData - Array of entities to create
   * @returns {Promise<Array>} Array of created entities
   */
  async createEntitiesBatch(tableName, entitiesData) {
    entitiesData = entitiesData.map(toCamelCase)
    try {
      const endpoint = this.endpoints[tableName]
      if (!endpoint) {
        throw new Error(`Unknown entity type: ${tableName}`)
      }

      Logger.info(`🔄 Batch creating ${entitiesData.length} ${tableName}`)

      const response = await apiClient.post(`${endpoint}/batch`, {
        entities: entitiesData,
      })

      if (!response.success) {
        throw new Error(response.error || `Failed to batch create ${tableName}`)
      }

      Logger.info(`✅ Batch created ${tableName}:`, response.data)
      return response.data
    } catch (error) {
      Logger.error(`❌ Failed to batch create ${tableName}:`, error)
      throw this.handleApiError(error, `batch create ${tableName}`)
    }
  }

  /**
   * Update an existing entity
   * @param {string} tableName - The table/entity type
   * @param {string} cloudId - The cloud ID of the entity
   * @param {object} entityData - The updated entity data
   * @returns {Promise<object>} The updated entity
   */
  async updateEntity(tableName, cloudId, entityData) {
    try {
      entityData = toCamelCase(entityData)
      const endpoint = this.endpoints[tableName]
      if (!endpoint) {
        throw new Error(`Unknown entity type: ${tableName}`)
      }

      Logger.info(`🔄 Updating ${tableName} ${cloudId}:`, entityData)

      const response = await apiClient.put(`${endpoint}/${cloudId}`, entityData)

      if (!response.success) {
        throw new Error(response.error || `Failed to update ${tableName}`)
      }

      Logger.info(`✅ Updated ${tableName}:`, response.data)
      return response.data
    } catch (error) {
      Logger.error(`❌ Failed to update ${tableName} ${cloudId}:`, error)
      throw this.handleApiError(error, `update ${tableName}`)
    }
  }

  /**
   * Force a full sync (admin/debug operation)
   * @returns {Promise<object>} Full sync result
   */
  async forceFullSync() {
    try {
      Logger.info("🔄 Initiating force full sync")

      const response = await apiClient.post("/sync/force-full")

      if (!response.success) {
        throw new Error(response.error || "Failed to initiate full sync")
      }

      Logger.info("✅ Force full sync initiated")
      return response.data
    } catch (error) {
      Logger.error("❌ Failed to initiate full sync:", error)
      throw this.handleApiError(error, "initiate full sync")
    }
  }

  /**
   * Delete an entity
   * @param {string} tableName - The table/entity type
   * @param {string} cloudId - The cloud ID of the entity
   * @returns {Promise<object>} Deletion confirmation
   */
  async deleteEntity(tableName, cloudId) {
    try {
      const endpoint = this.endpoints[tableName]
      if (!endpoint) {
        throw new Error(`Unknown entity type: ${tableName}`)
      }

      Logger.info(`🔄 Deleting ${tableName} ${cloudId}`)

      const response = await apiClient.delete(`${endpoint}/${cloudId}`)

      if (!response.success) {
        throw new Error(response.error || `Failed to delete ${tableName}`)
      }

      Logger.info(`✅ Deleted ${tableName} ${cloudId}`)
      return response.data
    } catch (error) {
      Logger.error(`❌ Failed to delete ${tableName} ${cloudId}:`, error)
      throw this.handleApiError(error, `delete ${tableName}`)
    }
  }

  /**
   * Get entities updated after a specific timestamp
   * @param {string} tableName - The table/entity type
   * @param {number} timestamp - The timestamp to fetch changes after
   * @returns {Promise<Array>} Array of entities
   */
  async getEntitiesAfter(tableName, timestamp) {
    try {
      const endpoint = this.endpoints[tableName]
      if (!endpoint) {
        throw new Error(`Unknown entity type: ${tableName}`)
      }

      Logger.info(`📥 Fetching ${tableName} after timestamp:`, timestamp)

      const response = await apiClient.get(`${endpoint}`, {
        params: {
          after: timestamp,
          limit: 1000, // Reasonable batch size
          include_deleted: true, // Include soft-deleted records
        },
      })

      if (!response.success) {
        throw new Error(response.error || `Failed to fetch ${tableName}`)
      }

      const raw =
        response.data?.data?.data ?? response.data?.data ?? response.data

      let entities = Array.isArray(raw) ? raw : []
      Logger.info(`📥 Fetched ${entities.length} ${tableName} records`)
      Logger.info(`📥 ${tableName} data:`, entities)
      if (tableName === "schedule_transactions") {
        entities = entities.map((e) => ({
          ...e,
          executionHistory: JSON.stringify(e.executionHistory || "[]"),
          tags: JSON.stringify(e.tags || "[]"),
          metadata: JSON.stringify(e.metadata || "{}"),
          notificationSettings: JSON.stringify(e.notificationSettings || "{}"),
        }))
      }
      entities = toSnakeCase(entities)

      return entities
    } catch (error) {
      Logger.error(`❌ Failed to fetch ${tableName}:`, error)
      throw this.handleApiError(error, `fetch ${tableName}`)
    }
  }

  /**
   * Get sync status/metadata for troubleshooting
   * @returns {Promise<object>} Sync status information
   */
  async getSyncStatus() {
    try {
      Logger.info("📊 Fetching sync status")

      const response = await apiClient.get("/sync/status")

      if (!response.success) {
        throw new Error(response.error || "Failed to fetch sync status")
      }

      return response.data
    } catch (error) {
      Logger.error("❌ Failed to fetch sync status:", error)
      throw this.handleApiError(error, "fetch sync status")
    }
  }

  /**
   * Health check for the sync service
   * @returns {Promise<boolean>} Service health status
   */
  async healthCheck() {
    try {
      const response = await apiClient.get("/sync/health")
      return response.success && response.data?.healthy === true
    } catch (error) {
      Logger.error("❌ Sync service health check failed:", error)
      return false
    }
  }

  /**
   * Get entity by cloud ID (for conflict resolution)
   * @param {string} tableName - The table/entity type
   * @param {string} cloudId - The cloud ID
   * @returns {Promise<object|null>} The entity or null if not found
   */
  async getEntityByCloudId(tableName, cloudId) {
    try {
      const endpoint = this.endpoints[tableName]
      if (!endpoint) {
        throw new Error(`Unknown entity type: ${tableName}`)
      }

      const response = await apiClient.get(`${endpoint}/${cloudId}`)

      if (response.status === 404) {
        return null // Entity not found
      }

      if (!response.success) {
        throw new Error(response.error || `Failed to fetch ${tableName}`)
      }

      return response.data
    } catch (error) {
      if (error.status === 404) {
        return null
      }
      Logger.error(`❌ Failed to fetch ${tableName} ${cloudId}:`, error)
      throw this.handleApiError(error, `fetch ${tableName}`)
    }
  }

  /**
   * Resolve sync conflicts (server-side conflict resolution)
   * @param {string} tableName - The table/entity type
   * @param {string} cloudId - The cloud ID
   * @param {object} localData - Local version data
   * @param {object} remoteData - Remote version data
   * @returns {Promise<object>} Resolved entity
   */
  async resolveConflict(tableName, cloudId, localData, remoteData) {
    try {
      const endpoint = this.endpoints[tableName]
      if (!endpoint) {
        throw new Error(`Unknown entity type: ${tableName}`)
      }

      Logger.info(`🔄 Resolving conflict for ${tableName} ${cloudId}`)

      const response = await apiClient.post(
        `${endpoint}/${cloudId}/resolve-conflict`,
        {
          localVersion: localData,
          remoteVersion: remoteData,
          strategy: "last_write_wins", // Could be configurable
        }
      )

      if (!response.success) {
        throw new Error(
          response.error || `Failed to resolve conflict for ${tableName}`
        )
      }

      Logger.info(`✅ Resolved conflict for ${tableName} ${cloudId}`)
      return response.data
    } catch (error) {
      Logger.error(
        `❌ Failed to resolve conflict for ${tableName} ${cloudId}:`,
        error
      )
      throw this.handleApiError(error, `resolve conflict for ${tableName}`)
    }
  }

  /**
   * Handle API errors with proper formatting
   * @param {Error} error - The original error
   * @param {string} operation - Description of the operation that failed
   * @returns {Error} Formatted error
   */
  handleApiError(error, operation) {
    // Handle different error types from ApiClient
    if (error.type === "NETWORK_ERROR") {
      return new Error(
        `Network error during ${operation}. Please check your internet connection.`
      )
    } else if (error.type === "AUTH_ERROR") {
      return new Error(
        `Authentication failed during ${operation}. Please login again.`
      )
    } else if (error.status === 400) {
      return new Error(
        `Bad request during ${operation}. Please check your data.`
      )
    } else if (error.status === 409) {
      return new Error(
        `Conflict during ${operation}. Data may have been modified by another user.`
      )
    } else if (error.status === 422) {
      return new Error(
        `Validation failed during ${operation}. Please check your data.`
      )
    } else if (error.status >= 500) {
      return new Error(
        `Server error during ${operation}. Please try again later.`
      )
    }

    return error
  }

  /**
   * Get retry configuration for specific operations
   * @param {string} operation - The operation type
   * @returns {object} Retry configuration
   */
  getRetryConfig(operation) {
    const configs = {
      create: { retries: 3, backoff: "exponential" },
      update: { retries: 3, backoff: "exponential" },
      delete: { retries: 2, backoff: "linear" },
      fetch: { retries: 5, backoff: "exponential" },
    }

    return configs[operation] || { retries: 3, backoff: "exponential" }
  }
}

// Export singleton instance
export const splitBudgetApiService = new SplitBudgetApiService()
export default splitBudgetApiService
