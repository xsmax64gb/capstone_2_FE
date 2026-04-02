"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Lightbulb, WandSparkles } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { TYPE_LABELS } from "../../data";
import { HintsSkeleton } from "@/components/exercises/skeletons";
import {
  useGetExerciseByIdQuery,
  useGetExerciseHintsQuery,
} from "@/lib/api/exercisesApi";

export default function ExerciseHintsPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  const { data: detailData } = useGetExerciseByIdQuery(id, { skip: !id });
  const {
    data: hintData,
    isLoading,
    isError,
  } = useGetExerciseHintsQuery(id, { skip: !id });

  const exercise = detailData?.exercise;
  const personalized = hintData?.personalized ?? [];
  const strategies = hintData?.strategies ?? [];
  const typeLabel = exercise
    ? (TYPE_LABELS[exercise.type as keyof typeof TYPE_LABELS] ?? exercise.type)
    : "";

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
          <h1 className="text-3xl font-bold tracking-tight">
            AI Hint Generator
          </h1>
          <p className="mt-1 text-slate-500">
            {hintData?.title ?? exercise?.title ?? "Exercise"}
            {typeLabel ? ` - ${typeLabel}` : ""}
          </p>
        </section>

        {isLoading && <HintsSkeleton />}

        {isError && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
            Failed to load hints.
          </div>
        )}

        {!isLoading && !isError && (
          <section className="space-y-4">
            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="inline-flex items-center text-sm font-semibold text-slate-700">
                <WandSparkles className="mr-1.5 h-4 w-4" />
                Personalized Tips
              </p>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {personalized.map((item) => (
                  <li key={item} className="rounded-lg bg-slate-50 px-3 py-2">
                    {item}
                  </li>
                ))}
                {personalized.length === 0 && (
                  <li className="rounded-lg bg-slate-50 px-3 py-2 text-slate-500">
                    No personalized tip yet.
                  </li>
                )}
              </ul>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="inline-flex items-center text-sm font-semibold text-slate-700">
                <Lightbulb className="mr-1.5 h-4 w-4" />
                Strategy Hints
              </p>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {strategies.map((hint) => (
                  <li key={hint} className="rounded-lg bg-slate-50 px-3 py-2">
                    {hint}
                  </li>
                ))}
                {strategies.length === 0 && (
                  <li className="rounded-lg bg-slate-50 px-3 py-2 text-slate-500">
                    No strategy hint yet.
                  </li>
                )}
              </ul>
            </article>
          </section>
        )}

        {exercise && (
          <section className="mt-6 flex flex-wrap gap-2">
            <Link
              href={`/exercises/${exercise.id}/attempt`}
              className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Start attempt
            </Link>
            <Link
              href={`/exercises/${exercise.id}/result/review`}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Open review template
            </Link>
          </section>
        )}
      </main>
    </ProtectedRoute>
  );
}
