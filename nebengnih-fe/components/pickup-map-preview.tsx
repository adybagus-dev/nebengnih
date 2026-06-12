"use client"

import { useEffect, useRef, useState } from "react"
import { Lightbulb } from "lucide-react"

// Bogor neighborhood near an Indomaret
const DEFAULT_CENTER: [number, number] = [-6.5984, 106.7988]
const INDOMARET_COORDS: [number, number] = [-6.5981, 106.7993]
const PIN_COORDS: [number, number] = [-6.5987, 106.799]

interface PickupMapPreviewProps {
  landmark: string
}

export function PickupMapPreview({ landmark }: PickupMapPreviewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<import("leaflet").Map | null>(null)
  const pinMarkerRef = useRef<import("leaflet").Marker | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
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

      // Indomaret label marker — uses blue from the first screen's pin-blue token
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

      // Glowing emerald pickup pin — matches --primary (#10B981 / oklch 0.7 0.15 162)
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

      const pinMarker = L.marker(PIN_COORDS, { icon: makePinIcon() }).addTo(map)
      pinMarkerRef.current = pinMarker

      mapInstanceRef.current = map

      // Force Leaflet to recalculate size after React paint
      requestAnimationFrame(() => {
        setTimeout(() => map.invalidateSize(), 150)
      })

      // Tap anywhere to move pin
      map.on("click", (e) => {
        const { lat, lng } = e.latlng
        pinMarkerRef.current?.setLatLng([lat, lng])
        map.panTo([lat, lng])
      })
    })

    return () => {
      mapInstanceRef.current?.remove()
      mapInstanceRef.current = null
      pinMarkerRef.current = null
    }
  }, [mounted])

  return (
    <section className="px-4 pt-5">
      {/* Leaflet CSS */}
      {mounted && (
        // eslint-disable-next-line @next/next/no-page-custom-font
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        />
      )}

      <div className="overflow-hidden rounded-2xl border border-border">
        {/* Map container */}
        <div
          ref={mapRef}
          className="h-52 w-full bg-muted"
          aria-label="Pickup location map"
        />

        {/* Tap-to-move hint */}
        <div className="flex items-start gap-2 border-t border-border bg-card px-4 py-3">
          <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Need to move? Tap anywhere on the map above to update your driver
            with your precise pickup landmark instantly.
            {landmark ? ` Current landmark: ${landmark}.` : ""}
          </p>
        </div>
      </div>
    </section>
  )
}
