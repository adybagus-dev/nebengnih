import type { Passenger, RouteSettings } from "./types"

type Coord = {
  lat: number
  lng: number
}

type RouteResponse = {
  code?: string
  message?: string
  routes?: Array<{
    distance: number
    legs?: Array<{
      distance: number
      steps?: Array<{
        mode?: string
        name?: string
        ref?: string
        destinations?: string
      }>
    }>
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

function toRadians(value: number) {
  return (value * Math.PI) / 180
}

function haversineKm(start: Coord, end: Coord) {
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

function routeDistanceKm(points: Coord[]) {
  return points.slice(1).reduce((total, point, index) => {
    const prev = points[index]
    return total + haversineKm(prev, point)
  }, 0)
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

function isUnsupportedRouteResponse(response: Response, json: RouteResponse) {
  return (
    json.code === "NoRoute" ||
    json.code === "NoSegment" ||
    (response.ok && (!json.routes || json.routes.length === 0))
  )
}

function routeUsesFerry(route: NonNullable<RouteResponse["routes"]>[number]) {
  const ferryTerms = ["ferry", "feri", "penyeberangan"]

  return (route.legs ?? []).some((leg) =>
    (leg.steps ?? []).some((step) => {
      const routeDetails = [
        step.mode,
        step.name,
        step.ref,
        step.destinations,
      ]
        .filter((value): value is string => Boolean(value))
        .join(" ")
        .toLowerCase()

      return ferryTerms.some((term) => routeDetails.includes(term))
    })
  )
}

function isSuspiciousRoadLeg(roadDistanceKm: number, directDistanceKm: number) {
  if (!Number.isFinite(roadDistanceKm) || !Number.isFinite(directDistanceKm)) return false
  if (directDistanceKm < 0.25) return false

  const ratio = roadDistanceKm / directDistanceKm
  const gapKm = roadDistanceKm - directDistanceKm

  if (directDistanceKm < 3) return ratio >= 4 && gapKm >= 6
  if (directDistanceKm < 10) return ratio >= 3 && gapKm >= 10
  if (directDistanceKm < 25) return ratio >= 2.3 && gapKm >= 14
  return ratio >= 1.8 && gapKm >= 25
}

function routeHasSuspiciousLeg(
  route: NonNullable<RouteResponse["routes"]>[number],
  points: Coord[]
) {
  const legs = route.legs ?? []
  if (legs.length !== points.length - 1) return false

  return legs.some((leg, index) =>
    isSuspiciousRoadLeg(leg.distance / 1000, haversineKm(points[index], points[index + 1]))
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

  const actualPoints = [origin, ...pickups, destination]
  const coordinates = actualPoints
    .map((coord) => `${coord.lng},${coord.lat}`)
    .join(";")
  const geodesicBaseKm = routeDistanceKm([origin, destination])
  const geodesicActualKm = routeDistanceKm(actualPoints)

  function crossWaterMetrics() {
    const manualBaseDistanceKm = Math.max(settings.baseDistanceKm, geodesicBaseKm * 2.2)
    const manualActualDistanceKm = Math.max(manualBaseDistanceKm, geodesicActualKm * 2.2)

    return {
      routeStatus: "manual-review" as const,
      validationType: "cross-water" as const,
      validationMessage:
        "This route crosses water, uses a ferry, or reaches another island without a continuous road connection.",
      baseDistanceKm: manualBaseDistanceKm,
      actualDistanceKm: manualActualDistanceKm,
      detourDistanceKm: Math.max(0, manualActualDistanceKm - manualBaseDistanceKm),
    }
  }

  try {
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=false&steps=true&annotations=distance`,
      { cache: "no-store" }
    )
    const json = (await response.json()) as RouteResponse

    if (isUnsupportedRouteResponse(response, json)) return crossWaterMetrics()
    if (!response.ok) throw new Error(json.message ?? "OSRM response not ok")

    const actualRoute = json.routes?.[0]
    const routeDistanceMeters = actualRoute?.distance
    if (typeof routeDistanceMeters !== "number" || !Number.isFinite(routeDistanceMeters)) {
      throw new Error("Missing route distance")
    }

    const actualDistanceKm = routeDistanceMeters / 1000
    const baseResponse = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=false&steps=true&annotations=distance`,
      { cache: "no-store" }
    )
    const baseJson = (await baseResponse.json()) as RouteResponse

    if (isUnsupportedRouteResponse(baseResponse, baseJson)) return crossWaterMetrics()
    if (!baseResponse.ok) throw new Error(baseJson.message ?? "Base OSRM response not ok")

    const baseRoute = baseJson.routes?.[0]
    const baseDistanceMeters = baseRoute?.distance
    const baseDistanceKm = typeof baseDistanceMeters === "number" && Number.isFinite(baseDistanceMeters)
      ? baseDistanceMeters / 1000
      : settings.baseDistanceKm

    if (
      !actualRoute ||
      !baseRoute ||
      routeUsesFerry(actualRoute) ||
      routeUsesFerry(baseRoute) ||
      routeHasSuspiciousLeg(actualRoute, actualPoints) ||
      routeHasSuspiciousLeg(baseRoute, [origin, destination])
    ) {
      return crossWaterMetrics()
    }

    return {
      routeStatus: "ready" as const,
      validationType: "road" as const,
      baseDistanceKm,
      actualDistanceKm,
      detourDistanceKm: Math.max(0, actualDistanceKm - baseDistanceKm),
      validationMessage: undefined,
    }
  } catch {
    const manualBaseDistanceKm = Math.max(settings.baseDistanceKm, geodesicBaseKm * 2.2)
    const manualActualDistanceKm = Math.max(manualBaseDistanceKm, geodesicActualKm * 2.2)
    const detourDistanceKm = Math.max(0, manualActualDistanceKm - manualBaseDistanceKm)
    return {
      routeStatus: "fallback" as const,
      validationType: "road" as const,
      validationMessage: undefined,
      baseDistanceKm: manualBaseDistanceKm,
      actualDistanceKm: manualActualDistanceKm,
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
