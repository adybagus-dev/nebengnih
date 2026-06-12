"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Route } from "lucide-react"
import { useRoom } from "@/components/providers/room-provider"
import { fetchRouteGeometry } from "@/lib/room/osrm"

type RouteStop = {
  id: string
  lat: number
  lng: number
  label: string
  detail: string
  kind: "start" | "passenger" | "destination"
}

const BATAM_CENTER: [number, number] = [1.1301, 104.0529]

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

function compactLabel(value: string) {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2)
    .join(", ")
}

function spreadOverlappingStops(stops: RouteStop[]) {
  const groups = new Map<string, RouteStop[]>()

  stops.forEach((stop) => {
    const key = `${stop.lat.toFixed(6)},${stop.lng.toFixed(6)}`
    groups.set(key, [...(groups.get(key) ?? []), stop])
  })

  return stops.map((stop) => {
    const key = `${stop.lat.toFixed(6)},${stop.lng.toFixed(6)}`
    const group = groups.get(key) ?? [stop]
    if (group.length === 1) return stop

    const index = group.findIndex((candidate) => candidate.id === stop.id)
    const angle = (Math.PI * 2 * index) / group.length
    const offset = 0.00012

    return {
      ...stop,
      lat: stop.lat + Math.sin(angle) * offset,
      lng: stop.lng + Math.cos(angle) * offset,
    }
  })
}

export function RouteMap() {
  const { room, summary } = useRoom()
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<import("leaflet").Map | null>(null)
  const routeLayersRef = useRef<import("leaflet").Layer[]>([])
  const [mapReady, setMapReady] = useState(false)
  const [routeComplete, setRouteComplete] = useState(true)

  const stops = useMemo(() => {
    const nextStops: RouteStop[] = []
    const settings = room.settings

    if (settings.originLat !== undefined && settings.originLng !== undefined) {
      nextStops.push({
        id: "driver-start",
        lat: settings.originLat,
        lng: settings.originLng,
        label: "Driver start",
        detail: compactLabel(settings.origin) || "Start location",
        kind: "start",
      })
    }

    room.passengers
      .filter(
        (passenger) =>
          passenger.joiningToday &&
          passenger.pickupLat !== undefined &&
          passenger.pickupLng !== undefined
      )
      .forEach((passenger) => {
        nextStops.push({
          id: passenger.id,
          lat: passenger.pickupLat as number,
          lng: passenger.pickupLng as number,
          label: passenger.name || "Passenger",
          detail: compactLabel(passenger.pickupLandmark) || "Pickup point",
          kind: "passenger",
        })
      })

    if (
      settings.destinationLat !== undefined &&
      settings.destinationLng !== undefined
    ) {
      nextStops.push({
        id: "driver-destination",
        lat: settings.destinationLat,
        lng: settings.destinationLng,
        label: "Destination",
        detail: compactLabel(settings.destination) || "End location",
        kind: "destination",
      })
    }

    return nextStops
  }, [room.passengers, room.settings])

  useEffect(() => {
    let cancelled = false

    void import("leaflet").then((L) => {
      if (cancelled || !mapContainerRef.current || mapRef.current) return

      const container = mapContainerRef.current as HTMLDivElement & {
        _leaflet_id?: number
      }
      if (container._leaflet_id) delete container._leaflet_id

      const map = L.map(container, {
        center: BATAM_CENTER,
        zoom: 13,
        zoomControl: true,
        attributionControl: false,
        dragging: true,
        scrollWheelZoom: false,
        doubleClickZoom: true,
        touchZoom: true,
      })

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        crossOrigin: "anonymous",
      }).addTo(map)

      mapRef.current = map
      setMapReady(true)

      requestAnimationFrame(() => {
        window.setTimeout(() => map.invalidateSize(), 120)
      })
    })

    return () => {
      cancelled = true
      mapRef.current?.remove()
      mapRef.current = null
      routeLayersRef.current = []
    }
  }, [])

  useEffect(() => {
    if (!mapReady || !mapRef.current) return

    let cancelled = false

    async function drawRoute() {
      const L = await import("leaflet")
      const map = mapRef.current
      if (!map || cancelled) return

      routeLayersRef.current.forEach((layer) => map.removeLayer(layer))
      routeLayersRef.current = []

      const geometry = await fetchRouteGeometry(room.settings, room.passengers)
      if (cancelled || !mapRef.current) return
      setRouteComplete(geometry.complete)

      const layers: import("leaflet").Layer[] = []

      if (geometry.base.length >= 2) {
        const baseRoute = L.polyline(
          geometry.base.map((point) => [point.lat, point.lng]),
          {
            color: "#64748b",
            weight: 5,
            opacity: 0.65,
            dashArray: "8 10",
            lineCap: "round",
            lineJoin: "round",
          }
        ).addTo(map)
        layers.push(baseRoute)
      }

      if (geometry.actual.length >= 2) {
        const actualRoute = L.polyline(
          geometry.actual.map((point) => [point.lat, point.lng]),
          {
            color: geometry.complete ? "#10b981" : "#f59e0b",
            weight: 7,
            opacity: 0.95,
            dashArray: geometry.complete ? undefined : "10 8",
            lineCap: "round",
            lineJoin: "round",
          }
        ).addTo(map)
        layers.push(actualRoute)
      }

      spreadOverlappingStops(stops).forEach((stop, index) => {
        const style = {
          start: { color: "#ef4444", glyph: "S" },
          passenger: { color: "#10b981", glyph: String(index) },
          destination: { color: "#2563eb", glyph: "D" },
        }[stop.kind]

        const icon = L.divIcon({
          className: "",
          html: `
            <div style="display:flex;flex-direction:column;align-items:center;width:150px;">
              <div style="
                max-width:145px;
                overflow:hidden;
                text-overflow:ellipsis;
                white-space:nowrap;
                border:1px solid rgba(226,232,240,.95);
                border-radius:999px;
                background:rgba(255,255,255,.96);
                box-shadow:0 8px 20px rgba(15,23,42,.14);
                padding:4px 9px;
                color:#0f172a;
                font-size:11px;
                font-weight:800;
              ">${escapeHtml(stop.label)}</div>
              <div style="
                margin-top:2px;
                max-width:145px;
                overflow:hidden;
                text-overflow:ellipsis;
                white-space:nowrap;
                border-radius:999px;
                background:rgba(255,255,255,.9);
                padding:2px 8px;
                color:#64748b;
                font-size:9px;
                font-weight:600;
              ">${escapeHtml(stop.detail)}</div>
              <div style="
                display:flex;
                align-items:center;
                justify-content:center;
                width:34px;
                height:34px;
                margin-top:3px;
                border:3px solid white;
                border-radius:999px;
                background:${style.color};
                box-shadow:0 8px 18px rgba(15,23,42,.22);
                color:white;
                font-size:12px;
                font-weight:900;
              ">${style.glyph}</div>
            </div>`,
          iconSize: [150, 82],
          iconAnchor: [75, 76],
        })

        const marker = L.marker([stop.lat, stop.lng], {
          icon,
          keyboard: false,
          riseOnHover: true,
        }).addTo(map)
        layers.push(marker)
      })

      routeLayersRef.current = layers

      const fitPoints =
        geometry.actual.length > 0
          ? geometry.actual
          : stops.map(({ lat, lng }) => ({ lat, lng }))

      if (fitPoints.length > 0) {
        map.fitBounds(
          fitPoints.map((point) => [point.lat, point.lng]),
          {
            paddingTopLeft: [36, 105],
            paddingBottomRight: [36, 36],
            maxZoom: 15,
          }
        )
      }
    }

    void drawRoute()

    return () => {
      cancelled = true
    }
  }, [mapReady, room.passengers, room.settings, stops])

  return (
    <section className="px-4" aria-label="Driver and passenger route map">
      <div className="relative isolate h-[42vh] min-h-[300px] overflow-hidden rounded-3xl border border-border bg-muted shadow-xl">
        <div
          ref={mapContainerRef}
          className="absolute inset-0 z-0"
          aria-label="Interactive map showing driver route and passenger pickups"
        />

        <div className="pointer-events-none absolute right-3 top-3 z-[500] max-w-[12rem] rounded-2xl border border-white/80 bg-background/90 px-3 py-2 shadow-lg backdrop-blur-md">
          <div className="flex items-start gap-2">
            <Route
              className={`mt-0.5 size-4 shrink-0 ${
                routeComplete ? "text-emerald-600" : "text-amber-600"
              }`}
            />
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-foreground">
                {routeComplete ? "Complete route" : "Needs destination"}
              </p>
              <p className="mt-0.5 text-[10px] leading-tight text-muted-foreground">
                {summary.activePassengers.length} pickup
                {summary.activePassengers.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <div className="mt-2 flex items-center gap-3 text-[9px] font-semibold text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="h-1 w-3 rounded-full bg-slate-500" />
              Direct
            </span>
            <span className="flex items-center gap-1">
              <span
                className={`h-1 w-3 rounded-full ${
                  routeComplete ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
              Pickups
            </span>
          </div>
        </div>

        {!mapReady ? (
          <div className="absolute inset-0 z-[600] flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <p className="text-sm font-semibold text-foreground">
              Loading complete route...
            </p>
          </div>
        ) : null}
      </div>
    </section>
  )
}
