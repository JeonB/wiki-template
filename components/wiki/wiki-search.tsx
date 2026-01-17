"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { searchWikiPages } from "@/lib/actions/wiki.actions";
import { highlightText } from "@/lib/utils/search.utils";
import type { WikiListItem } from "@/lib/types/wiki.types";

interface WikiSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function WikiSearch({ open, onOpenChange }: WikiSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<WikiListItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  // 검색 실행
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const searchResults = await searchWikiPages(searchQuery);
      setResults(searchResults);
      setSelectedIndex(0);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Search error:', error);
      }
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // 검색어 변경 시 검색 실행 (디바운싱)
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  // 전역 키보드 단축키 처리 (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K로 검색 모달 열기/닫기
      // 입력 필드에 포커스가 있을 때는 무시
      if (
        (e.metaKey || e.ctrlKey) &&
        e.key === "k" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  // 모달이 열릴 때 포커스 설정
  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
      // 입력창에 포커스 (약간의 지연 후)
      setTimeout(() => {
        const input = document.querySelector(
          "[data-search-input]"
        ) as HTMLInputElement;
        input?.focus();
      }, 100);
    }
  }, [open]);

  // 키보드 네비게이션
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      handleSelectResult(results[selectedIndex]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onOpenChange(false);
    }
  };

  const handleSelectResult = (item: WikiListItem) => {
    router.push(`/${item.slug}`);
    onOpenChange(false);
    setQuery("");
    setResults([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>문서 검색</DialogTitle>
          <DialogDescription>
            제목, 설명, 태그, 카테고리에서 검색합니다
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              data-search-input
              type="text"
              placeholder="검색어를 입력하세요... (Cmd/Ctrl + K)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10"
            />
          </div>
          {isSearching && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              검색 중...
            </div>
          )}
          {!isSearching && query && results.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              검색 결과가 없습니다.
            </div>
          )}
          {!isSearching && !query && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              검색어를 입력하여 문서를 찾아보세요.
            </div>
          )}
          {!isSearching && results.length > 0 && (
            <div className="max-h-[400px] space-y-1 overflow-y-auto">
              {results.map((item, index) => {
                const titleParts = highlightText(item.title, query);
                return (
                  <button
                    key={item.slug}
                    type="button"
                    onClick={() => handleSelectResult(item)}
                    className={`w-full rounded-md border p-3 text-left transition-colors ${
                      index === selectedIndex
                        ? "border-primary bg-accent"
                        : "border-transparent hover:bg-accent"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold">
                          {titleParts.map((part, i) =>
                            part.highlight ? (
                              <mark
                                key={i}
                                className="bg-yellow-200 dark:bg-yellow-800"
                              >
                                {part.text}
                              </mark>
                            ) : (
                              <span key={i}>{part.text}</span>
                            )
                          )}
                        </h3>
                        {item.description && (
                          <p className="text-muted-foreground mt-1 text-sm line-clamp-1">
                            {item.description}
                          </p>
                        )}
                        <div className="mt-2 flex flex-wrap gap-2">
                          {item.category && (
                            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">
                              {item.category}
                            </span>
                          )}
                          {item.tags && item.tags.length > 0 && (
                            <>
                              {item.tags.slice(0, 2).map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-full bg-muted px-2 py-0.5 text-xs"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
          <div className="flex items-center justify-between border-t pt-2 text-xs text-muted-foreground">
            <div className="flex gap-4">
              <span>↑↓ 방향키로 탐색</span>
              <span>Enter로 선택</span>
              <span>Esc로 닫기</span>
            </div>
            <span>Cmd/Ctrl + K로 열기</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
