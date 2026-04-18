"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import AiExerciseWizard from "@/components/exercises/ai-exercise-wizard";
import { useI18n } from "@/lib/i18n/context";

export default function CreateAiExercisePage() {
  const { t } = useI18n();

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-10">
        <nav className="mb-6">
          <Link
            href="/exercises"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("Sân thi đấu bài tập")}
          </Link>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            {t("Tạo bài tập bằng AI")}
          </h1>
          <p className="mt-2 text-slate-600">
            {t("Chỉ tạo bằng AI — không nhập thủ công")}
          </p>
        </header>

        <AiExerciseWizard />
      </main>
    </ProtectedRoute>
  );
}
