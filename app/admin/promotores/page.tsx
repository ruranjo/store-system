import { RoleGuard } from "@/components/app/role-guard"
import { PromotersManager } from "@/components/admin/promoters-manager"

export default function Page() {
  return (
    <RoleGuard roles={["superadmin"]}>
      <PromotersManager />
    </RoleGuard>
  )
}
