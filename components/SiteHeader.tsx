"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Tags, CalendarDays, User } from "lucide-react";

const navItems = [
  { href: "/recettes", label: "Recettes", icon: BookOpen },
  { href: "/categories", label: "Catégories", icon: Tags },
  { href: "/semaine", label: "Cette semaine", icon: CalendarDays },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="flex items-center justify-between mb-10 gap-2">
      <Link href="/" className="font-display text-3xl sm:text-3xl text-papaya shrink-0">
        miam
      </Link>
      <nav className="flex items-center gap-1 sm:gap-1.5 text-sm overflow-x-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-center gap-1.5 min-w-11 min-h-11 sm:min-w-0 sm:min-h-0 px-2.5 sm:px-3.5 py-1.5 rounded-full transition whitespace-nowrap ${
                isActive ? "bg-leaf text-white" : "text-foreground hover:bg-surface"
              }`}
            >
              <Icon className="w-6 h-6 sm:hidden" aria-hidden="true" />
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          );
        })}
        <Link
          href="/admin"
          className="ml-1 sm:ml-2 flex items-center justify-center min-w-11 min-h-11 sm:min-w-0 sm:min-h-0 shrink-0 text-foreground"
        >
          <User className="w-6 h-6 sm:w-4 sm:h-4" />
        </Link>
      </nav>
    </header>
  );
}
