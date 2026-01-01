'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import WikiEditor from '@/components/wiki/wiki-editor';
import { Button } from '@/components/ui/button';
import type { WikiPage } from '@/lib/types/wiki.types';

interface EditWikiFormProps {
  page: WikiPage;
  onSubmit: (formData: FormData) => Promise<void>;
}

export default function EditWikiForm({ page, onSubmit }: EditWikiFormProps) {
  const [title, setTitle] = useState(page.frontmatter.title);
  const [content, setContent] = useState(page.content);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      const formData = new FormData(e.currentTarget);
      try {
        await onSubmit(formData);
      } catch (error) {
        console.error('Failed to update wiki page:', error);
        alert('문서 수정에 실패했습니다.');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <WikiEditor title={title} content={content} onTitleChange={setTitle} onContentChange={setContent} />
      <input type="hidden" name="title" value={title} />
      <input type="hidden" name="content" value={content} />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>
          취소
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? '저장 중...' : '저장'}
        </Button>
      </div>
    </form>
  );
}
