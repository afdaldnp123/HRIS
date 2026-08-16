"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

export function AdminNav() {
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/karyawan", label: "Karyawan" },
    { href: "/admin/absensi-cuti", label: "Absensi & Cuti" },
    { href: "/admin/payroll", label: "Payroll" },
    { href: "/admin/master-data", label: "Pengaturan / Master Data" },
  ];

  return (
    <nav className="p-4 space-y-1">
      {links.map((link) => {
        const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
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
