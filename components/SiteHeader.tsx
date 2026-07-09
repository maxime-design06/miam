"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "lucide-react";

const navItems = [
  { href: "/recettes", label: "Recettes" },
  { href: "/categories", label: "Catégories" },
  { href: "/semaine", label: "Cette semaine" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="flex items-center justify-between mb-10">
      <Link href="/" className="font-display text-3xl text-papaya">
        miam
      </Link>
      <nav className="flex items-center gap-1.5 text-sm">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3.5 py-1.5 rounded-full transition ${
                isActive ? "bg-leaf text-cream" : "text-foreground hover:bg-surface"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
        <Link href="/admin" className="ml-2 flex items-center text-foreground">
          <User className="w-4 h-4" />
        </Link>
      </nav>
    </header>
  );
}
