import { PlacementTestEditorScreen } from "@/components/admin/placement-test-editor-screen";

type Props = {
  searchParams?: Promise<{
    source?: string;
  }>;
};

export default async function NewPlacementTestPage({ searchParams }: Props) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const source =
    typeof resolvedSearchParams?.source === "string"
      ? resolvedSearchParams.source
      : undefined;

  return <PlacementTestEditorScreen source={source} />;
}
