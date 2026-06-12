"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { loadStoredActiveRoomCode } from "@/lib/room/storage"

export default function DriverRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    const roomCode = loadStoredActiveRoomCode()
    router.replace(roomCode ? `/driver/${roomCode}` : "/")
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <p className="text-sm text-muted-foreground">Opening your driver room...</p>
    </div>
  )
}
