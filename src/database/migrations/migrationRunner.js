import { Logger } from "../../utility/logger"
export class MigrationRunner {
  constructor(db) {
    this.db = db
  }

  async initialiseMigrationTable() {
    //creating the migration table
    Logger.info("Initialsing the migration table")
    try {
      this.db.execAsync(`

                CREATE TABLE IF NOT EXISTS schema_migrations(
                    version INTEGER PRIMARY KEY,
                    name TEXT,
                    description TEXT,
                    applied_at INTEGER NOT NULL
                )

                `)
      Logger.info("Migration table ready")
    } catch (err) {
      throw new Error("Error while creating the migration table")
    }
  }

  async getCurrentVersion() {
    try {
      const data = await this.db.getFirstAsync(
        `
            SELECT MAX(version) as version FROM schema_migrations
            `
      )
      return data
    } catch (err) {
      Logger.error("Error while getting version", err)
    }
  }
  async isMigrationApplied(version) {
    const data = await this.db.getFirstAsync(
      `
        SELECT version FROM schema_migrations WHERE version=?
        `,
      [version]
    )
    Logger.info(`Checking if version ${version} is alraedy applied`)
    Logger.info("data of schema table: ", data)

    if (data?.version) {
      return true
    }
    return false
  }
  async getAppliedMigrations() {
    const appliedMigrations = await this.db.getAllAsync(
      `SELECT * FROM schema_migrations;`
    )
    return appliedMigrations
  }
  async recordMigration(version, name, description) {
    await this.db.runAsync(
      `
        INSERT INTO schema_migrations (version,name,description,applied_at) VALUES (?,?,?,?)
        `,
      [version, name, description, Date.now()]
    )
    console.log("Migration recorded")
  }
  async runMigrations(migrations) {
    // initialising migration table
    Logger.info("Initialsing migration table")
    await this.initialiseMigrationTable()
    Logger.info("Migration table initialised")

    const sortedMigrations = migrations.sort((a, b) => a.version - b.version)
    Logger.info("sorted migrations:: ", sortedMigrations)
    let migrationRun = 0

    try {
      for (const m of sortedMigrations) {
        const status = await this.isMigrationApplied(m.version)
        if (status) {
          Logger.info(`${m.version} already applied.`)
          Logger.info("Continuing.....")
          continue
        }
        Logger.info(`-------Running migration ${m.version}-------`)
        await m.up(this.db)
        await this.recordMigration(m.version, m.name, m.description)
        migrationRun++
      }
    } catch (error) {
      Logger.error("Some error occured while applying migration", error)
    }
    const res = `${migrationRun} of ${sortedMigrations.length} runned succesfully`
    Logger.info(res)
    return res
  }
}
