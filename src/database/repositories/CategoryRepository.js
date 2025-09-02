// repositories/CategoryRepository.js
import { BaseRepository } from "./BaseRepository.js"

export class CategoryRepository extends BaseRepository {
  constructor(db) {
    super(db, "categories")
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
    if (!category) {
      throw new Error("Category not found")
    }

    return await this.update(id, { is_active: category.is_active ? 0 : 1 })
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
}
