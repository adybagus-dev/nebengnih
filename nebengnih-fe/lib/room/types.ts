export type Passenger = {
  id: string
  name: string
  pickupLandmark: string
  detourKm: number
  joiningToday: boolean
}

export type RouteSettings = {
  origin: string
  destination: string
  fuelEfficiencyKmPerLiter: number
  fuelPricePerLiter: number
  tollCost: number
  baseDistanceKm: number
}

export type RoomState = {
  roomCode: string
  driverNickname: string
  settings: RouteSettings
  passengers: Passenger[]
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
  tollCost: number
  activePassengers: Passenger[]
  passengerBills: PassengerBill[]
  baseShare: number
  driverShare: number
  totalTripCost: number
}
