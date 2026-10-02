"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, KeyRound } from "lucide-react"
import { useCurrentUser } from "@/hooks/use-db"
import { homeFor, login, ROLE_LABEL } from "@/lib/session"
import { demoCredentials } from "@/lib/users"
import { initials } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Brand } from "@/components/app/brand"
import { FullscreenLoader } from "@/components/app/fullscreen-loader"

export function LoginScreen() {
  const { db, current } = useCurrentUser()
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (current) router.replace(homeFor(current.role))
  }, [current, router])

  if (!db || current) return <FullscreenLoader />

  function signIn(name: string, pass: string) {
    const result = login(name, pass)
    if (result.ok) router.replace(homeFor(result.role))
    else setError(result.error)
  }

  const credentials = demoCredentials(db)

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1.1fr]">
      <section className="flex flex-col justify-between gap-10 bg-sidebar px-6 py-8 text-sidebar-foreground md:px-12 md:py-12">
        <Brand name={db.settings.storeName} inverted className="text-sidebar-accent-foreground" />
        <div className="flex max-w-md flex-col gap-6">
          <h1 className="text-3xl font-semibold tracking-tight text-balance text-sidebar-accent-foreground md:text-5xl">
            Tu catálogo, tus promotores, cada oferta con nombre propio.
          </h1>
          <p className="leading-relaxed text-pretty">
            Los promotores generan códigos únicos por producto, se registran automáticamente y los clientes compran
            directo por WhatsApp.
          </p>
          <div className="ticket-notch hidden max-w-sm rotate-[-2deg] overflow-hidden rounded-xl bg-ticket text-ticket-foreground sm:flex">
            <div className="flex w-24 flex-col items-center justify-center py-5">
              <span className="font-mono text-3xl font-bold tracking-tighter">-15%</span>
            </div>
            <div className="my-3 border-l-2 border-dashed border-current opacity-25" aria-hidden="true" />
            <div className="flex flex-col justify-center gap-1 px-4 py-4">
              <span className="text-xs opacity-75">Código de oferta</span>
              <span className="font-mono text-lg font-bold tracking-wider">PRM-001-AUD-7KQ</span>
            </div>
          </div>
        </div>
        <Link
          href="/"
          className="flex w-fit items-center gap-1.5 text-sm text-sidebar-accent-foreground underline-offset-4 hover:underline"
        >
          Ver catálogo público
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </section>

      <section className="flex items-center justify-center px-6 py-10 md:px-12">
        <div className="flex w-full max-w-md flex-col gap-8">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-semibold tracking-tight">Ingresar</h2>
            <p className="text-sm text-muted-foreground">
              Es un demo: usa una de estas credenciales. Toca una tarjeta para rellenar el formulario.
            </p>
          </div>

          <section aria-labelledby="demo-credentials" className="flex flex-col gap-3 rounded-xl border bg-muted/50 p-4">
            <h3 id="demo-credentials" className="flex items-center gap-2 text-sm font-medium">
              <KeyRound className="size-4 text-muted-foreground" aria-hidden="true" />
              Credenciales de demostración
            </h3>
            <ul className="flex flex-col gap-2">
              {credentials.map((c) => (
                <li key={c.username}>
                  <button
                    type="button"
                    onClick={() => {
                      setUsername(c.username)
                      setPassword(c.password)
                      setError(null)
                    }}
                    aria-label={`Usar credenciales de ${ROLE_LABEL[c.role]}: usuario ${c.username}, contraseña ${c.password}`}
                    className="flex w-full items-center gap-3 rounded-lg border bg-card p-3 text-left transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                  >
                    <span
                      aria-hidden="true"
                      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground"
                    >
                      {initials(c.name)}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate text-sm font-medium">
                        {ROLE_LABEL[c.role]}
                        <span className="font-normal text-muted-foreground"> · {c.detail}</span>
                      </span>
                      <span className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                        <span>
                          Usuario: <span className="font-mono text-foreground">{c.username}</span>
                        </span>
                        <span>
                          Contraseña: <span className="font-mono text-foreground">{c.password}</span>
                        </span>
                      </span>
                    </span>
                    <span className="text-xs font-medium text-primary">Usar</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault()
              signIn(username, password)
            }}
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                autoComplete="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value)
                  setError(null)
                }}
                placeholder="ej. superadmin"
                aria-invalid={!!error}
                aria-describedby={error ? "login-error" : undefined}
                className="h-11 bg-card"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError(null)
                }}
                aria-invalid={!!error}
                aria-describedby={error ? "login-error" : undefined}
                className="h-11 bg-card"
              />
              {error && (
                <p id="login-error" role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}
            </div>
            <Button type="submit" size="lg" className="h-11" disabled={!username.trim() || !password}>
              Ingresar
            </Button>
          </form>
        </div>
      </section>
    </div>
  )
}
