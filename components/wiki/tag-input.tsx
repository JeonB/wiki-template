'use client';

import { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
  maxLength?: number;
}

export default function TagInput({
  tags,
  onChange,
  placeholder = '태그를 입력하고 Enter를 누르세요',
  className,
  maxLength = 20,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const normalizeTag = (tag: string): string => {
    return tag
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-_]/g, '')
      .slice(0, maxLength);
  };

  const isValidTag = (tag: string): boolean => {
    const normalized = normalizeTag(tag);
    return normalized.length > 0 && normalized.length <= maxLength;
  };

  const addTag = (tag: string) => {
    const normalized = normalizeTag(tag);
    if (!normalized || normalized.length === 0) return;

    // 중복 체크
    if (tags.includes(normalized)) {
      setInputValue('');
      return;
    }

    // 유효성 검사
    if (!isValidTag(normalized)) return;

    onChange([...tags, normalized]);
    setInputValue('');
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      // 빈 입력창에서 Backspace 시 마지막 태그 삭제
      removeTag(tags[tags.length - 1]);
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      addTag(inputValue);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex min-h-[42px] flex-wrap gap-2 rounded-md border border-input bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-sm"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="rounded-full hover:bg-secondary-foreground/20 focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label={`${tag} 태그 제거`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="min-w-[120px] flex-1 border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>
      <p className="text-muted-foreground text-xs">
        Enter 또는 쉼표(,)로 태그를 추가하세요. 영문, 숫자, 하이픈(-), 언더스코어(_)만 사용 가능합니다.
      </p>
    </div>
  );
}
