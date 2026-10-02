import { RoleGuard } from "@/components/app/role-guard"
import { UsersRoles } from "@/components/admin/users-roles"

export default function Page() {
  return (
    <RoleGuard roles={["superadmin"]}>
      <UsersRoles />
    </RoleGuard>
  )
}
