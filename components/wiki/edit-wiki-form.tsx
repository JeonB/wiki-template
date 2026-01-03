'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import WikiEditor from '@/components/wiki/wiki-editor';
import TagInput from '@/components/wiki/tag-input';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import type { WikiPage } from '@/lib/types/wiki.types';

interface EditWikiFormProps {
  page: WikiPage;
  onSubmit: (formData: FormData) => Promise<void>;
}

export default function EditWikiForm({ page, onSubmit }: EditWikiFormProps) {
  const [title, setTitle] = useState(page.frontmatter.title);
  const [content, setContent] = useState(page.content);
  const [description, setDescription] = useState(page.frontmatter.description || '');
  const [category, setCategory] = useState(page.frontmatter.category || '');
  const [tags, setTags] = useState<string[]>(page.frontmatter.tags || []);
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
      <input type="hidden" name="title" value={title} />
      <input type="hidden" name="content" value={content} />
      <input type="hidden" name="description" value={description} />
      <input type="hidden" name="category" value={category} />
      <input type="hidden" name="tags" value={JSON.stringify(tags)} />
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
