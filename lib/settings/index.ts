import type { Settings } from "@/lib/types"
import { commit, resetDb } from "@/lib/storage/db"
import { withActivity } from "@/lib/activity"

export function updateSettings(settings: Settings, actor: string) {
  if (!settings.storeName.trim()) throw new Error("El nombre de la tienda es obligatorio.")
  if (!/^\d{8,15}$/.test(settings.whatsappNumber))
    throw new Error("El WhatsApp debe incluir código de país, solo dígitos (8 a 15).")
  if (settings.maxDiscount < 1 || settings.maxDiscount > 90) throw new Error("El descuento máximo debe estar entre 1 y 90.")
  if (settings.offerValidityHours < 1) throw new Error("La vigencia debe ser de al menos 1 hora.")
  if (!(settings.commissionRate >= 0 && settings.commissionRate <= 50))
    throw new Error("La comisión debe estar entre 0% y 50%.")
  if (!Number.isInteger(settings.dailyGoal) || settings.dailyGoal < 1)
    throw new Error("La meta diaria debe ser un número entero mayor a 0.")
  if (!Number.isInteger(settings.weeklyGoal) || settings.weeklyGoal < settings.dailyGoal)
    throw new Error("La meta semanal debe ser un entero mayor o igual a la meta diaria.")
  const categories = Array.from(new Set(settings.categories.map((c) => c.trim()).filter(Boolean)))
  if (categories.length === 0) throw new Error("Debe existir al menos una categoría.")
  commit({
    settings: { ...settings, categories },
    activity: withActivity("settings_updated", actor, "actualizó la configuración"),
  })
}

export function resetDemoData() {
  resetDb()
}
