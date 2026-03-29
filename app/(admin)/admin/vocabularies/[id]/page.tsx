import { VocabularyEditorScreen } from "@/components/admin/vocabulary-editor-screen";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditVocabularyPage({ params }: Props) {
  const { id } = await params;

  return <VocabularyEditorScreen vocabularyId={id} />;
}
