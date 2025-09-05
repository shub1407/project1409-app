// hooks/useSplitBudgetSync.js
import { useEffect, useRef, useState } from "react"
import { useDatabase } from "../database/providers/DatabaseProvider"
import { RepositoryFactory } from "../database/repositories/RepositoryFactory"
import { SplitBudgetSyncManager } from "../services/sync/SplitBudgetSyncManager"

export function useSplitBudgetSync() {
  const { db, isReady } = useDatabase()
  const [syncState, setSyncState] = useState({
    isConnected: false,
    isSyncing: false,
    lastSyncTime: null,
    syncError: null,
    lastSyncResult: null,
  })

  const syncManagerRef = useRef(null)
  const repositoryFactoryRef = useRef(null)

  useEffect(() => {
    if (isReady && db) {
      initializeSyncManager()
    }

    return () => {
      if (syncManagerRef.current) {
        syncManagerRef.current.cleanup()
      }
    }
  }, [isReady, db])

  const initializeSyncManager = () => {
    repositoryFactoryRef.current = new RepositoryFactory(db)
    syncManagerRef.current = new SplitBudgetSyncManager(
      db,
      repositoryFactoryRef.current
    )

    // Set up callbacks for UI updates
    syncManagerRef.current.onSyncStart = () => {
      setSyncState((prev) => ({ ...prev, isSyncing: true, syncError: null }))
    }

    syncManagerRef.current.onSyncComplete = (result) => {
      setSyncState((prev) => ({
        ...prev,
        isSyncing: false,
        lastSyncTime: Date.now(),
        lastSyncResult: result,
        syncError: null,
      }))
    }

    syncManagerRef.current.onSyncError = (error) => {
      setSyncState((prev) => ({
        ...prev,
        isSyncing: false,
        syncError: error.message,
      }))
    }

    syncManagerRef.current.onNetworkChange = (isConnected) => {
      setSyncState((prev) => ({ ...prev, isConnected }))
    }

    console.log("🚀 [useSplitBudgetSync] Initialized")
  }

  const triggerSync = async () => {
    if (syncManagerRef.current) {
      return await syncManagerRef.current.triggerManualSync()
    }
    throw new Error("Sync manager not initialized")
  }

  return {
    syncState,
    triggerSync,
    isReady: !!syncManagerRef.current,
  }
}
