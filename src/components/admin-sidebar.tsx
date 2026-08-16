"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { ChevronLeft, ChevronRight, LayoutDashboard, Users, CalendarCheck, Wallet, Database, LogOut, Receipt, ShieldCheck } from "lucide-react";
import { signOut } from "next-auth/react";

export function AdminSidebar({ isMobile = false }: { isMobile?: boolean }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { href: "/admin/karyawan", label: "Karyawan", icon: <Users className="w-5 h-5" /> },
    { href: "/admin/absensi-cuti", label: "Absensi & Cuti", icon: <CalendarCheck className="w-5 h-5" /> },
    { href: "/admin/reimbursement", label: "Klaim Biaya", icon: <Receipt className="w-5 h-5" /> },
    { href: "/admin/payroll", label: "Payroll", icon: <Wallet className="w-5 h-5" /> },
    { href: "/admin/master-data", label: "Master Data", icon: <Database className="w-5 h-5" /> },
    { href: "/admin/audit-log", label: "Audit Log", icon: <ShieldCheck className="w-5 h-5" /> },
  ];

  return (
    <div className={clsx("flex flex-col bg-white border-r border-zinc-200 transition-all duration-300 h-screen sticky top-0", 
      isMobile ? "w-full" : (isCollapsed ? "w-20" : "w-64")
    )}>
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 px-4">
        {!isCollapsed && <span className="font-bold text-lg tracking-tight text-zinc-900 ml-2 truncate">HRIS Admin</span>}
        {isCollapsed && <span className="font-bold text-xl tracking-tight text-zinc-900 mx-auto w-full text-center truncate">H</span>}
      </div>
      {!isMobile && (
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 bg-white border border-zinc-200 rounded-full p-1 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 shadow-sm z-10"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      )}

      <nav className="p-3 space-y-1 flex-1 overflow-y-auto mt-2">
        {links.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors",
                isActive 
                  ? "bg-zinc-900 text-white shadow-sm" 
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
                isCollapsed ? "justify-center" : ""
              )}
              title={isCollapsed ? link.label : undefined}
            >
              <span className={clsx(isCollapsed ? "" : "mr-3")}>{link.icon}</span>
              {!isCollapsed && <span className="truncate">{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-200 flex-shrink-0">
         <button 
          onClick={() => signOut({ callbackUrl: '/login' })}
          className={clsx(
            "flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-md text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors",
            isCollapsed ? "justify-center" : ""
          )}
          title={isCollapsed ? "Keluar" : undefined}
        >
          <LogOut className={clsx("w-5 h-5", isCollapsed ? "" : "mr-3")} />
          {!isCollapsed && <span>Keluar</span>}
        </button>
      </div>
    </div>
  );
}
