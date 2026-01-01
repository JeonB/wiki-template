'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

interface WikiEditorProps {
  title: string;
  content: string;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
}

export default function WikiEditor({ title, content, onTitleChange, onContentChange }: WikiEditorProps) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="wiki-title" className="mb-2 block text-sm font-medium">
          제목
        </label>
        <Input
          id="wiki-title"
          name="title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="문서 제목을 입력하세요"
        />
      </div>
      <div>
        <label htmlFor="wiki-content" className="mb-2 block text-sm font-medium">
          내용 (Markdown)
        </label>
        <Textarea
          id="wiki-content"
          name="content"
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="마크다운 형식으로 문서를 작성하세요"
          className="min-h-[500px] font-mono text-sm"
        />
        <p className="mt-2 text-sm text-muted-foreground">
          마크다운 문법을 사용할 수 있습니다. 예: # 제목, **굵게**, `코드` 등
        </p>
      </div>
    </div>
  );
}
