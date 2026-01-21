import { notFound, redirect } from "next/navigation";
import {
  getWikiPage,
  updateWikiPageFromFormData,
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

  async function handleUpdate(formData: FormData) {
    "use server";
    await updateWikiPageFromFormData(slug, formData);
    redirect(`/${slug}`);
  }

  return (
    <div className="p-10">
      <EditWikiForm page={page} onSubmit={handleUpdate} />
    </div>
  );
}
