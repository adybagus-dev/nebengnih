import { createClient } from "@supabase/supabase-js"
import { createDefaultRoomState } from "./defaults"
import { getRoomStorageKey, loadRoomState, saveRoomState } from "./storage"
import type { RoomState } from "./types"

type RoomRecord = {
  code: string
  payload: RoomState
  updated_at?: string
}

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return null
  return createClient(url, anonKey)
}

export function hasSupabaseConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

export async function fetchRoom(roomCode: string): Promise<RoomState> {
  const normalizedCode = roomCode.toUpperCase()
  const supabase = getSupabaseClient()

  if (supabase) {
    const { data, error } = await supabase
      .from("rooms")
      .select("code,payload,updated_at")
      .eq("code", normalizedCode)
      .maybeSingle<RoomRecord>()

    if (!error && data?.payload) {
      return {
        ...createDefaultRoomState(normalizedCode),
        ...data.payload,
        roomCode: normalizedCode,
      }
    }
  }

  if (typeof window !== "undefined") {
    const local = loadRoomState(normalizedCode)
    if (local) return local
  }

  return createDefaultRoomState(normalizedCode)
}

export async function persistRoom(
  room: RoomState,
  options?: { trackAsDriver?: boolean }
): Promise<RoomState> {
  saveRoomState(room, options)

  const supabase = getSupabaseClient()
  if (!supabase) return room

  const record: RoomRecord = {
    code: room.roomCode.toUpperCase(),
    payload: room,
    updated_at: new Date().toISOString(),
  }

  await supabase.from("rooms").upsert(record, { onConflict: "code" })
  return room
}

export function subscribeToRoom(roomCode: string, onRoom: (room: RoomState) => void) {
  const supabase = getSupabaseClient()
  if (!supabase || typeof window === "undefined") return () => {}

  const normalizedCode = roomCode.toUpperCase()
  const channel = supabase
    .channel(`room:${normalizedCode}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "rooms",
        filter: `code=eq.${normalizedCode}`,
      },
      async () => {
        const nextRoom = await fetchRoom(normalizedCode)
        onRoom(nextRoom)
      }
    )
    .subscribe()

  return () => {
    void supabase.removeChannel(channel)
  }
}

export async function ensureRoom(roomCode: string): Promise<RoomState> {
  const existing = await fetchRoom(roomCode)
  await persistRoom(existing)
  return existing
}

export function roomShareUrl(roomCode: string) {
  return `https://nebengnih.app/room/${roomCode.toUpperCase()}`
}

export function getRoomStorageSlot(roomCode: string) {
  return getRoomStorageKey(roomCode)
}
