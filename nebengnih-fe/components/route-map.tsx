"use client"

import { Layers, MapPin, Flag } from "lucide-react"

export function RouteMap() {
  return (
    <section className="px-4" aria-label="Route map">
      <div className="relative h-[40vh] min-h-[260px] w-full overflow-hidden rounded-2xl border border-border bg-[var(--map-land)] shadow-lg">
        {/* Mock street grid */}
        <svg
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
          preserveAspectRatio="xMidYMid slice"
          viewBox="0 0 400 300"
        >
          {/* land blocks */}
          <rect x="0" y="0" width="400" height="300" fill="var(--map-land)" />
          {/* roads */}
          <g stroke="var(--map-road)" strokeWidth="10" strokeLinecap="round">
            <line x1="-10" y1="70" x2="410" y2="70" />
            <line x1="-10" y1="160" x2="410" y2="160" />
            <line x1="-10" y1="245" x2="410" y2="245" />
            <line x1="80" y1="-10" x2="80" y2="310" />
            <line x1="200" y1="-10" x2="200" y2="310" />
            <line x1="320" y1="-10" x2="320" y2="310" />
          </g>
          {/* dashed route geometry */}
          <polyline
            points="60,250 80,160 200,160 200,70 320,70"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="2 9"
          />
        </svg>

        {/* Pin: Me (Start) - red, bottom-left */}
        <MapPinMarker
          className="bottom-[16%] left-[12%]"
          color="var(--pin-red)"
          label="Me (Start)"
          icon={<MapPin className="size-3.5" strokeWidth={2.5} />}
        />

        {/* Pin: Andi - green, middle */}
        <MapPinMarker
          className="top-[48%] left-[48%]"
          color="var(--pin-green)"
          label="Andi"
          icon={<MapPin className="size-3.5" strokeWidth={2.5} />}
        />

        {/* Pin: Office (End) - blue checkered, top-right */}
        <MapPinMarker
          className="top-[18%] right-[16%]"
          color="var(--pin-blue)"
          label="Office (End)"
          icon={<Flag className="size-3.5" strokeWidth={2.5} />}
        />

        {/* Floating layer control */}
        <button
          type="button"
          aria-label="Toggle map layers"
          className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-lg border border-border bg-card/90 text-foreground shadow-md backdrop-blur transition-colors hover:bg-card active:scale-95"
        >
          <Layers className="size-[18px]" />
        </button>

        {/* Attribution chip */}
        <div className="absolute bottom-2 right-2 rounded bg-card/80 px-1.5 py-0.5 text-[10px] text-muted-foreground backdrop-blur">
          © OpenStreetMap
        </div>
      </div>
    </section>
  )
}

function MapPinMarker({
  className,
  color,
  label,
  icon,
}: {
  className?: string
  color: string
  label: string
  icon: React.ReactNode
}) {
  return (
    <div className={`absolute flex flex-col items-center ${className ?? ""}`}>
      <div
        className="flex size-7 items-center justify-center rounded-full text-white shadow-lg ring-2 ring-white/30"
        style={{ backgroundColor: color }}
      >
        {icon}
      </div>
      <span
        className="mt-1 whitespace-nowrap rounded-full bg-card/90 px-2 py-0.5 text-[10px] font-semibold text-foreground shadow backdrop-blur"
      >
        {label}
      </span>
    </div>
  )
}
