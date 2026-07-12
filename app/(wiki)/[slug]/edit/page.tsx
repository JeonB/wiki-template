import { notFound, redirect } from "next/navigation";
import {
  getWikiPage,
  updateWikiPageAction,
} from "@/lib/actions/wiki.actions";
import EditWikiForm from "@/components/wiki/edit-wiki-form";
import { canonicalizeSlug } from "@/lib/utils/slug.utils";

interface EditWikiPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditWikiPage({ params }: EditWikiPageProps) {
  const { slug } = await params;
  const canonicalSlug = canonicalizeSlug(slug);

  if (!canonicalSlug) {
    notFound();
  }

  if (canonicalSlug !== slug) {
    redirect(`/${canonicalSlug}/edit`);
  }

  const page = await getWikiPage(canonicalSlug);

  if (!page) {
    notFound();
  }

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 lg:p-10">
      <EditWikiForm page={page} onSubmit={updateWikiPageAction.bind(null, canonicalSlug)} />
    </div>
  );
}
