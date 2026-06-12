import type { RoomState } from "./types"

export const DEFAULT_ROOM_STATE: RoomState = {
  roomCode: "BGR-99A",
  driverNickname: "Driver",
  settings: {
    origin: "Jl. Raya Pajajaran No. 12, Bogor",
    destination: "Sudirman Central Business District, Jakarta",
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
      detourKm: 2.4,
      joiningToday: true,
    },
    {
      id: "budi",
      name: "Budi",
      pickupLandmark: "Alfamidi Pajajaran",
      detourKm: 3.1,
      joiningToday: true,
    },
    {
      id: "tiara",
      name: "Tiara",
      pickupLandmark: "Bogor Trade Mall gate",
      detourKm: 1.8,
      joiningToday: false,
    },
  ],
}

export const ROOM_STORAGE_KEY = "nebengnih.room.state"
