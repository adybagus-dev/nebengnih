"use client"

import { MapPin, ShieldCheck } from "lucide-react"

interface PickupLocationPickerProps {
  landmark: string
  onLandmarkChange: (value: string) => void
}

export function PickupLocationPicker({
  landmark,
  onLandmarkChange,
}: PickupLocationPickerProps) {
  return (
    <section className="px-4 pt-5">
      <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-foreground">
        <MapPin className="size-4 text-primary" />
        Your Pickup Landmark
      </h2>

      {/* Landmark input */}
      <div className="rounded-xl border border-input bg-card px-4 py-3 mb-3 focus-within:ring-2 focus-within:ring-ring transition-shadow">
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

      {/* Trip Contribution Preview */}
      <div className="rounded-2xl border border-border bg-card px-4 py-4 mb-3">
        <h3 className="mb-3 text-sm font-semibold text-foreground flex items-center gap-1.5">
          <span aria-hidden="true">📊</span>
          Trip Contribution Preview
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-primary/5 border border-primary/20 px-3 py-3">
            <p className="text-xs text-muted-foreground mb-1">Est. Detour</p>
            <p className="text-2xl font-bold text-primary leading-none">+2.4 km</p>
          </div>
          <div className="rounded-xl bg-secondary border border-border px-3 py-3">
            <p className="text-xs text-muted-foreground mb-1">Your Share</p>
            <p className="text-2xl font-bold text-foreground leading-none">IDR 22,500</p>
          </div>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          <span aria-hidden="true">💡</span>{" "}
          Final cost adjusts dynamically based on the total number of active passengers joining the ride today.
        </p>
      </div>

      {/* Privacy guard callout */}
      <div className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3.5">
        <div className="mb-1.5 flex items-center gap-2">
          <ShieldCheck className="size-4 text-primary shrink-0" />
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            Privacy Guard
          </span>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Do not place the pin directly on your home roof. Dropping your pin at
          a nearby main gate, Indomaret, or security post protects your privacy
          and makes pickups faster for the driver!
        </p>
      </div>
    </section>
  )
}
