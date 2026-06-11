"use client"

import { useState } from "react"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function AttendanceToggle() {
  const [joining, setJoining] = useState(true)

  return (
    <section className="px-4 pt-4">
      {/* Attendance toggle */}
      <div
        role="group"
        aria-label="Attendance status"
        className="grid grid-cols-2 gap-3"
      >
        {/* Joining button */}
        <button
          type="button"
          onClick={() => setJoining(true)}
          aria-pressed={joining}
          className={cn(
            "relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 px-4 py-5 text-center transition-all duration-200 active:scale-[0.97]",
            joining
              ? "border-primary bg-primary/10 shadow-lg shadow-primary/15"
              : "border-border bg-card opacity-60"
          )}
        >
          <span
            className={cn(
              "flex size-12 items-center justify-center rounded-full transition-colors duration-200",
              joining ? "bg-primary" : "bg-muted"
            )}
          >
            <Check
              className={cn(
                "size-6 transition-colors duration-200",
                joining ? "text-primary-foreground" : "text-muted-foreground"
              )}
              strokeWidth={3}
            />
          </span>
          <span
            className={cn(
              "text-sm font-bold leading-tight transition-colors duration-200",
              joining ? "text-primary" : "text-muted-foreground"
            )}
          >
            {"I'm Joining"} <br /> Today
          </span>
          {joining && (
            <span className="absolute right-3 top-3 flex size-2 rounded-full bg-primary shadow-md shadow-primary/60" />
          )}
        </button>

        {/* Absent button */}
        <button
          type="button"
          onClick={() => setJoining(false)}
          aria-pressed={!joining}
          className={cn(
            "relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 px-4 py-5 text-center transition-all duration-200 active:scale-[0.97]",
            !joining
              ? "border-destructive/60 bg-destructive/10 shadow-lg shadow-destructive/10"
              : "border-border bg-card opacity-60"
          )}
        >
          <span
            className={cn(
              "flex size-12 items-center justify-center rounded-full transition-colors duration-200",
              !joining ? "bg-destructive/80" : "bg-muted"
            )}
          >
            <X
              className={cn(
                "size-6 transition-colors duration-200",
                !joining ? "text-white" : "text-muted-foreground"
              )}
              strokeWidth={3}
            />
          </span>
          <span
            className={cn(
              "text-sm font-bold leading-tight transition-colors duration-200",
              !joining ? "text-destructive" : "text-muted-foreground"
            )}
          >
            {"I'm Absent"}
          </span>
          {!joining && (
            <span className="absolute right-3 top-3 flex size-2 rounded-full bg-destructive shadow-md shadow-destructive/60" />
          )}
        </button>
      </div>
    </section>
  )
}
