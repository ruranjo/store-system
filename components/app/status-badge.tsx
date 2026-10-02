import { cn } from "@/lib/utils"
import type { OfferStatus, Status } from "@/lib/types"

const STYLES: Record<Status | OfferStatus, { label: string; className: string }> = {
  active: { label: "Activo", className: "bg-accent text-accent-foreground" },
  inactive: { label: "Inactivo", className: "bg-muted text-muted-foreground" },
  expired: { label: "Expirada", className: "bg-muted text-muted-foreground" },
  cancelled: { label: "Anulada", className: "bg-destructive/10 text-destructive" },
  redeemed: { label: "Canjeada", className: "bg-primary/10 text-primary" },
}

export function StatusBadge({ status, label, className }: { status: Status | OfferStatus; label?: string; className?: string }) {
  const s = STYLES[status]
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium whitespace-nowrap",
        s.className,
        className,
      )}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {label ?? s.label}
    </span>
  )
}
