"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

export function EssNav() {
  const pathname = usePathname();

  const links = [
    { href: "/ess", label: "Beranda" },
    { href: "/ess/absensi", label: "Absensi Harian" },
    { href: "/ess/slip-gaji", label: "Slip Gaji" },
    { href: "/ess/cuti", label: "Pengajuan Cuti" },
  ];

  return (
    <nav className="p-4 space-y-1">
      {links.map((link) => {
        const isActive = pathname === link.href || (link.href !== "/ess" && pathname.startsWith(link.href));
        return (
          <Link
            key={link.href}
            href={link.href}
            className={clsx(
              "block px-3 py-2 text-sm font-medium rounded-md transition-colors",
              isActive 
                ? "bg-zinc-900 text-white shadow-sm" 
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
