"use client"

import { useState } from "react"
import { Users, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { useRoom } from "@/components/providers/room-provider"
import { roomExists } from "@/lib/room/repository"

export function PassengerEntryCard() {
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [checking, setChecking] = useState(false)
  const router = useRouter()
  const { joinRoom } = useRoom()

  async function handleJoin() {
    const normalizedCode = code.trim().toUpperCase()
    if (!normalizedCode) return

    setChecking(true)
    setError("")

    try {
      const exists = await roomExists(normalizedCode)
      if (!exists) {
        setError("That room code does not exist yet. Ask the driver for the correct code.")
        return
      }

      joinRoom(normalizedCode)
      router.push(`/room/${normalizedCode}`)
    } catch {
      setError("We could not check that room right now. Please try again.")
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex size-9 items-center justify-center rounded-xl bg-secondary">
          <Users className="size-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">I am a Passenger</p>
          <p className="text-xs text-muted-foreground">Enter the code your driver shared</p>
        </div>
      </div>

      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="Enter Room Code"
        maxLength={10}
        className="mb-3 w-full rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm font-medium text-foreground placeholder:font-sans placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        onKeyDown={(e) => e.key === "Enter" && handleJoin()}
        aria-label="Room code"
      />

      {error ? <p className="mb-3 text-xs leading-relaxed text-destructive">{error}</p> : null}

      <button
        type="button"
        onClick={() => void handleJoin()}
        disabled={checking}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-primary bg-background py-3.5 text-sm font-bold text-primary transition-colors hover:bg-primary/5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {checking ? "Checking..." : "Join Ride"}
        <ArrowRight className="size-4" />
      </button>
    </div>
  )
}
