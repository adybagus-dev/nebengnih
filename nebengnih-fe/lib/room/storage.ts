import { DEFAULT_ROOM_STATE, ROOM_STORAGE_KEY } from "./defaults"
import type { RoomState } from "./types"

export function loadRoomState(): RoomState {
  if (typeof window === "undefined") {
    return DEFAULT_ROOM_STATE
  }

  try {
    const raw = window.localStorage.getItem(ROOM_STORAGE_KEY)
    if (!raw) return DEFAULT_ROOM_STATE

    const parsed = JSON.parse(raw) as Partial<RoomState>
    return {
      ...DEFAULT_ROOM_STATE,
      ...parsed,
      settings: {
        ...DEFAULT_ROOM_STATE.settings,
        ...(parsed.settings ?? {}),
      },
      passengers: Array.isArray(parsed.passengers)
        ? parsed.passengers.map((passenger) => ({
            ...passenger,
            detourKm: Number(passenger.detourKm) || 0,
            joiningToday: Boolean(passenger.joiningToday),
          }))
        : DEFAULT_ROOM_STATE.passengers,
    }
  } catch {
    return DEFAULT_ROOM_STATE
  }
}

export function saveRoomState(state: RoomState) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(ROOM_STORAGE_KEY, JSON.stringify(state))
}
