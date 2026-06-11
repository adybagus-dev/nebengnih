"use client"

import { NebengNihLogo } from "./nebengnih-logo"

export function LandingNavbar() {
  return (
    <header className="flex items-center justify-between px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-3">
      <a
        href="/"
        className="flex items-center gap-2 text-lg font-bold tracking-tight text-primary"
        aria-label="NebengNih home"
      >
        <NebengNihLogo className="size-7 text-primary" />
        <span>NebengNih</span>
      </a>
    </header>
  )
}
