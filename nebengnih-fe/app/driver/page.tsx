"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { listDriverRooms } from "@/lib/driver-session"

export default function DriverRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const result = await listDriverRooms()
        if (cancelled) return

        router.replace(result.activeRoomCode ? `/driver/${result.activeRoomCode}` : "/")
      } catch {
        if (!cancelled) router.replace("/")
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <p className="text-sm text-muted-foreground">Opening your driver room...</p>
    </div>
  )
}
