import { RoomProvider } from "@/components/providers/room-provider"
import { EditRouteSession } from "@/components/edit-route-session"

export default async function DriverEditRoutePage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params

  return (
    <RoomProvider initialRoomCode={code}>
      <EditRouteSession />
    </RoomProvider>
  )
}
