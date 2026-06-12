import type { RoomState } from "./types"

export function createDefaultRoomState(roomCode = ""): RoomState {
  return {
    roomCode,
    driverNickname: "Driver",
    settings: {
      origin: "",
      destination: "",
      originLat: undefined,
      originLng: undefined,
      destinationLat: undefined,
      destinationLng: undefined,
      fuelEfficiencyKmPerLiter: 10,
      fuelPricePerLiter: 12500,
      tollCost: 20000,
      baseDistanceKm: 0,
    },
    passengers: [],
    routeMetrics: {
      routeStatus: "idle",
    },
  }
}

export const DEFAULT_ROOM_STATE: RoomState = createDefaultRoomState()

export const ROOM_STORAGE_KEY = "nebengnih.room.state"
export const ACTIVE_ROOM_CODE_KEY = "nebengnih.active-room-code"
export const DRIVER_ROOM_HISTORY_KEY = "nebengnih.driver-room-history"
