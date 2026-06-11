"use client"

import { GripVertical, Navigation, Check, Plus, SlidersHorizontal } from "lucide-react"
import Link from "next/link"

type Passenger = {
  id: string
  name: string
  status: string
  cost: string
  active: boolean
}

const passengers: Passenger[] = [
  { id: "andi", name: "Andi", status: "Detour: +2.4 km", cost: "IDR 22,500", active: true },
  { id: "budi", name: "Budi", status: "On the way", cost: "IDR 25,000", active: true },
  { id: "tiara", name: "Tiara", status: "Absent today", cost: "IDR 0", active: false },
]

interface PassengerSequencerProps {
  onSettingsClick?: () => void
}

export function PassengerSequencer({ onSettingsClick }: PassengerSequencerProps) {
  return (
    <section className="px-4 pt-5" aria-label="Passenger lineup">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
          <span aria-hidden="true">🗓️</span>
          Today&apos;s Lineup &amp; Cost Split
        </h2>
        <button
          type="button"
          onClick={onSettingsClick}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary active:scale-95"
        >
          <SlidersHorizontal className="size-3.5" />
          Edit Route &amp; Costs
        </button>
      </div>

      <ul className="flex flex-col gap-2.5">
        {passengers.map((p) => (
          <PassengerCard key={p.id} passenger={p} />
        ))}
      </ul>

      <Link
        href="/driver/add-spot"
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-transparent py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary active:scale-[0.99]"
      >
        <Plus className="size-4" />
        Add New Spot Manually
      </Link>
    </section>
  )
}

function PassengerCard({ passenger }: { passenger: Passenger }) {
  const { name, status, cost, active } = passenger

  return (
    <li
      className={`flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition-opacity ${
        active ? "" : "opacity-50"
      }`}
    >
      {/* drag handle */}
      <button
        type="button"
        aria-label={`Reorder ${name}`}
        className="-ml-1 cursor-grab text-muted-foreground active:cursor-grabbing"
      >
        <GripVertical className="size-5" />
      </button>

      {/* checkbox */}
      <span
        role="checkbox"
        aria-checked={active}
        aria-label={`${name} attending`}
        className={`flex size-5 shrink-0 items-center justify-center rounded-md border ${
          active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-transparent"
        }`}
      >
        {active && <Check className="size-3.5" strokeWidth={3} />}
      </span>

      {/* name + status */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{name}</p>
        <p className="truncate text-xs text-muted-foreground">({status})</p>
      </div>

      {/* navigate */}
      {active && (
        <button
          type="button"
          className="flex shrink-0 items-center gap-1 rounded-lg bg-accent px-2.5 py-1.5 text-xs font-semibold text-accent-foreground shadow-sm ring-1 ring-primary/15 transition-transform active:scale-95"
        >
          <Navigation className="size-3.5" />
          Navigate
        </button>
      )}

      {/* cost */}
      <span
        className={`shrink-0 text-right font-mono text-xs font-bold tabular-nums ${
          active ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        {cost}
      </span>
    </li>
  )
}
