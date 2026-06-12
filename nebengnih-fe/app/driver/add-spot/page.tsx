"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { loadActiveRoomCode } from "@/lib/room/storage"

export default function DriverAddSpotRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace(`/driver/${loadActiveRoomCode()}/add-spot`)
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <p className="text-sm text-muted-foreground">Opening add spot flow...</p>
    </div>
  )
}
