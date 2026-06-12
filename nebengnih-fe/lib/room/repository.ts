import { createClient } from "@supabase/supabase-js"
import { normalizeRoomState } from "./state"
import { getRoomStorageKey, loadRoomState, saveRoomState } from "./storage"
import type { RoomState } from "./types"

type RoomRecord = {
  code: string
  payload: RoomState
}

type RoomExistenceRecord = {
  code: string
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseClient =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

export async function fetchRoom(roomCode: string): Promise<RoomState> {
  const normalizedCode = roomCode.toUpperCase()
  const supabase = supabaseClient

  if (supabase) {
    const { data, error } = await supabase
      .from("rooms")
      .select("code,payload")
      .eq("code", normalizedCode)
      .maybeSingle<RoomRecord>()

    if (error) {
      throw new Error(`Unable to load room ${normalizedCode}: ${error.message}`)
    }

    if (data?.payload) {
      return normalizeRoomState(normalizedCode, data.payload)
    }

    throw new Error(`Room ${normalizedCode} not found`)
  }

  if (typeof window !== "undefined") {
    const local = loadRoomState(normalizedCode)
    if (local) return local
  }

  throw new Error(`Room ${normalizedCode} not found`)
}

export async function roomExists(roomCode: string): Promise<boolean> {
  const normalizedCode = roomCode.toUpperCase()
  const supabase = supabaseClient

  if (supabase) {
    const { data, error } = await supabase
      .from("rooms")
      .select("code")
      .eq("code", normalizedCode)
      .maybeSingle<RoomExistenceRecord>()

    if (error) {
      throw new Error(`Unable to check room ${normalizedCode}: ${error.message}`)
    }

    return Boolean(data?.code)
  }

  if (typeof window !== "undefined") {
    return Boolean(window.localStorage.getItem(getRoomStorageKey(normalizedCode)))
  }

  return false
}

export async function persistRoom(
  room: RoomState,
  options?: { trackAsDriver?: boolean }
): Promise<RoomState> {
  const supabase = supabaseClient
  if (!supabase) {
    saveRoomState(room, options)
    return room
  }

  const response = await fetch("/api/driver-rooms", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      roomCode: room.roomCode.toUpperCase(),
      payload: room,
    }),
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error ?? `Unable to save room ${room.roomCode}`)
  }

  saveRoomState(room, options)
  return room
}
