"use client"

import { useState } from "react"
import { CheckSquare } from "lucide-react"
import { useRouter } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { PickupLocationPicker } from "@/components/pickup-location-picker"
import { PickupMapPreview } from "@/components/pickup-map-preview"
import { estimatePickupDetourKm } from "@/lib/room/calculations"
import { RouteValidationSheet } from "@/components/route-validation-sheet"
import { validateRouteBeforeSave } from "@/lib/room/validation"
import { persistPassenger } from "@/lib/room/repository"
import { useRoom } from "@/components/providers/room-provider"

export function AddSpotSession() {
  const router = useRouter()
  const { room, summary, upsertPassenger } = useRoom()
  const [passengerName, setPassengerName] = useState("")
  const [landmark, setLandmark] = useState("Current location")
  const [saveError, setSaveError] = useState("")
  const [validationOpen, setValidationOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [pickupCoordinates, setPickupCoordinates] = useState({
    lat: -6.5987,
    lng: 106.799,
  })
  const estimatedDetourKm = estimatePickupDetourKm(
    room.settings,
    pickupCoordinates,
    landmark
  )

  async function handleConfirm() {
    if (saving) return

    const passenger = {
      id: `manual-${crypto.randomUUID()}`,
      name: passengerName.trim() || "Guest",
      pickupLandmark: landmark.trim() || "Nearby landmark",
      pickupLat: pickupCoordinates.lat,
      pickupLng: pickupCoordinates.lng,
      detourKm: estimatedDetourKm,
      joiningToday: true,
    }

    const validation = await validateRouteBeforeSave(
      room.settings,
      [...room.passengers, passenger],
      "passenger"
    )

      if (!validation.allowed) {
      setSaveError(validation.message ?? "This pickup cannot be saved.")
      setValidationOpen(true)
      return
    }

    setSaving(true)
    setSaveError("")

    try {
      await persistPassenger(summary.roomCode, passenger)
      upsertPassenger(passenger)
      router.push(`/driver/${summary.roomCode}`)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "This pickup cannot be saved.")
      setValidationOpen(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
      <AppHeader
        title="Add Manual Spot"
        backHref={`/driver/${summary.roomCode}`}
        backLabel="Dashboard"
      />

      <main className="flex-1 pb-28">
        <section className="px-4 pt-5">
          <label htmlFor="passenger-name" className="mb-2 block text-base font-semibold text-foreground">
            Passenger Name
          </label>
          <div className="rounded-xl border border-input bg-card px-4 py-3 transition-shadow focus-within:ring-2 focus-within:ring-ring">
            <input
              id="passenger-name"
              type="text"
              value={passengerName}
              onChange={(e) => setPassengerName(e.target.value)}
              placeholder="Enter your friend's name (e.g., Cici)"
              className="w-full bg-transparent text-base font-medium text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
        </section>

        <PickupMapPreview
          landmark={landmark}
          initialCoordinates={pickupCoordinates}
          onCoordinatesChange={setPickupCoordinates}
          onLandmarkChange={setLandmark}
        />
        <PickupLocationPicker
          landmark={landmark}
          estimatedDetourKm={estimatedDetourKm}
          estimatedShare={summary.baseShare + estimatedDetourKm * summary.fuelCostPerKm}
        />

        <div className="h-4" />
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md border-t border-border bg-background/80 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-lg">
        <button
          type="button"
          disabled={saving}
          onClick={() => void handleConfirm()}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
        >
          <CheckSquare className="size-5" />
          {saving ? "Saving..." : "Confirm & Add to Lineup"}
        </button>
      </footer>

      <RouteValidationSheet
        open={validationOpen}
        onOpenChange={setValidationOpen}
        title="Pickup crosses water"
        message={saveError}
        actionLabel="Choose another pickup"
      />
    </div>
  )
}
