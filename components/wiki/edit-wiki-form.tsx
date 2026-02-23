'use client';

import { useState, useTransition } from 'react';
import { useRouter, unstable_rethrow } from 'next/navigation';
import WikiEditor from '@/components/wiki/wiki-editor';
import WikiFormFields from '@/components/wiki/wiki-form-fields';
import { Button } from '@/components/ui/button';
import type { WikiPage } from '@/lib/types/wiki.types';

interface EditWikiFormProps {
  page: WikiPage;
  onSubmit: (formData: FormData) => Promise<void>;
}

export default function EditWikiForm({ page, onSubmit }: EditWikiFormProps) {
  const [title, setTitle] = useState(page.frontmatter.title);
  const [content, setContent] = useState(page.content);
  const [category, setCategory] = useState(page.frontmatter.category || '');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const formData = new FormData(e.currentTarget);
      try {
        await onSubmit(formData);
      } catch (error) {
        unstable_rethrow(error);
        setError(error instanceof Error ? error.message : '문서 수정에 실패했습니다.');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}
      <WikiEditor title={title} content={content} onTitleChange={setTitle} onContentChange={setContent} />
      <WikiFormFields category={category} onCategoryChange={setCategory} />
      <input type="hidden" name="title" value={title} />
      <input type="hidden" name="content" value={content} />
      <div className="flex flex-wrap justify-end gap-2">
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
