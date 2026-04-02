import { LearnMapEditorScreen } from "@/components/admin/learn-map-editor-screen";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditLearnMapPage({ params }: Props) {
  const { id } = await params;

  return <LearnMapEditorScreen mapId={id} />;
}
