"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import AiExerciseWizard from "@/components/exercises/ai-exercise-wizard";
import { notify } from "@/lib/admin";
import {
  AI_EXERCISE_BUILDER_FEATURE_KEY,
  getFeatureQuotaBlockedMessage,
  getFeatureQuotaItem,
  isFeatureQuotaBlocked,
} from "@/lib/feature-quota";
import { useI18n } from "@/lib/i18n/context";
import { useGetMyFeatureQuotasQuery } from "@/store/services/paymentApi";

export default function CreateAiExercisePage() {
  const { t } = useI18n();
  const { data: featureQuotaOverview, isLoading: isQuotaLoading } =
    useGetMyFeatureQuotasQuery();
  const hasShownQuotaNoticeRef = useRef(false);
  const aiExerciseQuota = useMemo(
    () =>
      getFeatureQuotaItem(featureQuotaOverview, AI_EXERCISE_BUILDER_FEATURE_KEY),
    [featureQuotaOverview],
  );
  const isQuotaBlocked = isFeatureQuotaBlocked(aiExerciseQuota);
  const quotaBlockedMessage = getFeatureQuotaBlockedMessage(
    aiExerciseQuota,
    t("Tạo bài tập bằng AI"),
  );

  useEffect(() => {
    if (!isQuotaBlocked || hasShownQuotaNoticeRef.current) {
      return;
    }

    hasShownQuotaNoticeRef.current = true;
    notify({
      title: t("Không thể dùng tính năng AI"),
      message: quotaBlockedMessage,
      type: "warning",
    });
  }, [isQuotaBlocked, quotaBlockedMessage, t]);

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

        {isQuotaLoading && !featureQuotaOverview ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
            {t("Đang kiểm tra quota tạo AI...")}
          </section>
        ) : isQuotaBlocked ? (
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-amber-950">
              {t("Tính năng AI hiện không khả dụng")}
            </h2>
            <p className="mt-2 text-sm leading-7 text-amber-900">
              {quotaBlockedMessage}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/payments"
                className="inline-flex items-center rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                {t("Xem quota và nâng cấp gói")}
              </Link>
              <Link
                href="/exercises"
                className="inline-flex items-center rounded-lg border border-amber-200 bg-white px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-100"
              >
                {t("Quay lại bài tập")}
              </Link>
            </div>
          </section>
        ) : (
          <AiExerciseWizard />
        )}
      </main>
    </ProtectedRoute>
  );
}
