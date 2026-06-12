"use client"

import { NebengNihLogo } from "./nebengnih-logo"
import { useRoom } from "@/components/providers/room-provider"

export function PassengerHeader() {
  const { summary } = useRoom()

  return (
    <header className="flex items-center justify-between gap-2 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3">
      <h1 className="flex items-center gap-1.5 text-lg font-bold tracking-tight text-primary">
        <NebengNihLogo className="size-7 text-primary" />
        <span>NebengNih</span>
      </h1>

      <div className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5">
        <span className="relative flex size-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-primary" />
        </span>
        <span className="font-mono text-xs font-bold tracking-wide text-primary">
          {summary.roomCode}
        </span>
      </div>
    </header>
  )
}
