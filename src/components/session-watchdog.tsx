"use client";

import { useEffect } from "react";

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 menit

export function SessionWatchdog() {
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        // Otomatis arahkan ke halaman logout NextAuth jika tidak ada aktivitas
        window.location.href = "/api/auth/signout?callbackUrl=/login?reason=timeout";
      }, INACTIVITY_TIMEOUT);
    };

    const events = ["mousemove", "keydown", "click", "scroll"];
    
    events.forEach((event) => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      clearTimeout(timeoutId);
    };
  }, []);

  return null;
}
