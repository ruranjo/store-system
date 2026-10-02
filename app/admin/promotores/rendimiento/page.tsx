import { RoleGuard } from "@/components/app/role-guard"
import { PromoterPerformance } from "@/components/admin/promoter-performance"

export default function Page() {
  return (
    <RoleGuard roles={["superadmin"]}>
      <PromoterPerformance />
    </RoleGuard>
  )
}
