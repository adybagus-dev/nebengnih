"use client"

import { useState } from "react"
import { Settings, X } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet"

interface SettingsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsSheet({ open, onOpenChange }: SettingsSheetProps) {
  const [startLocation, setStartLocation] = useState("Jl. Raya Pajajaran No. 12, Bogor")
  const [destination, setDestination] = useState("Sudirman Central Business District, Jakarta")
  const [fuelEfficiency, setFuelEfficiency] = useState("10")
  const [fuelPrice, setFuelPrice] = useState("12500")
  const [tollCosts, setTollCosts] = useState("20000")

  function handleSave() {
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto max-w-md rounded-t-3xl border-t border-border bg-background px-0 pb-0 pt-0"
      >
        {/* Header */}
        <SheetHeader className="flex flex-row items-center justify-between border-b border-border px-5 py-4">
          <SheetTitle className="flex items-center gap-2 text-base font-bold text-foreground">
            <Settings className="size-4 text-primary" />
            Route Settings
          </SheetTitle>
          <SheetClose asChild>
            <button
              type="button"
              aria-label="Close settings"
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground active:scale-95"
            >
              <X className="size-4" />
            </button>
          </SheetClose>
        </SheetHeader>

        <div className="overflow-y-auto px-5 py-5">
          {/* Route locations */}
          <fieldset className="mb-5">
            <legend className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Route Locations
            </legend>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="start-location" className="text-sm font-medium text-foreground">
                  Your Start Location
                </label>
                <input
                  id="start-location"
                  type="text"
                  value={startLocation}
                  onChange={(e) => setStartLocation(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="destination" className="text-sm font-medium text-foreground">
                  Office Destination
                </label>
                <input
                  id="destination"
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </fieldset>

          {/* Cost calculator */}
          <fieldset className="mb-5">
            <legend className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Cost Calculator Parameters
            </legend>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="fuel-efficiency" className="text-sm font-medium text-foreground">
                  Fuel Efficiency
                </label>
                <div className="flex overflow-hidden rounded-xl border border-border bg-background focus-within:ring-2 focus-within:ring-ring">
                  <input
                    id="fuel-efficiency"
                    type="number"
                    min="1"
                    value={fuelEfficiency}
                    onChange={(e) => setFuelEfficiency(e.target.value)}
                    className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm font-mono text-foreground focus:outline-none"
                  />
                  <span className="flex items-center bg-secondary px-3 text-xs font-semibold text-muted-foreground">
                    km/L
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="fuel-price" className="text-sm font-medium text-foreground">
                  Fuel Price / Liter
                </label>
                <div className="flex overflow-hidden rounded-xl border border-border bg-background focus-within:ring-2 focus-within:ring-ring">
                  <span className="flex items-center bg-secondary px-3 text-xs font-semibold text-muted-foreground">
                    IDR
                  </span>
                  <input
                    id="fuel-price"
                    type="number"
                    min="0"
                    value={fuelPrice}
                    onChange={(e) => setFuelPrice(e.target.value)}
                    className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm font-mono text-foreground focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </fieldset>

          {/* Tolls */}
          <fieldset className="mb-6">
            <legend className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Daily Tolls
            </legend>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="toll-costs" className="text-sm font-medium text-foreground">
                Daily Toll Costs Total
              </label>
              <div className="flex overflow-hidden rounded-xl border border-border bg-background focus-within:ring-2 focus-within:ring-ring">
                <span className="flex items-center bg-secondary px-3 text-xs font-semibold text-muted-foreground">
                  IDR
                </span>
                <input
                  id="toll-costs"
                  type="number"
                  min="0"
                  value={tollCosts}
                  onChange={(e) => setTollCosts(e.target.value)}
                  className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm font-mono text-foreground focus:outline-none"
                />
              </div>
            </div>
          </fieldset>

          {/* CTA */}
          <button
            type="button"
            onClick={handleSave}
            className="mb-[max(1.25rem,env(safe-area-inset-bottom))] flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-transform active:scale-[0.98]"
          >
            <Settings className="size-4" />
            Update Settings &amp; Recalculate
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
