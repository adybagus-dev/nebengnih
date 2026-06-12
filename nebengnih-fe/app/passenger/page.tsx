"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { loadActiveRoomCode } from "@/lib/room/storage"

export default function PassengerRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace(`/room/${loadActiveRoomCode()}`)
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <p className="text-sm text-muted-foreground">Opening your room...</p>
    </div>
  )
}
