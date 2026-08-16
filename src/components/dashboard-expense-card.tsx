"use client";

import { useState } from "react";
import { Wallet, Eye, EyeOff } from "lucide-react";

export function DashboardExpenseCard({ totalPengeluaran }: { totalPengeluaran: number }) {
  const [isMasked, setIsMasked] = useState(true);

  return (
    <div className="p-6 bg-zinc-900 rounded-xl shadow-sm flex flex-col text-white relative">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-zinc-400">
          <Wallet className="w-4 h-4" />
          <h3 className="text-sm font-medium">Pengeluaran (Bulan Ini)</h3>
        </div>
        <button 
          onClick={() => setIsMasked(!isMasked)}
          className="text-zinc-500 hover:text-zinc-300 transition-colors"
          title={isMasked ? "Tampilkan Nominal" : "Sembunyikan Nominal"}
        >
          {isMasked ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      <p className="text-2xl font-bold mt-auto font-mono">
        {isMasked ? "Rp ••••••••••" : `Rp ${totalPengeluaran.toLocaleString('id-ID')}`}
      </p>
    </div>
  );
}
