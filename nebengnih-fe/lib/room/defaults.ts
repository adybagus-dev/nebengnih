import type { RoomState } from "./types"

export function createDefaultRoomState(roomCode = "BGR-99A"): RoomState {
  return {
    roomCode,
    driverNickname: "Driver",
    settings: {
      origin: "Current location",
      destination: "Where are you going?",
      originLat: -6.5971,
      originLng: 106.8062,
      destinationLat: -6.2297,
      destinationLng: 106.7745,
      fuelEfficiencyKmPerLiter: 10,
      fuelPricePerLiter: 12500,
      tollCost: 20000,
      baseDistanceKm: 20,
    },
    passengers: [
      {
        id: "andi",
        name: "Andi",
        pickupLandmark: "Front of Indomaret Gang 4",
        pickupLat: -6.5981,
        pickupLng: 106.7993,
        detourKm: 2.4,
        joiningToday: true,
      },
      {
        id: "budi",
        name: "Budi",
        pickupLandmark: "Alfamidi Pajajaran",
        pickupLat: -6.5958,
        pickupLng: 106.8021,
        detourKm: 3.1,
        joiningToday: true,
      },
      {
        id: "tiara",
        name: "Tiara",
        pickupLandmark: "Bogor Trade Mall gate",
        pickupLat: -6.5979,
        pickupLng: 106.804,
        detourKm: 1.8,
        joiningToday: false,
      },
    ],
    routeMetrics: {
      routeStatus: "idle",
    },
  }
}

export const DEFAULT_ROOM_STATE: RoomState = createDefaultRoomState()

export const ROOM_STORAGE_KEY = "nebengnih.room.state"
export const ACTIVE_ROOM_CODE_KEY = "nebengnih.active-room-code"
export const DRIVER_ROOM_HISTORY_KEY = "nebengnih.driver-room-history"
