import { MapPin, Flag } from "lucide-react"

export function EmptyRouteMap() {
  return (
    <section className="px-4" aria-label="Route map — no passengers yet">
      <div className="relative h-[40vh] min-h-[260px] w-full overflow-hidden rounded-2xl border border-border bg-[var(--map-land)] shadow-lg">
        {/* Mock street grid */}
        <svg
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
          preserveAspectRatio="xMidYMid slice"
          viewBox="0 0 400 300"
        >
          <rect x="0" y="0" width="400" height="300" fill="var(--map-land)" />
          <g stroke="var(--map-road)" strokeWidth="10" strokeLinecap="round">
            <line x1="-10" y1="70"  x2="410" y2="70" />
            <line x1="-10" y1="160" x2="410" y2="160" />
            <line x1="-10" y1="245" x2="410" y2="245" />
            <line x1="80"  y1="-10" x2="80"  y2="310" />
            <line x1="200" y1="-10" x2="200" y2="310" />
            <line x1="320" y1="-10" x2="320" y2="310" />
          </g>
          {/* Straight line: start → end (no passenger stops) */}
          <line
            x1="60" y1="250"
            x2="330" y2="60"
            stroke="var(--primary)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="6 8"
          />
        </svg>

        {/* Pin: Me (Start) — red, bottom-left */}
        <div className="absolute bottom-[16%] left-[12%] flex flex-col items-center">
          <div className="flex size-7 items-center justify-center rounded-full text-white shadow-lg ring-2 ring-white/30" style={{ backgroundColor: "var(--pin-red)" }}>
            <MapPin className="size-3.5" strokeWidth={2.5} />
          </div>
          <span className="mt-1 whitespace-nowrap rounded-full bg-card/90 px-2 py-0.5 text-[10px] font-semibold text-foreground shadow backdrop-blur">
            Me (Start)
          </span>
        </div>

        {/* Pin: Office (End) — blue, top-right */}
        <div className="absolute right-[16%] top-[18%] flex flex-col items-center">
          <div className="flex size-7 items-center justify-center rounded-full text-white shadow-lg ring-2 ring-white/30" style={{ backgroundColor: "var(--pin-blue)" }}>
            <Flag className="size-3.5" strokeWidth={2.5} />
          </div>
          <span className="mt-1 whitespace-nowrap rounded-full bg-card/90 px-2 py-0.5 text-[10px] font-semibold text-foreground shadow backdrop-blur">
            Office (End)
          </span>
        </div>

        {/* Attribution */}
        <div className="absolute bottom-2 right-2 rounded bg-card/80 px-1.5 py-0.5 text-[10px] text-muted-foreground backdrop-blur">
          © OpenStreetMap
        </div>
      </div>
    </section>
  )
}
