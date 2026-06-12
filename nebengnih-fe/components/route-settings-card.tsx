"use client"

import { useEffect, useState } from "react"
import { PickupMapPreview } from "@/components/pickup-map-preview"
import { useRoom } from "@/components/providers/room-provider"

function toCoordinates(lat?: number, lng?: number) {
  if (typeof lat !== "number" || typeof lng !== "number") return undefined
  return { lat, lng }
}

export function RouteSettingsCard() {
  const { room, setDriverNickname, updateSettings } = useRoom()
  const [driverNickname, setDriverNicknameInput] = useState(room.driverNickname)

  useEffect(() => {
    setDriverNicknameInput(room.driverNickname)
  }, [room.driverNickname])

  return (
    <>
      <section className="px-4 pt-5">
        <label htmlFor="driver-nickname" className="mb-2 block text-base font-semibold text-foreground">
          Driver Name
        </label>
        <div className="rounded-xl border border-input bg-card px-4 py-3 transition-shadow focus-within:ring-2 focus-within:ring-ring">
          <input
            id="driver-nickname"
            type="text"
            value={driverNickname}
            onChange={(event) => setDriverNicknameInput(event.target.value)}
            onBlur={() => setDriverNickname(driverNickname.trim() || "Driver")}
            placeholder="Enter your name (e.g., Bang Andi)"
            className="w-full bg-transparent text-base font-medium text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
      </section>

      <PickupMapPreview
        landmark={room.settings.origin}
        initialCoordinates={toCoordinates(room.settings.originLat, room.settings.originLng)}
        onCoordinatesChange={(coordinates) =>
          updateSettings({
            originLat: coordinates.lat,
            originLng: coordinates.lng,
          })
        }
        onLandmarkChange={(origin) => updateSettings({ origin })}
        title="Search or drop your start location"
        description="Search for your starting point, tap the map, or drag the pin to place it precisely."
        searchPlaceholder="Search your start location"
        statusLabel="Start from your current location"
        manualHint="Turn on location or place the pin manually."
      />

      <PickupMapPreview
        landmark={room.settings.destination}
        initialCoordinates={toCoordinates(room.settings.destinationLat, room.settings.destinationLng)}
        onCoordinatesChange={(coordinates) =>
          updateSettings({
            destinationLat: coordinates.lat,
            destinationLng: coordinates.lng,
          })
        }
        onLandmarkChange={(destination) => updateSettings({ destination })}
        title="Search or drop your destination"
        description="Search for the destination, tap the map, or drag the pin to place it precisely."
        searchPlaceholder="Search your destination"
        statusLabel="Choose where the route ends"
        manualHint="Search for a place or place the pin manually."
        enableCurrentLocation={false}
      />

      <section className="px-4 pt-5" aria-labelledby="cost-parameters-title">
        <h2 id="cost-parameters-title" className="mb-1 text-base font-semibold text-foreground">
          Cost Calculator Parameters
        </h2>
        <p className="mb-3 text-sm text-muted-foreground">
          Used to calculate the driver and passenger shares.
        </p>

        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="route-fuel-efficiency" className="text-sm font-medium text-foreground">
                Fuel Efficiency
              </label>
              <div className="flex overflow-hidden rounded-xl border border-input bg-background focus-within:ring-2 focus-within:ring-ring">
                <input
                  id="route-fuel-efficiency"
                  type="number"
                  inputMode="decimal"
                  min="1"
                  step="0.1"
                  value={room.settings.fuelEfficiencyKmPerLiter}
                  onChange={(event) =>
                    updateSettings({
                      fuelEfficiencyKmPerLiter: Math.max(1, Number(event.target.value) || 1),
                    })
                  }
                  className="min-w-0 flex-1 bg-transparent px-3 py-3 font-mono text-sm text-foreground outline-none"
                />
                <span className="flex items-center bg-secondary px-2.5 text-xs font-semibold text-muted-foreground">
                  km/L
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="route-fuel-price" className="text-sm font-medium text-foreground">
                Fuel Price
              </label>
              <div className="flex overflow-hidden rounded-xl border border-input bg-background focus-within:ring-2 focus-within:ring-ring">
                <span className="flex items-center bg-secondary px-2.5 text-xs font-semibold text-muted-foreground">
                  IDR
                </span>
                <input
                  id="route-fuel-price"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="500"
                  value={room.settings.fuelPricePerLiter}
                  onChange={(event) =>
                    updateSettings({
                      fuelPricePerLiter: Math.max(0, Number(event.target.value) || 0),
                    })
                  }
                  className="min-w-0 flex-1 bg-transparent px-3 py-3 font-mono text-sm text-foreground outline-none"
                />
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-1.5">
            <label htmlFor="route-toll-cost" className="text-sm font-medium text-foreground">
              Daily Toll Cost
            </label>
            <div className="flex overflow-hidden rounded-xl border border-input bg-background focus-within:ring-2 focus-within:ring-ring">
              <span className="flex items-center bg-secondary px-3 text-xs font-semibold text-muted-foreground">
                IDR
              </span>
              <input
                id="route-toll-cost"
                type="number"
                inputMode="numeric"
                min="0"
                step="1000"
                value={room.settings.tollCost}
                onChange={(event) =>
                  updateSettings({
                    tollCost: Math.max(0, Number(event.target.value) || 0),
                  })
                }
                className="min-w-0 flex-1 bg-transparent px-3 py-3 font-mono text-sm text-foreground outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="h-4" />
    </>
  )
}
