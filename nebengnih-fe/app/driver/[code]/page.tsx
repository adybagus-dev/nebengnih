import { RoomProvider } from "@/components/providers/room-provider"
import { DriverDashboardShell } from "@/components/driver-dashboard-shell"

export default async function DriverRoomPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params
  return (
    <RoomProvider initialRoomCode={code}>
      <DriverDashboardShell />
    </RoomProvider>
  )
}
