"use client"

import { CheckCircle2, X } from "lucide-react"
import { useRoom } from "@/components/providers/room-provider"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { buildLedgerText } from "@/lib/room/calculations"

interface LedgerModalProps {
  open: boolean
  onClose: () => void
}

export function LedgerModal({ open, onClose }: LedgerModalProps) {
  const { summary } = useRoom()

  const ledgerPreview = buildLedgerText(summary)

  return (
    <Sheet open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="mx-auto max-w-md overflow-hidden rounded-t-3xl border-t border-border bg-background px-0 pb-0 pt-0"
      >
        <div className="flex max-h-[calc(100vh-3rem)] flex-col">
          <SheetHeader className="flex flex-row items-center justify-between border-b border-border px-5 py-4">
            <SheetTitle className="text-base font-bold text-foreground">
              Ledger Copied
            </SheetTitle>
            <button
              type="button"
              aria-label="Close modal"
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground active:scale-95"
            >
              <X className="size-4" />
            </button>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            <div className="flex flex-col items-center gap-5">
              <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="size-8 text-primary" strokeWidth={2} />
              </div>

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

              <div className="w-full rounded-2xl border border-border bg-secondary/50 p-4">
                <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-foreground">
                  {ledgerPreview}
                </pre>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 border-t border-border bg-background/95 px-5 py-4 backdrop-blur-sm">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-2xl border border-border bg-background py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary active:scale-[0.98]"
            >
              Awesome, Close
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
