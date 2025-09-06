// migrations/migration002.js
import categoryService from "../../services/api/categoryService"
export const migration002 = {
  version: 2,
  name: "Seed default categories",
  description: "Fetch default categories from backend and insert into SQLite",

  async up(db) {
    console.log("🌱 Seeding default categories into SQLite...")

    try {
      // Fetch default categories from backend
      const response = await categoryService.getDefaultCategories()
      console.log("ressponse from backend", response)
      if (!response.success) {
        throw new Error(`Failed to fetch default categories: ${response.error}`)
      }
      const defaultCategories = response.data.data || response.data
      if (!Array.isArray(defaultCategories) || defaultCategories.length === 0) {
        console.log("No default categories to seed.")
        return
      }

      const timestamp = Date.now()

      for (const category of defaultCategories) {
        console.log(
          `Seeding category with cloud id(${category.cloudId})`,
          category
        )
        await db.runAsync(
          `
          INSERT OR IGNORE INTO categories (
            id, label, type, icon, color, is_default, is_active,
            created_at, updated_at, sync_status, version, cloud_id
          ) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, 'synced', 1, ?)
        `,
          [
            category.id,
            category.label,
            category.type,
            category.icon,
            category.color,
            category.isDefault,
            timestamp,
            timestamp,
            category.cloudId,
          ]
        )
      }

      console.log("✅ Default categories seeded into SQLite successfully")
    } catch (err) {
      console.error(`❌ Failed migration ${this.version}:`, err)
      throw err
    }
  },
}
