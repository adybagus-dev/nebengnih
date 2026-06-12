"use client"

import { Check, Link2, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useRoom } from "@/components/providers/room-provider"
import { formatMoney } from "@/lib/room/calculations"
import { useState } from "react"

interface InviteLinkSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InviteLinkSheet({ open, onOpenChange }: InviteLinkSheetProps) {
  const { summary } = useRoom()
  const router = useRouter()
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(summary.shareUrl).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleGoToDashboard() {
    onOpenChange(false)
    router.push("/driver")
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto max-w-md rounded-t-3xl border-t border-border bg-background px-0 pb-0 pt-0"
      >
        <SheetHeader className="flex flex-row items-center justify-between border-b border-border px-5 py-4">
          <SheetTitle className="text-base font-bold text-foreground">
            Share Invite Link
          </SheetTitle>
          <button
            type="button"
            aria-label="Close invite"
            onClick={() => onOpenChange(false)}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground active:scale-95"
          >
            <X className="size-4" />
          </button>
        </SheetHeader>

        <div className="px-5 py-5">
          <div className="mb-4 text-center">
            <p className="text-lg font-extrabold tracking-tight text-foreground">
              Your room is ready
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Copy the link below and send it to your WhatsApp group so passengers can join the room.
            </p>
          </div>

          <div className="mb-4 rounded-xl border border-border bg-secondary/60 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Room code
                </p>
                <p className="font-mono text-base font-bold text-foreground">{summary.roomCode}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Driver share
                </p>
                <p className="font-mono text-sm font-semibold text-foreground">
                  {formatMoney(summary.driverShare)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center overflow-hidden rounded-xl border border-border bg-background">
            <p
              aria-label="Invite link"
              className="flex-1 truncate px-3.5 py-3 font-mono text-xs font-medium text-muted-foreground"
            >
              {summary.shareUrl}
            </p>
            <button
              type="button"
              onClick={handleCopy}
              aria-label={copied ? "Link copied" : "Copy invite link"}
              className="flex shrink-0 items-center gap-1.5 bg-primary px-4 py-3 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="size-3.5" />
                  Copied!
                </>
              ) : (
                <>
                  <Link2 className="size-3.5" />
                  Copy Link
                </>
              )}
            </button>
          </div>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            Share it only after route details are set.
          </p>

          <button
            type="button"
            onClick={handleGoToDashboard}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-transform active:scale-[0.98]"
          >
            Continue to Dashboard
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
