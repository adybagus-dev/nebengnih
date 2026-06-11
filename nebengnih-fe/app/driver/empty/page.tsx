"use client"

import { useState } from "react"
import { NebengNihLogo } from "@/components/nebengnih-logo"
import { Settings } from "lucide-react"
import { EmptyRouteMap } from "@/components/empty-route-map"
import { InviteWizardCard } from "@/components/invite-wizard-card"
import { SettingsSheet } from "@/components/settings-sheet"

export default function DriverEmptyStatePage() {
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
      {/* Header — identical to driver dashboard */}
      <header className="flex items-center justify-between gap-2 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3">
        <h1 className="flex items-center gap-1.5 text-lg font-bold tracking-tight text-primary">
          <NebengNihLogo className="size-7 text-primary" />
          <span>NebengNih</span>
        </h1>

        <div className="flex items-center gap-2">
          <span className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 font-mono text-xs font-bold tracking-wide text-primary">
            BGR-99A
          </span>
          <button
            type="button"
            aria-label="Room settings"
            onClick={() => setSettingsOpen(true)}
            className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground active:scale-95"
          >
            <Settings className="size-[18px]" />
          </button>
        </div>
      </header>

      <main className="flex-1 pb-10">
        <EmptyRouteMap />
        <InviteWizardCard />
      </main>

      <SettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  )
}
