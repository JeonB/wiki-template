'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteWikiPage } from '@/lib/actions/wiki.actions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface DeleteWikiDialogProps {
  slug: string;
  title: string;
}

export default function DeleteWikiDialog({ slug, title }: DeleteWikiDialogProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      try {
        await deleteWikiPage(slug);
        setOpen(false);
        router.push('/');
        router.refresh();
      } catch (error) {
        setError(error instanceof Error ? error.message : '문서 삭제에 실패했습니다.');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="mr-2 h-4 w-4" />
          삭제
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>문서 삭제</DialogTitle>
          <DialogDescription>
            정말로 &quot;{title}&quot; 문서를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <div className="rounded-md border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            취소
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending ? '삭제 중...' : '삭제'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
