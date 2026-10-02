import { cn } from "@/lib/utils"

export function Brand({ name = "Vitrina", className, inverted }: { name?: string; className?: string; inverted?: boolean }) {
  return (
    <span className={cn("flex items-center gap-2 font-semibold tracking-tight", className)}>
      <span
        aria-hidden="true"
        className={cn(
          "flex size-7 items-center justify-center rounded-md font-mono text-sm font-bold",
          inverted ? "bg-sidebar-primary text-sidebar-primary-foreground" : "bg-primary text-primary-foreground",
        )}
      >
        {name.charAt(0).toUpperCase()}
      </span>
      <span className="truncate">{name}</span>
    </span>
  )
}
