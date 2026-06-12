"use client"

import { useEffect, useState } from "react"
import { MapPin, User } from "lucide-react"
import { PassengerHeader } from "@/components/passenger-header"
import { AttendanceToggle } from "@/components/attendance-toggle"
import { PickupLocationPicker } from "@/components/pickup-location-picker"
import { PickupMapPreview } from "@/components/pickup-map-preview"
import { estimateDetourKm } from "@/lib/room/calculations"
import { useRoom } from "@/components/providers/room-provider"

export default function PassengerPage() {
  const { room, summary, upsertPassenger } = useRoom()
  const [passengerId, setPassengerId] = useState("passenger-local")
  const [name, setName] = useState("")
  const [landmark, setLandmark] = useState("Front of Indomaret Gang 4")
  const [joining, setJoining] = useState(true)

  useEffect(() => {
    const storageKey = "nebengnih.passenger.id"
    const existing = window.localStorage.getItem(storageKey)
    if (existing) {
      setPassengerId(existing)
      return
    }

    const next = crypto.randomUUID()
    window.localStorage.setItem(storageKey, next)
    setPassengerId(next)
  }, [])

  useEffect(() => {
    const existing = room.passengers.find((passenger) => passenger.id === passengerId)
    if (!existing) return

    setName(existing.name)
    setLandmark(existing.pickupLandmark)
    setJoining(existing.joiningToday)
  }, [passengerId, room.passengers])

  const estimatedDetourKm = estimateDetourKm(landmark)
  const estimatedShare =
    summary.baseShare + estimatedDetourKm * summary.fuelCostPerKm

  function handleSave() {
    upsertPassenger({
      id: passengerId,
      name: name.trim() || "Guest",
      pickupLandmark: landmark.trim() || "Nearby landmark",
      detourKm: estimatedDetourKm,
      joiningToday: joining,
    })
  }

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
      <PassengerHeader />

      <main className="flex-1 pb-28">
        <section className="px-4 pt-4">
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-foreground">
            <User className="size-4 text-primary" />
            Your Name
          </h2>
          <div className="rounded-xl border border-input bg-card px-4 py-3 transition-shadow focus-within:ring-2 focus-within:ring-ring">
            <label htmlFor="passenger-name" className="sr-only">
              Your name
            </label>
            <input
              id="passenger-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent text-base font-medium text-foreground outline-none placeholder:text-muted-foreground"
              placeholder="e.g. Andi"
              autoComplete="given-name"
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Room code: <span className="font-mono font-semibold text-primary">{summary.roomCode}</span>
          </p>
        </section>

        <AttendanceToggle joining={joining} onChange={setJoining} />
        <PickupLocationPicker
          landmark={landmark}
          onLandmarkChange={setLandmark}
          estimatedDetourKm={estimatedDetourKm}
          estimatedShare={estimatedShare}
        />
        <PickupMapPreview landmark={landmark} />
        <div className="h-4" />
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md border-t border-border bg-background/80 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-lg">
        <button
          type="button"
          onClick={handleSave}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-transform active:scale-[0.98]"
        >
          <MapPin className="size-5" />
          Save My Location Status
        </button>
      </footer>
    </div>
  )
}
