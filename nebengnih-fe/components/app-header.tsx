"use client"

import Link from "next/link"
import { ArrowLeft, Home, RefreshCcw } from "lucide-react"
import { NebengNihLogo } from "@/components/nebengnih-logo"

interface AppHeaderProps {
  title?: string
  backHref?: string
  backLabel?: string
  roomCode?: string
  statusLabel?: string
  live?: boolean
  onRefresh?: () => void
}

export function AppHeader({
  title,
  backHref,
  backLabel = "Back",
  roomCode,
  statusLabel,
  live = false,
  onRefresh,
}: AppHeaderProps) {
  const taskHeader = Boolean(title && backHref)

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur-lg">
      {taskHeader ? (
        <div className="grid h-11 grid-cols-[1fr_auto_1fr] items-center gap-2">
          <Link
            href={backHref!}
            className="flex min-w-0 items-center gap-1.5 justify-self-start text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4 shrink-0" />
            <span className="truncate">{backLabel}</span>
          </Link>

          <div className="flex h-10 min-w-0 flex-col items-center justify-center text-center">
            <h1 className="max-w-44 truncate text-base font-bold text-foreground">
              {title}
            </h1>
            <p
              className={`mt-0.5 min-h-3 font-mono text-[10px] font-semibold tracking-wide ${
                roomCode ? "text-primary" : "text-transparent"
              }`}
              aria-hidden={roomCode ? undefined : true}
            >
              {roomCode ?? "ROOM"}
            </p>
          </div>

          <Link
            href="/"
            aria-label="Go to NebengNih home"
            className="flex size-9 items-center justify-center justify-self-end rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:text-primary active:scale-95"
          >
            <Home className="size-[18px]" />
          </Link>
        </div>
      ) : (
        <div className="flex h-11 items-center justify-between gap-3">
          <Link
            href="/"
            aria-label="Go to NebengNih home"
            className="flex items-center gap-1.5 text-lg font-bold tracking-tight text-primary transition-opacity hover:opacity-80 active:opacity-70"
          >
            <NebengNihLogo className="size-7 text-primary" />
            <span>NebengNih</span>
          </Link>

          {roomCode ? (
            <div className="flex items-center gap-2">
              <div className="flex h-10 flex-col items-end justify-center">
                <div className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5">
                  {live ? (
                    <span className="relative flex size-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                      <span className="relative inline-flex size-2 rounded-full bg-primary" />
                    </span>
                  ) : null}
                  <span className="font-mono text-xs font-bold tracking-wide text-primary">
                    {roomCode}
                  </span>
                </div>
                <span
                  className={`mt-0.5 min-h-3 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                    statusLabel ? "text-muted-foreground" : "text-transparent"
                  }`}
                  aria-hidden={statusLabel ? undefined : true}
                >
                  {statusLabel ?? "STATUS"}
                </span>
              </div>

              {onRefresh ? (
                <button
                  type="button"
                  onClick={onRefresh}
                  className="flex size-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:text-primary active:scale-95"
                  aria-label="Refresh room data"
                >
                  <RefreshCcw className="size-[18px]" />
                </button>
              ) : null}
            </div>
          ) : (
            <span className="h-10" aria-hidden="true" />
          )}
        </div>
      )}
    </header>
  )
}
