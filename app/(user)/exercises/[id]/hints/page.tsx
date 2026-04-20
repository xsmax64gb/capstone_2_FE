"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { HintsSkeleton } from "@/components/exercises/skeletons";
import {
  useGetExerciseByIdQuery,
  useGetExerciseHintsQuery,
} from "@/store/services/exercisesApi";
import { useI18n } from "@/lib/i18n/context";

const TYPE_LABELS: Record<string, string> = {
  mcq: "Trắc nghiệm",
  fill_blank: "Điền vào chỗ trống",
  matching: "Nối cặp",
};

export default function ExerciseHintsPage() {
  const { t, lang } = useI18n();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  const { data: detailData } = useGetExerciseByIdQuery(id, { skip: !id });
  const { data: hintData, isLoading, isError } = useGetExerciseHintsQuery(id, { skip: !id });

  const exercise = detailData?.exercise;
  const personalized = hintData?.personalized ?? [];
  const strategies = hintData?.strategies ?? [];
  const typeLabel = exercise ? (TYPE_LABELS[exercise.type] ?? exercise.type) : "";

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
        <nav className="mb-6">
          <Link
            href={exercise ? `/exercises/${exercise.id}` : "/exercises"}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            {exercise ? t("Quay lại bài tập") : t("Sân thi đấu bài tập")}
          </Link>
        </nav>

        <section className="mb-8 overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-5 sm:px-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                <Sparkles className="h-6 w-6 text-slate-600" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                  {t("Gợi ý AI")}
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  {hintData?.title ?? exercise?.title ?? t("Bài tập")}
                  {typeLabel ? ` · ${typeLabel}` : ""}
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              {t(
                "Gợi ý được tạo theo nội dung bài và lịch sử học của bạn. Đọc nhanh trước khi làm bài để tập trung đúng hướng.",
              )}
            </p>
          </div>
        </section>

        {isLoading && <HintsSkeleton />}
        {isError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
            {t("Không tải được gợi ý. Vui lòng thử lại.")}
          </div>
        )}

        {!isLoading && !isError && (
          <div className="space-y-6">
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3.5">
                <BookOpen className="h-4 w-4 text-slate-500" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {t("Gợi ý cá nhân hóa")}
                  </p>
                  <p className="text-xs text-slate-500">
                    {t("Dựa trên tiến độ và lịch sử làm bài")}
                  </p>
                </div>
              </div>
              <div className="space-y-2 p-4 sm:p-5">
                {personalized.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-500">
                    {t("Chưa có gợi ý cá nhân. Hãy làm thêm bài để hệ thống hiểu rõ hơn.")}
                  </p>
                ) : (
                  personalized.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3"
                    >
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                        {i + 1}
                      </span>
                      <p className="text-sm leading-relaxed text-slate-700">{item}</p>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3.5">
                <Lightbulb className="h-4 w-4 text-slate-500" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {t("Chiến thuật làm bài")}
                  </p>
                  <p className="text-xs text-slate-500">{t("Mẹo áp dụng cho dạng bài này")}</p>
                </div>
              </div>
              <div className="space-y-2 p-4 sm:p-5">
                {strategies.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-500">
                    {t("Chưa có chiến thuật. Thử tải lại trang sau.")}
                  </p>
                ) : (
                  strategies.map((hint, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3"
                    >
                      <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <p className="text-sm leading-relaxed text-slate-700">{hint}</p>
                    </div>
                  ))
                )}
              </div>
            </section>

            {(personalized.length > 0 || strategies.length > 0) && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                <p className="flex items-center gap-1.5 font-semibold text-slate-900">
                  <CheckCircle2 className="h-4 w-4 text-slate-600" />
                  {t("Sẵn sàng làm bài?")}
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  {lang === "en"
                    ? `You've read ${personalized.length + strategies.length} hints.`
                    : `Bạn đã xem ${personalized.length + strategies.length} gợi ý.`}
                </p>
              </div>
            )}
          </div>
        )}

        {exercise && (
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/exercises/${exercise.id}/attempt`}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            >
              <CheckCircle2 className="h-4 w-4" />
              {t("Bắt đầu làm bài")}
            </Link>
            <Link
              href={`/exercises/${exercise.id}`}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("Xem chi tiết bài tập")}
            </Link>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
