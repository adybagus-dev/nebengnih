"use client"

import { useEffect, useState } from "react"
import { ArrowRight, Car, History, Plus, Trash2, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useRoom } from "@/components/providers/room-provider"
import { persistRoom } from "@/lib/room/repository"
import {
  loadDriverRoomHistory,
  loadStoredActiveRoomCode,
  removeDriverRoomFromDevice,
  saveActiveRoomCode,
  subscribeToDriverRoomHistory,
  type DriverRoomHistoryEntry,
} from "@/lib/room/storage"

export function DriverEntryCard() {
  const router = useRouter()
  const { room, createRoom } = useRoom()
  const [history, setHistory] = useState<DriverRoomHistoryEntry[]>([])
  const [activeRoomCode, setActiveRoomCode] = useState<string | null>(null)
  const [createConfirmOpen, setCreateConfirmOpen] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<DriverRoomHistoryEntry | null>(null)

  useEffect(() => {
    function refreshRooms() {
      setHistory(loadDriverRoomHistory())
      setActiveRoomCode(loadStoredActiveRoomCode()?.toUpperCase() ?? null)
    }

    refreshRooms()
    return subscribeToDriverRoomHistory(refreshRooms)
  }, [])

  const activeRoom = history.find((entry) => entry.roomCode === activeRoomCode) ?? null
  const previousRooms = history.filter((entry) => entry.roomCode !== activeRoomCode)

  function openRoom(roomCode: string) {
    saveActiveRoomCode(roomCode)
    router.push(`/driver/${roomCode}`)
  }

  async function createNewRoom() {
    if (activeRoom) {
      await persistRoom(room, { trackAsDriver: true })
    }

    createRoom()
    setCreateConfirmOpen(false)
    router.push("/driver/empty")
  }

  function handleCreateClick() {
    if (history.length > 0) {
      setCreateConfirmOpen(true)
      return
    }

    void createNewRoom()
  }

  function handleRemoveRoom() {
    if (!removeTarget) return
    removeDriverRoomFromDevice(removeTarget.roomCode)
    setRemoveTarget(null)
  }

  return (
    <>
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
            <Car className="size-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">I am the Driver</p>
            <p className="text-xs text-muted-foreground">Continue a room or start a new route</p>
          </div>
        </div>

        {activeRoom ? (
          <button
            type="button"
            onClick={() => openRoom(activeRoom.roomCode)}
            className="flex w-full items-center justify-between rounded-xl bg-primary px-4 py-3.5 text-left text-primary-foreground shadow-md shadow-primary/25 transition-transform active:scale-[0.98]"
          >
            <span>
              <span className="block text-xs font-medium opacity-80">Continue current room</span>
              <span className="mt-0.5 block font-mono text-sm font-bold">{activeRoom.roomCode}</span>
            </span>
            <ArrowRight className="size-5" />
          </button>
        ) : null}

        <button
          type="button"
          onClick={handleCreateClick}
          className={
            activeRoom
              ? "mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary active:scale-[0.98]"
              : "flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-md shadow-primary/25 transition-transform active:scale-[0.98]"
          }
        >
          <Plus className="size-4" />
          Create New Route Room
        </button>

        {previousRooms.length > 0 ? (
          <div className="mt-5 border-t border-border pt-4">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <History className="size-3.5" />
              Previous rooms
            </p>

            <div className="space-y-2">
              {previousRooms.map((entry) => (
                <div
                  key={entry.roomCode}
                  className="flex items-center gap-2 rounded-xl border border-border bg-background p-3"
                >
                  <button
                    type="button"
                    onClick={() => openRoom(entry.roomCode)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <span className="block font-mono text-xs font-bold text-primary">
                      {entry.roomCode}
                    </span>
                    <span className="mt-1 block truncate text-xs text-muted-foreground">
                      {entry.origin} to {entry.destination}
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-label={`Remove ${entry.roomCode} from this device`}
                    onClick={() => setRemoveTarget(entry)}
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {createConfirmOpen ? (
        <div className="fixed inset-0 z-[1100] flex items-end justify-center bg-black/30 p-4 backdrop-blur-sm sm:items-center">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-room-title"
            className="w-full max-w-sm rounded-3xl border border-border bg-background p-5 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="create-room-title" className="text-lg font-bold text-foreground">
                  Create another room?
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  Your current room stays in Previous Rooms and its passenger link keeps working.
                </p>
              </div>
              <button
                type="button"
                aria-label="Cancel creating room"
                onClick={() => setCreateConfirmOpen(false)}
                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setCreateConfirmOpen(false)}
                className="flex-1 rounded-xl border border-border py-3 text-sm font-semibold text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void createNewRoom()}
                className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground"
              >
                Create New
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {removeTarget ? (
        <div className="fixed inset-0 z-[1100] flex items-end justify-center bg-black/30 p-4 backdrop-blur-sm sm:items-center">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="remove-room-title"
            className="w-full max-w-sm rounded-3xl border border-border bg-background p-5 shadow-2xl"
          >
            <h2 id="remove-room-title" className="text-lg font-bold text-foreground">
              Remove {removeTarget.roomCode}?
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              This only removes the room from this device. The shared passenger link will keep working.
            </p>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setRemoveTarget(null)}
                className="flex-1 rounded-xl border border-border py-3 text-sm font-semibold text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRemoveRoom}
                className="flex-1 rounded-xl bg-destructive py-3 text-sm font-bold text-white"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
