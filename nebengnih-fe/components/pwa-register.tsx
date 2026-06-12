"use client"

import { useEffect } from "react"

export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return

    if (process.env.NODE_ENV !== "production") {
      const cleanupDevelopmentPwa = async () => {
        const wasControlled = Boolean(navigator.serviceWorker.controller)
        const registrations = await navigator.serviceWorker.getRegistrations()

        await Promise.all(registrations.map((registration) => registration.unregister()))

        if ("caches" in window) {
          const cacheNames = await caches.keys()
          await Promise.all(
            cacheNames
              .filter((cacheName) => cacheName.startsWith("nebengnih-"))
              .map((cacheName) => caches.delete(cacheName))
          )
        }

        const reloadKey = "nebengnih.dev-pwa-cleaned"
        if (wasControlled && !window.sessionStorage.getItem(reloadKey)) {
          window.sessionStorage.setItem(reloadKey, "true")
          window.location.reload()
        }
      }

      void cleanupDevelopmentPwa()
      return
    }

    const register = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js", { scope: "/" })
      } catch {
        // ignore registration issues in unsupported or restricted contexts
      }
    }

    void register()
  }, [])

  return null
}
