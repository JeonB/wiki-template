import { redirect } from 'next/navigation';
import { createWikiPage } from '@/lib/actions/wiki.actions';
import NewWikiForm from '@/components/wiki/new-wiki-form';

export default function NewWikiPage() {
  async function handleCreate(formData: FormData) {
    'use server';
    const slug = formData.get('slug') as string;
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;

    if (!slug || !title || !content) {
      throw new Error('슬러그, 제목, 내용을 모두 입력해주세요');
    }

    await createWikiPage(slug, title, content);
    redirect(`/${slug}`);
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">새 문서 작성</h1>
      <NewWikiForm onSubmit={handleCreate} />
    </div>
  );
}
