"use client"

import { Car } from "lucide-react"
import { useRouter } from "next/navigation"

export function DriverEntryCard() {
  const router = useRouter()

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
          <Car className="size-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">I am the Driver</p>
          <p className="text-xs text-muted-foreground">Set your route, invite the sirkel</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => router.push("/driver/empty")}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-md shadow-primary/25 transition-transform active:scale-[0.98]"
      >
        <Car className="size-4" />
        Create New Route Room
      </button>

      <p className="mt-2.5 text-center text-xs text-muted-foreground">
        Generates an anonymous room code instantly.
      </p>
    </div>
  )
}
