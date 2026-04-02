import { PlacementTestEditorScreen } from "@/components/admin/placement-test-editor-screen";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditPlacementTestPage({ params }: Props) {
  const { id } = await params;

  return <PlacementTestEditorScreen testId={id} />;
}
