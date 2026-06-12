"use client"

import { useEffect, useState } from "react"
import { ClipboardList } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard-header"
import { RouteMap } from "@/components/route-map"
import { PassengerSequencer } from "@/components/passenger-sequencer"
import { RideStats } from "@/components/ride-stats"
import { LedgerModal } from "@/components/ledger-modal"
import { buildLedgerText } from "@/lib/room/calculations"
import { fetchRouteMetrics } from "@/lib/room/osrm"
import { useRoom } from "@/components/providers/room-provider"

export function DriverDashboardShell() {
  const [ledgerOpen, setLedgerOpen] = useState(false)
  const { room, summary, setRouteMetrics } = useRoom()

  useEffect(() => {
    let cancelled = false

    async function updateRouteMetrics() {
      setRouteMetrics({
        routeStatus: "loading",
        updatedAt: new Date().toISOString(),
      })

      const metrics = await fetchRouteMetrics(room.settings, room.passengers)
      if (cancelled) return

      setRouteMetrics({
        ...metrics,
        updatedAt: new Date().toISOString(),
      })
    }

    void updateRouteMetrics()

    return () => {
      cancelled = true
    }
  }, [room.settings, room.passengers])

  async function handleCopyLedger() {
    const ledgerText = buildLedgerText(summary)

    try {
      await navigator.clipboard.writeText(ledgerText)
    } catch {
      // fallback: modal still opens even if clipboard is denied
    }
    setLedgerOpen(true)
  }

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
      <DashboardHeader />

      <main className="flex-1 pb-28">
        <RouteMap />
        <PassengerSequencer />
        <RideStats />
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md border-t border-border bg-background/80 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-lg">
        <button
          type="button"
          onClick={handleCopyLedger}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-transform active:scale-[0.98]"
        >
          <ClipboardList className="size-5" />
          Copy WhatsApp Ledger
        </button>
      </footer>

      <LedgerModal open={ledgerOpen} onClose={() => setLedgerOpen(false)} />
    </div>
  )
}
