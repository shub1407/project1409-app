// repositories/BaseRepository.js
import { toCamelCase, toSnakeCase } from "../../utility/caseMapper.js"
import { Logger } from "../../utility/logger"
import { Result } from "../../utility/Result.js"

export class BaseRepository {
  constructor(db, tableName) {
    this.db = db
    this.tableName = tableName
  }

  generateId() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c == "x" ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  async create(data) {
    try {
      const id = this.generateId()
      const timestamp = Date.now()

      const recordData = toSnakeCase({
        id,
        ...data,
        createdAt: timestamp,
        updatedAt: timestamp,
        isDeleted: 0,
        syncStatus: "pending_create",
        version: 1,
      })

      Logger.info(`Creating record in ${this.tableName}: `, recordData)

      const columns = Object.keys(recordData)
      const placeholders = columns.map(() => "?").join(", ")
      const values = columns.map((col) => recordData[col])

      await this.db.runAsync(
        `INSERT INTO ${this.tableName} (${columns.join(
          ", "
        )}) VALUES (${placeholders})`,
        values
      )

      await this.queueSyncOperation("CREATE", id, recordData)

      // Convert to camelCase for frontend
      const result = toCamelCase(recordData)
      return Result.ok(result, "Record created successfully")
    } catch (err) {
      Logger.error(err)
      return Result.fail(err.message, "Failed to create record")
    }
  }

  async findById(id) {
    try {
      const row = await this.db.getFirstAsync(
        `SELECT * FROM ${this.tableName} WHERE id = ? AND is_deleted = 0`,
        [id]
      )
      return Result.ok(
        toCamelCase(row || {}),
        row ? "Record fetched successfully" : "Record not found"
      )
    } catch (err) {
      Logger.error(err)
      return Result.fail(err.message, "Failed to fetch record")
    }
  }

  async findAll(options = {}) {
    try {
      const { where = "", orderBy = "created_at DESC", limit = null } = options
      let query = `SELECT * FROM ${this.tableName} WHERE is_deleted = 0`
      const params = []

      if (where) {
        query += ` AND ${where.clause}`
        params.push(...where.params)
      }

      query += ` ORDER BY ${orderBy}`
      if (limit) query += ` LIMIT ?` && params.push(limit)

      const rows = await this.db.getAllAsync(query, params)
      return Result.ok(toCamelCase(rows), "Records fetched successfully")
    } catch (err) {
      Logger.error(err)
      return Result.fail(err.message, "Failed to fetch records")
    }
  }

  async update(id, data) {
    try {
      const timestamp = Date.now()
      const existingRecord = await this.db.getFirstAsync(
        `SELECT * FROM ${this.tableName} WHERE id = ? AND is_deleted = 0`,
        [id]
      )
      if (!existingRecord)
        return Result.fail(null, `${this.tableName} with id ${id} not found`)

      const updateData = toSnakeCase({
        ...data,
        updatedAt: timestamp,
        version: existingRecord.version + 1,
        syncStatus:
          existingRecord.sync_status === "synced"
            ? "pending_update"
            : existingRecord.sync_status,
      })

      const columns = Object.keys(updateData)
      const setClause = columns.map((col) => `${col} = ?`).join(", ")
      const values = [...columns.map((col) => updateData[col]), id]

      await this.db.runAsync(
        `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`,
        values
      )
      const updatedRecord = { ...existingRecord, ...updateData }

      await this.queueSyncOperation("UPDATE", id, updatedRecord)
      return Result.ok(
        toCamelCase(updatedRecord),
        "Record updated successfully"
      )
    } catch (err) {
      Logger.error(err)
      return Result.fail(err.message, "Failed to update record")
    }
  }

  async delete(id) {
    try {
      const timestamp = Date.now()
      const existingRecord = await this.db.getFirstAsync(
        `SELECT * FROM ${this.tableName} WHERE id = ? AND is_deleted = 0`,
        [id]
      )
      if (!existingRecord)
        return Result.fail(null, `${this.tableName} with id ${id} not found`)

      await this.db.runAsync(
        `UPDATE ${this.tableName} SET is_deleted = 1, updated_at = ?, sync_status = ? WHERE id = ?`,
        [timestamp, "pending_delete", id]
      )
      await this.queueSyncOperation("DELETE", id, existingRecord)

      return Result.ok({ id }, "Record deleted successfully")
    } catch (err) {
      Logger.error(err)
      return Result.fail(err.message, "Failed to delete record")
    }
  }

  // ---------------- SYNC METHODS ----------------
  async queueSyncOperation(operationType, recordId, recordData) {
    const operationId = this.generateId()
    await this.db.runAsync(
      `
      INSERT INTO sync_operations (
        id, operation_type, table_name, record_id, record_data, 
        created_at, status
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending')
    `,
      [
        operationId,
        operationType,
        this.tableName,
        recordId,
        JSON.stringify(recordData),
        Date.now(),
      ]
    )
  }
}
