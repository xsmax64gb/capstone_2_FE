"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, Sparkles, Trophy } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { RecommendedSkeleton } from "@/components/exercises/skeletons";
import { useGetRecommendedExercisesQuery } from "@/store/services/exercisesApi";
import { useI18n } from "@/lib/i18n/context";

export default function RecommendedExercisesPage() {
  const { t } = useI18n();
  const {
    data: items = [],
    isLoading,
    isError,
  } = useGetRecommendedExercisesQuery({ limit: 6 });
  const getTopicLabel = (topic: string) => {
    const labels: Record<string, string> = {
      "daily-life": t("Đời sống hằng ngày"),
      work: t("Công việc"),
      travel: t("Du lịch"),
      technology: t("Công nghệ"),
    };
    return labels[topic] ?? topic;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      mcq: t("Trắc nghiệm lựa chọn"),
      fill_blank: t("Điền vào chỗ trống"),
      matching: t("Nối cặp"),
    };
    return labels[type] ?? type;
  };

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-10">
        <section className="mb-8">
          <Link
            href="/exercises"
            className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-black"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("Quay lại Sân thi đấu bài tập")}
          </Link>
        </section>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold tracking-tight">
            {t("Đề xuất cho bạn")}
          </h1>
          <p className="mt-1 text-slate-500">
            {t(
              "Các bộ được tuyển chọn dựa trên lần làm gần nhất, kỹ năng yếu và tiến độ cấp độ của bạn.",
            )}
          </p>
        </section>

        {isLoading && <RecommendedSkeleton />}

        {isError && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
            {t("Không tải được bài tập đề xuất.")}
          </div>
        )}

        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item, index) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="h-40 bg-slate-100">
                <img
                  src={item.coverImage}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-5">
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                  {t("Gợi ý")} #{index + 1}
                </span>
                {item.isCompleted ? (
                  <span className="mt-3 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                    {t("Đã hoàn thành")}
                  </span>
                ) : null}
                <h3 className="mt-3 text-xl font-bold">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600">
                  {item.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-700">
                    {getTopicLabel(item.topic)}
                  </span>
                  <span className="rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-700">
                    {getTypeLabel(item.type)}
                  </span>
                  <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-700">
                    <Trophy className="mr-1 h-3.5 w-3.5" />+{item.rewardsXp} XP
                  </span>
                </div>
                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/exercises/${item.id}`}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    {t("Chi tiết")}
                  </Link>
                  <Link
                    href={`/exercises/${item.id}/attempt`}
                    className="rounded-lg bg-black px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                  >
                    {t("Bắt đầu ngay")}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </section>

        {!isLoading && !isError && items.length === 0 && (
          <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="font-semibold">
              {t("Chưa có đề xuất phù hợp")}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {t("Hãy làm thêm vài bài để cải thiện gợi ý.")}
            </p>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
