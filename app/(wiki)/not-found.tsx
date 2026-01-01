import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center">
      <h1 className="mb-4 text-4xl font-bold">404</h1>
      <p className="mb-8 text-muted-foreground text-lg">문서를 찾을 수 없습니다.</p>
      <Link href="/">
        <Button>목록으로 돌아가기</Button>
      </Link>
    </div>
  );
}
