import { redirect } from 'next/navigation';
import { createWikiPage } from '@/lib/actions/wiki.actions';
import NewWikiForm from '@/components/wiki/new-wiki-form';

export default function NewWikiPage() {
  async function handleCreate(formData: FormData) {
    'use server';
    const slug = formData.get('slug') as string;
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const description = (formData.get('description') as string) || undefined;
    const category = (formData.get('category') as string) || undefined;
    const tagsJson = formData.get('tags') as string;
    let tags: string[] | undefined;

    try {
      tags = tagsJson ? JSON.parse(tagsJson) : undefined;
    } catch {
      tags = undefined;
    }

    if (!slug || !title || !content) {
      throw new Error('슬러그, 제목, 내용을 모두 입력해주세요');
    }

    await createWikiPage(slug, title, content, {
      description,
      category,
      tags,
    });
    redirect(`/${slug}`);
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">새 문서 작성</h1>
      <NewWikiForm onSubmit={handleCreate} />
    </div>
  );
}
