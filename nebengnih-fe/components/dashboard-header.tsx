"use client"

import { AppHeader } from "@/components/app-header"
import { useRoom } from "@/components/providers/room-provider"

export function DashboardHeader() {
  const { summary } = useRoom()

  return (
    <AppHeader
      title="Driver Dashboard"
      backHref="/"
      backLabel="Back"
      roomCode={summary.roomCode}
    />
  )
}
