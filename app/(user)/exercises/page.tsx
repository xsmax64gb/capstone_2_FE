"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookCheck,
  Clock3,
  History,
  Search,
  Sparkles,
  Trophy,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { TOPIC_LABELS, TYPE_LABELS } from "./data";
import { ExercisesListSkeleton } from "./skeletons";
import {
  useGetExercisesQuery,
  useGetExerciseSummaryQuery,
} from "@/lib/api/exercisesApi";

export default function ExercisesPage() {
  const [query, setQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<
    "all" | "A1" | "A2" | "B1" | "B2" | "C1" | "C2"
  >("all");
  const [selectedType, setSelectedType] = useState<
    "all" | "mcq" | "fill_blank" | "matching"
  >("all");

  const {
    data: listData,
    isLoading,
    isError,
  } = useGetExercisesQuery({
    query,
    level: selectedLevel,
    type: selectedType,
    limit: 50,
  });
  const { data: summaryData } = useGetExerciseSummaryQuery();

  const items = listData?.items ?? [];
  const totalQuestions = summaryData?.totalQuestions ?? 0;
  const totalXp = summaryData?.totalXp ?? 0;
  const pastAttempts = summaryData?.pastAttempts ?? 0;

  const getTopicLabel = (topic: string) =>
    TOPIC_LABELS[topic as keyof typeof TOPIC_LABELS] ?? topic;
  const getTypeLabel = (type: string) =>
    TYPE_LABELS[type as keyof typeof TYPE_LABELS] ?? type;

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-10">
        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Exercise Arena
              </h1>
              <p className="mt-1 text-slate-500">
                Full practice hub with attempt flow, result analysis, and review
                pages.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/exercises/recommended"
                className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Sparkles className="mr-1.5 h-4 w-4" />
                Recommended
              </Link>
              <Link
                href="/exercises/history"
                className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <History className="mr-1.5 h-4 w-4" />
                Attempt History
              </Link>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">
                Question Bank
              </p>
              <p className="mt-1 text-xl font-bold">{totalQuestions}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">
                Potential XP
              </p>
              <p className="mt-1 text-xl font-bold">{totalXp}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">
                Past Attempts
              </p>
              <p className="mt-1 text-xl font-bold">{pastAttempts}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search exercise, skill..."
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-black"
              />
            </label>

            <select
              value={selectedLevel}
              onChange={(e) =>
                setSelectedLevel(e.target.value as "all" | "A1" | "A2" | "B1" | "B2" | "C1" | "C2")
              }
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-black"
            >
              <option value="all">All levels</option>
              <option value="A1">A1</option>
              <option value="A2">A2</option>
              <option value="B1">B1</option>
              <option value="B2">B2</option>
            </select>

            <select
              value={selectedType}
              onChange={(e) =>
                setSelectedType(e.target.value as "all" | "mcq" | "fill_blank" | "matching")
              }
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-black"
            >
              <option value="all">All types</option>
              <option value="mcq">Multiple Choice</option>
              <option value="fill_blank">Fill in the Blank</option>
              <option value="matching">Matching</option>
            </select>
          </div>
        </section>

        {isLoading && <ExercisesListSkeleton />}

        {isError && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
            Failed to load exercises. Please check login token or backend
            connection.
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {items.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="h-36 bg-slate-100">
                <img
                  src={item.coverImage}
                  alt={item.title}
                  className="h-full w-full object-cover opacity-85"
                />
              </div>
              <div className="p-5">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-2xl font-bold leading-tight">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.description}
                    </p>
                  </div>
                  <span className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-semibold">
                    {item.level}
                  </span>
                </div>

                <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-700">
                    {getTypeLabel(item.type)}
                  </span>
                  <span className="rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-700">
                    {getTopicLabel(item.topic)}
                  </span>
                  <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-700">
                    <BookCheck className="mr-1 h-3.5 w-3.5" />
                    {item.questionCount} questions
                  </span>
                  <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-700">
                    <Clock3 className="mr-1 h-3.5 w-3.5" />
                    {item.durationMinutes} mins
                  </span>
                  <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-700">
                    <Trophy className="mr-1 h-3.5 w-3.5" />+{item.rewardsXp} XP
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                  <Link
                    href={`/exercises/${item.id}`}
                    className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Detail
                  </Link>
                  <Link
                    href={`/exercises/${item.id}/attempt`}
                    className="inline-flex items-center justify-center rounded-lg bg-black px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                  >
                    Start
                  </Link>
                  <Link
                    href={`/exercises/${item.id}/hints`}
                    className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Hints
                  </Link>
                  <Link
                    href={`/exercises/${item.id}/leaderboard`}
                    className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Rank
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </section>

        {!isLoading && !isError && items.length === 0 && (
          <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="font-semibold">No exercise found</p>
            <p className="mt-1 text-sm text-slate-500">
              Try another keyword, level, or exercise type.
            </p>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
