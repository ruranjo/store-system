import { RedeemConsole } from "@/components/admin/redeem-console"

export default async function Page({ searchParams }: { searchParams: Promise<{ codigo?: string }> }) {
  const { codigo } = await searchParams
  return <RedeemConsole initialCode={codigo ?? ""} />
}
