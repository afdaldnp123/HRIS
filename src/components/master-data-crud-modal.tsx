"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveDepartment, saveAllowance, saveDeduction } from "@/actions/master-data";
import { Edit, Plus } from "lucide-react";

export function DepartmentModal({ initialData }: { initialData?: any }) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState(initialData?.code || "");
  const [name, setName] = useState(initialData?.name || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await saveDepartment({ id: initialData?.id, code, name });
    setLoading(false);
    setOpen(false);
  };

  return (
    <>
      {initialData ? (
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => setOpen(true)}>
          <Edit className="h-4 w-4" />
        </Button>
      ) : (
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-2" /> Tambah Departemen</Button>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Departemen" : "Tambah Departemen"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Kode Departemen</Label>
            <Input required value={code} onChange={e => setCode(e.target.value)} placeholder="Misal: IT" />
          </div>
          <div className="space-y-2">
            <Label>Nama Departemen</Label>
            <Input required value={name} onChange={e => setName(e.target.value)} placeholder="Misal: Information Technology" />
          </div>
          <div className="pt-2">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}

export function AllowanceModal({ initialData }: { initialData?: any }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(initialData?.name || "");
  const [type, setType] = useState(initialData?.type || "FIXED_AMOUNT");
  const [defaultValue, setDefaultValue] = useState(initialData?.defaultValue ? Number(initialData.defaultValue) : 0);
  const [isTaxable, setIsTaxable] = useState(initialData?.isTaxable !== false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await saveAllowance({ id: initialData?.id, name, type, defaultValue, isTaxable });
    setLoading(false);
    setOpen(false);
  };

  return (
    <>
      {initialData ? (
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => setOpen(true)}>
          <Edit className="h-4 w-4" />
        </Button>
      ) : (
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-2" /> Tambah Tunjangan</Button>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Tunjangan" : "Tambah Tunjangan"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Nama Tunjangan</Label>
            <Input required value={name} onChange={e => setName(e.target.value)} placeholder="Misal: Tunjangan Makan" />
          </div>
          <div className="space-y-2">
            <Label>Tipe Tunjangan</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue placeholder="Pilih tipe" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="FIXED_AMOUNT">Nominal Tetap</SelectItem>
                <SelectItem value="PERCENTAGE">Persentase (%)</SelectItem>
                <SelectItem value="DAILY_ATTENDANCE">Harian (Kehadiran)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Nilai (Rp / %)</Label>
            <Input required type="number" min="0" step="0.01" value={defaultValue} onChange={e => setDefaultValue(Number(e.target.value))} />
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <input type="checkbox" id="taxable" checked={isTaxable} onChange={e => setIsTaxable(e.target.checked)} className="rounded border-zinc-300" />
            <Label htmlFor="taxable">Kena Pajak (PPh 21)</Label>
          </div>
          <div className="pt-2">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}

export function DeductionModal({ initialData }: { initialData?: any }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(initialData?.name || "");
  const [type, setType] = useState(initialData?.type || "FIXED_AMOUNT");
  const [defaultValue, setDefaultValue] = useState(initialData?.defaultValue ? Number(initialData.defaultValue) : 0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await saveDeduction({ id: initialData?.id, name, type, defaultValue });
    setLoading(false);
    setOpen(false);
  };

  return (
    <>
      {initialData ? (
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => setOpen(true)}>
          <Edit className="h-4 w-4" />
        </Button>
      ) : (
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-2" /> Tambah Potongan</Button>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Potongan" : "Tambah Potongan"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Nama Potongan</Label>
            <Input required value={name} onChange={e => setName(e.target.value)} placeholder="Misal: Denda Keterlambatan" />
          </div>
          <div className="space-y-2">
            <Label>Tipe Potongan</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue placeholder="Pilih tipe" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="FIXED_AMOUNT">Nominal Tetap</SelectItem>
                <SelectItem value="PERCENTAGE">Persentase (%)</SelectItem>
                <SelectItem value="DAILY_ATTENDANCE">Harian (Kehadiran)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Nilai (Rp / %)</Label>
            <Input required type="number" min="0" step="0.01" value={defaultValue} onChange={e => setDefaultValue(Number(e.target.value))} />
          </div>
          <div className="pt-2">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}
