export const migration002 = {
  version: 2,
  name: "Seed default categories",
  description: "Insert default income and expense categories for new users",

  async up(db) {
    console.log("🌱 Seeding default categories...")

    try {
      const defaultCategories = [
        // Income categories
        {
          id: "cat_salary",
          label: "Salary",
          type: "income",
          icon: "wallet-outline",
          color: "#4CAF50",
          is_default: 1,
        },
        {
          id: "cat_freelance",
          label: "Freelance",
          type: "income",
          icon: "briefcase-outline",
          color: "#2196F3",
          is_default: 1,
        },
        {
          id: "cat_investment",
          label: "Investment",
          type: "income",
          icon: "trending-up-outline",
          color: "#FF9800",
          is_default: 1,
        },
        {
          id: "cat_other_income",
          label: "Other Income",
          type: "income",
          icon: "add-circle-outline",
          color: "#9C27B0",
          is_default: 1,
        },

        // Expense categories
        {
          id: "cat_food",
          label: "Food & Dining",
          type: "expense",
          icon: "restaurant-outline",
          color: "#F44336",
          is_default: 1,
        },
        {
          id: "cat_transport",
          label: "Transportation",
          type: "expense",
          icon: "car-outline",
          color: "#3F51B5",
          is_default: 1,
        },
        {
          id: "cat_shopping",
          label: "Shopping",
          type: "expense",
          icon: "bag-outline",
          color: "#E91E63",
          is_default: 1,
        },
        {
          id: "cat_entertainment",
          label: "Entertainment",
          type: "expense",
          icon: "game-controller-outline",
          color: "#9C27B0",
          is_default: 1,
        },
        {
          id: "cat_bills",
          label: "Bills & Utilities",
          type: "expense",
          icon: "receipt-outline",
          color: "#FF5722",
          is_default: 1,
        },
        {
          id: "cat_healthcare",
          label: "Healthcare",
          type: "expense",
          icon: "medical-outline",
          color: "#00BCD4",
          is_default: 1,
        },
        {
          id: "cat_education",
          label: "Education",
          type: "expense",
          icon: "school-outline",
          color: "#607D8B",
          is_default: 1,
        },
        {
          id: "cat_other_expense",
          label: "Other Expenses",
          type: "expense",
          icon: "ellipsis-horizontal-outline",
          color: "#795548",
          is_default: 1,
        },
      ]

      const timestamp = Date.now()

      for (const category of defaultCategories) {
        await db.runAsync(
          `
          INSERT OR IGNORE INTO categories (
            id, label, type, icon, color, is_default, is_active, 
            created_at, updated_at, sync_status, version
          ) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, 'synced', 1)
        `,
          [
            category.id,
            category.label,
            category.type,
            category.icon,
            category.color,
            category.is_default,
            timestamp,
            timestamp,
          ]
        )
      }

      console.log("✅ Default categories seeded successfully")
    } catch (err) {
      console.error(`Error while running ${this.version} migration:`, err)
      throw err
    }
  },
}
