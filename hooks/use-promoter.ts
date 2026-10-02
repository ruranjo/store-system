"use client"

import { useCurrentUser } from "@/hooks/use-db"

/** For screens rendered inside a promoter RoleGuard. */
export function usePromoter() {
  const { db, current } = useCurrentUser()
  if (!db || current?.role !== "promoter") return null
  return { db, promoter: current.user }
}

/** For screens rendered inside an admin RoleGuard. */
export function useAdmin() {
  const { db, current } = useCurrentUser()
  if (!db || !current || current.role === "promoter") return null
  return { db, admin: current.user, isSuper: current.role === "superadmin" }
}
