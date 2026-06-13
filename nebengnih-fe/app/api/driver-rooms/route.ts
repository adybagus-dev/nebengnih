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

function readCookieToken(request: Request) {
  const raw = request.headers.get("cookie") ?? ""
  return raw.match(new RegExp(`${COOKIE_NAME}=([^;]+)`))?.[1] ?? null
}

function getOrCreateToken(request: Request) {
  return readCookieToken(request) ?? randomUUID()
}

async function ensureDriverSession(request: Request) {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error("Supabase is not configured")

  const token = getOrCreateToken(request)
  const hash = tokenHash(token)
  const { data, error } = await supabase
    .from("driver_sessions")
    .upsert({ session_token_hash: hash }, { onConflict: "session_token_hash" })
    .select("id,last_active_room_code")
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? "Unable to load driver session")
  }

  return { session: data, token }
}

function setSessionCookieIfMissing(response: NextResponse, request: Request, token: string) {
  if (readCookieToken(request)) return

  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  })
}

export async function GET(request: Request) {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 })

    const { session, token } = await ensureDriverSession(request)
    const { data, error } = await supabase
      .from("rooms")
      .select("code,payload,updated_at")
      .eq("driver_session_id", session.id)
      .order("updated_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const rooms = (data ?? []).map((row) => {
      const payload = row.payload as {
        driverNickname?: string
        settings?: { origin?: string; destination?: string }
      }
      return {
        code: row.code,
        driverNickname: payload.driverNickname || "Driver",
        origin: payload.settings?.origin || "Start location",
        destination: payload.settings?.destination || "Destination",
        updatedAt: row.updated_at,
      }
    })

    const response = NextResponse.json({
      activeRoomCode: session.last_active_room_code ?? null,
      rooms,
    })
    setSessionCookieIfMissing(response, request, token)
    return response
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 })

    const { session, token } = await ensureDriverSession(request)
    const body = (await request.json()) as { roomCode?: string; payload?: unknown }
    if (!body.roomCode || !body.payload) {
      return NextResponse.json({ error: "Missing roomCode or payload" }, { status: 400 })
    }

    const { error } = await supabase.from("rooms").upsert(
      {
        code: body.roomCode.toUpperCase(),
        driver_session_id: session.id,
        payload: body.payload,
      },
      { onConflict: "code" }
    )

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await supabase
      .from("driver_sessions")
      .update({ last_active_room_code: body.roomCode.toUpperCase() })
      .eq("id", session.id)

    const response = NextResponse.json({ ok: true })
    setSessionCookieIfMissing(response, request, token)
    return response
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 })

    const { session, token } = await ensureDriverSession(request)
    const body = (await request.json()) as { roomCode?: string }
    if (!body.roomCode) {
      return NextResponse.json({ error: "Missing roomCode" }, { status: 400 })
    }

    const { error } = await supabase
      .from("driver_sessions")
      .update({ last_active_room_code: body.roomCode.toUpperCase() })
      .eq("id", session.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const response = NextResponse.json({ ok: true })
    setSessionCookieIfMissing(response, request, token)
    return response
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 })

    const { session, token } = await ensureDriverSession(request)
    const body = (await request.json()) as { roomCode?: string }
    if (!body.roomCode) {
      return NextResponse.json({ error: "Missing roomCode" }, { status: 400 })
    }

    const roomCode = body.roomCode.toUpperCase()
    const { error } = await supabase
      .from("rooms")
      .delete()
      .eq("code", roomCode)
      .eq("driver_session_id", session.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data } = await supabase
      .from("rooms")
      .select("code")
      .eq("driver_session_id", session.id)
      .order("updated_at", { ascending: false })
      .limit(1)

    await supabase
      .from("driver_sessions")
      .update({ last_active_room_code: data?.[0]?.code ?? null })
      .eq("id", session.id)

    const response = NextResponse.json({ ok: true })
    setSessionCookieIfMissing(response, request, token)
    return response
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
