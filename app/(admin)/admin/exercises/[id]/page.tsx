import { ExerciseEditorScreen } from "@/components/admin/exercise-editor-screen";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditExercisePage({ params }: Props) {
  const { id } = await params;

  return <ExerciseEditorScreen exerciseId={id} />;
}
