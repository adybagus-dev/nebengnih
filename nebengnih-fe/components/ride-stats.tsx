import { Route, Gauge } from "lucide-react"
import type { ReactNode } from "react"
import { useRoom } from "@/components/providers/room-provider"
import { formatMoney } from "@/lib/room/calculations"

export function RideStats() {
  const { room, summary } = useRoom()
  const routeReviewMessage =
    room.routeMetrics?.routeStatus === "manual-review"
      ? room.routeMetrics.validationMessage ?? "Route review needed."
      : null
  const routeStatusLabel = {
    idle: "Idle",
    loading: "Loading",
    ready: "Live",
    fallback: "Fallback",
    "manual-review": "Review",
  }[room.routeMetrics?.routeStatus ?? "idle"]
  const validationMessage = room.routeMetrics?.validationMessage

  return (
    <section className="px-4 pt-5" aria-label="Ride stats and settings">
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <StatCard
          icon={<Route className="size-4 text-primary" />}
          title="Distance"
          rows={[
            { label: "Base route", value: `${summary.baseDistanceKm.toFixed(1)} km` },
            { label: "Estimated extra distance", value: `${summary.detourDistanceKm.toFixed(1)} km` },
            { label: "Route total (map)", value: `${summary.actualDistanceKm.toFixed(1)} km` },
          ]}
        />
        <StatCard
          icon={<Gauge className="size-4 text-accent" />}
          title="Cost"
          rows={[
            { label: "Fuel rate", value: `${room.settings.fuelEfficiencyKmPerLiter.toFixed(1)} km/L` },
            { label: "Additional cost", value: formatMoney(summary.additionalCost) },
            {
              label: "Driver share",
              value: routeReviewMessage ? "Review required" : formatMoney(summary.driverShare),
            },
          ]}
        />
      </div>
      <div className="mt-2.5 rounded-2xl border border-border bg-card p-3.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-muted-foreground">Active passengers</span>
          <span className="font-mono text-xs font-semibold text-foreground">{summary.activePassengers.length}</span>
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-muted-foreground">Route status</span>
          <span className="font-mono text-xs font-semibold text-foreground">{routeStatusLabel}</span>
        </div>
        {validationMessage ? (
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
            <p className="text-xs font-semibold text-amber-900">Route review needed</p>
            <p className="mt-0.5 text-xs leading-relaxed text-amber-800">{validationMessage}</p>
          </div>
        ) : null}
      </div>
    </section>
  )
}

function StatCard({
  icon,
      title,
      rows,
}: {
  icon: ReactNode
  title: string
  rows: { label: string; value: string }[]
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3.5">
      <div className="mb-2.5 flex items-center gap-1.5">
        {icon}
        <span className="text-xs font-semibold text-foreground">{title}</span>
      </div>
      <dl className="flex flex-col gap-2">
        {rows.map((r) => (
          <div key={r.label} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
            <dt className="min-w-0 text-xs leading-tight text-muted-foreground">{r.label}</dt>
            <dd className="max-w-full whitespace-nowrap text-right font-mono text-[11px] font-semibold tabular-nums text-foreground sm:text-xs">
              {r.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
