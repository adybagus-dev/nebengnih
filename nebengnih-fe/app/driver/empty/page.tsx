"use client"

import { useEffect, useState } from "react"
import { CheckSquare } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { RouteSettingsCard } from "@/components/route-settings-card"
import { InviteLinkSheet } from "@/components/invite-link-sheet"
import { useRoom } from "@/components/providers/room-provider"
import { persistRoom } from "@/lib/room/repository"

export default function DriverEmptyStatePage() {
  const [inviteOpen, setInviteOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const { room, createRoom } = useRoom()

  useEffect(() => {
    if (room.roomCode) return
    createRoom()
  }, [createRoom, room.roomCode])

  async function handleSaveRoute() {
    if (!room.roomCode) return
    setSaving(true)
    try {
      await persistRoom(room, { trackAsDriver: true })
      setInviteOpen(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
      <AppHeader title="Route Setup" backHref="/" backLabel="Cancel" />

      <main className="flex-1 pb-28">
        <RouteSettingsCard />
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md border-t border-border bg-background/80 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-lg">
        <button
          type="button"
          disabled={saving}
          onClick={() => void handleSaveRoute()}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-transform active:scale-[0.98]"
        >
          <CheckSquare className="size-5" />
          {saving ? "Saving Route..." : "Save Route & Invite"}
        </button>
      </footer>

      <InviteLinkSheet open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  )
}
