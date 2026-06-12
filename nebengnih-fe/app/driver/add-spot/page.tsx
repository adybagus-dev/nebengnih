"use client"

import { useState } from "react"
import { ArrowLeft, CheckSquare } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PickupLocationPicker } from "@/components/pickup-location-picker"
import { PickupMapPreview } from "@/components/pickup-map-preview"
import { estimateDetourKm } from "@/lib/room/calculations"
import { useRoom } from "@/components/providers/room-provider"

function createPassengerId() {
  if (typeof window === "undefined") return "manual-passenger"
  return `manual-${crypto.randomUUID()}`
}

export default function AddSpotPage() {
  const router = useRouter()
  const { summary, upsertPassenger } = useRoom()
  const [passengerName, setPassengerName] = useState("")
  const [landmark, setLandmark] = useState("Front of Indomaret Gang 4")

  function handleConfirm() {
    const id = createPassengerId()
    upsertPassenger({
      id,
      name: passengerName.trim() || "Guest",
      pickupLandmark: landmark.trim() || "Nearby landmark",
      detourKm: estimateDetourKm(landmark),
      joiningToday: true,
    })
    router.push("/driver")
  }

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))]">
        <Link
          href="/driver"
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4 shrink-0" />
          Back to Dashboard
        </Link>
        <h1 className="flex-1 pr-[88px] text-center text-base font-bold text-foreground">
          Add Manual Spot
        </h1>
      </header>

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

        <PickupLocationPicker
          landmark={landmark}
          onLandmarkChange={setLandmark}
          estimatedDetourKm={estimateDetourKm(landmark)}
          estimatedShare={summary.baseShare + estimateDetourKm(landmark) * summary.fuelCostPerKm}
        />
        <PickupMapPreview landmark={landmark} />

        <div className="h-4" />
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md border-t border-border bg-background/80 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-lg">
        <button
          type="button"
          onClick={handleConfirm}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-transform active:scale-[0.98]"
        >
          <CheckSquare className="size-5" />
          Confirm &amp; Add to Lineup
        </button>
      </footer>
    </div>
  )
}
