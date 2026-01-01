import { notFound, redirect } from 'next/navigation';
import { getWikiPage, updateWikiPage } from '@/lib/actions/wiki.actions';
import EditWikiForm from '@/components/wiki/edit-wiki-form';

interface EditWikiPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditWikiPage({ params }: EditWikiPageProps) {
  const { slug } = await params;
  const page = await getWikiPage(slug);

  if (!page) {
    notFound();
  }

  async function handleUpdate(formData: FormData) {
    'use server';
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;

    if (!title || !content) {
      throw new Error('제목과 내용을 입력해주세요');
    }

    await updateWikiPage(slug, { title, content });
    redirect(`/${slug}`);
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">문서 수정</h1>
      <EditWikiForm page={page} onSubmit={handleUpdate} />
    </div>
  );
}
