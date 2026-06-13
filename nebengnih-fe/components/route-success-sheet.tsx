"use client"

import { CheckCircle2 } from "lucide-react"
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"

interface RouteSuccessSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  message: string
  actionLabel?: string
}

export function RouteSuccessSheet({
  open,
  onOpenChange,
  title,
  message,
  actionLabel = "Keep checking room",
}: RouteSuccessSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="mx-auto max-w-md overflow-hidden rounded-t-3xl border-t border-border bg-background px-0 pb-0 pt-0"
      >
        <div className="flex max-h-[calc(100vh-3rem)] flex-col">
          <SheetHeader className="flex flex-row items-center gap-3 border-b border-border px-5 py-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="size-5" />
            </div>
            <div className="min-w-0">
              <SheetTitle className="text-base font-bold text-foreground">
                {title}
              </SheetTitle>
              <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                {message}
              </p>
            </div>
          </SheetHeader>

          <div className="flex-1 px-5 py-5">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
              <p className="text-sm font-semibold text-emerald-900">What&apos;s next</p>
              <p className="mt-3 text-sm leading-relaxed text-emerald-900/90">
                You can open the same room link again anytime to update your pickup. When you save again, the room updates automatically.
              </p>
            </div>
          </div>

          <SheetFooter className="sticky bottom-0 border-t border-border bg-background/95 px-5 py-4 backdrop-blur-sm">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="w-full rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground transition-transform active:scale-[0.98]"
            >
              {actionLabel}
            </button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  )
}
