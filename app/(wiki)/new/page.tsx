import { createWikiPageAction } from "@/lib/actions/wiki.actions";
import NewWikiForm from "@/components/wiki/new-wiki-form";

export default function NewWikiPage() {
  return (
    <div className="p-10">
      <h1 className="mb-6 text-3xl font-bold">새 문서 작성</h1>
      <NewWikiForm onSubmit={createWikiPageAction} />
    </div>
  );
}
