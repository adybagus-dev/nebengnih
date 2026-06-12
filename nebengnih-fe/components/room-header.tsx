"use client"

import { AppHeader } from "@/components/app-header"

interface RoomHeaderProps {
  roomCode: string
}

export function RoomHeader({ roomCode }: RoomHeaderProps) {
  return (
    <AppHeader
      title="Passenger Room"
      backHref="/"
      backLabel="Back"
      roomCode={roomCode}
    />
  )
}
