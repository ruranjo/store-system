"use client"

import { useSyncExternalStore } from "react"
import { getDb, subscribe } from "@/lib/storage/db"
import { resolveCurrentUser } from "@/lib/session"
import type { Database } from "@/lib/types"

const getServerSnapshot = () => null

/** Reactive view of the whole local database. `null` until hydrated on the client. */
export function useDb(): Database | null {
  return useSyncExternalStore(subscribe, getDb, getServerSnapshot)
}

export function useCurrentUser() {
  const db = useDb()
  return { db, current: db ? resolveCurrentUser(db) : null }
}
