import { Route, Gauge } from "lucide-react"

export function RideStats() {
  return (
    <section className="px-4 pt-5" aria-label="Ride stats and settings">
      <div className="grid grid-cols-2 gap-2.5">
        <StatCard
          icon={<Route className="size-4 text-primary" />}
          title="Total Distance"
          rows={[
            { label: "Base", value: "20 km" },
            { label: "Actual", value: "27.5 km" },
          ]}
        />
        <StatCard
          icon={<Gauge className="size-4 text-accent" />}
          title="Inputs Preview"
          rows={[
            { label: "Fuel", value: "10 km/L" },
            { label: "Tolls", value: "IDR 20,000" },
          ]}
        />
      </div>
    </section>
  )
}

function StatCard({
  icon,
  title,
  rows,
}: {
  icon: React.ReactNode
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
