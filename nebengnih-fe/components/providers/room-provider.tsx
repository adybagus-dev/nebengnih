"use client"

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react"
import type { ReactNode } from "react"
import { DEFAULT_ROOM_STATE } from "@/lib/room/defaults"
import { generateRoomCode, calculateRoomSummary } from "@/lib/room/calculations"
import { fetchRoom, persistRoom } from "@/lib/room/repository"
import type { Passenger, RoomState, RoomSummary, RouteMetrics, RouteSettings } from "@/lib/room/types"

type RoomAction =
  | { type: "replace"; room: RoomState }
  | { type: "create-room"; roomCode: string }
  | { type: "join-room"; roomCode: string }
  | { type: "set-driver-nickname"; driverNickname: string }
  | { type: "update-settings"; settings: Partial<RouteSettings> }
  | { type: "set-passenger-name"; id: string; name: string }
  | { type: "set-passenger-landmark"; id: string; pickupLandmark: string }
  | { type: "set-passenger-detour"; id: string; detourKm: number }
  | { type: "set-passenger-joining"; id: string; joiningToday: boolean }
  | { type: "set-route-metrics"; routeMetrics: RouteMetrics }
  | { type: "upsert-passenger"; passenger: Passenger }
  | { type: "reorder-passengers"; passengerIds: string[] }
  | { type: "move-passenger"; id: string; direction: "up" | "down" }
  | { type: "remove-passenger"; id: string }

type RoomContextValue = {
  room: RoomState
  summary: RoomSummary
  createRoom: () => string
  joinRoom: (roomCode: string) => void
  setDriverNickname: (driverNickname: string) => void
  updateSettings: (settings: Partial<RouteSettings>) => void
  setPassengerName: (id: string, name: string) => void
  setPassengerLandmark: (id: string, pickupLandmark: string) => void
  setPassengerDetour: (id: string, detourKm: number) => void
  setPassengerJoining: (id: string, joiningToday: boolean) => void
  setRouteMetrics: (routeMetrics: RouteMetrics) => void
  upsertPassenger: (passenger: Passenger) => void
  reorderPassengers: (passengerIds: string[]) => void
  movePassenger: (id: string, direction: "up" | "down") => void
  removePassenger: (id: string) => void
  refreshRoom: () => Promise<void>
}

const RoomContext = createContext<RoomContextValue | null>(null)

function roomSignature(room: RoomState) {
  return JSON.stringify({
    roomCode: room.roomCode,
    driverNickname: room.driverNickname,
    settings: room.settings,
    passengers: room.passengers,
    routeMetrics: room.routeMetrics
      ? {
          routeStatus: room.routeMetrics.routeStatus,
          baseDistanceKm: room.routeMetrics.baseDistanceKm,
          actualDistanceKm: room.routeMetrics.actualDistanceKm,
          detourDistanceKm: room.routeMetrics.detourDistanceKm,
        }
      : null,
  })
}

function roomReducer(state: RoomState, action: RoomAction): RoomState {
  switch (action.type) {
    case "replace":
      return action.room
    case "create-room":
      return {
        ...DEFAULT_ROOM_STATE,
        roomCode: action.roomCode,
      }
    case "join-room":
      return {
        ...state,
        roomCode: action.roomCode.toUpperCase(),
      }
    case "set-driver-nickname":
      return {
        ...state,
        driverNickname: action.driverNickname,
      }
    case "update-settings":
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.settings,
        },
      }
    case "set-passenger-name":
      return {
        ...state,
        passengers: state.passengers.map((passenger) =>
          passenger.id === action.id ? { ...passenger, name: action.name } : passenger
        ),
      }
    case "set-passenger-landmark":
      return {
        ...state,
        passengers: state.passengers.map((passenger) =>
          passenger.id === action.id ? { ...passenger, pickupLandmark: action.pickupLandmark } : passenger
        ),
      }
    case "set-passenger-detour":
      return {
        ...state,
        passengers: state.passengers.map((passenger) =>
          passenger.id === action.id ? { ...passenger, detourKm: action.detourKm } : passenger
        ),
      }
    case "set-passenger-joining":
      return {
        ...state,
        passengers: state.passengers.map((passenger) =>
          passenger.id === action.id ? { ...passenger, joiningToday: action.joiningToday } : passenger
        ),
      }
    case "set-route-metrics":
      return {
        ...state,
        routeMetrics: action.routeMetrics,
      }
    case "upsert-passenger": {
      const index = state.passengers.findIndex((passenger) => passenger.id === action.passenger.id)
      if (index === -1) {
        return {
          ...state,
          passengers: [...state.passengers, action.passenger],
        }
      }

      const passengers = [...state.passengers]
      passengers[index] = action.passenger
      return {
        ...state,
        passengers,
      }
    }
    case "reorder-passengers": {
      const byId = new Map(
        state.passengers.map((passenger) => [passenger.id, passenger])
      )
      const ordered = action.passengerIds
        .map((id) => byId.get(id))
        .filter((passenger): passenger is Passenger => Boolean(passenger))
      const orderedIds = new Set(action.passengerIds)

      return {
        ...state,
        passengers: [
          ...ordered,
          ...state.passengers.filter((passenger) => !orderedIds.has(passenger.id)),
        ],
      }
    }
    case "move-passenger": {
      const index = state.passengers.findIndex((passenger) => passenger.id === action.id)
      const nextIndex = action.direction === "up" ? index - 1 : index + 1
      if (index < 0 || nextIndex < 0 || nextIndex >= state.passengers.length) return state

      const passengers = [...state.passengers]
      const [selected] = passengers.splice(index, 1)
      passengers.splice(nextIndex, 0, selected)

      return {
        ...state,
        passengers,
      }
    }
    case "remove-passenger":
      return {
        ...state,
        passengers: state.passengers.filter((passenger) => passenger.id !== action.id),
      }
    default:
      return state
  }
}

export function RoomProvider({
  children,
  initialRoomCode,
}: {
  children: ReactNode
  initialRoomCode?: string
}) {
  const [room, setRoom] = useState<RoomState>(() => ({
    ...DEFAULT_ROOM_STATE,
    roomCode: (initialRoomCode ?? DEFAULT_ROOM_STATE.roomCode).toUpperCase(),
  }))
  const [hydrated, setHydrated] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const skipNextPersistRef = useRef(false)
  const trackAsDriverRef = useRef(Boolean(initialRoomCode))
  const userActionRef = useRef(false)
  const roomSignatureRef = useRef(roomSignature({
    ...DEFAULT_ROOM_STATE,
    roomCode: (initialRoomCode ?? DEFAULT_ROOM_STATE.roomCode).toUpperCase(),
  }))

  useEffect(() => {
    const roomCode = (initialRoomCode ?? "").toUpperCase()
    trackAsDriverRef.current = Boolean(initialRoomCode)
    if (!roomCode) {
      setHydrated(true)
      return
    }

    let cancelled = false

    async function load() {
      try {
        const nextRoom = await fetchRoom(roomCode)
        if (cancelled || userActionRef.current) return

        roomSignatureRef.current = roomSignature(nextRoom)
        setRoom(nextRoom)
        setHydrated(true)
      } catch (error) {
        console.error(error)
        if (!cancelled) {
          setHydrated(true)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [initialRoomCode])

  useEffect(() => {
    if (!hydrated) return
    if (!room.roomCode) return
    if (skipNextPersistRef.current) {
      skipNextPersistRef.current = false
      return
    }

    const nextSignature = roomSignature(room)
    if (roomSignatureRef.current === nextSignature) return
    roomSignatureRef.current = nextSignature

    void persistRoom(room, { trackAsDriver: trackAsDriverRef.current }).catch(console.error)
  }, [hydrated, room])

  const summary = useMemo(() => calculateRoomSummary(room), [room])

  function dispatch(action: RoomAction) {
    setRoom((current) => roomReducer(current, action))
  }

  const value = useMemo<RoomContextValue>(
    () => ({
      room,
      summary,
      createRoom: () => {
        const roomCode = generateRoomCode()
        userActionRef.current = true
        trackAsDriverRef.current = true
        setHydrated(true)
        dispatch({ type: "create-room", roomCode })
        return roomCode
      },
      joinRoom: (roomCode: string) => {
        userActionRef.current = true
        trackAsDriverRef.current = false
        skipNextPersistRef.current = true
        setHydrated(true)
        dispatch({ type: "join-room", roomCode })
      },
      setDriverNickname: (driverNickname: string) =>
        dispatch({ type: "set-driver-nickname", driverNickname }),
      updateSettings: (settings: Partial<RouteSettings>) =>
        dispatch({ type: "update-settings", settings }),
      setPassengerName: (id: string, name: string) =>
        dispatch({ type: "set-passenger-name", id, name }),
      setPassengerLandmark: (id: string, pickupLandmark: string) =>
        dispatch({ type: "set-passenger-landmark", id, pickupLandmark }),
      setPassengerDetour: (id: string, detourKm: number) =>
        dispatch({ type: "set-passenger-detour", id, detourKm }),
      setPassengerJoining: (id: string, joiningToday: boolean) =>
        dispatch({ type: "set-passenger-joining", id, joiningToday }),
      setRouteMetrics: (routeMetrics: RouteMetrics) =>
        dispatch({ type: "set-route-metrics", routeMetrics }),
      upsertPassenger: (passenger: Passenger) =>
        dispatch({ type: "upsert-passenger", passenger }),
      reorderPassengers: (passengerIds: string[]) =>
        dispatch({ type: "reorder-passengers", passengerIds }),
      movePassenger: (id: string, direction: "up" | "down") =>
        dispatch({ type: "move-passenger", id, direction }),
      removePassenger: (id: string) => dispatch({ type: "remove-passenger", id }),
      refreshRoom: async () => {
        if (!room.roomCode || refreshing) return

        setRefreshing(true)
        try {
          const nextRoom = await fetchRoom(room.roomCode)
          roomSignatureRef.current = roomSignature(nextRoom)
          skipNextPersistRef.current = true
          setRoom(nextRoom)
        } finally {
          setRefreshing(false)
        }
      },
    }),
    [room, summary, refreshing]
  )

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>
}

export function useRoom() {
  const context = useContext(RoomContext)
  if (!context) {
    throw new Error("useRoom must be used within a RoomProvider")
  }

  return context
}

export { DEFAULT_ROOM_STATE }
