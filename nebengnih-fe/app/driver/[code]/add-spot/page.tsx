import { RoomProvider } from "@/components/providers/room-provider"
import { AddSpotSession } from "@/components/add-spot-session"

export default async function DriverAddSpotRoomPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params
  return (
    <RoomProvider initialRoomCode={code}>
      <AddSpotSession />
    </RoomProvider>
  )
}
