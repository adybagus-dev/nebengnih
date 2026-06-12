"use client"

import { useState } from "react"
import { Link2, Check } from "lucide-react"
import { useRoom } from "@/components/providers/room-provider"

export function InviteWizardCard() {
  const [copied, setCopied] = useState(false)
  const { summary } = useRoom()

  function handleCopy() {
    navigator.clipboard.writeText(summary.shareUrl).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="px-4 pt-5" aria-label="Invite passengers">
      <div className="rounded-2xl border-2 border-dashed border-border bg-card p-5 shadow-sm">
        {/* Status */}
        <div className="mb-4 text-center">
          <p className="text-lg font-extrabold tracking-tight text-foreground">
            Your room is live! 🚀
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground text-pretty">
            Share the link below to your WhatsApp group circle so your friends
            can drop their pickup landmarks.
          </p>
        </div>

        {/* Passengers waiting indicator */}
        <div className="mb-4 flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary/60 px-4 py-2.5">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
          <span className="text-xs font-semibold text-muted-foreground">
            Waiting for passengers to join…
          </span>
        </div>

        {/* Share action */}
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
                Copy Invite Link
              </>
            )}
          </button>
        </div>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          Room code:{" "}
          <span className="font-mono font-bold text-primary">{summary.roomCode}</span>
        </p>
      </div>
    </section>
  )
}
