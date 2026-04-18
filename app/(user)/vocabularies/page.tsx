"use client";

import { Suspense } from "react";
import VocabulariesContent from "@/components/vocabularies/vocabularies-content";
import { useI18n } from "@/lib/i18n/context";

function VocabulariesFallback() {
  const { t } = useI18n();
  return (
    <div className="mx-auto max-w-7xl px-6 py-10 text-sm text-slate-600">
      {t("Đang tải...")}
    </div>
  );
}

export default function VocabulariesPage() {
  return (
    <Suspense fallback={<VocabulariesFallback />}>
      <VocabulariesContent />
    </Suspense>
  );
}
