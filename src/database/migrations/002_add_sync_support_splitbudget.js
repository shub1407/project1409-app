export const migration002 = {
  version: 2,
  name: "Add cloud sync support to SplitBudget tables",
  description:
    "Add sync tracking fields and operation queue for offline-first functionality",

  async up(db) {
    console.log("🔄 Adding sync fields to SplitBudget tables...")

    try {
      // Add sync fields to accounts table
      await db.execAsync(`
        ALTER TABLE accounts ADD COLUMN cloud_id TEXT;
        ALTER TABLE accounts ADD COLUMN sync_status TEXT DEFAULT 'pending_create';
        ALTER TABLE accounts ADD COLUMN last_synced INTEGER DEFAULT 0;
        ALTER TABLE accounts ADD COLUMN version INTEGER DEFAULT 1;
      `)

      // Add sync fields to categories table
      await db.execAsync(`
        ALTER TABLE categories ADD COLUMN cloud_id TEXT;
        ALTER TABLE categories ADD COLUMN sync_status TEXT DEFAULT 'pending_create';
        ALTER TABLE categories ADD COLUMN last_synced INTEGER DEFAULT 0;
        ALTER TABLE categories ADD COLUMN version INTEGER DEFAULT 1;
      `)

      // Add sync fields to transactions table
      await db.execAsync(`
        ALTER TABLE transactions ADD COLUMN cloud_id TEXT;
        ALTER TABLE transactions ADD COLUMN sync_status TEXT DEFAULT 'pending_create';
        ALTER TABLE transactions ADD COLUMN last_synced INTEGER DEFAULT 0;
        ALTER TABLE transactions ADD COLUMN version INTEGER DEFAULT 1;
      `)

      // Create sync operations queue table
      await db.execAsync(`
        CREATE TABLE sync_operations (
          id TEXT PRIMARY KEY,
          operation_type TEXT NOT NULL CHECK (operation_type IN ('CREATE', 'UPDATE', 'DELETE')),
          table_name TEXT NOT NULL CHECK (table_name IN ('accounts', 'categories', 'transactions')),
          record_id TEXT NOT NULL,
          record_data TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          retry_count INTEGER DEFAULT 0,
          status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'retrying')),
          error_message TEXT,
          last_attempt INTEGER
        )
      `)

      // Create indexes for sync operations
      await db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_sync_operations_status ON sync_operations(status);
        CREATE INDEX IF NOT EXISTS idx_sync_operations_table_record ON sync_operations(table_name, record_id);
        CREATE INDEX IF NOT EXISTS idx_accounts_sync_status ON accounts(sync_status);
        CREATE INDEX IF NOT EXISTS idx_categories_sync_status ON categories(sync_status);
        CREATE INDEX IF NOT EXISTS idx_transactions_sync_status ON transactions(sync_status);
      `)

      // Update existing records to have sync status
      await db.execAsync(`
        UPDATE accounts SET sync_status = 'pending_create', version = 1 WHERE sync_status IS NULL;
        UPDATE categories SET sync_status = 'pending_create', version = 1 WHERE sync_status IS NULL;
        UPDATE transactions SET sync_status = 'pending_create', version = 1 WHERE sync_status IS NULL;
      `)

      console.log("✅ Sync support added to all SplitBudget tables")
    } catch (err) {
      console.error(`Error while running ${this.version} migration:`, err)
      throw err
    }
  },
}
