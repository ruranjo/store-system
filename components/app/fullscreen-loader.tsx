import { Loader2 } from "lucide-react"

export function FullscreenLoader() {
  return (
    <div className="flex min-h-dvh items-center justify-center" role="status">
      <Loader2 className="size-5 animate-spin text-muted-foreground" aria-hidden="true" />
      <span className="sr-only">Cargando…</span>
    </div>
  )
}
