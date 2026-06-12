type DriverSessionResponse = {
  driverSessionId: string | null
  lastActiveRoomCode: string | null
}

let cachedSession: DriverSessionResponse | null = null

export async function getDriverSession() {
  if (cachedSession) return cachedSession

  const response = await fetch("/api/driver-session", {
    method: "POST",
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error("Unable to load driver session")
  }

  cachedSession = (await response.json()) as DriverSessionResponse
  return cachedSession
}

export async function listDriverRooms() {
  const response = await fetch("/api/driver-rooms", {
    method: "GET",
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error("Unable to load driver rooms")
  }

  const payload = (await response.json()) as {
    activeRoomCode: string | null
    rooms: Array<{
      code: string
      driverNickname: string
      origin: string
      destination: string
      updatedAt: string
    }>
  }

  return {
    activeRoomCode: payload.activeRoomCode,
    rooms: payload.rooms.map((room) => ({
      roomCode: room.code,
      driverNickname: room.driverNickname,
      origin: room.origin,
      destination: room.destination,
      updatedAt: room.updatedAt,
    })),
  }
}

export async function saveDriverRoomPointer(roomCode: string) {
  await fetch("/api/driver-rooms", {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ roomCode }),
  })
}

export async function createDriverRoom(roomCode: string, payload: unknown) {
  const response = await fetch("/api/driver-rooms", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ roomCode, payload }),
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error ?? "Unable to create room")
  }
}
