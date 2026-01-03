'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import WikiEditor from '@/components/wiki/wiki-editor';
import TagInput from '@/components/wiki/tag-input';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface NewWikiFormProps {
  onSubmit: (formData: FormData) => Promise<void>;
}

export default function NewWikiForm({ onSubmit }: NewWikiFormProps) {
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
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
      <div>
        <label htmlFor="wiki-description" className="mb-2 block text-sm font-medium">
          설명 (선택사항)
        </label>
        <Textarea
          id="wiki-description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="문서에 대한 간단한 설명을 입력하세요"
          rows={2}
          className="resize-none"
        />
      </div>
      <div>
        <label htmlFor="wiki-category" className="mb-2 block text-sm font-medium">
          카테고리 (선택사항)
        </label>
        <Input
          id="wiki-category"
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="예: 가이드, 참고자료, FAQ"
        />
      </div>
      <div>
        <label htmlFor="wiki-tags" className="mb-2 block text-sm font-medium">
          태그 (선택사항)
        </label>
        <TagInput tags={tags} onChange={setTags} />
      </div>
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="title" value={title} />
      <input type="hidden" name="content" value={content} />
      <input type="hidden" name="description" value={description} />
      <input type="hidden" name="category" value={category} />
      <input type="hidden" name="tags" value={JSON.stringify(tags)} />
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
