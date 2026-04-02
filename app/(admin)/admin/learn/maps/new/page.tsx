import { LearnMapEditorScreen } from "@/components/admin/learn-map-editor-screen";

type Props = {
  searchParams?: Promise<{
    source?: string;
  }>;
};

export default async function AdminNewLearnMapPage({ searchParams }: Props) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const source =
    typeof resolvedSearchParams?.source === "string"
      ? resolvedSearchParams.source
      : undefined;

  return <LearnMapEditorScreen source={source} />;
}
