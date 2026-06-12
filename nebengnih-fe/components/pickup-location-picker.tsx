"use client"

import { MapPin, ShieldCheck } from "lucide-react"
import { formatMoney } from "@/lib/room/calculations"

interface PickupLocationPickerProps {
  landmark: string
  onLandmarkChange: (value: string) => void
  estimatedDetourKm: number
  estimatedShare: number
}

export function PickupLocationPicker({
  landmark,
  onLandmarkChange,
  estimatedDetourKm,
  estimatedShare,
}: PickupLocationPickerProps) {
  return (
    <section className="px-4 pt-5">
      <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-foreground">
        <MapPin className="size-4 text-primary" />
        Your Pickup Landmark
      </h2>

      <div className="mb-3 rounded-xl border border-input bg-card px-4 py-3 focus-within:ring-2 focus-within:ring-ring transition-shadow">
        <label htmlFor="landmark" className="sr-only">
          Pickup landmark
        </label>
        <input
          id="landmark"
          type="text"
          value={landmark}
          onChange={(e) => onLandmarkChange(e.target.value)}
          className="w-full bg-transparent text-base font-medium text-foreground placeholder:text-muted-foreground outline-none"
          placeholder="Describe your pickup point…"
        />
      </div>

      <div className="mb-3 rounded-2xl border border-border bg-card px-4 py-4">
        <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <span aria-hidden="true">📊</span>
          Trip Contribution Preview
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-3">
            <p className="mb-1 text-xs text-muted-foreground">Est. Detour</p>
            <p className="text-2xl font-bold leading-none text-primary">+{estimatedDetourKm.toFixed(1)} km</p>
          </div>
          <div className="rounded-xl border border-border bg-secondary px-3 py-3">
            <p className="mb-1 text-xs text-muted-foreground">Your Share</p>
            <p className="text-2xl font-bold leading-none text-foreground">{formatMoney(estimatedShare)}</p>
          </div>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          <span aria-hidden="true">💡</span>{" "}
          Final cost adjusts dynamically based on the total number of active passengers joining the ride today.
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
