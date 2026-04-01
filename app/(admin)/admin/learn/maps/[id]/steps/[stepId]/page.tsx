import { LearnStepEditorScreen } from "@/components/admin/learn-step-editor-screen";

type Props = {
  params: Promise<{
    id: string;
    stepId: string;
  }>;
};

export default async function EditLearnStepPage({ params }: Props) {
  const { id, stepId } = await params;

  return <LearnStepEditorScreen mapId={id} stepId={stepId} />;
}
