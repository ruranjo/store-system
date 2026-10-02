import {
  Home,
  LayoutDashboard,
  Package,
  ScanLine,
  Settings,
  Store,
  TicketPercent,
  UserRound,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react"
import type { Role } from "@/lib/types"

export interface NavLink {
  href: string
  label: string
  /** Opens outside the panel (e.g. the public store); never marked active. */
  external?: boolean
}

export interface NavSection {
  label: string
  icon: LucideIcon
  items: NavLink[]
}

export interface NavGroup {
  title: string
  sections: NavSection[]
}

const productsSection: NavSection = {
  label: "Productos",
  icon: Package,
  items: [
    { href: "/admin/productos", label: "Todos los productos" },
    { href: "/admin/productos/activos", label: "Activos" },
    { href: "/admin/productos/inactivos", label: "Inactivos" },
    { href: "/admin/productos/categorias", label: "Categorías" },
  ],
}

const dashboardSection: NavSection = {
  label: "Dashboard",
  icon: LayoutDashboard,
  items: [
    { href: "/admin", label: "Resumen" },
    { href: "/admin/actividad", label: "Actividad" },
  ],
}

const redeemSection: NavSection = {
  label: "Caja",
  icon: ScanLine,
  items: [{ href: "/admin/canjear", label: "Canjear código" }],
}

const catalogSection: NavSection = {
  label: "Catálogo",
  icon: Store,
  items: [
    { href: "/admin/catalogo", label: "Vista previa" },
    { href: "/", label: "Tienda pública", external: true },
  ],
}

export function navFor(role: Role): NavGroup[] {
  if (role === "promoter") {
    return [
      {
        title: "Principal",
        sections: [{ label: "Inicio", icon: Home, items: [{ href: "/promotor", label: "Inicio" }] }],
      },
      {
        title: "Ventas",
        sections: [
          {
            label: "Catálogo",
            icon: Store,
            items: [
              { href: "/promotor/catalogo", label: "Todos los productos" },
              { href: "/promotor/catalogo/pendientes", label: "Sin oferta esta hora" },
            ],
          },
          {
            label: "Mis ofertas",
            icon: TicketPercent,
            items: [
              { href: "/promotor/ofertas", label: "Historial" },
              { href: "/promotor/ofertas/vigentes", label: "Vigentes" },
              { href: "/promotor/ofertas/canjeadas", label: "Canjeadas" },
              { href: "/promotor/ofertas/vencidas", label: "Vencidas" },
            ],
          },
          {
            label: "Comisiones",
            icon: Wallet,
            items: [{ href: "/promotor/comisiones", label: "Metas y ganancias" }],
          },
        ],
      },
      {
        title: "Cuenta",
        sections: [
          {
            label: "Mi cuenta",
            icon: UserRound,
            items: [
              { href: "/promotor/perfil", label: "Perfil" },
              { href: "/promotor/perfil/estadisticas", label: "Estadísticas" },
              { href: "/", label: "Tienda pública", external: true },
            ],
          },
        ],
      },
    ]
  }

  if (role === "admin") {
    return [
      { title: "Principal", sections: [dashboardSection, redeemSection] },
      { title: "Gestión", sections: [productsSection] },
      { title: "Tienda", sections: [catalogSection] },
    ]
  }

  return [
    { title: "Principal", sections: [dashboardSection, redeemSection] },
    {
      title: "Gestión",
      sections: [
        productsSection,
        {
          label: "Promotores",
          icon: Users,
          items: [
            { href: "/admin/promotores", label: "Listado" },
            { href: "/admin/promotores/rendimiento", label: "Rendimiento" },
            { href: "/admin/promotores/comisiones", label: "Comisiones" },
          ],
        },
        {
          label: "Ofertas",
          icon: TicketPercent,
          items: [
            { href: "/admin/ofertas", label: "Todas" },
            { href: "/admin/ofertas/vigentes", label: "Vigentes" },
            { href: "/admin/ofertas/hoy", label: "De hoy" },
            { href: "/admin/ofertas/canjeadas", label: "Canjeadas" },
            { href: "/admin/ofertas/anuladas", label: "Anuladas" },
          ],
        },
      ],
    },
    {
      title: "Sistema",
      sections: [
        catalogSection,
        {
          label: "Configuración",
          icon: Settings,
          items: [
            { href: "/admin/configuracion", label: "General" },
            { href: "/admin/configuracion/usuarios", label: "Usuarios y roles" },
          ],
        },
      ],
    },
  ]
}

/** The nav link that best matches the current path (longest prefix wins). */
export function activeHref(groups: NavGroup[], pathname: string) {
  let best: string | undefined
  for (const g of groups)
    for (const s of g.sections)
      for (const l of s.items) {
        if (l.external) continue
        const matches = pathname === l.href || pathname.startsWith(`${l.href}/`)
        if (matches && (!best || l.href.length > best.length)) best = l.href
      }
  return best
}
