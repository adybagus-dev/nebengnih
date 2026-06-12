import { LandingNavbar } from "@/components/landing-navbar"
import { DriverEntryCard } from "@/components/driver-entry-card"
import { PassengerEntryCard } from "@/components/passenger-entry-card"
import { Lock } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
      <LandingNavbar />

      <main className="flex flex-1 flex-col px-5 pb-24 pt-6">
        {/* Hero */}
        <section className="mb-8 text-center" aria-label="Hero">
          <h1 className="text-balance text-[1.65rem] font-extrabold leading-tight tracking-tight text-foreground">
            Nebeng-nih?{" "}
            <span className="text-primary">No logins.</span>{" "}
            <br className="hidden sm:block" />
            Just fair fuel splits with your sirkel.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">
            Create a room, share a code, split the cost — zero sign-ups, zero
            tracking.
          </p>
        </section>

        {/* Cards */}
        <div className="flex flex-col gap-3">
          <DriverEntryCard />
          <PassengerEntryCard />
        </div>
      </main>

      {/* Trust badge */}
      <footer className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md border-t border-border bg-background/80 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-lg">
        <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="size-3.5 shrink-0 text-primary" />
          100% Anonymous. No passwords, no emails, no tracking.
        </p>
      </footer>
    </div>
  )
}
