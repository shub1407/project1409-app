export const migration001 = {
  version: 1,
  name: "Initial SplitBudget Database Setup with Sync Support",
  description:
    "Create accounts, categories, transactions, schedule_transactions tables with sync support and operation queue for offline-first splitBudget app",

  async up(db) {
    console.log(`Running the up function of ${this.version}`)

    try {
      // Create accounts table with sync fields
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
          is_deleted INTEGER DEFAULT 0,
          cloud_id TEXT,
          sync_status TEXT DEFAULT 'pending_create',
          last_synced INTEGER DEFAULT 0,
          version INTEGER DEFAULT 1
        )
      `)

      // Create categories table with sync fields
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
          is_deleted INTEGER DEFAULT 0,
          cloud_id TEXT,
          sync_status TEXT DEFAULT 'pending_create',
          last_synced INTEGER DEFAULT 0,
          version INTEGER DEFAULT 1
        )
      `)

      // Create transactions table with sync fields
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
          cloud_id TEXT,
          sync_status TEXT DEFAULT 'pending_create',
          last_synced INTEGER DEFAULT 0,
          version INTEGER DEFAULT 1,

          FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
          FOREIGN KEY (to_account_id) REFERENCES accounts(id) ON DELETE CASCADE,
          FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
        )
      `)

      // Create schedule_transactions table with sync fields
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS schedule_transactions (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
          category_id TEXT,
          account_id TEXT NOT NULL,
          to_account_id TEXT,
          amount REAL NOT NULL,
          currency TEXT DEFAULT 'INR',
          frequency TEXT NOT NULL DEFAULT 'monthly' CHECK (frequency IN ('one-time', 'daily', 'weekly', 'monthly', 'yearly')),
          is_recurring INTEGER DEFAULT 1,
          recurrence_rule TEXT NOT NULL,
          start_date INTEGER NOT NULL,
          end_date INTEGER,
          next_run_date INTEGER NOT NULL,
          last_executed INTEGER,
          execution_count INTEGER DEFAULT 0,
          max_executions INTEGER,
          status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
          notes TEXT,
          tags TEXT, -- JSON string for array of tags
          
          -- Notification Settings (as JSON)
          notification_settings TEXT NOT NULL DEFAULT '{"enabled":true,"timing":"on-due-date","email":true,"push":true}',
          
          -- Metadata (as JSON)
          metadata TEXT DEFAULT '{"platform":"android","source":"manual"}',
          
          -- Execution History (as JSON array)
          execution_history TEXT DEFAULT '[]',
          
          -- Standard fields
          is_active INTEGER DEFAULT 1,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL,
          is_deleted INTEGER DEFAULT 0,
          deleted_at INTEGER,
          
          -- Sync fields
          cloud_id TEXT,
          sync_status TEXT DEFAULT 'pending_create',
          last_synced INTEGER DEFAULT 0,
          version INTEGER DEFAULT 1,

          FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
          FOREIGN KEY (to_account_id) REFERENCES accounts(id) ON DELETE CASCADE,
          FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
        )
      `)
      //creating scheduled_execution
      // Add to your migration001 after schedule_transactions table
      await db.execAsync(`
  CREATE TABLE IF NOT EXISTS scheduled_transaction_executions (
    id TEXT PRIMARY KEY,
    scheduled_transaction_id TEXT NOT NULL,
    transaction_id TEXT NOT NULL,
    executed_at INTEGER NOT NULL,
    amount REAL NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'skipped')),
    failure_reason TEXT,
    execution_type TEXT DEFAULT 'automatic' CHECK (execution_type IN ('automatic', 'manual')),
    
    -- Account balances at time of execution
    account_balance_before REAL,
    account_balance_after REAL,
    to_account_balance_before REAL,
    to_account_balance_after REAL,
    
    -- Metadata
    metadata TEXT DEFAULT '{}',
    
    -- Standard fields
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    is_deleted INTEGER DEFAULT 0,
    
    -- Sync fields
    cloud_id TEXT,
    sync_status TEXT DEFAULT 'pending_create',
    last_synced INTEGER DEFAULT 0,
    version INTEGER DEFAULT 1,

    FOREIGN KEY (scheduled_transaction_id) REFERENCES schedule_transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
  )
`)

      // Add indexes for the execution log table
      await db.execAsync(`
  CREATE INDEX IF NOT EXISTS idx_scheduled_executions_scheduled_txn ON scheduled_transaction_executions(scheduled_transaction_id);
  CREATE INDEX IF NOT EXISTS idx_scheduled_executions_executed_at ON scheduled_transaction_executions(executed_at);
  CREATE INDEX IF NOT EXISTS idx_scheduled_executions_status ON scheduled_transaction_executions(status);
  CREATE INDEX IF NOT EXISTS idx_scheduled_executions_transaction_id ON scheduled_transaction_executions(transaction_id);
`)

      // Create indexes for better performance
      await db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_schedule_transactions_account_id ON schedule_transactions(account_id);
        CREATE INDEX IF NOT EXISTS idx_schedule_transactions_next_run_date ON schedule_transactions(next_run_date);
        CREATE INDEX IF NOT EXISTS idx_schedule_transactions_type ON schedule_transactions(type);
        CREATE INDEX IF NOT EXISTS idx_schedule_transactions_status ON schedule_transactions(status);
        CREATE INDEX IF NOT EXISTS idx_schedule_transactions_frequency ON schedule_transactions(frequency);
        CREATE INDEX IF NOT EXISTS idx_schedule_transactions_start_date ON schedule_transactions(start_date);
        CREATE INDEX IF NOT EXISTS idx_schedule_transactions_is_active ON schedule_transactions(is_active);
        CREATE INDEX IF NOT EXISTS idx_schedule_transactions_sync_status ON schedule_transactions(sync_status);
      `)

      // Create sync operations queue table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS sync_operations (
          id TEXT PRIMARY KEY,
          operation_type TEXT NOT NULL CHECK (operation_type IN ('CREATE', 'UPDATE', 'DELETE')),
          table_name TEXT NOT NULL CHECK (table_name IN ('accounts', 'categories', 'transactions', 'schedule_transactions')),
          record_id TEXT NOT NULL,
          record_data TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          retry_count INTEGER DEFAULT 0,
          status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'retrying')),
          error_message TEXT,
          last_attempt INTEGER
        )
      `)

      // Create indexes for better performance
      await db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_accounts_type ON accounts(type);
        CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);
        CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
        CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
        CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
        CREATE INDEX IF NOT EXISTS idx_schedule_transactions_account_id ON schedule_transactions(account_id);
        CREATE INDEX IF NOT EXISTS idx_schedule_transactions_next_run_date ON schedule_transactions(next_run_date);
        CREATE INDEX IF NOT EXISTS idx_schedule_transactions_type ON schedule_transactions(type);
        CREATE INDEX IF NOT EXISTS idx_schedule_transactions_is_active ON schedule_transactions(is_active);
        CREATE INDEX IF NOT EXISTS idx_accounts_sync_status ON accounts(sync_status);
        CREATE INDEX IF NOT EXISTS idx_categories_sync_status ON categories(sync_status);
        CREATE INDEX IF NOT EXISTS idx_transactions_sync_status ON transactions(sync_status);
        CREATE INDEX IF NOT EXISTS idx_schedule_transactions_sync_status ON schedule_transactions(sync_status);
        CREATE INDEX IF NOT EXISTS idx_sync_operations_status ON sync_operations(status);
        CREATE INDEX IF NOT EXISTS idx_sync_operations_table_record ON sync_operations(table_name, record_id);
      `)

      console.log(
        "✅ Initial SplitBudget tables with sync support created successfully"
      )
    } catch (err) {
      console.error(`Error while running ${this.version} migration:`, err)
      throw err
    }
  },
}
