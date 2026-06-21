"use client"

import { ShieldCheck } from "lucide-react"
import { formatMoney } from "@/lib/room/calculations"

interface PickupLocationPickerProps {
  landmark: string
  estimatedDetourKm: number
  estimatedShare?: number
  showEstimatedShare?: boolean
}

export function PickupLocationPicker({
  landmark,
  estimatedDetourKm,
  estimatedShare,
  showEstimatedShare = true,
}: PickupLocationPickerProps) {
  return (
    <section className="px-4 pt-5">
      <div className="mb-3 rounded-2xl border border-border bg-card px-4 py-4">
        <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <span aria-hidden="true">📍</span>
          Selected Pickup
        </h3>

        <div className="rounded-xl border border-border bg-background px-3 py-3">
          <p className="text-xs text-muted-foreground">Pickup label</p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {landmark || "Choose a place from the map search or tap a pin on the map"}
          </p>
        </div>

        <div className={`mt-3 grid gap-3 ${showEstimatedShare ? "grid-cols-2" : "grid-cols-1"}`}>
          <div className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-3">
            <p className="mb-1 text-xs text-muted-foreground">Est. Detour</p>
            <p className="text-2xl font-bold leading-none text-primary">+{estimatedDetourKm.toFixed(1)} km</p>
          </div>
          {showEstimatedShare && typeof estimatedShare === "number" ? (
            <div className="rounded-xl border border-border bg-secondary px-3 py-3">
              <p className="mb-1 text-xs text-muted-foreground">Your Share</p>
              <p className="text-2xl font-bold leading-none text-foreground">{formatMoney(estimatedShare)}</p>
            </div>
          ) : null}
        </div>

        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Final cost adjusts when the room is ready. For now, we only save your pickup and detour.
        </p>
      </div>

      <div className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3.5">
        <div className="mb-1.5 flex items-center gap-2">
          <ShieldCheck className="size-4 shrink-0 text-primary" />
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Privacy Guard</span>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Do not place the pin directly on your home roof. Dropping your pin at a nearby main gate, Indomaret, or security post protects your privacy and makes pickups faster for the driver!
        </p>
      </div>
    </section>
  )
}
