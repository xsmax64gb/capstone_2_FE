import { LearnStepEditorScreen } from "@/components/admin/learn-step-editor-screen";

type Props = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    source?: string;
  }>;
};

export default async function CreateLearnStepPage({ params, searchParams }: Props) {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const source =
    typeof resolvedSearchParams?.source === "string"
      ? resolvedSearchParams.source
      : undefined;

  return <LearnStepEditorScreen mapId={id} source={source} />;
}
