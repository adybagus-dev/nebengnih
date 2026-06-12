import { createHash, randomUUID } from "node:crypto"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const COOKIE_NAME = "nebengnih-driver-session"

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex")
}

export async function GET(request: Request) {
  const existingCookie = request.headers.get("cookie")?.match(new RegExp(`${COOKIE_NAME}=([^;]+)`))
  const token = existingCookie?.[1] ?? randomUUID()

  const response = NextResponse.json({ ok: true })
  if (!existingCookie) {
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    })
  }

  return response
}

export async function POST(request: Request) {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 })
  }

  const existingCookie = request.headers.get("cookie")?.match(new RegExp(`${COOKIE_NAME}=([^;]+)`))
  const sessionToken = existingCookie?.[1] ?? randomUUID()

  const { data, error } = await supabase
    .from("driver_sessions")
    .upsert(
      {
        session_token_hash: tokenHash(sessionToken),
      },
      { onConflict: "session_token_hash" }
    )
    .select("id,last_active_room_code")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const response = NextResponse.json({
    driverSessionId: data.id,
    lastActiveRoomCode: data.last_active_room_code ?? null,
  })

  if (!existingCookie) {
    response.cookies.set(COOKIE_NAME, sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    })
  }

  return response
}
