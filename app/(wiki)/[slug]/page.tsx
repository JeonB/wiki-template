import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getWikiPage } from '@/lib/actions/wiki.actions';
import WikiViewer from '@/components/wiki/wiki-viewer';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import DeleteWikiDialog from '@/components/wiki/delete-wiki-dialog';

interface WikiPageProps {
  params: Promise<{ slug: string }>;
}

export default async function WikiPage({ params }: WikiPageProps) {
  const { slug } = await params;
  const page = await getWikiPage(slug);

  if (!page) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex-1" />
        <div className="flex gap-2">
          <Link href={`/${slug}/edit`}>
            <Button variant="outline" size="sm">
              <Pencil className="mr-2 h-4 w-4" />
              수정
            </Button>
          </Link>
          <DeleteWikiDialog slug={slug} title={page.frontmatter.title} />
        </div>
      </div>
      <WikiViewer page={page} />
    </div>
  );
}
