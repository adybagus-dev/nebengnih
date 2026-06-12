"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import { DEFAULT_ROOM_STATE } from "@/lib/room/defaults"
import { generateRoomCode, calculateRoomSummary } from "@/lib/room/calculations"
import { loadRoomState, saveRoomState } from "@/lib/room/storage"
import type { Passenger, RoomState, RoomSummary, RouteSettings } from "@/lib/room/types"

type RoomAction =
  | { type: "replace"; room: RoomState }
  | { type: "create-room" }
  | { type: "join-room"; roomCode: string }
  | { type: "set-driver-nickname"; driverNickname: string }
  | { type: "update-settings"; settings: Partial<RouteSettings> }
  | { type: "set-passenger-name"; id: string; name: string }
  | { type: "set-passenger-landmark"; id: string; pickupLandmark: string }
  | { type: "set-passenger-detour"; id: string; detourKm: number }
  | { type: "set-passenger-joining"; id: string; joiningToday: boolean }
  | { type: "upsert-passenger"; passenger: Passenger }
  | { type: "move-passenger"; id: string; direction: "up" | "down" }
  | { type: "remove-passenger"; id: string }

type RoomContextValue = {
  room: RoomState
  summary: RoomSummary
  createRoom: () => void
  joinRoom: (roomCode: string) => void
  setDriverNickname: (driverNickname: string) => void
  updateSettings: (settings: Partial<RouteSettings>) => void
  setPassengerName: (id: string, name: string) => void
  setPassengerLandmark: (id: string, pickupLandmark: string) => void
  setPassengerDetour: (id: string, detourKm: number) => void
  setPassengerJoining: (id: string, joiningToday: boolean) => void
  upsertPassenger: (passenger: Passenger) => void
  movePassenger: (id: string, direction: "up" | "down") => void
  removePassenger: (id: string) => void
}

const RoomContext = createContext<RoomContextValue | null>(null)

function roomReducer(state: RoomState, action: RoomAction): RoomState {
  switch (action.type) {
    case "replace":
      return action.room
    case "create-room":
      return {
        ...state,
        roomCode: generateRoomCode(),
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

export function RoomProvider({ children }: { children: ReactNode }) {
  const [room, setRoom] = useState<RoomState>(DEFAULT_ROOM_STATE)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setRoom(loadRoomState())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    saveRoomState(room)
  }, [hydrated, room])

  const summary = useMemo(() => calculateRoomSummary(room), [room])

  function dispatch(action: RoomAction) {
    setRoom((current) => roomReducer(current, action))
  }

  const value = useMemo<RoomContextValue>(
    () => ({
      room,
      summary,
      createRoom: () => dispatch({ type: "create-room" }),
      joinRoom: (roomCode: string) => dispatch({ type: "join-room", roomCode }),
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
      upsertPassenger: (passenger: Passenger) =>
        dispatch({ type: "upsert-passenger", passenger }),
      movePassenger: (id: string, direction: "up" | "down") =>
        dispatch({ type: "move-passenger", id, direction }),
      removePassenger: (id: string) => dispatch({ type: "remove-passenger", id }),
    }),
    [room, summary]
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
