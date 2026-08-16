import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin-sidebar";
import { LogoutButton } from "@/components/logout-button";
import { MobileNav } from "@/components/mobile-nav";
import { NotificationBell } from "@/components/notification-bell";
import { SessionWatchdog } from "@/components/session-watchdog";
import prisma from "@/lib/prisma";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 10
  });
  
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="flex h-screen w-full bg-zinc-50 overflow-hidden">
      <SessionWatchdog />
      <div className="hidden md:flex h-full min-h-screen">
        <AdminSidebar />
      </div>
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-zinc-200 bg-white flex items-center px-4 md:px-6 justify-between shrink-0">
          <div className="flex items-center gap-3">
             <MobileNav isAdmin={true} />
             <div className="font-medium text-zinc-800 hidden md:block">HRIS Administrator</div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
             <NotificationBell initialCount={unreadCount} notifications={notifications} />
             <span className="text-sm font-medium text-zinc-600 hidden md:block">{session.user.email}</span>
             <LogoutButton />
          </div>
        </header>
        <div className="p-4 md:p-6 lg:p-8 flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
