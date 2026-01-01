'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import WikiEditor from '@/components/wiki/wiki-editor';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface NewWikiFormProps {
  onSubmit: (formData: FormData) => Promise<void>;
}

export default function NewWikiForm({ onSubmit }: NewWikiFormProps) {
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      const formData = new FormData(e.currentTarget);
      try {
        await onSubmit(formData);
      } catch (error) {
        console.error('Failed to create wiki page:', error);
        alert(error instanceof Error ? error.message : '문서 생성에 실패했습니다.');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="wiki-slug" className="mb-2 block text-sm font-medium">
          슬러그 (URL에 사용되는 고유한 식별자)
        </label>
        <Input
          id="wiki-slug"
          name="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-'))}
          placeholder="예: getting-started"
          required
        />
        <p className="mt-2 text-sm text-muted-foreground">영문 소문자, 숫자, 하이픈(-)만 사용 가능합니다.</p>
      </div>
      <WikiEditor title={title} content={content} onTitleChange={setTitle} onContentChange={setContent} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="title" value={title} />
      <input type="hidden" name="content" value={content} />
      <div className="flex justify-end gap-2">
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
