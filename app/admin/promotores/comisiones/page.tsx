import { RoleGuard } from "@/components/app/role-guard"
import { CommissionsOverview } from "@/components/admin/commissions-overview"

export default function Page() {
  return (
    <RoleGuard roles={["superadmin"]}>
      <CommissionsOverview />
    </RoleGuard>
  )
}
