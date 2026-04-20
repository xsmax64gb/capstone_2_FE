import { LevelTestEditorScreen } from "@/components/admin/level-test-editor-screen";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditLevelTestPage({ params }: Props) {
  const { id } = await params;

  return <LevelTestEditorScreen testId={id} />;
}
