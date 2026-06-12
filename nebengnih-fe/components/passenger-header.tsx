"use client"

import { AppHeader } from "@/components/app-header"
import { useRoom } from "@/components/providers/room-provider"

export function PassengerHeader() {
  const { summary, refreshRoom } = useRoom()

  return <AppHeader roomCode={summary.roomCode} live onRefresh={() => void refreshRoom()} />
}
