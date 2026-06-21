"use client"

import { useEffect, useMemo, useState } from "react"
import { Copy, MapPin, User } from "lucide-react"
import { AttendanceToggle } from "@/components/attendance-toggle"
import { PickupLocationPicker } from "@/components/pickup-location-picker"
import { PickupMapPreview } from "@/components/pickup-map-preview"
import { RoomHeader } from "@/components/room-header"
import { RouteValidationSheet } from "@/components/route-validation-sheet"
import {
  calculateRoomSummary,
  estimatePickupDetourKm,
} from "@/lib/room/calculations"
import { createDefaultRoomState } from "@/lib/room/defaults"
import { fetchRoom, persistPassenger, roomExists } from "@/lib/room/repository"
import type { RoomState } from "@/lib/room/types"

interface RoomPassengerSessionProps {
  roomCode: string
}

const DEFAULT_PICKUP_COORDINATES = {
  lat: -6.5987,
  lng: 106.799,
}

function getPassengerId(roomCode: string) {
  if (typeof window === "undefined") return "passenger-local"

  const storageKey = `nebengnih.passenger.id.${roomCode}`
  const existing = window.localStorage.getItem(storageKey)
  if (existing) return existing

  const passengerId = crypto.randomUUID()
  window.localStorage.setItem(storageKey, passengerId)
  return passengerId
}

export function RoomPassengerSession({ roomCode }: RoomPassengerSessionProps) {
  const normalizedCode = roomCode.toUpperCase()
  const [room, setRoom] = useState<RoomState>(() => createDefaultRoomState(normalizedCode))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle")
  const [saveError, setSaveError] = useState("")
  const [validationOpen, setValidationOpen] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [roomMissing, setRoomMissing] = useState(false)
  const [loadError, setLoadError] = useState("")
  const [passengerId] = useState(() => getPassengerId(normalizedCode))
  const [name, setName] = useState("")
  const [landmark, setLandmark] = useState("")
  const [joining, setJoining] = useState(true)
  const [pickupCoordinates, setPickupCoordinates] = useState<
    { lat: number; lng: number } | undefined
  >(undefined)
  const [pickupLocating, setPickupLocating] = useState(true)

  useEffect(() => {
    let mounted = true

    async function loadRoom() {
      setLoading(true)
      setLoadError("")

      try {
        const exists = await roomExists(normalizedCode)
        if (!mounted) return

        if (!exists) {
          setRoomMissing(true)
          return
        }

        const loaded = await fetchRoom(normalizedCode)
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
      } catch (error) {
        if (!mounted) return
        setLoadError(error instanceof Error ? error.message : "Unable to load this room.")
      } finally {
        if (mounted) setLoading(false)
      }
    }

    void loadRoom()

    return () => {
      mounted = false
    }
  }, [normalizedCode, passengerId])

  useEffect(() => {
    let mounted = true

    if (!("geolocation" in navigator)) {
      setPickupLocating(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!mounted) return

        const nextCoordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }

        setPickupCoordinates(nextCoordinates)
        setLandmark("Current location")
        setPickupLocating(false)
      },
      () => {
        if (!mounted) return
        setPickupLocating(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    )

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (saveStatus !== "saved") return

    const timeout = window.setTimeout(() => {
      setSaveStatus("idle")
    }, 2200)

    return () => window.clearTimeout(timeout)
  }, [saveStatus])

  useEffect(() => {
    if (!linkCopied) return

    const timeout = window.setTimeout(() => {
      setLinkCopied(false)
    }, 1800)

    return () => window.clearTimeout(timeout)
  }, [linkCopied])

  const summary = useMemo(() => calculateRoomSummary(room), [room])
  const resolvedPickupCoordinates = pickupCoordinates ?? DEFAULT_PICKUP_COORDINATES
  const estimatedDetourKm = estimatePickupDetourKm(room.settings, resolvedPickupCoordinates, landmark)
  const estimatedShare = summary.baseShare + estimatedDetourKm * summary.fuelCostPerKm
  const passengerName = name.trim()
  const canSave = passengerName.length > 0 && Boolean(pickupCoordinates) && !saving

  async function handleCopyRoomLink() {
    const roomLink = `${window.location.origin}/room/${normalizedCode}`

    try {
      await navigator.clipboard.writeText(roomLink)
      setLinkCopied(true)
    } catch {
      window.prompt("Copy this room link", roomLink)
    }
  }

  async function handleSave() {
    setSaving(true)
    setSaveStatus("idle")
    setSaveError("")

    const nextPassenger = {
      id: passengerId,
      name: passengerName,
      pickupLandmark: landmark.trim() || "Nearby landmark",
      pickupLat: resolvedPickupCoordinates.lat,
      pickupLng: resolvedPickupCoordinates.lng,
      detourKm: estimatedDetourKm,
      joiningToday: joining,
    }

    try {
      const persisted = await persistPassenger(normalizedCode, nextPassenger)
      setRoom(persisted)
      setSaveStatus("saved")
      setSuccessOpen(true)
    } catch (error) {
      setSaveStatus("error")
      setSaveError(error instanceof Error ? error.message : "Failed to save your location status.")
      setValidationOpen(true)
    } finally {
      setSaving(false)
    }
  }

  if (loading || pickupLocating) {
    return (
      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
        <RoomHeader roomCode={normalizedCode} />
        <main className="flex flex-1 items-center justify-center px-4">
          <div className="rounded-3xl border border-border bg-card px-5 py-6 text-center shadow-sm">
            <p className="text-base font-semibold text-foreground">Finding your location...</p>
            <p className="mt-1 text-sm text-muted-foreground">We’ll open the pickup map on your current spot first.</p>
          </div>
        </main>
      </div>
    )
  }

  if (roomMissing) {
    return (
      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
        <RoomHeader roomCode={normalizedCode} />
        <main className="flex flex-1 items-center justify-center px-4">
          <div className="rounded-3xl border border-border bg-card px-5 py-6 text-center shadow-sm">
            <p className="text-base font-semibold text-foreground">Room not found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Double-check the room code with the driver. This room has not been created yet.
            </p>
          </div>
        </main>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
        <RoomHeader roomCode={normalizedCode} />
        <main className="flex flex-1 items-center justify-center px-4">
          <div className="rounded-3xl border border-destructive/30 bg-card px-5 py-6 text-center shadow-sm">
            <p className="text-base font-semibold text-foreground">Could not open room</p>
            <p className="mt-1 text-sm text-muted-foreground">{loadError}</p>
          </div>
        </main>
      </div>
    )
  }

  if (successOpen) {
    return (
      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
        <RoomHeader roomCode={summary.roomCode} />

        <main className="flex flex-1 flex-col px-4 pb-6 pt-4">
          <section className="rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <MapPin className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  Location sent
                </p>
                <h2 className="mt-1 text-2xl font-bold text-foreground">
                  Your pickup is now shared with the driver.
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  The driver has your latest pickup point. Please wait for the fare details in your WhatsApp or chat app once the route is confirmed.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-4 rounded-3xl border border-border bg-card px-5 py-5 shadow-sm">
            <p className="text-sm font-semibold text-foreground">What&apos;s next</p>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                Your location is already sent to the driver, so you can put your phone away for now.
              </p>
              <p>
                When the driver sends the final price, check your WhatsApp message or the chat app you use with them.
              </p>
              <p>
                If you want to edit your location or your name, open the same room link again from the link your driver shared.
              </p>
            </div>
          </section>

          <section className="mt-4 rounded-3xl border border-border bg-card px-5 py-5 shadow-sm">
            <div className="grid gap-3 text-sm text-muted-foreground">
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium text-foreground">Room</span>
                <span className="font-mono font-semibold text-primary">{summary.roomCode}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium text-foreground">Passenger</span>
                <span className="truncate font-semibold text-foreground">{passengerName}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium text-foreground">Pickup</span>
                <span className="max-w-[12rem] truncate text-right font-medium text-foreground">
                  {landmark || "Current location"}
                </span>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-border bg-background/90 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-lg">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleCopyRoomLink}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background px-3 py-4 text-sm font-semibold text-foreground shadow-sm transition-transform active:scale-[0.98]"
            >
              <Copy className="size-4" />
              {linkCopied ? "Copied" : "Copy room link"}
            </button>
            <button
              type="button"
              onClick={() => setSuccessOpen(false)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-3 py-4 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-transform active:scale-[0.98]"
            >
              Keep editing this room
            </button>
          </div>
        </footer>
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
          showEstimatedShare={false}
        />
        <AttendanceToggle joining={joining} onChange={setJoining} />
        <div className="h-4" />
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md border-t border-border bg-background/80 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-lg">
        <button
          type="button"
          disabled={!canSave}
          onClick={handleSave}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
        >
          <MapPin className="size-5" />
          {saving ? "Saving..." : saveStatus === "saved" ? "Saved" : "Save My Location Status"}
        </button>
      </footer>

      <RouteValidationSheet
        open={validationOpen}
        onOpenChange={setValidationOpen}
        title="Pickup route not allowed"
        message={saveError || "This pickup cannot be saved."}
        actionLabel="Choose another pickup"
      />

    </div>
  )
}
