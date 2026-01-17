'use client';

import TagInput from '@/components/wiki/tag-input';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface WikiFormFieldsProps {
  description: string;
  category: string;
  tags: string[];
  onDescriptionChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onTagsChange: (tags: string[]) => void;
}

export default function WikiFormFields({
  description,
  category,
  tags,
  onDescriptionChange,
  onCategoryChange,
  onTagsChange,
}: WikiFormFieldsProps) {
  return (
    <>
      <div>
        <label htmlFor="wiki-description" className="mb-2 block text-sm font-medium">
          설명 (선택사항)
        </label>
        <Textarea
          id="wiki-description"
          name="description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
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
          onChange={(e) => onCategoryChange(e.target.value)}
          placeholder="예: 가이드, 참고자료, FAQ"
        />
      </div>
      <div>
        <label htmlFor="wiki-tags" className="mb-2 block text-sm font-medium">
          태그 (선택사항)
        </label>
        <TagInput tags={tags} onChange={onTagsChange} />
      </div>
      <input type="hidden" name="description" value={description} />
      <input type="hidden" name="category" value={category} />
      <input type="hidden" name="tags" value={JSON.stringify(tags)} />
    </>
  );
}
