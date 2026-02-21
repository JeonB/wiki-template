"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorFallbackProps {
  error: Error & { digest?: string };
  reset: () => void;
  /** 루트 레벨에서 사용 시, "목록" 대신 "홈" 노출 */
  isRoot?: boolean;
}

export default function ErrorFallback({
  error,
  reset,
  isRoot = false,
}: ErrorFallbackProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12">
      <div
        className={cn(
          "w-full max-w-md rounded-xl border bg-card px-8 py-10 shadow-sm",
          "border-border text-card-foreground"
        )}
      >
        <div className="flex flex-col items-center text-center">
          <span
            className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive"
            aria-hidden
          >
            <AlertCircle className="h-6 w-6" strokeWidth={2} />
          </span>
          <h1 className="mb-2 text-xl font-semibold text-foreground">
            문제가 발생했습니다
          </h1>
          <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
            {isRoot
              ? "일시적인 오류일 수 있습니다. 다시 시도하거나 홈으로 돌아가 보세요."
              : "일시적인 오류일 수 있습니다. 다시 시도하거나 목록에서 다른 문서를 찾아보세요."}
          </p>

          {error.message && (
            <div
              className="mb-6 max-h-24 w-full overflow-y-auto rounded-lg border border-border bg-muted/50 px-4 py-3 text-left"
              role="alert"
            >
              <p className="font-mono text-xs leading-relaxed text-muted-foreground wrap-break-word">
                {error.message}
              </p>
            </div>
          )}

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
            <Button onClick={reset} size="default">
              다시 시도
            </Button>
            <Button asChild variant="outline" size="default">
              <Link href="/">
                {isRoot ? "홈으로 돌아가기" : "목록으로 돌아가기"}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
