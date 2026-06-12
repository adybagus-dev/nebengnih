"use client"

import { useState } from "react"
import { ClipboardList } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard-header"
import { RouteMap } from "@/components/route-map"
import { PassengerSequencer } from "@/components/passenger-sequencer"
import { RideStats } from "@/components/ride-stats"
import { SettingsSheet } from "@/components/settings-sheet"
import { LedgerModal } from "@/components/ledger-modal"
import { buildLedgerText } from "@/lib/room/calculations"
import { useRoom } from "@/components/providers/room-provider"

export default function DriverDashboardPage() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [ledgerOpen, setLedgerOpen] = useState(false)
  const { summary } = useRoom()

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
        <PassengerSequencer onSettingsClick={() => setSettingsOpen(true)} />
        <RideStats />
      </main>

      {/* Sticky footer CTA */}
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

      <SettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} />
      <LedgerModal open={ledgerOpen} onClose={() => setLedgerOpen(false)} />
    </div>
  )
}
