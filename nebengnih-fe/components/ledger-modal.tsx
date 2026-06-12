"use client"

import { CheckCircle2, X } from "lucide-react"
import { useRoom } from "@/components/providers/room-provider"
import { buildLedgerText } from "@/lib/room/calculations"

interface LedgerModalProps {
  open: boolean
  onClose: () => void
}

export function LedgerModal({ open, onClose }: LedgerModalProps) {
  const { summary } = useRoom()

  if (!open) return null
  const ledgerPreview = buildLedgerText(summary)

  return (
    /* backdrop */
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ledger-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
    >
      {/* dim overlay */}
      <div
        className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* card */}
      <div className="relative z-10 w-full max-w-sm rounded-3xl border border-border bg-background shadow-2xl shadow-foreground/10">
        {/* close button */}
        <button
          type="button"
          aria-label="Close modal"
          onClick={onClose}
          className="absolute right-4 top-4 flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <X className="size-4" />
        </button>

        <div className="flex flex-col items-center gap-5 px-6 pb-6 pt-8">
          {/* success icon */}
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="size-8 text-primary" strokeWidth={2} />
          </div>

          {/* title */}
          <div className="text-center">
            <h2
              id="ledger-modal-title"
              className="text-lg font-bold text-foreground"
            >
              Ledger Copied to Clipboard!
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Paste it directly into your WhatsApp group.
            </p>
          </div>

          {/* preview box */}
          <div className="w-full rounded-2xl border border-border bg-secondary/50 p-4">
            <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-foreground">
              {ledgerPreview}
            </pre>
          </div>

          {/* dismiss */}
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl border border-border bg-background py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary active:scale-[0.98]"
          >
            Awesome, Close
          </button>
        </div>
      </div>
    </div>
  )
}
