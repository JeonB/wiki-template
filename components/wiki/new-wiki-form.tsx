'use client';

import { useState, useTransition } from 'react';
import { useRouter, unstable_rethrow } from 'next/navigation';
import WikiEditor from '@/components/wiki/wiki-editor';
import WikiFormFields from '@/components/wiki/wiki-form-fields';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { normalizeSlug } from '@/lib/utils/slug.utils';

interface NewWikiFormProps {
  onSubmit: (formData: FormData) => Promise<string>;
}

export default function NewWikiForm({ onSubmit }: NewWikiFormProps) {
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const formData = new FormData(e.currentTarget);
      try {
        const createdSlug = await onSubmit(formData);
        router.push(`/${createdSlug}`);
        router.refresh();
      } catch (error) {
        unstable_rethrow(error);
        setError(error instanceof Error ? error.message : '문서 생성에 실패했습니다.');
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
      <div>
        <label htmlFor="wiki-slug" className="mb-2 block text-sm font-medium">
          슬러그 (URL에 사용되는 고유한 식별자)
        </label>
        <Input
          id="wiki-slug"
          name="slug"
          value={slug}
          onChange={(e) => setSlug(normalizeSlug(e.target.value))}
          placeholder="예: getting-started"
          required
        />
        <p className="mt-2 text-sm text-muted-foreground">영문 소문자, 숫자, 하이픈(-)만 사용 가능합니다.</p>
      </div>
      <WikiEditor title={title} content={content} onTitleChange={setTitle} onContentChange={setContent} />
      <WikiFormFields category={category} onCategoryChange={setCategory} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="title" value={title} />
      <input type="hidden" name="content" value={content} />
      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>
          취소
        </Button>
        <Button type="submit" disabled={isPending || !slug || !title || !content}>
          {isPending ? '저장 중...' : '저장'}
        </Button>
      </div>
    </form>
  );
}
