"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LineChart, ListChecks, Settings, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/", label: "Partidos", icon: Trophy },
  { href: "/apuestas", label: "Apuestas", icon: ListChecks },
  { href: "/rendimiento", label: "Rendimiento", icon: LineChart },
  { href: "/ajustes", label: "Ajustes", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line/80 bg-surface/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-lg items-stretch sm:max-w-3xl lg:max-w-5xl">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors",
                active ? "text-brand" : "text-ink-faint hover:text-ink-muted"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
