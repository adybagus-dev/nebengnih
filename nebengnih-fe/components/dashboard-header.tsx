"use client"

import { NebengNihLogo } from "./nebengnih-logo"

export function DashboardHeader() {
  return (
    <header className="flex items-center justify-between gap-2 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3">
      <h1 className="flex items-center gap-1.5 text-lg font-bold tracking-tight text-primary">
        <NebengNihLogo className="size-7 text-primary" />
        <span>NebengNih</span>
      </h1>

      <span className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 font-mono text-xs font-bold tracking-wide text-primary">
        BGR-99A
      </span>
    </header>
  )
}
