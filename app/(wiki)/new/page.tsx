import { createWikiPageAction } from "@/lib/actions/wiki.actions";
import NewWikiForm from "@/components/wiki/new-wiki-form";

export default function NewWikiPage() {
  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 lg:p-10">
      <h1 className="mb-6 text-2xl font-bold sm:text-3xl">새 문서 작성</h1>
      <NewWikiForm onSubmit={createWikiPageAction} />
    </div>
  );
}
