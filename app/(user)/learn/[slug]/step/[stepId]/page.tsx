"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useGetLearnMapBySlugQuery } from "@/lib/api/learnApi";
import { useI18n } from "@/lib/i18n/context";
import { LearnStepClient } from "./learn-step-client";

function LearnStepContent() {
  const { lang } = useI18n();
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const stepId = typeof params.stepId === "string" ? params.stepId : "";
  const { data, isLoading } = useGetLearnMapBySlugQuery(slug, { skip: !slug });
  const step = data?.steps?.find((s) => s.id === stepId);
  const bi = (vi: string, en: string) => (lang === "vi" ? vi : en);

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col px-5 py-6 md:px-8 md:py-8">
      <Link
        href={`/learn/${slug}`}
        className="mb-5 inline-flex items-center text-sm font-semibold text-slate-600 hover:text-black"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {bi("Quay lại bản đồ", "Back to map")}
      </Link>

      {isLoading && (
        <p className="text-sm text-slate-500">{bi("Đang tải…", "Loading…")}</p>
      )}
      {!isLoading && !step && (
        <p className="text-sm text-red-600">
          {bi(
            "Không tìm thấy bước trong bản đồ này.",
            "This step was not found in the map.",
          )}
        </p>
      )}
      {step && <LearnStepClient slug={slug} step={step} />}
    </div>
  );
}

export default function LearnStepPage() {
  return (
    <ProtectedRoute>
      <main className="min-h-[100vh] bg-gradient-to-b from-slate-50 via-white to-slate-100">
        <Suspense
          fallback={
            <div className="mx-auto w-full max-w-[1440px] px-5 py-6">
              <p className="text-sm text-slate-500">Loading…</p>
            </div>
          }
        >
          <LearnStepContent />
        </Suspense>
      </main>
    </ProtectedRoute>
  );
}
