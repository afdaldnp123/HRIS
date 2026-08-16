"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { markNotificationsAsRead } from "@/actions/notification";

type Notification = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
};

export function NotificationBell({ initialCount, notifications }: { initialCount: number, notifications: Notification[] }) {
  const handleOpen = (open: boolean) => {
    if (open && initialCount > 0) {
      markNotificationsAsRead();
    }
  };

  return (
    <Popover onOpenChange={handleOpen}>
      <PopoverTrigger render={
        <Button variant="ghost" size="icon" className="relative text-zinc-600 hover:text-zinc-900">
          <Bell className="w-5 h-5" />
          {initialCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          )}
        </Button>
      } />
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b border-zinc-200">
          <h3 className="font-semibold text-sm">Notifikasi</h3>
        </div>
        <ScrollArea className="h-72">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-zinc-500">Tidak ada notifikasi</div>
          ) : (
            notifications.map(n => (
              <div key={n.id} className={`p-4 border-b border-zinc-100 ${n.isRead ? 'bg-white' : 'bg-blue-50/50'}`}>
                <h4 className="text-sm font-semibold text-zinc-900">{n.title}</h4>
                <p className="text-xs text-zinc-500 mt-1">{n.message}</p>
              </div>
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
