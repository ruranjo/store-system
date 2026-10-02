import { cn } from "@/lib/utils"

export function GoalProgress({
  label,
  current,
  goal,
  hint,
  className,
}: {
  label: string
  current: number
  goal: number
  hint?: string
  className?: string
}) {
  const pct = goal > 0 ? Math.min(100, Math.round((current / goal) * 100)) : 0
  const done = current >= goal
  const id = `goal-${label.replace(/\s+/g, "-").toLowerCase()}`

  return (
    <div className={cn("flex flex-col gap-3 rounded-xl border bg-card p-4", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <span id={id} className="text-sm font-medium">
          {label}
        </span>
        <span className="font-mono text-sm">
          <span className="text-lg font-semibold">{current}</span>
          <span className="text-muted-foreground"> / {goal} canjes</span>
        </span>
      </div>
      <div
        role="progressbar"
        aria-labelledby={id}
        aria-valuemin={0}
        aria-valuemax={goal}
        aria-valuenow={Math.min(current, goal)}
        className="h-2.5 overflow-hidden rounded-full bg-muted"
      >
        <div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
      <p className={cn("text-xs", done ? "font-medium text-primary" : "text-muted-foreground")}>
        {done ? "Meta cumplida" : `Faltan ${goal - current} canjes · ${pct}%`}
        {hint && !done ? ` · ${hint}` : ""}
      </p>
    </div>
  )
}
