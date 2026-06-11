"use client"

import { useState } from "react"
import { MapPin, User } from "lucide-react"
import { PassengerHeader } from "@/components/passenger-header"
import { AttendanceToggle } from "@/components/attendance-toggle"
import { PickupLocationPicker } from "@/components/pickup-location-picker"
import { PickupMapPreview } from "@/components/pickup-map-preview"

export default function PassengerPage() {
  const [name, setName] = useState("")
  const [landmark, setLandmark] = useState("Front of Indomaret Gang 4")

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
      <PassengerHeader />

      <main className="flex-1 pb-28">
        {/* Passenger name */}
        <section className="px-4 pt-4">
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-foreground">
            <User className="size-4 text-primary" />
            Your Name
          </h2>
          <div className="rounded-xl border border-input bg-card px-4 py-3 focus-within:ring-2 focus-within:ring-ring transition-shadow">
            <label htmlFor="passenger-name" className="sr-only">
              Your name
            </label>
            <input
              id="passenger-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent text-base font-medium text-foreground placeholder:text-muted-foreground outline-none"
              placeholder="e.g. Andi"
              autoComplete="given-name"
            />
          </div>
        </section>

        <AttendanceToggle />
        <PickupLocationPicker landmark={landmark} onLandmarkChange={setLandmark} />
        <PickupMapPreview />
        <div className="h-4" />
      </main>

      {/* Sticky Save CTA */}
      <footer className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md border-t border-border bg-background/80 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-lg">
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-transform active:scale-[0.98]"
        >
          <MapPin className="size-5" />
          Save My Location Status
        </button>
      </footer>
    </div>
  )
}
