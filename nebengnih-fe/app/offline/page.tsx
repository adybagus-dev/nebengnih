import { AppHeader } from "@/components/app-header"

export default function OfflinePage() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
      <AppHeader />
      <main className="flex flex-1 items-center justify-center px-4">
        <div className="max-w-sm rounded-3xl border border-border bg-card p-6 text-center shadow-sm">
          <p className="text-lg font-bold text-foreground">You are offline</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            NebengNih cached shell is available, but this page needs a network connection to load fresh room data.
          </p>
        </div>
      </main>
    </div>
  )
}
