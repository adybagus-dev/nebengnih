import type { Passenger, RouteSettings } from "./types"

type Coord = {
  lat: number
  lng: number
}

type RouteResponse = {
  routes?: Array<{
    distance: number
    geometry?: {
      coordinates: [number, number][]
      type: "LineString"
    }
  }>
}

type TripResponse = {
  code?: string
  waypoints?: Array<{
    waypoint_index: number
  }>
}

function hasCoords(coord?: Coord | null): coord is Coord {
  return Boolean(coord && Number.isFinite(coord.lat) && Number.isFinite(coord.lng))
}

function routePoints(settings: RouteSettings, passengers: Passenger[]) {
  const origin = hasCoords({ lat: settings.originLat ?? NaN, lng: settings.originLng ?? NaN })
    ? { lat: settings.originLat as number, lng: settings.originLng as number }
    : null
  const destination = hasCoords({
    lat: settings.destinationLat ?? NaN,
    lng: settings.destinationLng ?? NaN,
  })
    ? { lat: settings.destinationLat as number, lng: settings.destinationLng as number }
    : null

  const pickups = passengers
    .filter((passenger) => passenger.joiningToday)
    .map((passenger) =>
      hasCoords({ lat: passenger.pickupLat ?? NaN, lng: passenger.pickupLng ?? NaN })
        ? { lat: passenger.pickupLat as number, lng: passenger.pickupLng as number }
        : null
    )
    .filter((coord): coord is Coord => Boolean(coord))

  return { origin, destination, pickups }
}

async function fetchGeometry(points: Coord[]) {
  if (points.length < 2) return []

  const coordinates = points.map((coord) => `${coord.lng},${coord.lat}`).join(";")
  const response = await fetch(
    `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson&steps=false`,
    { cache: "no-store" }
  )

  if (!response.ok) throw new Error("OSRM geometry response not ok")

  const json = (await response.json()) as RouteResponse
  return (json.routes?.[0]?.geometry?.coordinates ?? []).map(
    ([lng, lat]) => ({ lat, lng })
  )
}

export async function fetchRouteGeometry(settings: RouteSettings, passengers: Passenger[]) {
  const { origin, destination, pickups } = routePoints(settings, passengers)
  const actualPoints = [
    ...(origin ? [origin] : []),
    ...pickups,
    ...(destination ? [destination] : []),
  ]

  try {
    const [base, actual] = await Promise.all([
      origin && destination ? fetchGeometry([origin, destination]) : Promise.resolve([]),
      fetchGeometry(actualPoints),
    ])

    return {
      base,
      actual,
      complete: Boolean(origin && destination),
    }
  } catch {
    return {
      base: origin && destination ? [origin, destination] : [],
      actual: actualPoints,
      complete: Boolean(origin && destination),
    }
  }
}

export async function fetchRouteMetrics(settings: RouteSettings, passengers: Passenger[]) {
  const { origin, destination, pickups } = routePoints(settings, passengers)

  if (!origin || !destination) {
    return {
      routeStatus: "fallback" as const,
      baseDistanceKm: settings.baseDistanceKm,
      actualDistanceKm: settings.baseDistanceKm + pickups.length * 1.2,
      detourDistanceKm: pickups.length * 1.2,
    }
  }

  const coordinates = [origin, ...pickups, destination]
    .map((coord) => `${coord.lng},${coord.lat}`)
    .join(";")

  try {
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=false&steps=false&annotations=distance`,
      { cache: "no-store" }
    )

    if (!response.ok) throw new Error("OSRM response not ok")

    const json = (await response.json()) as RouteResponse
    const routeDistanceMeters = json.routes?.[0]?.distance
    if (typeof routeDistanceMeters !== "number" || !Number.isFinite(routeDistanceMeters)) {
      throw new Error("Missing route distance")
    }

    const actualDistanceKm = routeDistanceMeters / 1000
    const baseResponse = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=false&steps=false&annotations=distance`,
      { cache: "no-store" }
    )

    if (!baseResponse.ok) throw new Error("Base OSRM response not ok")

    const baseJson = (await baseResponse.json()) as RouteResponse
    const baseDistanceMeters = baseJson.routes?.[0]?.distance
    const baseDistanceKm = typeof baseDistanceMeters === "number" && Number.isFinite(baseDistanceMeters)
      ? baseDistanceMeters / 1000
      : settings.baseDistanceKm

    return {
      routeStatus: "ready" as const,
      baseDistanceKm,
      actualDistanceKm,
      detourDistanceKm: Math.max(0, actualDistanceKm - baseDistanceKm),
    }
  } catch {
    const detourDistanceKm = pickups.length * 1.2
    return {
      routeStatus: "fallback" as const,
      baseDistanceKm: settings.baseDistanceKm,
      actualDistanceKm: settings.baseDistanceKm + detourDistanceKm,
      detourDistanceKm,
    }
  }
}

export async function optimizePassengerOrder(
  settings: RouteSettings,
  passengers: Passenger[]
) {
  const { origin, destination } = routePoints(settings, passengers)
  const activeWithCoordinates = passengers.filter(
    (passenger) =>
      passenger.joiningToday &&
      hasCoords({
        lat: passenger.pickupLat ?? NaN,
        lng: passenger.pickupLng ?? NaN,
      })
  )

  if (!origin || !destination) {
    throw new Error("Add a valid driver start and destination first.")
  }

  if (activeWithCoordinates.length < 2) {
    return activeWithCoordinates.map((passenger) => passenger.id)
  }

  const points = [
    origin,
    ...activeWithCoordinates.map((passenger) => ({
      lat: passenger.pickupLat as number,
      lng: passenger.pickupLng as number,
    })),
    destination,
  ]
  const coordinates = points.map((point) => `${point.lng},${point.lat}`).join(";")
  const response = await fetch(
    `https://router.project-osrm.org/trip/v1/driving/${coordinates}?source=first&destination=last&roundtrip=false&overview=false&steps=false`,
    { cache: "no-store" }
  )

  if (!response.ok) throw new Error("Route optimization is unavailable right now.")

  const json = (await response.json()) as TripResponse
  if (json.code !== "Ok" || json.waypoints?.length !== points.length) {
    throw new Error("Could not calculate a better pickup order.")
  }

  return activeWithCoordinates
    .map((passenger, index) => ({
      id: passenger.id,
      order: json.waypoints?.[index + 1]?.waypoint_index ?? index + 1,
    }))
    .sort((left, right) => left.order - right.order)
    .map((passenger) => passenger.id)
}
