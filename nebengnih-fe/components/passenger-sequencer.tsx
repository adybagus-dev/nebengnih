"use client"

import { ArrowDown, ArrowUp, Navigation, Plus, SlidersHorizontal, Check } from "lucide-react"
import Link from "next/link"
import { useRoom } from "@/components/providers/room-provider"
import { formatMoney } from "@/lib/room/calculations"

export function PassengerSequencer() {
  const { room, summary, movePassenger, setPassengerJoining } = useRoom()

  return (
    <section className="px-4 pt-5" aria-label="Passenger lineup">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
          <span aria-hidden="true">🗓️</span>
          Today&apos;s Lineup &amp; Cost Split
        </h2>
        <Link
          href={`/driver/${room.roomCode}/edit`}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary active:scale-95"
        >
          <SlidersHorizontal className="size-3.5" />
          Edit Route &amp; Costs
        </Link>
      </div>

      <ul className="flex flex-col gap-2.5">
        {room.passengers.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-border bg-card px-4 py-6 text-center text-sm text-muted-foreground">
            No passengers are in this room yet. Add the first pickup spot to start the sequence.
          </li>
        ) : null}

        {room.passengers.map((passenger, index) => {
          const bill = summary.passengerBills.find((entry) => entry.id === passenger.id)

          return (
            <PassengerCard
              key={passenger.id}
              name={passenger.name}
              status={passenger.joiningToday ? `Detour: +${passenger.detourKm.toFixed(1)} km` : "Absent today"}
              cost={passenger.joiningToday ? formatMoney(bill?.total ?? 0) : "IDR 0"}
              active={passenger.joiningToday}
              canMoveUp={index > 0}
              canMoveDown={index < room.passengers.length - 1}
              onMoveUp={() => movePassenger(passenger.id, "up")}
              onMoveDown={() => movePassenger(passenger.id, "down")}
              onToggle={(next) => setPassengerJoining(passenger.id, next)}
            />
          )
        })}
      </ul>

      <Link
        href={`/driver/${room.roomCode}/add-spot`}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-transparent py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary active:scale-[0.99]"
      >
        <Plus className="size-4" />
        Add New Spot Manually
      </Link>
    </section>
  )
}

function PassengerCard({
  name,
  status,
  cost,
  active,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onToggle,
}: {
  name: string
  status: string
  cost: string
  active: boolean
  canMoveUp: boolean
  canMoveDown: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  onToggle: (next: boolean) => void
}) {
  return (
    <li
      className={`flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition-opacity ${
        active ? "" : "opacity-50"
      }`}
    >
      <div className="flex flex-col gap-1">
        <button
          type="button"
          aria-label={`Move ${name} up`}
          onClick={onMoveUp}
          disabled={!canMoveUp}
          className="rounded-md p-0.5 text-muted-foreground disabled:opacity-25"
        >
          <ArrowUp className="size-3.5" />
        </button>
        <button
          type="button"
          aria-label={`Move ${name} down`}
          onClick={onMoveDown}
          disabled={!canMoveDown}
          className="rounded-md p-0.5 text-muted-foreground disabled:opacity-25"
        >
          <ArrowDown className="size-3.5" />
        </button>
      </div>

      <button
        type="button"
        onClick={() => onToggle(!active)}
        aria-pressed={active}
        aria-label={`${name} attending`}
        className={`flex size-5 shrink-0 items-center justify-center rounded-md border ${
          active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-transparent"
        }`}
      >
        {active && <Check className="size-3.5" strokeWidth={3} />}
      </button>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{name}</p>
        <p className="truncate text-xs text-muted-foreground">({status})</p>
      </div>

      {active ? (
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(status)}`}
          target="_blank"
          rel="noreferrer"
          className="flex shrink-0 items-center gap-1 rounded-lg bg-accent px-2.5 py-1.5 text-xs font-semibold text-accent-foreground shadow-sm ring-1 ring-primary/15 transition-transform active:scale-95"
        >
          <Navigation className="size-3.5" />
          Open Map
        </a>
      ) : null}

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
