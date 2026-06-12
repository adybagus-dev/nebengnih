import type { Passenger, RoomState, RoomSummary } from "./types"

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

export function formatMoney(amount: number) {
  return `IDR ${formatCurrency(amount)}`
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
  const baseTripCost = baseDistanceKm * fuelCostPerKm
  const detourCost = detourDistanceKm * fuelCostPerKm
  const totalTripCost = baseTripCost + detourCost + room.settings.tollCost
  const peopleInCar = activePassengers.length + 1
  const baseShare = peopleInCar > 0 ? (baseTripCost + room.settings.tollCost) / peopleInCar : 0
  const driverShare = baseShare

  const passengerBills = activePassengers.map((passenger, index) => {
    const detourShare = passenger.detourKm * fuelCostPerKm
    return {
      id: passenger.id,
      name: passenger.name,
      pickupLandmark: passenger.pickupLandmark,
      pickupLat: passenger.pickupLat,
      pickupLng: passenger.pickupLng,
      detourKm: passenger.detourKm,
      baseShare,
      detourShare,
      total: baseShare + detourShare,
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
    tollCost: room.settings.tollCost,
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

export function buildLedgerText(summary: RoomSummary) {
  const lines = [
    "🚗 NEBENGNIH DAILY REPORT 🚗",
    `Date: ${formatDateLabel()}`,
    `Room: ${summary.roomCode}`,
    `Driver: ${summary.driverNickname}`,
    `Route: ${cleanLabel(summary.origin)} → ${cleanLabel(summary.destination)}`,
    "",
    "Pickup Route Sequence:",
    "-----------------------",
  ]

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
    `Base Distance: ${formatDistance(summary.baseDistanceKm)}`,
    `Actual Distance: ${formatDistance(summary.actualDistanceKm)}`,
    `Detour Distance: ${formatDistance(summary.detourDistanceKm)}`,
    `Fuel Cost / km: ${formatMoney(summary.fuelCostPerKm)}`,
    `Total Tolls: ${formatMoney(summary.tollCost)}`,
    `Driver Share: ${formatMoney(summary.driverShare)}`,
    "Settle via manual transfer to Driver.",
    "Drive safe! 🙏"
  )

  return lines.join("\n")
}

export function formatPassengerCount(passengers: Passenger[]) {
  return `${passengers.length} passenger${passengers.length === 1 ? "" : "s"}`
}
