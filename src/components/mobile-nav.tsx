"use client";

import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { EssSidebar } from "./ess-sidebar";
import { AdminSidebar } from "./admin-sidebar";

export function MobileNav({ isAdmin = false }: { isAdmin?: boolean }) {
  return (
    <Sheet>
      <SheetTrigger render={
        <Button variant="ghost" size="icon" className="md:hidden text-zinc-600">
          <Menu className="w-6 h-6" />
        </Button>
      } />
      <SheetContent side="left" className="p-0 w-64 border-r-zinc-200" aria-describedby={undefined}>
        <SheetHeader className="sr-only">
          <SheetTitle>Menu Navigasi</SheetTitle>
        </SheetHeader>
        <div className="h-full flex flex-col">
          {isAdmin ? <AdminSidebar isMobile /> : <EssSidebar isMobile />}
        </div>
      </SheetContent>
    </Sheet>
  );
}
