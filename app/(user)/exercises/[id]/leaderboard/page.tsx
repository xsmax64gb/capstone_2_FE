"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Medal, Timer, Trophy } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { formatDuration } from "../../data";
import {
  useGetExerciseByIdQuery,
  useGetExerciseLeaderboardQuery,
} from "@/lib/api/exercisesApi";

export default function ExerciseLeaderboardPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  const { data: detailData } = useGetExerciseByIdQuery(id, { skip: !id });
  const {
    data: leaderboardData,
    isLoading,
    isError,
  } = useGetExerciseLeaderboardQuery(id, { skip: !id });

  const exercise = detailData?.exercise;
  const leaderboard = leaderboardData?.leaderboard ?? [];

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-5xl px-6 py-10 lg:px-10">
        <section className="mb-8">
          <Link
            href={exercise ? `/exercises/${exercise.id}` : "/exercises"}
            className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-black"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to detail
          </Link>
        </section>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
          <p className="mt-1 text-slate-500">{exercise?.title ?? "Exercise"}</p>
        </section>

        {isLoading && (
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
            Loading leaderboard...
          </div>
        )}

        {isError && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
            Failed to load leaderboard.
          </div>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
          {!isLoading && !isError && leaderboard.length === 0 && (
            <p className="text-sm text-slate-500">No ranking data yet.</p>
          )}
          {!isLoading && !isError && leaderboard.length > 0 && (
            <div className="space-y-3">
              {leaderboard.map((item) => (
                <article
                  key={`${item.rank}-${item.name}`}
                  className="flex flex-wrap items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold">
                      {item.rank}
                    </span>
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-xs text-slate-500">
                        Rank #{item.rank}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <p className="inline-flex items-center font-semibold">
                      <Trophy className="mr-1.5 h-4 w-4 text-amber-500" />
                      {item.score}/
                      {exercise?.questionCount ??
                        leaderboardData?.questionCount ??
                        "-"}
                    </p>
                    <p className="inline-flex items-center font-semibold">
                      <Timer className="mr-1.5 h-4 w-4 text-slate-500" />
                      {formatDuration(item.durationSec)}
                    </p>
                    <p className="inline-flex items-center font-semibold">
                      <Medal className="mr-1.5 h-4 w-4 text-slate-500" />
                      Top {item.rank}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </ProtectedRoute>
  );
}
