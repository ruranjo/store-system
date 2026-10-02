import type { Activity, ActivityType } from "@/lib/types"
import { getDb, uid } from "@/lib/storage/db"

const MAX_ENTRIES = 100

/** Returns the new activity list; callers include it in their own commit. */
export function withActivity(type: ActivityType, actor: string, message: string): Activity[] {
  const entry: Activity = { id: uid("act-"), type, actor, message, at: new Date().toISOString() }
  return [entry, ...getDb().activity].slice(0, MAX_ENTRIES)
}

export function listActivity(limit = 10) {
  return getDb().activity.slice(0, limit)
}
