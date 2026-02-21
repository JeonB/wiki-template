"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "./theme-toggle";
import WikiSearch from "@/components/wiki/wiki-search";
import MobileSidebarToggle from "./mobile-sidebar-toggle";
import type { WikiListItem } from "@/lib/types/wiki.types";

interface WikiNavProps {
  items: WikiListItem[];
}

export default function WikiNav({ items }: WikiNavProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <nav className="border-b bg-background">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <MobileSidebarToggle items={items} />
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <FileText className="h-5 w-5" />
              Wiki
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchOpen(true)}
              aria-label="검색"
            >
              <Search className="mr-2 h-4 w-4" />
              검색
            </Button>
            <Link href="/new">
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" /> 새 문서
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </nav>
      <WikiSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
