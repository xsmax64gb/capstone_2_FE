"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Clock3,
  Medal,
  RotateCcw,
  Trophy,
  Users,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { LeaderboardSkeleton } from "@/components/exercises/skeletons";
import {
  useGetExerciseByIdQuery,
  useGetExerciseLeaderboardQuery,
} from "@/store/services/exercisesApi";

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

const RANK_STYLES: Record<
  number,
  { bg: string; border: string; iconColor: string; label: string }
> = {
  1: {
    bg: "bg-slate-100",
    border: "border-slate-300",
    iconColor: "text-slate-700",
    label: "bg-slate-900 text-white",
  },
  2: {
    bg: "bg-slate-50",
    border: "border-slate-300",
    iconColor: "text-slate-600",
    label: "bg-slate-700 text-white",
  },
  3: {
    bg: "bg-slate-50",
    border: "border-slate-200",
    iconColor: "text-slate-500",
    label: "bg-slate-500 text-white",
  },
};

const DEFAULT_RANK_STYLE = {
  bg: "bg-white",
  border: "border-slate-200",
  iconColor: "text-slate-400",
  label: "bg-slate-100 text-slate-600",
};

export default function ExerciseLeaderboardPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  const { data: detailData } = useGetExerciseByIdQuery(id, { skip: !id });
  const { data: leaderboardData, isLoading, isError } =
    useGetExerciseLeaderboardQuery(id, { skip: !id });

  const exercise = detailData?.exercise;
  const leaderboard = leaderboardData?.leaderboard ?? [];
  const questionCount =
    exercise?.questionCount ?? leaderboardData?.questionCount ?? 0;

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
        {/* Back */}
        <nav className="mb-6 flex items-center justify-between">
          <Link
            href={exercise ? `/exercises/${exercise.id}` : "/exercises"}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại bài tập
          </Link>
          {exercise && (
            <Link
              href={`/exercises/${exercise.id}/attempt`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-700"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Thử lại để cải thiện thứ hạng
            </Link>
          )}
        </nav>

        {/* Header */}
        <div className="mb-6 rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100">
              <Trophy className="h-6 w-6 text-slate-700" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                Bảng xếp hạng
              </p>
              <h1 className="mt-0.5 text-xl font-bold text-slate-900">
                {exercise?.title ?? "Bài tập"}
              </h1>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                <Users className="h-3.5 w-3.5" />
                {leaderboard.length} người tham gia ·{" "}
                {questionCount} câu hỏi
              </p>
            </div>
          </div>
        </div>

        {isLoading && <LeaderboardSkeleton />}
        {isError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
            Không tải được bảng xếp hạng.
          </div>
        )}

        {/* Leaderboard list */}
        {!isLoading && !isError && (
          <>
            {leaderboard.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <Trophy className="mx-auto h-10 w-10 text-slate-200" />
                <p className="mt-3 font-semibold text-slate-700">
                  Chưa có ai lọt vào bảng xếp hạng
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Hãy là người đầu tiên!
                </p>
                {exercise && (
                  <Link
                    href={`/exercises/${exercise.id}/attempt`}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-700"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Làm bài ngay
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-2.5">
                {leaderboard.map((item) => {
                  const rankStyle = RANK_STYLES[item.rank] ?? DEFAULT_RANK_STYLE;
                  const pct = questionCount
                    ? Math.round((item.score / questionCount) * 100)
                    : 0;

                  return (
                    <article
                      key={`${item.rank}-${item.name}`}
                      className={`flex items-center gap-4 rounded-2xl border px-5 py-4 ${rankStyle.bg} ${rankStyle.border}`}
                    >
                      {/* Rank badge */}
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black ${rankStyle.label}`}
                      >
                        {item.rank <= 3 ? (
                          <Medal className="h-4 w-4" />
                        ) : (
                          `#${item.rank}`
                        )}
                      </div>

                      {/* Name + score bar */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="truncate text-sm font-bold text-slate-900">
                            {item.name}
                          </p>
                          <span className="ml-2 shrink-0 text-xs font-semibold text-slate-500">
                            #{item.rank}
                          </span>
                        </div>
                        {/* Progress bar */}
                        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full bg-slate-900 transition-all duration-700"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <p className="flex items-center gap-1 text-sm font-bold text-slate-900">
                          <Trophy className={`h-3.5 w-3.5 ${rankStyle.iconColor}`} />
                          {item.score}/{questionCount}
                          <span className="ml-1 text-xs font-normal text-slate-500">
                            ({pct}%)
                          </span>
                        </p>
                        <p className="flex items-center gap-1 text-xs text-slate-500">
                          <Clock3 className="h-3 w-3" />
                          {formatDuration(item.durationSec)}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Bottom CTA */}
        {exercise && leaderboard.length > 0 && (
          <div className="mt-5 text-center">
            <Link
              href={`/exercises/${exercise.id}/attempt`}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-700"
            >
              <RotateCcw className="h-4 w-4" />
              Làm lại để cải thiện vị trí
            </Link>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
