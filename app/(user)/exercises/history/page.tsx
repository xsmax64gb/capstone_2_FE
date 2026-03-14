"use client";

import Link from "next/link";
import { ArrowLeft, Clock3, FileClock, RotateCcw } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { TOPIC_LABELS, formatDuration } from "../data";
import { useGetExerciseHistoryQuery } from "@/lib/api/exercisesApi";

export default function ExerciseHistoryPage() {
  const {
    data: history = [],
    isLoading,
    isError,
  } = useGetExerciseHistoryQuery({ limit: 50 });
  const getTopicLabel = (topic: string) =>
    TOPIC_LABELS[topic as keyof typeof TOPIC_LABELS] ?? topic;

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-10">
        <section className="mb-8">
          <Link
            href="/exercises"
            className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-black"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Exercise Arena
          </Link>
        </section>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold tracking-tight">Attempt History</h1>
          <p className="mt-1 text-slate-500">
            Track your recent submissions, scores, and completion speed.
          </p>
        </section>

        {isLoading && (
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
            Loading attempt history...
          </div>
        )}

        {isError && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
            Failed to load attempt history.
          </div>
        )}

        <section className="space-y-4">
          {history.map((item) => {
            const exercise = item.exercise;
            if (!exercise) return null;

            const percent = Math.round((item.score / item.total) * 100);
            return (
              <article
                key={item.attemptId}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-xl font-bold">{exercise.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {getTopicLabel(exercise.topic)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="rounded-full border border-slate-200 px-2.5 py-1 font-semibold">
                      {exercise.level}
                    </span>
                    <span className="rounded-full border border-slate-200 px-2.5 py-1 font-semibold">
                      {item.score}/{item.total}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Result
                    </p>
                    <p className="mt-1 text-sm font-semibold">{percent}%</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Duration
                    </p>
                    <p className="mt-1 inline-flex items-center text-sm font-semibold">
                      <Clock3 className="mr-1 h-4 w-4" />
                      {item.durationText ?? formatDuration(item.durationSec)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Submitted
                    </p>
                    <p className="mt-1 inline-flex items-center text-sm font-semibold">
                      <FileClock className="mr-1 h-4 w-4" />
                      {new Date(item.submittedAt).toLocaleString("en-US")}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/exercises/${item.exerciseId}/result?score=${item.score}&total=${item.total}&time=${item.durationSec}&answers=${encodeURIComponent((item.answers ?? []).join(","))}`}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Open result
                  </Link>
                  <Link
                    href={`/exercises/${item.exerciseId}/attempt`}
                    className="inline-flex items-center rounded-lg bg-black px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                  >
                    <RotateCcw className="mr-1 h-3.5 w-3.5" />
                    Retry
                  </Link>
                </div>
              </article>
            );
          })}
        </section>

        {!isLoading && !isError && history.length === 0 && (
          <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="font-semibold">No attempt history yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Start an exercise to create your first history record.
            </p>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
