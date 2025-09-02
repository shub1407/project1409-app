export const migration001 = {
  version: 1,
  name: "Initial SplitBudget Database Setup",
  description:
    "Create accounts, categories, and transactions tables for offline-first splitBudget app",

  async up(db) {
    console.log(`Running the up function of ${this.version}`)

    try {
      // Create accounts table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS accounts (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL,
          name TEXT NOT NULL,
          balance REAL DEFAULT 0,
          initial_balance REAL DEFAULT 0,
          color TEXT DEFAULT '#000000',
          icon TEXT DEFAULT 'default-icon',
          order_index INTEGER DEFAULT 0,
          created_at INTEGER,
          updated_at INTEGER,
          is_deleted INTEGER DEFAULT 0
        )
      `)

      // Create categories table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS categories (
          id TEXT PRIMARY KEY,
          label TEXT NOT NULL,
          type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
          icon TEXT DEFAULT 'trending-up-outline',
          color TEXT DEFAULT '#007AFF',
          is_default INTEGER DEFAULT 0,
          is_active INTEGER DEFAULT 1,
          created_at INTEGER DEFAULT ${Date.now()},
          updated_at INTEGER DEFAULT ${Date.now()},
          is_deleted INTEGER DEFAULT 0
        )
      `)

      // Create transactions table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS transactions (
          id TEXT PRIMARY KEY,
          account_id TEXT NOT NULL,
          to_account_id TEXT,
          type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
          category_id TEXT,
          amount REAL NOT NULL,
          description TEXT,
          note TEXT DEFAULT '',
          is_recurring INTEGER DEFAULT 0,
          date INTEGER NOT NULL,
          opening_balance REAL,
          closing_balance REAL,
          transfer_reference TEXT,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL,
          is_deleted INTEGER DEFAULT 0,

          FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
          FOREIGN KEY (to_account_id) REFERENCES accounts(id) ON DELETE CASCADE,
          FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
        )
      `)

      // Create indexes for better performance
      await db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_accounts_type ON accounts(type);
        CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);
        CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
        CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
        CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
      `)

      console.log("✅ Initial SplitBudget tables created successfully")
    } catch (err) {
      console.error(`Error while running ${this.version} migration:`, err)
      throw err
    }
  },
}
