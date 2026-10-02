import { RoleGuard } from "@/components/app/role-guard"
import { AdminOffers } from "@/components/admin/admin-offers"

export default function Page() {
  return (
    <RoleGuard roles={["superadmin"]}>
      <AdminOffers view="redeemed" />
    </RoleGuard>
  )
}
