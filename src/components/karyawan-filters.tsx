"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function KaryawanFilters({ departments }: { departments: { id: string, name: string }[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'ALL') params.set(key, value);
    else params.delete(key);
    
    // reset page when filtering
    params.delete('page');
    
    router.push(`/admin/karyawan?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
        <Input 
          placeholder="Cari Nama atau NIP..." 
          defaultValue={searchParams.get('q') || ''}
          onChange={(e) => {
            const val = e.target.value;
            // Debounce manually
            if ((window as any).searchTimeout) clearTimeout((window as any).searchTimeout);
            (window as any).searchTimeout = setTimeout(() => {
              updateParams('q', val);
            }, 500);
          }}
          className="pl-9 h-10 border-zinc-200"
        />
      </div>
      <select 
        defaultValue={searchParams.get('dept') || 'ALL'}
        className="h-10 px-3 py-2 rounded-md border border-zinc-200 bg-white text-sm text-zinc-700 outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 transition-all"
        onChange={(e) => updateParams('dept', e.target.value)}
      >
        <option value="ALL">Semua Departemen</option>
        {departments.map(d => (
          <option key={d.id} value={d.id}>{d.name}</option>
        ))}
      </select>
    </div>
  );
}
