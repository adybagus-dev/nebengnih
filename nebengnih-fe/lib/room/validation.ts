import type { Passenger, RouteSettings } from "./types"
import { fetchRouteMetrics } from "./osrm"

type RouteValidationTarget = "driver" | "passenger"

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

function buildCrossWaterMessage(target: RouteValidationTarget) {
  return target === "driver"
    ? "This route crosses water, uses a ferry, or reaches another island without a continuous road connection. Please choose a different start and destination connected by road."
    : "This pickup crosses water, uses a ferry, or reaches another island without a continuous road connection. Please choose a pickup connected to the driver route by road."
}

export async function validateRouteBeforeSave(
  settings: RouteSettings,
  passengers: Passenger[],
  target: RouteValidationTarget
) {
  const hasDriverRoute =
    hasCoords(settings.originLat, settings.originLng) &&
    hasCoords(settings.destinationLat, settings.destinationLng)

  if (!hasDriverRoute) {
    return { allowed: true as const }
  }

  const metrics = await fetchRouteMetrics(settings, passengers)
  if (metrics.routeStatus === "manual-review" && metrics.validationType === "cross-water") {
    return {
      allowed: false as const,
      message: buildCrossWaterMessage(target),
    }
  }

  return { allowed: true as const }
}
