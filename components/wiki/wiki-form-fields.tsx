'use client';

import { Input } from '@/components/ui/input';

interface WikiFormFieldsProps {
  category: string;
  onCategoryChange: (value: string) => void;
}

export default function WikiFormFields({ category, onCategoryChange }: WikiFormFieldsProps) {
  return (
    <>
      <div>
        <label htmlFor="wiki-category" className="mb-2 block text-sm font-medium">
          카테고리 (선택사항)
        </label>
        <Input
          id="wiki-category"
          name="category"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          placeholder="예: 가이드, 참고자료, FAQ"
        />
      </div>
      <input type="hidden" name="category" value={category} />
    </>
  );
}
