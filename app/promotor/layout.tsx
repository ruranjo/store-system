import { RoleGuard } from "@/components/app/role-guard"
import { AppShell } from "@/components/app/app-shell"

export default function PromoterLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard roles={["promoter"]}>
      <AppShell>{children}</AppShell>
    </RoleGuard>
  )
}
