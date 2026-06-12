"use client"

import { useEffect, useState } from "react"
import { Settings, X } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useRoom } from "@/components/providers/room-provider"
import { formatMoney } from "@/lib/room/calculations"

interface SettingsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsSheet({ open, onOpenChange }: SettingsSheetProps) {
  const { room, summary, setDriverNickname, updateSettings } = useRoom()
  const [driverNickname, setDriverNicknameInput] = useState(room.driverNickname)
  const [startLocation, setStartLocation] = useState(room.settings.origin)
  const [destination, setDestination] = useState(room.settings.destination)
  const [fuelEfficiency, setFuelEfficiency] = useState(String(room.settings.fuelEfficiencyKmPerLiter))
  const [fuelPrice, setFuelPrice] = useState(String(room.settings.fuelPricePerLiter))
  const [tollCosts, setTollCosts] = useState(String(room.settings.tollCost))
  const [baseDistance, setBaseDistance] = useState(String(room.settings.baseDistanceKm))

  useEffect(() => {
    if (!open) return
    setDriverNicknameInput(room.driverNickname)
    setStartLocation(room.settings.origin)
    setDestination(room.settings.destination)
    setFuelEfficiency(String(room.settings.fuelEfficiencyKmPerLiter))
    setFuelPrice(String(room.settings.fuelPricePerLiter))
    setTollCosts(String(room.settings.tollCost))
    setBaseDistance(String(room.settings.baseDistanceKm))
  }, [open, room])

  function handleSave() {
    setDriverNickname(driverNickname.trim() || "Driver")
    updateSettings({
      origin: startLocation.trim(),
      destination: destination.trim(),
      fuelEfficiencyKmPerLiter: Number(fuelEfficiency) || 1,
      fuelPricePerLiter: Number(fuelPrice) || 0,
      tollCost: Number(tollCosts) || 0,
      baseDistanceKm: Number(baseDistance) || 0,
    })
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
          <button
            type="button"
            aria-label="Close settings"
            onClick={() => onOpenChange(false)}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground active:scale-95"
          >
            <X className="size-4" />
          </button>
        </SheetHeader>

        <div className="overflow-y-auto px-5 py-5">
          {/* Route locations */}
          <fieldset className="mb-5">
            <legend className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Driver Identity
            </legend>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="driver-nickname" className="text-sm font-medium text-foreground">
                Driver Nickname
              </label>
              <input
                id="driver-nickname"
                type="text"
                value={driverNickname}
                onChange={(e) => setDriverNicknameInput(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </fieldset>

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
              <div className="flex flex-col gap-1.5">
                <label htmlFor="base-distance" className="text-sm font-medium text-foreground">
                  Base Route Distance
                </label>
                <div className="flex overflow-hidden rounded-xl border border-border bg-background focus-within:ring-2 focus-within:ring-ring">
                  <input
                    id="base-distance"
                    type="number"
                    min="0"
                    value={baseDistance}
                    onChange={(e) => setBaseDistance(e.target.value)}
                    className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm font-mono text-foreground focus:outline-none"
                  />
                  <span className="flex items-center bg-secondary px-3 text-xs font-semibold text-muted-foreground">
                    km
                  </span>
                </div>
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

          <div className="mb-[max(1rem,env(safe-area-inset-bottom))] rounded-2xl border border-border bg-secondary/40 p-3.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Current base share</span>
              <span className="font-mono text-xs font-semibold text-foreground">{formatMoney(summary.baseShare)}</span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
