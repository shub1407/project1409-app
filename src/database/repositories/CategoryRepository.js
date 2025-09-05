// repositories/CategoryRepository.js

import { toCamelCase } from "../../utility/caseMapper.js"
import { Logger } from "../../utility/logger.js"
import { Result } from "../../utility/Result.js"
import { BaseRepository } from "./BaseRepository.js"

export class CategoryRepository extends BaseRepository {
  constructor(db) {
    super(db, "categories")
  }

  // ✅ Categories typically don't have dependencies (they're root entities)
  detectCreateDependencies(recordData) {
    return [] // Categories don't depend on other entities
  }

  detectUpdateDependencies(updateData, existingData) {
    return [] // Category updates don't create new dependencies
  }

  // Get categories by type
  async findByType(type) {
    return await this.findAll({
      where: { clause: "type = ? AND is_active = 1", params: [type] },
      orderBy: "is_default DESC, label ASC",
    })
  }

  // Get default categories
  async getDefaultCategories() {
    return await this.findAll({
      where: { clause: "is_default = 1 AND is_active = 1", params: [] },
      orderBy: "type ASC, label ASC",
    })
  }

  // Get user custom categories
  async getCustomCategories() {
    return await this.findAll({
      where: { clause: "is_default = 0 AND is_active = 1", params: [] },
      orderBy: "type ASC, label ASC",
    })
  }

  // Toggle category active status
  async toggleActive(id) {
    const category = await this.findById(id)
    if (!category.success || !category.data.id) {
      throw new Error("Category not found")
    }
    return await this.update(id, { is_active: category.data.isActive ? 0 : 1 })
  }

  // Get categories with usage stats
  async getCategoriesWithStats() {
    const result = await this.db.getAllAsync(`
      SELECT
        c.*,
        COUNT(t.id) as transaction_count,
        COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) as total_expense,
        COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) as total_income
      FROM categories c
      LEFT JOIN transactions t ON c.id = t.category_id AND t.is_deleted = 0
      WHERE c.is_deleted = 0 AND c.is_active = 1
      GROUP BY c.id
      ORDER BY c.is_default DESC, c.label ASC
    `)
    return result
  }

  async getCategories(type = null, hiddenCategoryIds = []) {
    try {
      let query = `
        SELECT
          c.*,
          COUNT(t.id) as transaction_count
        FROM categories c
        LEFT JOIN transactions t ON c.id = t.category_id
          AND t.is_deleted = 0
        WHERE c.is_deleted = 0
          AND c.is_active = 1
      `
      const params = []

      // Filter by type if provided
      if (type) {
        query += ` AND c.type = ?`
        params.push(type)
      }

      // Exclude hidden categories if any
      if (hiddenCategoryIds.length > 0) {
        const placeholders = hiddenCategoryIds.map(() => "?").join(", ")
        query += ` AND c.id NOT IN (${placeholders})`
        params.push(...hiddenCategoryIds)
      }

      query += `
        GROUP BY c.id
        ORDER BY c.is_default DESC, c.label ASC
      `

      const rows = await this.db.getAllAsync(query, params)
      return Result.ok(
        toCamelCase(rows),
        "Categories with transaction count fetched successfully"
      )
    } catch (err) {
      Logger.error(`Error in getCategories: ${err.message}`)
      return Result.fail(
        err.message,
        "Failed to fetch categories with transaction count"
      )
    }
  }
}
