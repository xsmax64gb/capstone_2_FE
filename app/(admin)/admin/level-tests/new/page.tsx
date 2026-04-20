import { LevelTestEditorScreen } from "@/components/admin/level-test-editor-screen";

type Props = {
  searchParams?: Promise<{
    source?: string;
  }>;
};

export default async function NewLevelTestPage({ searchParams }: Props) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const source =
    typeof resolvedSearchParams?.source === "string"
      ? resolvedSearchParams.source
      : undefined;

  return <LevelTestEditorScreen source={source} />;
}
