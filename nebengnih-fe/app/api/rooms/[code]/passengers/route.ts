import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { normalizeRoomState } from "@/lib/room/state"
import { validateRouteBeforeSave } from "@/lib/room/validation"
import type { Passenger, RoomState } from "@/lib/room/types"

type RoomRecord = {
  code: string
  payload: RoomState
}

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) return null
  return createClient(url, key)
}

function isFiniteCoordinate(value: unknown, minimum: number, maximum: number) {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= minimum &&
    value <= maximum
  )
}

function parsePassenger(value: unknown): Passenger | null {
  if (!value || typeof value !== "object") return null

  const passenger = value as Partial<Passenger>
  if (
    typeof passenger.id !== "string" ||
    !passenger.id.trim() ||
    passenger.id.length > 100 ||
    typeof passenger.name !== "string" ||
    passenger.name.length > 80 ||
    typeof passenger.pickupLandmark !== "string" ||
    passenger.pickupLandmark.length > 300 ||
    !isFiniteCoordinate(passenger.pickupLat, -90, 90) ||
    !isFiniteCoordinate(passenger.pickupLng, -180, 180) ||
    typeof passenger.detourKm !== "number" ||
    !Number.isFinite(passenger.detourKm) ||
    passenger.detourKm < 0 ||
    passenger.detourKm > 1000 ||
    typeof passenger.joiningToday !== "boolean"
  ) {
    return null
  }

  return {
    id: passenger.id.trim(),
    name: passenger.name.trim() || "Guest",
    pickupLandmark: passenger.pickupLandmark.trim() || "Nearby landmark",
    pickupLat: passenger.pickupLat,
    pickupLng: passenger.pickupLng,
    detourKm: passenger.detourKm,
    joiningToday: passenger.joiningToday,
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase is not configured" },
        { status: 500 }
      )
    }

    const { code } = await context.params
    const roomCode = code.trim().toUpperCase()
    const body = (await request.json()) as { passenger?: unknown }
    const passenger = parsePassenger(body.passenger)

    if (!/^BGR-[A-Z0-9]{3}$/.test(roomCode) || !passenger) {
      return NextResponse.json(
        { error: "Invalid room or passenger location data" },
        { status: 400 }
      )
    }

    const { data, error: loadError } = await supabase
      .from("rooms")
      .select("code,payload")
      .eq("code", roomCode)
      .maybeSingle<RoomRecord>()

    if (loadError) {
      return NextResponse.json({ error: loadError.message }, { status: 500 })
    }
    if (!data?.payload) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    const room = normalizeRoomState(roomCode, data.payload)
    const passengerIndex = room.passengers.findIndex(
      (entry) => entry.id === passenger.id
    )
    const passengers = [...room.passengers]

    if (passengerIndex === -1) {
      passengers.push(passenger)
    } else {
      passengers[passengerIndex] = passenger
    }

    const nextRoom: RoomState = {
      ...room,
      passengers,
    }

    const validation = await validateRouteBeforeSave(nextRoom.settings, passengers, "passenger")
    if (!validation.allowed) {
      return NextResponse.json(
        { error: validation.message ?? "This pickup cannot be saved." },
        { status: 400 }
      )
    }

    const { error: saveError } = await supabase
      .from("rooms")
      .update({ payload: nextRoom })
      .eq("code", roomCode)

    if (saveError) {
      return NextResponse.json({ error: saveError.message }, { status: 500 })
    }

    return NextResponse.json({ room: nextRoom })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
