"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function ExpandableText({ text, maxLength = 60 }: { text: string; maxLength?: number }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!text) return <span>-</span>;

  if (text.length <= maxLength) {
    return <span className="block whitespace-normal break-words leading-relaxed">{text}</span>;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="group cursor-pointer text-left focus:outline-none block w-full whitespace-normal break-words leading-relaxed">
        <span className="line-clamp-2" title={text}>{text}</span>
        <span className="text-[10px] font-medium text-blue-600 hover:text-blue-800 hover:underline mt-0.5 block">
          Baca selengkapnya
        </span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Detail Catatan</DialogTitle>
        </DialogHeader>
        <div className="mt-2 text-sm text-zinc-700 whitespace-pre-wrap leading-relaxed bg-zinc-50 p-4 rounded-md border border-zinc-100">
          {text}
        </div>
      </DialogContent>
    </Dialog>
  );
}
