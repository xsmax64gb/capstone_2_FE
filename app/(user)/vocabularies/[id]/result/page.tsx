"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  RotateCcw,
  Star,
  Target,
  Timer,
  Trophy,
  XCircle,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { VocabularyResultSkeleton } from "../../skeletons";
import { RESULT_LABELS } from "../../data";

function ResultContent() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const id = params?.id ?? "";

  const score = parseInt(searchParams.get("score") ?? "0", 10);
  const total = parseInt(searchParams.get("total") ?? "1", 10);
  const percent = parseInt(searchParams.get("percent") ?? "0", 10);
  const time = parseInt(searchParams.get("time") ?? "0", 10);
  const mode = searchParams.get("mode") ?? "flashcards";

  const resultLabel =
    percent >= 90 ? "Excellent!" :
    percent >= 70 ? "Good job!" :
    percent >= 50 ? "Keep going!" :
    "Needs more practice";

  const resultInfo = RESULT_LABELS[resultLabel] ?? RESULT_LABELS["Needs more practice"];

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const isPassing = percent >= 50;

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-10 lg:px-10">
      {/* Back */}
      <div className="mb-8">
        <Link
          href={`/vocabularies/${id}`}
          className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-black"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Vocabulary
        </Link>
      </div>

      {/* Score card */}
      <section className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white text-center shadow-sm">
        {/* Score circle */}
        <div className="flex flex-col items-center gap-4 border-b border-slate-100 bg-slate-50 px-6 py-10">
          <div
            className={`flex h-28 w-28 items-center justify-center rounded-full text-4xl font-bold ${
              isPassing
                ? "bg-emerald-100 text-emerald-700"
                : "bg-rose-100 text-rose-700"
            }`}
          >
            {percent}%
          </div>

          <div>
            <h1 className={`text-2xl font-bold ${resultInfo.color}`}>{resultLabel}</h1>
            <p className="mt-1 text-sm text-slate-500">
              You got {score} out of {total} correct
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100">
          <div className="flex flex-col items-center gap-1 px-4 py-5">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <p className="text-lg font-bold">{score}</p>
            <p className="text-xs text-slate-500">Correct</p>
          </div>
          <div className="flex flex-col items-center gap-1 px-4 py-5">
            <XCircle className="h-5 w-5 text-rose-600" />
            <p className="text-lg font-bold">{total - score}</p>
            <p className="text-xs text-slate-500">Incorrect</p>
          </div>
          <div className="flex flex-col items-center gap-1 px-4 py-5">
            <Timer className="h-5 w-5 text-slate-600" />
            <p className="text-lg font-bold">{formatTime(time)}</p>
            <p className="text-xs text-slate-500">Time</p>
          </div>
        </div>

        {/* XP earned */}
        <div className="flex items-center justify-center gap-2 border-t border-slate-100 bg-amber-50 px-6 py-4">
          <Star className="h-5 w-5 text-amber-600" />
          <p className="text-sm font-semibold text-amber-800">
            +{score * 2} XP earned
          </p>
        </div>
      </section>

      {/* Actions */}
      <section className="flex flex-wrap items-center justify-center gap-3">
        {mode === "flashcards" ? (
          <Link
            href={`/vocabularies/${id}/quiz`}
            className="inline-flex items-center rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Try Quiz Mode
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        ) : (
          <Link
            href={`/vocabularies/${id}/flashcards`}
            className="inline-flex items-center rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Try Flashcards
          </Link>
        )}

        <Link
          href={`/vocabularies/${id}/result/review`}
          className="inline-flex items-center rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <Target className="mr-2 h-4 w-4" />
          Review Answers
        </Link>

        <Link
          href={`/vocabularies/${id}`}
          className="inline-flex items-center rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <Trophy className="mr-2 h-4 w-4" />
          Leaderboard
        </Link>

        <Link
          href={`/vocabularies/${id}/${mode}`}
          className="inline-flex items-center rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Try Again
        </Link>
      </section>
    </main>
  );
}

export default function VocabularyResultPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  return (
    <ProtectedRoute>
      <Suspense fallback={<VocabularyResultSkeleton />}>
        <ResultContent />
      </Suspense>
    </ProtectedRoute>
  );
}
