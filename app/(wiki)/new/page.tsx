import { redirect } from "next/navigation";
import { createWikiPageFromFormData } from "@/lib/actions/wiki.actions";
import NewWikiForm from "@/components/wiki/new-wiki-form";

export default function NewWikiPage() {
  async function handleCreate(formData: FormData) {
    "use server";
    await createWikiPageFromFormData(formData);
    const slug = formData.get("slug") as string;
    redirect(`/${slug}`);
  }

  return (
    <div className="p-10">
      <h1 className="mb-6 text-3xl font-bold">새 문서 작성</h1>
      <NewWikiForm onSubmit={handleCreate} />
    </div>
  );
}
