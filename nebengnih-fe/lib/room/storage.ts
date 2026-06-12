import {
  ACTIVE_ROOM_CODE_KEY,
  createDefaultRoomState,
  DRIVER_ROOM_HISTORY_KEY,
  ROOM_STORAGE_KEY,
} from "./defaults"
import type { RoomState } from "./types"

export type DriverRoomHistoryEntry = {
  roomCode: string
  driverNickname: string
  origin: string
  destination: string
  updatedAt: string
}

const DRIVER_ROOMS_CHANGED_EVENT = "nebengnih:driver-rooms-changed"

export function getRoomStorageKey(roomCode: string) {
  return `${ROOM_STORAGE_KEY}.${roomCode.toUpperCase()}`
}

export function loadStoredActiveRoomCode() {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(ACTIVE_ROOM_CODE_KEY)
}

export function loadActiveRoomCode() {
  return loadStoredActiveRoomCode() ?? createDefaultRoomState().roomCode
}

export function saveActiveRoomCode(roomCode: string) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(ACTIVE_ROOM_CODE_KEY, roomCode.toUpperCase())
  window.dispatchEvent(new Event(DRIVER_ROOMS_CHANGED_EVENT))
}

export function loadDriverRoomHistory(): DriverRoomHistoryEntry[] {
  if (typeof window === "undefined") return []

  try {
    const raw = window.localStorage.getItem(DRIVER_ROOM_HISTORY_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw) as DriverRoomHistoryEntry[]
    if (!Array.isArray(parsed)) return []

    return parsed
      .filter((entry) => entry?.roomCode)
      .map((entry) => ({
        roomCode: entry.roomCode.toUpperCase(),
        driverNickname: entry.driverNickname || "Driver",
        origin: entry.origin || "Start location",
        destination: entry.destination || "Destination",
        updatedAt: entry.updatedAt || new Date(0).toISOString(),
      }))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  } catch {
    return []
  }
}

export function saveDriverRoomHistory(entries: DriverRoomHistoryEntry[]) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(DRIVER_ROOM_HISTORY_KEY, JSON.stringify(entries))
  window.dispatchEvent(new Event(DRIVER_ROOMS_CHANGED_EVENT))
}

export function recordDriverRoom(state: RoomState) {
  const nextEntry: DriverRoomHistoryEntry = {
    roomCode: state.roomCode.toUpperCase(),
    driverNickname: state.driverNickname || "Driver",
    origin: state.settings.origin,
    destination: state.settings.destination,
    updatedAt: new Date().toISOString(),
  }
  const history = loadDriverRoomHistory().filter((entry) => entry.roomCode !== nextEntry.roomCode)
  saveDriverRoomHistory([nextEntry, ...history])
  saveActiveRoomCode(nextEntry.roomCode)
}

export function removeDriverRoomFromDevice(roomCode: string) {
  if (typeof window === "undefined") return

  const normalizedCode = roomCode.toUpperCase()
  const history = loadDriverRoomHistory().filter((entry) => entry.roomCode !== normalizedCode)
  window.localStorage.removeItem(getRoomStorageKey(normalizedCode))
  saveDriverRoomHistory(history)

  if (loadStoredActiveRoomCode()?.toUpperCase() === normalizedCode) {
    if (history[0]) {
      saveActiveRoomCode(history[0].roomCode)
    } else {
      window.localStorage.removeItem(ACTIVE_ROOM_CODE_KEY)
      window.dispatchEvent(new Event(DRIVER_ROOMS_CHANGED_EVENT))
    }
  }
}

export function subscribeToDriverRoomHistory(onChange: () => void) {
  if (typeof window === "undefined") return () => {}

  const handleStorage = (event: StorageEvent) => {
    if (
      event.key === DRIVER_ROOM_HISTORY_KEY ||
      event.key === ACTIVE_ROOM_CODE_KEY ||
      event.key?.startsWith(`${ROOM_STORAGE_KEY}.`)
    ) {
      onChange()
    }
  }

  window.addEventListener("storage", handleStorage)
  window.addEventListener(DRIVER_ROOMS_CHANGED_EVENT, onChange)

  return () => {
    window.removeEventListener("storage", handleStorage)
    window.removeEventListener(DRIVER_ROOMS_CHANGED_EVENT, onChange)
  }
}

export function loadRoomState(roomCode: string): RoomState {
  const normalizedCode = roomCode.toUpperCase()

  if (typeof window === "undefined") {
    return createDefaultRoomState(normalizedCode)
  }

  try {
    const raw = window.localStorage.getItem(getRoomStorageKey(normalizedCode))
    if (!raw) return createDefaultRoomState(normalizedCode)

    const parsed = JSON.parse(raw) as Partial<RoomState>
    return {
      ...createDefaultRoomState(normalizedCode),
      ...parsed,
      settings: {
        ...createDefaultRoomState(normalizedCode).settings,
        ...(parsed.settings ?? {}),
      },
      passengers: Array.isArray(parsed.passengers)
        ? parsed.passengers.map((passenger) => ({
            ...passenger,
            pickupLat: typeof passenger.pickupLat === "number" ? passenger.pickupLat : undefined,
            pickupLng: typeof passenger.pickupLng === "number" ? passenger.pickupLng : undefined,
            detourKm: Number(passenger.detourKm) || 0,
            joiningToday: Boolean(passenger.joiningToday),
          }))
        : createDefaultRoomState(normalizedCode).passengers,
      routeMetrics: parsed.routeMetrics
        ? {
            routeStatus: parsed.routeMetrics.routeStatus ?? "idle",
            baseDistanceKm: parsed.routeMetrics.baseDistanceKm,
            actualDistanceKm: parsed.routeMetrics.actualDistanceKm,
            detourDistanceKm: parsed.routeMetrics.detourDistanceKm,
            updatedAt: parsed.routeMetrics.updatedAt,
          }
        : { routeStatus: "idle" },
    }
  } catch {
    return createDefaultRoomState(normalizedCode)
  }
}

export function saveRoomState(state: RoomState, options?: { trackAsDriver?: boolean }) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(getRoomStorageKey(state.roomCode), JSON.stringify(state))
  if (options?.trackAsDriver) {
    recordDriverRoom(state)
  }
}
