import { Route, Gauge } from "lucide-react"
import type { ReactNode } from "react"
import { useRoom } from "@/components/providers/room-provider"
import { formatMoney } from "@/lib/room/calculations"

export function RideStats() {
  const { room, summary } = useRoom()

  return (
    <section className="px-4 pt-5" aria-label="Ride stats and settings">
      <div className="grid grid-cols-2 gap-2.5">
        <StatCard
          icon={<Route className="size-4 text-primary" />}
          title="Total Distance"
          rows={[
            { label: "Base", value: `${summary.baseDistanceKm.toFixed(1)} km` },
            { label: "Actual", value: `${summary.actualDistanceKm.toFixed(1)} km` },
          ]}
        />
        <StatCard
          icon={<Gauge className="size-4 text-accent" />}
          title="Inputs Preview"
          rows={[
            { label: "Fuel", value: `${room.settings.fuelEfficiencyKmPerLiter.toFixed(1)} km/L` },
            { label: "Tolls", value: formatMoney(summary.tollCost) },
          ]}
        />
      </div>
      <div className="mt-2.5 rounded-2xl border border-border bg-card p-3.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-muted-foreground">Active passengers</span>
          <span className="font-mono text-xs font-semibold text-foreground">{summary.activePassengers.length}</span>
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-muted-foreground">Driver share</span>
          <span className="font-mono text-xs font-semibold text-foreground">{formatMoney(summary.driverShare)}</span>
        </div>
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
      <dl className="flex flex-col gap-1.5">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between">
            <dt className="text-xs text-muted-foreground">{r.label}</dt>
            <dd className="font-mono text-xs font-semibold tabular-nums text-foreground">{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
