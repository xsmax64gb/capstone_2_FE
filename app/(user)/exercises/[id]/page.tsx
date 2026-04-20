"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock3,
  List,
  Sparkles,
  Star,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { ExerciseDetailSkeleton } from "@/components/exercises/skeletons";
import {
  useDeleteUserAiExerciseMutation,
  useGetExerciseByIdQuery,
  useGetExerciseLeaderboardQuery,
} from "@/store/services/exercisesApi";
import { useI18n } from "@/lib/i18n/context";

const TOPIC_LABELS: Record<string, string> = {
  "daily-life": "Đời sống hằng ngày",
  work: "Công việc",
  travel: "Du lịch",
  technology: "Công nghệ",
  general: "Tổng hợp",
};

const TYPE_LABELS: Record<string, string> = {
  mcq: "Trắc nghiệm",
  fill_blank: "Điền vào chỗ trống",
  matching: "Nối cặp",
};

export default function ExerciseDetailPage() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  const { data, isLoading, isError } = useGetExerciseByIdQuery(id, { skip: !id });
  const { data: leaderboardData } = useGetExerciseLeaderboardQuery(id, { skip: !id });
  const [deleteAiExercise, { isLoading: deleting }] =
    useDeleteUserAiExerciseMutation();

  const exercise = data?.exercise;
  const relatedExercises = data?.related ?? [];
  const topRank = leaderboardData?.leaderboard?.[0];

  const topicLabel = (topic: string) => TOPIC_LABELS[topic] ?? topic;
  const typeLabel = (type: string) => TYPE_LABELS[type] ?? type;
  const levelColor = (_level?: string) => "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
        {/* Back nav */}
        <nav className="mb-6 flex items-center justify-between">
          <Link
            href="/exercises"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("Sân thi đấu bài tập")}
          </Link>
          {exercise && (
            <div className="flex flex-wrap gap-2">
              {exercise.isPersonal ? (
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => {
                    if (
                      typeof window !== "undefined" &&
                      !window.confirm(t("Bạn có chắc muốn xóa bài tập này?"))
                    ) {
                      return;
                    }
                    void deleteAiExercise(exercise.id).then(() => {
                      router.push("/exercises");
                    });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 shadow-sm transition hover:bg-rose-100 disabled:opacity-60"
                >
                  {t("Xóa bài tập")}
                </button>
              ) : null}
              <Link
                href={`/exercises/${exercise.id}/hints`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
              >
                <Sparkles className="h-3.5 w-3.5 text-slate-500" />
                {t("Gợi ý AI")}
              </Link>
              <Link
                href={`/exercises/${exercise.id}/leaderboard`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
              >
                <Trophy className="h-3.5 w-3.5 text-slate-500" />
                {t("Bảng xếp hạng")}
              </Link>
            </div>
          )}
        </nav>

        {/* States */}
        {isLoading && <ExerciseDetailSkeleton />}
        {isError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
            {t("Không tải được chi tiết bài tập.")}
          </div>
        )}
        {!isLoading && !isError && !exercise && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-base font-semibold text-slate-800">{t("Không tìm thấy bài tập")}</p>
            <p className="mt-1 text-sm text-slate-500">
              {t("Bài tập có thể đã bị xóa hoặc liên kết không hợp lệ.")}
            </p>
          </div>
        )}

        {exercise && (
          <>
            {/* ── Hero ──────────────────────────────────────────── */}
            <section className="mb-8 overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
              {/* cover */}
              <div className="h-48 w-full overflow-hidden bg-slate-100 md:h-56">
                {exercise.coverImage ? (
                  <img
                    src={exercise.coverImage}
                    alt={exercise.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-100">
                    <BookOpen className="h-16 w-16 text-slate-300" />
                  </div>
                )}
              </div>

              {/* body */}
              <div className="p-6">
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div className="flex-1">
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      {exercise.isCompleted ? (
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                          {t("Đã hoàn thành")}
                        </span>
                      ) : null}
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${levelColor()}`}
                      >
                        {exercise.level}
                      </span>
                      <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                        {topicLabel(exercise.topic)}
                      </span>
                      <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                        {typeLabel(exercise.type)}
                      </span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                      {exercise.title}
                    </h1>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">
                      {exercise.description}
                    </p>
                  </div>

                  {/* CTA */}
                  <div className="flex shrink-0 flex-col items-start gap-2 md:items-end">
                    <Link
                      href={`/exercises/${exercise.id}/attempt`}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-700 active:scale-95"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {exercise.isCompleted ? t("Làm lại bài") : t("Bắt đầu làm bài")}
                    </Link>
                    <Link
                      href={`/exercises/${exercise.id}/hints`}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-slate-500" />
                      {t("Xem gợi ý AI trước khi làm")}
                    </Link>
                  </div>
                </div>

                {/* Quick stats row */}
                <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5 sm:grid-cols-4">
                  {[
                    {
                      icon: List,
                      label: t("Câu hỏi"),
                      value: `${exercise.questionCount} câu`,
                      color: "text-slate-700",
                    },
                    {
                      icon: Clock3,
                      label: t("Thời lượng"),
                      value: `${exercise.durationMinutes} phút`,
                      color: "text-slate-700",
                    },
                    {
                      icon: Zap,
                      label: t("Phần thưởng"),
                      value: `+${exercise.rewardsXp} XP`,
                      color: "text-slate-700",
                    },
                    {
                      icon: Target,
                      label: t("Điểm mục tiêu"),
                      value: "80%+",
                      color: "text-slate-700",
                    },
                  ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                      <Icon className={`h-4 w-4 shrink-0 ${color}`} />
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          {label}
                        </p>
                        <p className="text-sm font-bold text-slate-900">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── Main Content ───────────────────────────────────── */}
            <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
              {/* Left column */}
              <div className="space-y-6">
                {/* How it works */}
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="mb-4 text-base font-bold text-slate-900">
                    {t("Hướng dẫn làm bài")}
                  </h2>
                  <ol className="space-y-3">
                    {[
                      {
                        step: "01",
                        text: t("Đọc kỹ từng câu hỏi trước khi chọn đáp án."),
                        color: "bg-slate-100 text-slate-700",
                      },
                      {
                        step: "02",
                        text: t("Bạn có thể quay lại sửa đáp án bất kỳ lúc nào trước khi nộp."),
                        color: "bg-slate-100 text-slate-700",
                      },
                      {
                        step: "03",
                        text: t("Nộp bài để nhận điểm, XP và xem giải thích từng câu."),
                        color: "bg-slate-100 text-slate-700",
                      },
                    ].map(({ step, text, color }) => (
                      <li key={step} className="flex items-start gap-3">
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black ${color}`}
                        >
                          {step}
                        </span>
                        <p className="pt-1 text-sm leading-relaxed text-slate-600">{text}</p>
                      </li>
                    ))}
                  </ol>

                  <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                    <Link
                      href={`/exercises/${exercise.id}/attempt`}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-700"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {exercise.isCompleted ? t("Làm lại bài") : t("Bắt đầu ngay")}
                    </Link>
                    <Link
                      href={`/exercises/${exercise.id}/hints`}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Sparkles className="h-4 w-4" />
                      {t("Tạo gợi ý AI")}
                    </Link>
                  </div>
                </section>

                {/* Skills */}
                {exercise.skills && exercise.skills.length > 0 && (
                  <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-3 text-base font-bold text-slate-900">{t("Kỹ năng luyện tập")}</h2>
                    <div className="flex flex-wrap gap-2">
                      {exercise.skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                        >
                          <Star className="h-3 w-3 text-slate-500" />
                          {skill}
                        </span>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              {/* Right sidebar */}
              <aside className="space-y-4">
                {/* Goals card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="mb-4 text-sm font-bold text-slate-900">{t("Mục tiêu phiên học")}</h3>
                  <div className="space-y-2.5">
                    {[
                      { label: t("Số câu hỏi"), value: `${exercise.questionCount} câu` },
                      { label: t("Thời lượng ước tính"), value: `${exercise.durationMinutes} phút` },
                      { label: t("Phần thưởng XP"), value: `+${exercise.rewardsXp} XP` },
                      {
                        label: t("Trạng thái"),
                        value: exercise.isCompleted ? t("Đã hoàn thành") : t("Chưa hoàn thành"),
                      },
                      { label: t("Điểm mục tiêu"), value: "≥ 80%" },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5">
                        <span className="text-xs font-medium text-slate-500">{label}</span>
                        <span className="text-sm font-bold text-slate-900">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top rank card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="mb-3 text-sm font-bold text-slate-900">
                    <span className="inline-flex items-center gap-1.5">
                      <Trophy className="h-4 w-4 text-slate-700" />
                      {t("Xếp hạng cao nhất")}
                    </span>
                  </h3>
                  {topRank ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-black text-white">
                          #{topRank.rank}
                        </span>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{topRank.name}</p>
                          <p className="text-xs text-slate-500">
                            {topRank.score}/{exercise.questionCount} câu ·{" "}
                            {Math.floor(topRank.durationSec / 60)}:{String(topRank.durationSec % 60).padStart(2, "0")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">{t("Chưa có dữ liệu xếp hạng.")}</p>
                  )}
                </div>

                {/* Start CTA */}
                <Link
                  href={`/exercises/${exercise.id}/attempt`}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.98]"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {exercise.isCompleted ? t("Làm lại bài") : t("Bắt đầu làm bài ngay")}
                </Link>
              </aside>
            </div>

            {/* ── Related Exercises ─────────────────────────────── */}
            {relatedExercises.length > 0 && (
              <section className="mt-10">
                <h2 className="mb-4 text-base font-bold text-slate-900">{t("Bài tập liên quan")}</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {relatedExercises.map((item) => (
                    <Link
                      key={item.id}
                      href={`/exercises/${item.id}`}
                      className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-md"
                    >
                      <div className="flex items-start gap-3">
                        {item.coverImage ? (
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-200">
                            <img src={item.coverImage} alt={item.title} className="h-full w-full object-cover" />
                          </div>
                        ) : (
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                            <BookOpen className="h-5 w-5 text-slate-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-900 group-hover:text-black">
                            {item.title}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {topicLabel(item.topic)} · {typeLabel(item.type)}
                          </p>
                          <span
                            className={`mt-1.5 inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold ${levelColor()}`}
                          >
                            {item.level}
                          </span>
                          {item.isCompleted ? (
                            <span className="mt-1.5 ml-2 inline-block rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                              {t("Đã hoàn thành")}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </ProtectedRoute>
  );
}
