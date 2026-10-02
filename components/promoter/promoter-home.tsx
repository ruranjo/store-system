"use client"

import Link from "next/link"
import { ArrowRight, TicketPercent } from "lucide-react"
import { usePromoter } from "@/hooks/use-promoter"
import { isToday, offerExpiresAt, offersForPromoter, offerStatus } from "@/lib/offers"
import { formatMoney, minutesUntilNextHour } from "@/lib/format"
import { earningsFor } from "@/lib/commissions"
import { GoalProgress } from "@/components/commissions/goal-progress"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/app/page-header"
import { StatTile } from "@/components/app/stat-tile"
import { EmptyState } from "@/components/app/empty-state"
import { OfferTicket } from "@/components/offers/offer-ticket"
import { ShareActions } from "@/components/offers/share-actions"

export function PromoterHome() {
  const ctx = usePromoter()
  if (!ctx) return null
  const { db, promoter } = ctx
  const { offerValidityHours, currency } = db.settings
  const offers = offersForPromoter(db, promoter.id)
  const active = offers.filter((o) => offerStatus(o, offerValidityHours) === "active")
  const today = offers.filter((o) => isToday(o.createdAt))
  const latest = offers[0]
  const earnings = earningsFor(db, promoter)

  return (
    <>
      <PageHeader
        title={`Hola, ${promoter.name.split(" ")[0]}`}
        description={`Tu código de promotor es ${promoter.code}. Cada oferta que generes queda registrada a tu nombre.`}
        actions={
          <Button size="lg" render={<Link href="/promotor/catalogo" />} nativeButton={false}>
            Generar oferta
            <ArrowRight data-icon="inline-end" aria-hidden="true" />
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatTile label="Ofertas hoy" value={today.length} />
        <StatTile label="Vigentes" value={active.length} hint={`Duran ${offerValidityHours} h`} />
        <StatTile
          label="Próximo bloque"
          value={`${minutesUntilNextHour()} min`}
          hint="Para repetir producto"
        />
      </div>

      <Link
        href="/promotor/comisiones"
        className="mt-3 block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Meta de hoy: ${earnings.redeemedToday} de ${db.settings.dailyGoal} canjes. Ganado hoy ${formatMoney(earnings.earnedToday, currency)}. Ver comisiones`}
      >
        <GoalProgress
          label="Meta de hoy"
          current={earnings.redeemedToday}
          goal={db.settings.dailyGoal}
          hint={`Ganado hoy ${formatMoney(earnings.earnedToday, currency)}`}
          className="transition-colors hover:border-primary/40"
        />
      </Link>

      <section className="mt-8 flex flex-col gap-4" aria-labelledby="latest-offer">
        <div className="flex items-center justify-between gap-2">
          <h2 id="latest-offer" className="text-lg font-semibold">
            Última oferta
          </h2>
          {offers.length > 0 && (
            <Link href="/promotor/ofertas" className="text-sm text-primary underline-offset-4 hover:underline">
              Ver todas
            </Link>
          )}
        </div>
        {latest ? (
          <div className="flex max-w-xl flex-col gap-4">
            <OfferTicket
              offer={latest}
              currency={currency}
              expiresAt={offerExpiresAt(latest, offerValidityHours)}
              status={offerStatus(latest, offerValidityHours)}
            />
            {offerStatus(latest, offerValidityHours) === "active" && (
              <ShareActions offer={latest} currency={currency} validityHours={offerValidityHours} />
            )}
          </div>
        ) : (
          <EmptyState
            icon={TicketPercent}
            title="Aún no tienes ofertas"
            description="Elige un producto del catálogo y genera tu primer código de descuento."
            action={
              <Button render={<Link href="/promotor/catalogo" />} nativeButton={false}>
                Ir al catálogo
              </Button>
            }
          />
        )}
      </section>
    </>
  )
}
