"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { activeHref, type NavGroup, type NavSection } from "@/components/app/nav-config"

const linkBase = "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors"
const linkIdle = "hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
const linkActive = "bg-sidebar-accent text-sidebar-accent-foreground"

export function SidebarNav({
  groups,
  pathname,
  onNavigate,
}: {
  groups: NavGroup[]
  pathname: string
  onNavigate?: () => void
}) {
  const current = activeHref(groups, pathname)
  const [toggled, setToggled] = useState<Record<string, boolean>>({})

  return (
    <nav aria-label="Principal" className="flex flex-col gap-5">
      {groups.map((group) => (
        <div key={group.title} className="flex flex-col gap-1">
          <p className="px-3 pb-1 text-[11px] font-semibold tracking-wider text-sidebar-foreground/60 uppercase">
            {group.title}
          </p>
          {group.sections.map((section) => (
            <Section
              key={section.label}
              section={section}
              current={current}
              open={toggled[section.label] ?? section.items.some((i) => i.href === current)}
              onToggle={() =>
                setToggled((t) => ({
                  ...t,
                  [section.label]: !(t[section.label] ?? section.items.some((i) => i.href === current)),
                }))
              }
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ))}
    </nav>
  )
}

function Section({
  section,
  current,
  open,
  onToggle,
  onNavigate,
}: {
  section: NavSection
  current?: string
  open: boolean
  onToggle: () => void
  onNavigate?: () => void
}) {
  const Icon = section.icon
  const containsActive = section.items.some((i) => i.href === current)

  if (section.items.length === 1) {
    const only = section.items[0]
    const active = only.href === current
    return (
      <Link
        href={only.href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={cn(linkBase, active ? linkActive : linkIdle)}
      >
        <Icon className={cn("size-4", active && "text-sidebar-primary")} aria-hidden="true" />
        {section.label}
      </Link>
    )
  }

  const panelId = `nav-${section.label.toLowerCase().replace(/\s+/g, "-")}`
  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className={cn(linkBase, linkIdle, "w-full text-left", containsActive && "text-sidebar-accent-foreground")}
      >
        <Icon className={cn("size-4", containsActive && "text-sidebar-primary")} aria-hidden="true" />
        <span className="flex-1">{section.label}</span>
        <ChevronDown
          className={cn("size-4 transition-transform duration-200", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>
      {open && (
        <ul id={panelId} className="mt-0.5 ml-5 flex flex-col gap-0.5 border-l border-sidebar-border pl-3">
          {section.items.map((item) => {
            const active = item.href === current
            return (
              <li key={item.href + item.label}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                    active
                      ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                      : "hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                  )}
                >
                  {item.label}
                  {item.external && <ExternalLink className="size-3.5 opacity-70" aria-hidden="true" />}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
