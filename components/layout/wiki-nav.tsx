import Link from "next/link";
import { FileText, Home, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "./theme-toggle";

export default function WikiNav() {
  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold"
        >
          <FileText className="h-5 w-5" />
          Wiki
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <Home className="mr-2 h-4 w-4" />
              목록
            </Button>
          </Link>
          <Link href="/new">
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />새 문서
            </Button>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
