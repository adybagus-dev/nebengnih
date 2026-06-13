export type Passenger = {
  id: string
  name: string
  pickupLandmark: string
  pickupLat?: number
  pickupLng?: number
  detourKm: number
  joiningToday: boolean
}

export type RouteSettings = {
  origin: string
  destination: string
  originLat?: number
  originLng?: number
  destinationLat?: number
  destinationLng?: number
  fuelEfficiencyKmPerLiter: number
  fuelPricePerLiter: number
  additionalCost: number
  baseDistanceKm: number
}

export type RouteMetrics = {
  routeStatus: "idle" | "loading" | "ready" | "fallback" | "manual-review"
  validationType?: "road" | "cross-water"
  validationMessage?: string
  baseDistanceKm?: number
  actualDistanceKm?: number
  detourDistanceKm?: number
  updatedAt?: string
}

export type RoomState = {
  roomCode: string
  driverNickname: string
  settings: RouteSettings
  passengers: Passenger[]
  routeMetrics?: RouteMetrics
}

export type PassengerBill = {
  id: string
  name: string
  pickupLandmark: string
  detourKm: number
  baseShare: number
  detourShare: number
  total: number
  order: number
}

export type RoomSummary = {
  roomCode: string
  shareUrl: string
  driverNickname: string
  origin: string
  destination: string
  baseDistanceKm: number
  actualDistanceKm: number
  detourDistanceKm: number
  fuelCostPerKm: number
  additionalCost: number
  activePassengers: Passenger[]
  passengerBills: PassengerBill[]
  baseShare: number
  driverShare: number
  totalTripCost: number
}
