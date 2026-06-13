"use client"

import { useState } from "react"
import { CheckSquare } from "lucide-react"
import { useRouter } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { RouteSettingsCard } from "@/components/route-settings-card"
import { RouteValidationSheet } from "@/components/route-validation-sheet"
import { useRoom } from "@/components/providers/room-provider"
import { persistRoom } from "@/lib/room/repository"
import { getMissingRouteSetupFields } from "@/lib/room/validation"

export function EditRouteSession() {
  const router = useRouter()
  const { room } = useRoom()
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [validationOpen, setValidationOpen] = useState(false)
  const missingFields = getMissingRouteSetupFields(room.settings, room.driverNickname)
  const canSave = missingFields.length === 0 && !saving

  async function handleSave() {
    setSaving(true)
    setSaveError("")

    try {
      await persistRoom(room, { trackAsDriver: true })
      router.push(`/driver/${room.roomCode}`)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Could not save route right now.")
      setValidationOpen(true)
    } finally {
      setSaving(false)
    }
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
          disabled={!canSave}
          onClick={() => void handleSave()}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
        >
          <CheckSquare className="size-5" />
          {saving ? "Saving Changes..." : "Save Route Changes"}
        </button>
        {!canSave ? (
          <p className="mt-2 px-1 text-center text-xs leading-relaxed text-muted-foreground">
            Complete {missingFields.join(", ")} before saving.
          </p>
        ) : null}
      </footer>

      <RouteValidationSheet
        open={validationOpen}
        onOpenChange={setValidationOpen}
        title={
          saveError.includes("crosses water")
            ? "Route crosses water"
            : "Complete the route setup"
        }
        message={saveError}
        actionLabel="Okay"
      />
    </div>
  )
}
