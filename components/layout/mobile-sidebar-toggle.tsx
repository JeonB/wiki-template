"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import WikiSidebar from "./wiki-sidebar";
import type { WikiListItem } from "@/lib/types/wiki.types";

interface MobileSidebarToggleProps {
  items: WikiListItem[];
}

export default function MobileSidebarToggle({
  items,
}: MobileSidebarToggleProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setOpen(true)}
        aria-label="사이드바 열기"
      >
        <Menu className="h-5 w-5" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[280px] p-0 sm:max-w-[280px]">
          <DialogHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                aria-label="닫기"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          <div className="max-h-[calc(100vh-120px)] overflow-y-auto">
            <WikiSidebar items={items} className="border-0" />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
