"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteDepartment, deleteAllowance, deleteDeduction } from "@/actions/master-data";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

type ActionType = "DEPARTMENT" | "ALLOWANCE" | "DEDUCTION";

export function MasterDataDeleteAction({ id, name, type }: { id: string, name: string, type: ActionType }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setIsDeleting(true);
    setError("");
    let res;
    if (type === "DEPARTMENT") res = await deleteDepartment(id);
    else if (type === "ALLOWANCE") res = await deleteAllowance(id);
    else if (type === "DEDUCTION") res = await deleteDeduction(id);

    if (res?.success) {
      setIsOpen(false);
    } else {
      setError(res?.error || "Gagal menghapus data.");
    }
    setIsDeleting(false);
  };

  return (
    <>
      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8" onClick={() => setIsOpen(true)}>
        <Trash2 className="w-4 h-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus Data</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus <strong>{name}</strong>? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded text-sm border border-red-200 mt-2">
              {error}
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isDeleting}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Menghapus..." : "Ya, Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
