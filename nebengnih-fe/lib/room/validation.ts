import type { Passenger, RouteSettings } from "./types"

type RouteValidationTarget = "driver" | "passenger"

type RouteValidationResult =
  | { allowed: true; message?: string }
  | { allowed: false; message: string }

function hasCoords(lat?: number, lng?: number) {
  return typeof lat === "number" && Number.isFinite(lat) && typeof lng === "number" && Number.isFinite(lng)
}

export function getMissingRouteSetupFields(settings: RouteSettings, driverNickname: string) {
  const missing: string[] = []

  if (!driverNickname.trim()) {
    missing.push("Driver name")
  }

  if (!settings.origin.trim() || !hasCoords(settings.originLat, settings.originLng)) {
    missing.push("Start location")
  }

  if (!settings.destination.trim() || !hasCoords(settings.destinationLat, settings.destinationLng)) {
    missing.push("Destination")
  }

  if (!Number.isFinite(settings.fuelEfficiencyKmPerLiter) || settings.fuelEfficiencyKmPerLiter <= 0) {
    missing.push("Fuel efficiency")
  }

  if (!Number.isFinite(settings.fuelPricePerLiter) || settings.fuelPricePerLiter <= 0) {
    missing.push("Fuel price")
  }

  if (!Number.isFinite(settings.additionalCost) || settings.additionalCost < 0) {
    missing.push("Additional cost")
  }

  return missing
}

export async function validateRouteBeforeSave(
  settings: RouteSettings,
  passengers: Passenger[],
  _target: RouteValidationTarget
) : Promise<RouteValidationResult> {
  const hasDriverRoute =
    hasCoords(settings.originLat, settings.originLng) &&
    hasCoords(settings.destinationLat, settings.destinationLng)

  if (!hasDriverRoute) {
    return { allowed: true as const }
  }

  return { allowed: true as const }
}
