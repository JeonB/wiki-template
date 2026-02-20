import { notFound } from "next/navigation";
import {
  getWikiPage,
  updateWikiPageAction,
} from "@/lib/actions/wiki.actions";
import EditWikiForm from "@/components/wiki/edit-wiki-form";

interface EditWikiPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditWikiPage({ params }: EditWikiPageProps) {
  const { slug } = await params;
  const page = await getWikiPage(slug);

  if (!page) {
    notFound();
  }

  return (
    <div className="p-10">
      <EditWikiForm page={page} onSubmit={updateWikiPageAction.bind(null, slug)} />
    </div>
  );
}
