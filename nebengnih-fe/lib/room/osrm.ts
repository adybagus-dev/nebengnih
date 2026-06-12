import type { Passenger, RouteSettings } from "./types"

type Coord = {
  lat: number
  lng: number
}

type RouteResponse = {
  routes?: Array<{
    distance: number
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
