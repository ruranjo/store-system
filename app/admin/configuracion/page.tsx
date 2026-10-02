import { RoleGuard } from "@/components/app/role-guard"
import { SettingsScreen } from "@/components/admin/settings-form"

export default function Page() {
  return (
    <RoleGuard roles={["superadmin"]}>
      <SettingsScreen />
    </RoleGuard>
  )
}
