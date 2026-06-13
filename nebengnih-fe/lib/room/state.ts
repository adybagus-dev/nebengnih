import { createDefaultRoomState } from "./defaults"
import type { RoomState } from "./types"

export function normalizeRoomState(roomCode: string, value: Partial<RoomState>): RoomState {
  const normalizedCode = roomCode.toUpperCase()
  const defaults = createDefaultRoomState(normalizedCode)

  return {
    ...defaults,
    ...value,
    roomCode: normalizedCode,
    settings: {
      ...defaults.settings,
      ...(value.settings ?? {}),
      additionalCost: value.settings?.additionalCost ?? defaults.settings.additionalCost,
    },
    passengers: Array.isArray(value.passengers)
      ? value.passengers.map((passenger) => ({
          ...passenger,
          pickupLat: typeof passenger.pickupLat === "number" ? passenger.pickupLat : undefined,
          pickupLng: typeof passenger.pickupLng === "number" ? passenger.pickupLng : undefined,
          detourKm: Number(passenger.detourKm) || 0,
          joiningToday: Boolean(passenger.joiningToday),
        }))
      : defaults.passengers,
    routeMetrics: value.routeMetrics
      ? {
          routeStatus: value.routeMetrics.routeStatus ?? "idle",
          validationType: value.routeMetrics.validationType,
          validationMessage: value.routeMetrics.validationMessage,
          baseDistanceKm: value.routeMetrics.baseDistanceKm,
          actualDistanceKm: value.routeMetrics.actualDistanceKm,
          detourDistanceKm: value.routeMetrics.detourDistanceKm,
          updatedAt: value.routeMetrics.updatedAt,
        }
      : defaults.routeMetrics,
  }
}
