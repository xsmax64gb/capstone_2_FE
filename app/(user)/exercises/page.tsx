"use client";

import { Suspense } from "react";
import ExercisesContent from "@/components/exercises/exercises-content";
import { useI18n } from "@/lib/i18n/context";

function ExercisesFallback() {
  const { t } = useI18n();
  return (
    <div className="mx-auto max-w-7xl px-6 py-10 text-sm text-slate-600">
      {t("Đang tải...")}
    </div>
  );
}

export default function ExercisesPage() {
  return (
    <Suspense fallback={<ExercisesFallback />}>
      <ExercisesContent />
    </Suspense>
  );
}
