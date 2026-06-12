import { RoomPassengerSession } from "@/components/room-passenger-session"

export default async function RoomPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params
  return <RoomPassengerSession roomCode={code} />
}
