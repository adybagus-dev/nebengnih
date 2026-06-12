"use client"

import { useState } from "react"
import { CheckSquare } from "lucide-react"
import { useRouter } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { RouteSettingsCard } from "@/components/route-settings-card"
import { useRoom } from "@/components/providers/room-provider"
import { persistRoom } from "@/lib/room/repository"

export function EditRouteSession() {
  const router = useRouter()
  const { room } = useRoom()
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    await persistRoom(room, { trackAsDriver: true })
    router.push(`/driver/${room.roomCode}`)
  }

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
      <AppHeader
        title="Edit Route & Costs"
        backHref={`/driver/${room.roomCode}`}
        backLabel="Dashboard"
      />

      <main className="flex-1 pb-28">
        <RouteSettingsCard />
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md border-t border-border bg-background/80 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-lg">
        <button
          type="button"
          disabled={saving}
          onClick={() => void handleSave()}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
        >
          <CheckSquare className="size-5" />
          {saving ? "Saving Changes..." : "Save Route Changes"}
        </button>
      </footer>
    </div>
  )
}
