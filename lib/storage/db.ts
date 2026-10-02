import type { Database } from "@/lib/types"
import { createSeed } from "@/lib/storage/seed"

/**
 * Single storage adapter for the whole app. Every service reads and writes
 * through here, so swapping localStorage for a real API only touches this
 * file and the services that call it.
 */
export const STORAGE_KEYS = {
  users: "app_users",
  promoters: "app_promoters",
  products: "app_products",
  offers: "app_offers",
  activity: "app_activity",
  settings: "app_settings",
  session: "app_session",
} as const satisfies Record<keyof Database, string>

const SEEDED_FLAG = "app_seeded"

type Listener = () => void
const listeners = new Set<Listener>()
let cache: Database | null = null

function readKey<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeKey(key: string, value: unknown) {
  if (value === null || value === undefined) {
    window.localStorage.removeItem(key)
  } else {
    window.localStorage.setItem(key, JSON.stringify(value))
  }
}

function load(): Database {
  const seeded = window.localStorage.getItem(SEEDED_FLAG) === "1"
  if (!seeded) {
    const seed = createSeed()
    for (const k of Object.keys(STORAGE_KEYS) as (keyof Database)[]) {
      writeKey(STORAGE_KEYS[k], seed[k])
    }
    window.localStorage.setItem(SEEDED_FLAG, "1")
    return seed
  }
  const seed = createSeed()
  return {
    users: readKey(STORAGE_KEYS.users, seed.users),
    promoters: readKey(STORAGE_KEYS.promoters, seed.promoters),
    products: readKey(STORAGE_KEYS.products, seed.products),
    offers: readKey(STORAGE_KEYS.offers, []),
    activity: readKey(STORAGE_KEYS.activity, []),
    settings: { ...seed.settings, ...readKey(STORAGE_KEYS.settings, seed.settings) },
    session: readKey(STORAGE_KEYS.session, null),
  }
}

export function getDb(): Database {
  if (!cache) cache = load()
  return cache
}

export function commit(patch: Partial<Database>) {
  const next = { ...getDb(), ...patch }
  for (const k of Object.keys(patch) as (keyof Database)[]) {
    writeKey(STORAGE_KEYS[k], next[k])
  }
  cache = next
  listeners.forEach((l) => l())
}

export function resetDb() {
  for (const key of Object.values(STORAGE_KEYS)) window.localStorage.removeItem(key)
  window.localStorage.removeItem(SEEDED_FLAG)
  cache = null
  getDb()
  listeners.forEach((l) => l())
}

export function subscribe(listener: Listener) {
  listeners.add(listener)
  const onStorage = (e: StorageEvent) => {
    if (e.key && !e.key.startsWith("app_")) return
    cache = null
    listener()
  }
  window.addEventListener("storage", onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", onStorage)
  }
}

export function uid(prefix = "") {
  const rand = Math.random().toString(36).slice(2, 8)
  return `${prefix}${Date.now().toString(36)}${rand}`
}
