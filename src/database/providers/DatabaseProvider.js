import { useSQLiteContext } from "expo-sqlite"
import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { DatabaseService } from "../../services/databse/DatabaseService"
import { migrations } from "../migrations"
import { MigrationRunner } from "../migrations/migrationRunner"
const DatabaseContext = createContext()
export const DatabaseProvider = ({ children }) => {
  const db = useSQLiteContext()
  const [isReady, setIsReady] = useState(false)
  const [migrationStatus, setMigrationStatus] = useState(null)
  const dbService = useMemo(() => new DatabaseService(db), [db])
  async function initialseDB() {
    setIsReady(false)
    console.log("----Initialising Database----")
    const migrationRunner = new MigrationRunner(db)
    const status = await migrationRunner.runMigrations(migrations)
    setMigrationStatus(status)
    console.log(
      "Printing all the applied migrations:: ",
      await migrationRunner.getAppliedMigrations()
    )
    setIsReady(true)
  }

  useEffect(() => {
    initialseDB()
  }, [db])
  const values = { db, isReady, dbService }
  return (
    <DatabaseContext.Provider value={values}>
      {children}
    </DatabaseContext.Provider>
  )
}

export const useDatabase = () => {
  const context = useContext(DatabaseContext)
  if (!context)
    throw new Error("Database Context must be used inside database provider")
  return context
}
