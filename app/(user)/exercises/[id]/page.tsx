"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BookCheck,
  CheckCircle2,
  Clock3,
  Sparkles,
  Trophy,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { TOPIC_LABELS, TYPE_LABELS } from "../data";
import { ExerciseDetailSkeleton } from "@/components/exercises/skeletons";
import {
  useGetExerciseByIdQuery,
  useGetExerciseLeaderboardQuery,
} from "@/lib/api/exercisesApi";
import { useI18n } from "@/lib/i18n/context";

export default function ExerciseDetailPage() {
  const { t } = useI18n();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  const { data, isLoading, isError } = useGetExerciseByIdQuery(id, {
    skip: !id,
  });
  const { data: leaderboardData } = useGetExerciseLeaderboardQuery(id, {
    skip: !id,
  });

  const exercise = data?.exercise;
  const relatedExercises = data?.related ?? [];
  const topRank = leaderboardData?.leaderboard?.[0];

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
        <section className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/exercises"
            className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-black"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("Quay lại Sân thi đấu bài tập")}
          </Link>
          {exercise && (
            <div className="flex gap-2">
              <Link
                href={`/exercises/${exercise.id}/hints`}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                {t("Gợi ý AI")}
              </Link>
              <Link
                href={`/exercises/${exercise.id}/leaderboard`}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                {t("Bảng xếp hạng")}
              </Link>
            </div>
          )}
        </section>

        {isLoading && <ExerciseDetailSkeleton />}

        {isError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
            {t("Không tải được chi tiết bài tập.")}
          </div>
        )}

        {!isLoading && !isError && !exercise && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="font-semibold">{t("Không tìm thấy bài tập")}</p>
            <p className="mt-1 text-sm text-slate-500">
              {t("Bài tập có thể đã bị xóa hoặc liên kết không hợp lệ.")}
            </p>
          </div>
        )}

        {exercise && (
          <>
            <section className="mb-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="h-44 bg-slate-100">
                <img
                  src={exercise.coverImage}
                  alt={exercise.title}
                  className="h-full w-full object-cover opacity-90"
                />
              </div>
              <div className="p-6">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      {getTopicLabel(exercise.topic)}
                    </p>
                    <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                      {exercise.title}
                    </h1>
                    <p className="mt-2 text-slate-500">
                      {exercise.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold">
                      {exercise.level}
                    </span>
                    <Link
                      href={`/exercises/${exercise.id}/attempt`}
                      className="inline-flex items-center rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      {t("Bắt đầu ngay")}
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-10 lg:grid-cols-12">
              <div className="space-y-6 lg:col-span-8">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="mb-4 text-xl font-bold">
                    {t("Chi tiết bài tập")}
                  </h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-lg bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {t("Dạng bài")}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {getTypeLabel(exercise.type)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {t("Chủ đề")}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {getTopicLabel(exercise.topic)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {t("Câu hỏi")}
                      </p>
                      <p className="mt-1 inline-flex items-center text-sm font-semibold text-slate-900">
                        <BookCheck className="mr-1.5 h-4 w-4" />
                        {exercise.questionCount} questions
                      </p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {t("Thời lượng")}
                      </p>
                      <p className="mt-1 inline-flex items-center text-sm font-semibold text-slate-900">
                        <Clock3 className="mr-1.5 h-4 w-4" />
                        {exercise.durationMinutes} mins
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-3 text-lg font-bold">
                    {t("Cách bài tập này hoạt động")}
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li>
                      {t("1. Mở trang làm bài và trả lời câu hỏi theo thứ tự.")}
                    </li>
                    <li>
                      {t(
                        "2. Nộp bài để nhận điểm, ước tính XP và thống kê tốc độ.",
                      )}
                    </li>
                    <li>
                      {t(
                        "3. Vào trang xem lại để kiểm tra từng giải thích chi tiết.",
                      )}
                    </li>
                  </ul>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link
                      href={`/exercises/${exercise.id}/hints`}
                      className="inline-flex items-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      {t("Tạo gợi ý AI")}
                    </Link>
                  </div>
                </div>
              </div>

              <aside className="space-y-6 lg:col-span-4">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-5 text-lg font-bold">
                    {t("Mục tiêu phiên học")}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
                      <span className="text-sm font-medium text-slate-600">
                        {t("Điểm mục tiêu")}
                      </span>
                      <span className="font-bold">80%+</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
                      <span className="text-sm font-medium text-slate-600">
                        {t("Phần thưởng")}
                      </span>
                      <span className="font-bold">
                        +{exercise.rewardsXp} XP
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
                      <span className="text-sm font-medium text-slate-600">
                        Questions
                      </span>
                      <span className="font-bold">
                        {exercise.questionCount}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-3 text-lg font-bold">
                    {t("Xếp hạng cao nhất")}
                  </h3>
                  {topRank ? (
                    <div className="rounded-lg bg-slate-50 p-4">
                      <p className="inline-flex items-center text-sm font-semibold text-slate-800">
                        <Trophy className="mr-1.5 h-4 w-4 text-amber-500" />#
                        {topRank.rank} {topRank.name}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Score: {topRank.score}/{exercise.questionCount}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">
                      {t("Chưa có dữ liệu xếp hạng.")}
                    </p>
                  )}
                </div>
              </aside>
            </section>

            <section className="mt-10">
              <h2 className="mb-4 text-lg font-bold tracking-tight">
                {t("Bài tập liên quan")}
              </h2>
              {relatedExercises.length > 0 && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {relatedExercises.map((item) => (
                    <Link
                      key={item.id}
                      href={`/exercises/${item.id}`}
                      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-black"
                    >
                      <p className="mb-1 text-sm font-semibold text-slate-500">
                        {getTopicLabel(item.topic)}
                      </p>
                      <p className="text-lg font-bold">{item.title}</p>
                      <p className="mt-2 text-sm text-slate-600">
                        {getTypeLabel(item.type)}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
              {relatedExercises.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
                  {t("Không có bài tập liên quan cho chủ đề này.")}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </ProtectedRoute>
  );
}
