import { RoleGuard } from "@/components/app/role-guard"
import { AppShell } from "@/components/app/app-shell"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard roles={["superadmin", "admin"]}>
      <AppShell>{children}</AppShell>
    </RoleGuard>
  )
}
