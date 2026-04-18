"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Brain,
  CheckCircle2,
  Lightbulb,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { HintsSkeleton } from "@/components/exercises/skeletons";
import {
  useGetExerciseByIdQuery,
  useGetExerciseHintsQuery,
} from "@/store/services/exercisesApi";

const TYPE_LABELS: Record<string, string> = {
  mcq: "Trắc nghiệm",
  fill_blank: "Điền vào chỗ trống",
  matching: "Nối cặp",
};

export default function ExerciseHintsPage() {
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
      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        {/* Back */}
        <nav className="mb-6">
          <Link
            href={exercise ? `/exercises/${exercise.id}` : "/exercises"}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại bài tập
          </Link>
        </nav>

        {/* Header */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-100">
              <Sparkles className="h-6 w-6 text-violet-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-violet-500">
                AI Hint Generator
              </p>
              <h1 className="mt-0.5 text-xl font-bold text-slate-900">
                Gợi ý thông minh
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                {hintData?.title ?? exercise?.title ?? "Bài tập"}
                {typeLabel ? ` · ${typeLabel}` : ""}
              </p>
            </div>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-violet-700">
            💡 AI đã phân tích bài tập này và tạo ra các gợi ý cá nhân hóa theo trình độ của bạn. Đọc kỹ trước khi bắt đầu để đạt điểm cao hơn.
          </p>
        </div>

        {isLoading && <HintsSkeleton />}
        {isError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
            Không tải được gợi ý. Vui lòng thử lại.
          </div>
        )}

        {!isLoading && !isError && (
          <div className="space-y-4">
            {/* Personalized tips */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/60 px-5 py-3.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100">
                  <Brain className="h-4 w-4 text-violet-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Gợi ý cá nhân hóa</p>
                  <p className="text-xs text-slate-500">Dựa trên lịch sử học tập của bạn</p>
                </div>
              </div>
              <div className="space-y-2 p-4">
                {personalized.length === 0 ? (
                  <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-400">
                    Chưa có gợi ý cá nhân. Hãy làm thêm bài tập để AI hiểu rõ hơn về bạn.
                  </p>
                ) : (
                  personalized.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-xl border border-violet-100 bg-violet-50/50 px-4 py-3"
                    >
                      <WandSparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" />
                      <p className="text-sm leading-relaxed text-slate-700">{item}</p>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Strategy hints */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/60 px-5 py-3.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100">
                  <Lightbulb className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Chiến thuật làm bài</p>
                  <p className="text-xs text-slate-500">Mẹo giúp bạn đạt điểm cao hơn</p>
                </div>
              </div>
              <div className="space-y-2 p-4">
                {strategies.length === 0 ? (
                  <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-400">
                    Chưa có chiến thuật. Thử lại sau.
                  </p>
                ) : (
                  strategies.map((hint, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50/50 px-4 py-3"
                    >
                      <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                      <p className="text-sm leading-relaxed text-slate-700">{hint}</p>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Checklist reminder */}
            {(personalized.length > 0 || strategies.length > 0) && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                <p className="flex items-center gap-1.5 font-semibold">
                  <CheckCircle2 className="h-4 w-4" />
                  Đã sẵn sàng?
                </p>
                <p className="mt-1 text-xs">
                  Bạn đã đọc xong {personalized.length + strategies.length} gợi ý. Hãy bắt đầu làm bài ngay!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {exercise && (
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={`/exercises/${exercise.id}/attempt`}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-700"
            >
              <CheckCircle2 className="h-4 w-4" />
              Bắt đầu làm bài
            </Link>
            <Link
              href={`/exercises/${exercise.id}`}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Xem chi tiết bài tập
            </Link>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
