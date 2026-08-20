"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Flame,
  Gamepad2,
  GraduationCap,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Hoy", icon: Flame },
  { href: "/aprender", label: "Aprender", icon: GraduationCap },
  { href: "/jugar", label: "Jugar", icon: Gamepad2 },
  { href: "/progreso", label: "Progreso", icon: BookOpen },
  { href: "/ajustes", label: "Ajustes", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line/80 bg-surface/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-lg items-stretch sm:max-w-3xl lg:max-w-5xl">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/"
              ? pathname === "/"
              : pathname === href || pathname.startsWith(`${href}/`);
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
