"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="text-zinc-600 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-colors"
    >
      Keluar (Logout)
    </Button>
  );
}
