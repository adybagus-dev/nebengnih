"use client"

import { Apple, ExternalLink, Map, Navigation, X } from "lucide-react"
import { useRoom } from "@/components/providers/room-provider"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

type RouteNavigationSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Point = {
  lat: number
  lng: number
}

function isPoint(lat?: number, lng?: number): lat is number {
  return Number.isFinite(lat) && Number.isFinite(lng)
}

function pointLabel(point: Point) {
  return `${point.lat},${point.lng}`
}

export function RouteNavigationSheet({
  open,
  onOpenChange,
}: RouteNavigationSheetProps) {
  const { room } = useRoom()
  const origin =
    isPoint(room.settings.originLat, room.settings.originLng)
      ? {
          lat: room.settings.originLat,
          lng: room.settings.originLng as number,
        }
      : null
  const destination =
    isPoint(room.settings.destinationLat, room.settings.destinationLng)
      ? {
          lat: room.settings.destinationLat,
          lng: room.settings.destinationLng as number,
        }
      : null
  const pickups = room.passengers
    .filter(
      (passenger) =>
        passenger.joiningToday &&
        isPoint(passenger.pickupLat, passenger.pickupLng)
    )
    .map((passenger) => ({
      lat: passenger.pickupLat as number,
      lng: passenger.pickupLng as number,
    }))
  const nextStop = pickups[0] ?? destination
  const routeReady = Boolean(origin && destination)

  const googleUrl =
    origin && destination
      ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
          pointLabel(origin)
        )}&destination=${encodeURIComponent(pointLabel(destination))}${
          pickups.length > 0
            ? `&waypoints=${encodeURIComponent(
                pickups.map(pointLabel).join("|")
              )}`
            : ""
        }&travelmode=driving&dir_action=navigate`
      : ""
  const appleUrl =
    origin && nextStop
      ? `https://maps.apple.com/?saddr=${encodeURIComponent(
          pointLabel(origin)
        )}&daddr=${encodeURIComponent(pointLabel(nextStop))}&dirflg=d`
      : ""
  const wazeUrl = nextStop
    ? `https://waze.com/ul?ll=${encodeURIComponent(
        pointLabel(nextStop)
      )}&navigate=yes`
    : ""

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="mx-auto max-w-md overflow-hidden rounded-t-3xl border-border bg-background p-0"
      >
        <SheetHeader className="flex flex-row items-center justify-between border-b border-border px-5 py-4">
          <div>
            <SheetTitle className="text-base font-bold text-foreground">
              Open route with
            </SheetTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Start, {pickups.length} pickup{pickups.length === 1 ? "" : "s"},
              then destination
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close navigation options"
            className="flex size-9 items-center justify-center rounded-xl border border-border text-muted-foreground"
          >
            <X className="size-4" />
          </button>
        </SheetHeader>

        <div className="space-y-2 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {!routeReady ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900">
              Add both the driver start and final destination before starting navigation.
            </p>
          ) : null}
          {pickups.length > 3 ? (
            <p className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-900">
              Some mobile browsers support only three intermediate stops. The Google Maps app may support more.
            </p>
          ) : null}

          <NavigationOption
            href={googleUrl}
            disabled={!routeReady}
            icon={<Map className="size-5" />}
            title="Google Maps"
            description="Full route, opens in the app or browser"
            primary
          />
          <NavigationOption
            href={appleUrl}
            disabled={!appleUrl}
            icon={<Apple className="size-5" />}
            title="Apple Maps"
            description="Opens the next pickup"
          />
          <NavigationOption
            href={wazeUrl}
            disabled={!wazeUrl}
            icon={<Navigation className="size-5" />}
            title="Waze"
            description="Opens the next pickup"
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}

function NavigationOption({
  href,
  disabled,
  icon,
  title,
  description,
  primary = false,
}: {
  href: string
  disabled: boolean
  icon: React.ReactNode
  title: string
  description: string
  primary?: boolean
}) {
  return (
    <a
      href={disabled ? undefined : href}
      target="_blank"
      rel="noreferrer"
      aria-disabled={disabled}
      className={`flex items-center gap-3 rounded-2xl border p-3 transition-transform ${
        disabled
          ? "pointer-events-none border-border bg-muted opacity-45"
          : primary
            ? "border-primary bg-primary text-primary-foreground active:scale-[0.99]"
            : "border-border bg-card text-foreground active:scale-[0.99]"
      }`}
    >
      <span
        className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
          primary ? "bg-white/15" : "bg-secondary text-primary"
        }`}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold">{title}</span>
        <span
          className={`block text-xs ${
            primary ? "text-primary-foreground/75" : "text-muted-foreground"
          }`}
        >
          {description}
        </span>
      </span>
      <ExternalLink className="size-4 shrink-0 opacity-70" />
    </a>
  )
}
