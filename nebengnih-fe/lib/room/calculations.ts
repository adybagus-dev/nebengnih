import type { Passenger, RoomState, RoomSummary, RouteSettings } from "./types"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(Math.round(amount))
}

function formatDistance(distance: number) {
  const rounded = Math.round(distance * 10) / 10
  return Number.isInteger(rounded) ? `${rounded.toFixed(0)} km` : `${rounded.toFixed(1)} km`
}

function formatDateLabel() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function cleanLabel(value: string) {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ")
}

function cleanText(value: string) {
  return value.trim().replace(/\s+/g, " ")
}

function roundRupiah(amount: number) {
  return Math.round(amount)
}

export function generateRoomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let suffix = ""

  for (let index = 0; index < 3; index += 1) {
    const randomIndex = Math.floor(Math.random() * alphabet.length)
    suffix += alphabet[randomIndex]
  }

  return `BGR-${suffix}`
}

export function estimateDetourKm(landmark: string) {
  const lengthFactor = Math.min(3, Math.max(0, landmark.trim().length / 24))
  const estimate = 1.2 + lengthFactor
  return Math.max(0.8, Math.round(estimate * 10) / 10)
}

function toRadians(value: number) {
  return (value * Math.PI) / 180
}

function haversineKm(
  start: { lat: number; lng: number },
  end: { lat: number; lng: number }
) {
  const earthRadiusKm = 6371
  const dLat = toRadians(end.lat - start.lat)
  const dLng = toRadians(end.lng - start.lng)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(start.lat)) *
      Math.cos(toRadians(end.lat)) *
      Math.sin(dLng / 2) ** 2

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function hasCoords(lat?: number, lng?: number) {
  return typeof lat === "number" && Number.isFinite(lat) && typeof lng === "number" && Number.isFinite(lng)
}

export function estimatePickupDetourKm(
  settings: RouteSettings,
  pickup: { lat: number; lng: number },
  fallbackLandmark = ""
) {
  if (
    !hasCoords(settings.originLat, settings.originLng) ||
    !hasCoords(settings.destinationLat, settings.destinationLng)
  ) {
    return estimateDetourKm(fallbackLandmark)
  }

  const origin = { lat: settings.originLat as number, lng: settings.originLng as number }
  const destination = {
    lat: settings.destinationLat as number,
    lng: settings.destinationLng as number,
  }
  const directRouteKm = haversineKm(origin, destination)
  const viaPickupKm = haversineKm(origin, pickup) + haversineKm(pickup, destination)
  const detourKm = Math.max(0, viaPickupKm - directRouteKm)

  if (!Number.isFinite(detourKm) || detourKm <= 0) {
    return estimateDetourKm(fallbackLandmark)
  }

  return Math.round(detourKm * 10) / 10
}

export function formatMoney(amount: number) {
  return `IDR ${formatCurrency(roundRupiah(amount))}`
}

export function calculateRoomSummary(room: RoomState): RoomSummary {
  const activePassengers = room.passengers.filter((passenger) => passenger.joiningToday)
  const fuelCostPerKm =
    room.settings.fuelEfficiencyKmPerLiter > 0
      ? room.settings.fuelPricePerLiter / room.settings.fuelEfficiencyKmPerLiter
      : 0

  const detourDistanceKm = activePassengers.reduce((total, passenger) => total + passenger.detourKm, 0)
  const actualDistanceKm = room.routeMetrics?.actualDistanceKm ?? room.settings.baseDistanceKm + detourDistanceKm
  const baseDistanceKm = room.routeMetrics?.baseDistanceKm ?? room.settings.baseDistanceKm
  const baseTripCost = roundRupiah(baseDistanceKm * fuelCostPerKm)
  const detourCost = roundRupiah(detourDistanceKm * fuelCostPerKm)
  const totalTripCost = roundRupiah(baseTripCost + detourCost + room.settings.additionalCost)
  const peopleInCar = activePassengers.length + 1
  const baseShare = peopleInCar > 0 ? roundRupiah((baseTripCost + room.settings.additionalCost) / peopleInCar) : 0
  const driverShare = baseShare

  const passengerBills = activePassengers.map((passenger, index) => {
    const detourShare = roundRupiah(passenger.detourKm * fuelCostPerKm)
    return {
      id: passenger.id,
      name: passenger.name,
      pickupLandmark: passenger.pickupLandmark,
      pickupLat: passenger.pickupLat,
      pickupLng: passenger.pickupLng,
      detourKm: passenger.detourKm,
      baseShare,
      detourShare,
      total: roundRupiah(baseShare + detourShare),
      order: index + 1,
    }
  })

  const shareUrl = roomShareUrl(room.roomCode)

  return {
    roomCode: room.roomCode,
    shareUrl,
    driverNickname: room.driverNickname,
    origin: room.settings.origin,
    destination: room.settings.destination,
    baseDistanceKm,
    actualDistanceKm,
    detourDistanceKm,
    fuelCostPerKm,
    additionalCost: room.settings.additionalCost,
    activePassengers,
    passengerBills,
    baseShare,
    driverShare,
    totalTripCost,
  }
}

function getPublicAppUrl() {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (configured) return configured.replace(/\/$/, "")
  if (process.env.NODE_ENV === "production") return "https://nebengnih.app"
  return "http://localhost:3000"
}

export function roomShareUrl(roomCode: string) {
  return `${getPublicAppUrl()}/room/${roomCode.toUpperCase()}`
}

export function buildLedgerText(summary: RoomSummary, routeReviewMessage?: string | null) {
  const lines = [
    "🚗 NEBENGNIH DAILY REPORT 🚗",
    `Date: ${formatDateLabel()}`,
    `Room: ${summary.roomCode}`,
    `Driver: ${summary.driverNickname}`,
    `Route: ${cleanLabel(summary.origin)} → ${cleanLabel(summary.destination)}`,
    routeReviewMessage ? `Route Review: ${cleanText(routeReviewMessage)}` : null,
    "",
    "Pickup Route Sequence:",
    "-----------------------",
  ].filter((line): line is string => line !== null)

  if (summary.passengerBills.length === 0) {
    lines.push("No active passengers yet.")
  } else {
    summary.passengerBills.forEach((passenger) => {
      lines.push(
        `${passenger.order}. ${cleanText(passenger.name)} ➔ 📍 ${cleanLabel(passenger.pickupLandmark)}`,
        `   Bill: ${formatMoney(passenger.total)}`
      )
    })
  }

  lines.push(
    "-----------------------",
    `Base route: ${formatDistance(summary.baseDistanceKm)}`,
    `Estimated extra distance: ${formatDistance(summary.detourDistanceKm)}`,
    `Route total (map): ${formatDistance(summary.actualDistanceKm)}`,
    `Fuel Cost / km: ${formatMoney(summary.fuelCostPerKm)}`,
    `Additional Cost: ${formatMoney(summary.additionalCost)}`,
    routeReviewMessage
      ? "Driver Share: Review required"
      : `Driver Share: ${formatMoney(summary.driverShare)}`,
    routeReviewMessage
      ? "Settle after manual route review."
      : "Settle via manual transfer to Driver.",
    "Drive safe! 🙏"
  )

  return lines.join("\n")
}

export function formatPassengerCount(passengers: Passenger[]) {
  return `${passengers.length} passenger${passengers.length === 1 ? "" : "s"}`
}
