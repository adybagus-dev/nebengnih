"use client"

import { useState } from "react"
import { ArrowLeft, CheckSquare } from "lucide-react"
import Link from "next/link"
import { PickupLocationPicker } from "@/components/pickup-location-picker"
import { PickupMapPreview } from "@/components/pickup-map-preview"

export default function AddSpotPage() {
  const [passengerName, setPassengerName] = useState("")
  const [landmark, setLandmark] = useState("Front of Indomaret Gang 4")

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
      {/* Navbar */}
      <header className="flex items-center gap-3 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3 border-b border-border">
        <Link
          href="/driver"
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4 shrink-0" />
          Back to Dashboard
        </Link>
        <h1 className="flex-1 text-center text-base font-bold text-foreground pr-[88px]">
          Add Manual Spot
        </h1>
      </header>

      <main className="flex-1 pb-28">
        {/* Passenger name input */}
        <section className="px-4 pt-5">
          <label
            htmlFor="passenger-name"
            className="mb-2 block text-base font-semibold text-foreground"
          >
            Passenger Name
          </label>
          <div className="rounded-xl border border-input bg-card px-4 py-3 focus-within:ring-2 focus-within:ring-ring transition-shadow">
            <input
              id="passenger-name"
              type="text"
              value={passengerName}
              onChange={(e) => setPassengerName(e.target.value)}
              placeholder="Enter your friend's name (e.g., Cici)"
              className="w-full bg-transparent text-base font-medium text-foreground placeholder:text-muted-foreground outline-none"
            />
          </div>
        </section>

        {/* Reused pickup components */}
        <PickupLocationPicker
          landmark={landmark}
          onLandmarkChange={setLandmark}
        />
        <PickupMapPreview />

        <div className="h-4" />
      </main>

      {/* Sticky footer CTA */}
      <footer className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md border-t border-border bg-background/80 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-lg">
        <Link
          href="/driver"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-transform active:scale-[0.98]"
        >
          <CheckSquare className="size-5" />
          Confirm &amp; Add to Lineup
        </Link>
      </footer>
    </div>
  )
}
