"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronRight, Lightbulb, MapPin, Search } from "lucide-react"

// Bogor neighborhood near an Indomaret
const DEFAULT_CENTER: [number, number] = [-6.5984, 106.7988]
const INDOMARET_COORDS: [number, number] = [-6.5981, 106.7993]
const PIN_COORDS: [number, number] = [-6.5987, 106.799]

type Coordinates = {
  lat: number
  lng: number
}

type SearchResult = {
  display_name: string
  lat: string
  lon: string
}

interface PickupMapPreviewProps {
  landmark: string
  initialCoordinates?: Coordinates
  onCoordinatesChange?: (coordinates: Coordinates) => void
  onLandmarkChange?: (landmark: string) => void
  title?: string
  description?: string
  searchPlaceholder?: string
  statusLabel?: string
  manualHint?: string
  enableCurrentLocation?: boolean
  compact?: boolean
}

function buildDisplayLabel(displayName: string) {
  return displayName.split(",").slice(0, 3).join(", ").trim() || displayName
}

export function PickupMapPreview({
  landmark,
  initialCoordinates,
  onCoordinatesChange,
  onLandmarkChange,
  title = "Search or drop your pickup pin",
  description = "Tap anywhere on the map or drag the green pin to set the pickup point manually. You can also search for a landmark above.",
  searchPlaceholder = "Search a place, road, or landmark",
  statusLabel = "Location helps us start closer to you",
  manualHint = "Turn on location to start from your current spot, then fine tune the pin on the map.",
  enableCurrentLocation = true,
  compact = false,
}: PickupMapPreviewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<import("leaflet").Map | null>(null)
  const pinMarkerRef = useRef<import("leaflet").Marker | null>(null)
  const onCoordinatesChangeRef = useRef(onCoordinatesChange)
  const onLandmarkChangeRef = useRef(onLandmarkChange)
  const manualChangeRef = useRef(false)
  const locationRequestedRef = useRef(false)
  const [mounted, setMounted] = useState(false)
  const [coordinates, setCoordinates] = useState(
    initialCoordinates ?? { lat: PIN_COORDS[0], lng: PIN_COORDS[1] }
  )
  const [geoStatus, setGeoStatus] = useState<"idle" | "loading" | "ready" | "denied" | "unsupported">("idle")
  const [geoMessage, setGeoMessage] = useState("")
  const [searchText, setSearchText] = useState(landmark)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState("")

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    onCoordinatesChangeRef.current = onCoordinatesChange
  }, [onCoordinatesChange])

  useEffect(() => {
    onLandmarkChangeRef.current = onLandmarkChange
  }, [onLandmarkChange])

  useEffect(() => {
    setSearchText(landmark)
  }, [landmark])

  useEffect(() => {
    if (!mounted) return
    if (typeof window === "undefined") return
    if (!enableCurrentLocation) {
      setGeoStatus("idle")
      setGeoMessage("")
      return
    }
    if (locationRequestedRef.current) return
    locationRequestedRef.current = true
    if (!("geolocation" in navigator)) {
      setGeoStatus("unsupported")
      setGeoMessage("This browser cannot access location. You can still tap or drag the pin manually.")
      return
    }

    setGeoStatus("loading")
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextCoordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }

        if (
          !manualChangeRef.current &&
          (!initialCoordinates || landmark === "Current location")
        ) {
          setCoordinates(nextCoordinates)
          onCoordinatesChangeRef.current?.(nextCoordinates)
        }

        setGeoStatus("ready")
        void (async () => {
          const address = await reverseGeocode(nextCoordinates.lat, nextCoordinates.lng)
          if (address && !manualChangeRef.current) {
            setSearchText(address)
            onLandmarkChangeRef.current?.(address)
          } else if (!manualChangeRef.current) {
            setSearchText("Current location")
            onLandmarkChangeRef.current?.("Current location")
          }
        })()
        setGeoMessage("Current location is on. We started from your position.")
      },
      () => {
        setGeoStatus("denied")
        setGeoMessage("Turn on location to start from your current spot. You can still place the pin manually.")
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    )
  }, [enableCurrentLocation, initialCoordinates, landmark, mounted])

  useEffect(() => {
    if (!mounted) return
    if (typeof window === "undefined") return
    if (mapInstanceRef.current) return

    import("leaflet").then((L) => {
      if (!mapRef.current) return

      // Fix default icon paths for Next.js
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      })

      const map = L.map(mapRef.current!, {
        center: DEFAULT_CENTER,
        zoom: 17,
        zoomControl: false,
        attributionControl: false,
        dragging: true,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: true,
      })

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        crossOrigin: "anonymous",
      }).addTo(map)

      const indomaretIcon = L.divIcon({
        className: "",
        html: `<div style="
          background:oklch(0.6 0.18 250);
          color:#fff;
          font-size:10px;
          font-weight:700;
          padding:3px 7px;
          border-radius:6px;
          white-space:nowrap;
          border:1.5px solid rgba(255,255,255,0.4);
          box-shadow:0 2px 8px rgba(0,0,0,0.25);
          transform:translateX(-50%);
        ">Indomaret</div>`,
        iconSize: [80, 24],
        iconAnchor: [40, 12],
      })
      L.marker(INDOMARET_COORDS, { icon: indomaretIcon }).addTo(map)

      const makePinIcon = () =>
        L.divIcon({
          className: "",
          html: `<div style="position:relative;width:32px;height:32px;">
            <div style="
              position:absolute;inset:0;
              background:oklch(0.7 0.15 162 / 0.25);
              border-radius:50%;
            "></div>
            <div style="
              position:absolute;top:50%;left:50%;
              transform:translate(-50%,-50%);
              width:16px;height:16px;
              background:oklch(0.7 0.15 162);
              border-radius:50%;
              border:3px solid #fff;
              box-shadow:0 0 12px oklch(0.7 0.15 162 / 0.9), 0 0 24px oklch(0.7 0.15 162 / 0.4);
            "></div>
          </div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        })

      const updateManualPin = async (nextCoordinates: Coordinates) => {
        manualChangeRef.current = true
        setCoordinates(nextCoordinates)
        pinMarkerRef.current?.setLatLng([nextCoordinates.lat, nextCoordinates.lng])
        map.panTo([nextCoordinates.lat, nextCoordinates.lng])
        onCoordinatesChangeRef.current?.(nextCoordinates)

        try {
          const address = await reverseGeocode(nextCoordinates.lat, nextCoordinates.lng)
          if (address) {
            setSearchText(address)
            onLandmarkChangeRef.current?.(address)
          }
        } catch {
          // Keep the selected pin even if reverse lookup fails.
        }
      }

      const pinMarker = L.marker([coordinates.lat, coordinates.lng], {
        icon: makePinIcon(),
        draggable: true,
      }).addTo(map)
      pinMarkerRef.current = pinMarker
      mapInstanceRef.current = map

      requestAnimationFrame(() => {
        setTimeout(() => map.invalidateSize(), 150)
      })

      map.on("click", async (e) => {
        await updateManualPin({ lat: e.latlng.lat, lng: e.latlng.lng })
      })

      pinMarker.on("dragend", async () => {
        const nextPosition = pinMarker.getLatLng()
        await updateManualPin({ lat: nextPosition.lat, lng: nextPosition.lng })
      })
    })

    return () => {
      mapInstanceRef.current?.remove()
      mapInstanceRef.current = null
      pinMarkerRef.current = null
    }
  }, [mounted])

  useEffect(() => {
    if (!mounted) return
    if (!initialCoordinates) return

    setCoordinates(initialCoordinates)
    pinMarkerRef.current?.setLatLng([initialCoordinates.lat, initialCoordinates.lng])
    mapInstanceRef.current?.panTo([initialCoordinates.lat, initialCoordinates.lng])
  }, [initialCoordinates, mounted])

  useEffect(() => {
    if (!mounted) return
    const map = mapInstanceRef.current
    const pinMarker = pinMarkerRef.current
    if (!map || !pinMarker) return

    pinMarker.setLatLng([coordinates.lat, coordinates.lng])
    map.panTo([coordinates.lat, coordinates.lng])
  }, [coordinates, mounted])

  async function handleSearch() {
    const query = searchText.trim()
    if (!query) return

    setSearching(true)
    setSearchError("")

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=${encodeURIComponent(query)}`,
        { cache: "no-store" }
      )

      if (!response.ok) throw new Error("Search failed")

      const results = (await response.json()) as SearchResult[]
      setSearchResults(results)
      if (results.length === 0) {
        setSearchError("No places found. Try a nearby street, landmark, or building.")
      }
    } catch {
      setSearchResults([])
      setSearchError("Search temporarily unavailable. Try again or tap the map directly.")
    } finally {
      setSearching(false)
    }
  }

  async function handleSelectResult(result: SearchResult) {
    const nextCoordinates = {
      lat: Number(result.lat),
      lng: Number(result.lon),
    }
    const nextLabel = buildDisplayLabel(result.display_name)

    setSearchText(nextLabel)
    setSearchResults([])
    setCoordinates(nextCoordinates)
    onCoordinatesChangeRef.current?.(nextCoordinates)
    onLandmarkChangeRef.current?.(nextLabel)

    const map = mapInstanceRef.current
    const pinMarker = pinMarkerRef.current
    if (map && pinMarker) {
      pinMarker.setLatLng([nextCoordinates.lat, nextCoordinates.lng])
      map.panTo([nextCoordinates.lat, nextCoordinates.lng])
    }
  }

  return (
    <section className={compact ? "px-0" : "px-4 pt-5"}>
      <div className="relative z-0 isolate overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className={compact ? "border-b border-border p-3" : "border-b border-border p-4"}>
          <div className="mb-2 flex items-center gap-2">
            <Search className="size-4 shrink-0 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          </div>

          <div className="flex gap-2">
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder={searchPlaceholder}
              className="min-w-0 flex-1 rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
            />
            <button
              type="button"
              onClick={handleSearch}
              disabled={searching}
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {searching ? "Searching..." : "Search"}
            </button>
          </div>

          <div className="mt-2 flex items-start gap-2 rounded-xl border border-border bg-secondary px-3 py-2.5">
            <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground">
                {geoStatus === "ready" ? "Using your current location" : statusLabel}
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">{geoMessage || manualHint}</p>
            </div>
          </div>

          {searchError ? (
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{searchError}</p>
          ) : null}

          {searchResults.length > 0 ? (
            <div className="mt-3 space-y-2">
              {searchResults.map((result) => (
                <button
                  key={`${result.lat}-${result.lon}-${result.display_name}`}
                  type="button"
                  onClick={() => {
                    void handleSelectResult(result)
                  }}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 py-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {buildDisplayLabel(result.display_name)}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {result.display_name}
                    </p>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div
          ref={mapRef}
          className={compact ? "h-[16rem] w-full bg-muted sm:h-[18rem]" : "h-[21rem] w-full bg-muted sm:h-[24rem]"}
          aria-label="Pickup location map"
        />

        {compact ? null : (
          <div className="flex items-start gap-2 border-t border-border bg-card px-4 py-3">
            <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              {description}
              {landmark ? ` Current landmark: ${landmark}.` : ""}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

async function reverseGeocode(lat: number, lng: number) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
    { cache: "no-store" }
  )

  if (!response.ok) return ""

  const data = (await response.json()) as { display_name?: string }
  return data.display_name ? buildDisplayLabel(data.display_name) : ""
}
