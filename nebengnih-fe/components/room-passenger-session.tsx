"use client"

import { useEffect, useMemo, useState } from "react"
import { MapPin, User } from "lucide-react"
import { AttendanceToggle } from "@/components/attendance-toggle"
import { PickupLocationPicker } from "@/components/pickup-location-picker"
import { PickupMapPreview } from "@/components/pickup-map-preview"
import { RoomHeader } from "@/components/room-header"
import { calculateRoomSummary, estimateDetourKm } from "@/lib/room/calculations"
import { createDefaultRoomState } from "@/lib/room/defaults"
import { ensureRoom, persistRoom } from "@/lib/room/repository"
import type { RoomState } from "@/lib/room/types"

interface RoomPassengerSessionProps {
  roomCode: string
}

const DEFAULT_PICKUP_COORDINATES = {
  lat: -6.5987,
  lng: 106.799,
}

export function RoomPassengerSession({ roomCode }: RoomPassengerSessionProps) {
  const normalizedCode = roomCode.toUpperCase()
  const [room, setRoom] = useState<RoomState>(() => createDefaultRoomState(normalizedCode))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [passengerId, setPassengerId] = useState("passenger-local")
  const [name, setName] = useState("")
  const [landmark, setLandmark] = useState("Current location")
  const [joining, setJoining] = useState(true)
  const [pickupCoordinates, setPickupCoordinates] = useState(DEFAULT_PICKUP_COORDINATES)

  useEffect(() => {
    const storageKey = `nebengnih.passenger.id.${normalizedCode}`
    const existing = window.localStorage.getItem(storageKey)
    if (existing) {
      setPassengerId(existing)
    } else {
      const next = crypto.randomUUID()
      window.localStorage.setItem(storageKey, next)
      setPassengerId(next)
    }
  }, [normalizedCode])

  useEffect(() => {
    let mounted = true

    async function loadRoom() {
      setLoading(true)
      const loaded = await ensureRoom(normalizedCode)
      if (!mounted) return
      setRoom(loaded)

      const existing = loaded.passengers.find((passenger) => passenger.id === passengerId)
      if (existing) {
        setName(existing.name)
        setLandmark(existing.pickupLandmark)
        setJoining(existing.joiningToday)
        setPickupCoordinates(
          existing.pickupLat !== undefined && existing.pickupLng !== undefined
            ? { lat: existing.pickupLat, lng: existing.pickupLng }
            : DEFAULT_PICKUP_COORDINATES
        )
      }
      setLoading(false)
    }

    void loadRoom()

    return () => {
      mounted = false
    }
  }, [normalizedCode, passengerId])

  const summary = useMemo(() => calculateRoomSummary(room), [room])
  const estimatedDetourKm = estimateDetourKm(landmark)
  const estimatedShare = summary.baseShare + estimatedDetourKm * summary.fuelCostPerKm

  async function handleSave() {
    const nextRoom: RoomState = {
      ...room,
      roomCode: normalizedCode,
      passengers: (() => {
        const nextPassenger = {
          id: passengerId,
          name: name.trim() || "Guest",
          pickupLandmark: landmark.trim() || "Nearby landmark",
          pickupLat: pickupCoordinates.lat,
          pickupLng: pickupCoordinates.lng,
          detourKm: estimatedDetourKm,
          joiningToday: joining,
        }

        const index = room.passengers.findIndex((passenger) => passenger.id === passengerId)
        if (index === -1) return [...room.passengers, nextPassenger]

        const passengers = [...room.passengers]
        passengers[index] = nextPassenger
        return passengers
      })(),
    }

    setSaving(true)
    const persisted = await persistRoom(nextRoom)
    setRoom(persisted)
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
        <RoomHeader roomCode={normalizedCode} />
        <main className="flex flex-1 items-center justify-center px-4">
          <div className="rounded-3xl border border-border bg-card px-5 py-6 text-center shadow-sm">
            <p className="text-base font-semibold text-foreground">Loading room...</p>
            <p className="mt-1 text-sm text-muted-foreground">Please wait while we open the shared room.</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
      <RoomHeader roomCode={summary.roomCode} />

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

        <PickupMapPreview
          landmark={landmark}
          initialCoordinates={pickupCoordinates}
          onCoordinatesChange={setPickupCoordinates}
          onLandmarkChange={setLandmark}
        />
        <PickupLocationPicker
          landmark={landmark}
          estimatedDetourKm={estimatedDetourKm}
          estimatedShare={estimatedShare}
        />
        <AttendanceToggle joining={joining} onChange={setJoining} />
        <div className="h-4" />
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md border-t border-border bg-background/80 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-lg">
        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
        >
          <MapPin className="size-5" />
          {saving ? "Saving..." : "Save My Location Status"}
        </button>
      </footer>
    </div>
  )
}
