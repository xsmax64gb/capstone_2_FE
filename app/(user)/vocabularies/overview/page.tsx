"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen, Layers3 } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { LEVEL_LABELS, TOPIC_LABELS } from "../data";
import { VocabulariesListSkeleton } from "@/components/vocabularies/skeletons";
import { useGetVocabulariesQuery } from "@/lib/api/vocabulariesApi";

export default function VocabulariesOverviewPage() {
  const { data, isLoading, isError } = useGetVocabulariesQuery({ limit: 100 });

  const items = data?.items ?? [];

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-10">
        {/* Back */}
        <div className="mb-8">
          <Link
            href="/vocabularies"
            className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-black"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Vocabulary Lab
          </Link>
        </div>

        <section className="mb-8">
          <div className="mb-2 flex items-center gap-2">
            <Layers3 className="h-6 w-6 text-slate-600" />
            <h1 className="text-3xl font-bold tracking-tight">Overview Table</h1>
          </div>
          <p className="text-sm text-slate-500">
            All vocabulary sets and their words at a glance.
          </p>
        </section>

        {isLoading && <VocabulariesListSkeleton />}

        {isError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
            Failed to load overview.
          </div>
        )}

        {!isLoading && !isError && items.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-left">
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Set</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Topic</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Level</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Words</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Duration</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((set) => (
                    <tr key={set.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-slate-400" />
                          <div>
                            <p className="font-semibold">{set.title}</p>
                            <p className="text-xs text-slate-500 line-clamp-1">{set.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                          {TOPIC_LABELS[set.topic] ?? set.topic}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold">{LEVEL_LABELS[set.level] ?? set.level}</span>
                      </td>
                      <td className="px-6 py-4 text-sm">{set.wordCount}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{set.durationMinutes} min</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Link
                            href={`/vocabularies/${set.id}`}
                            className="text-xs font-semibold text-slate-700 hover:text-black"
                          >
                            Detail
                          </Link>
                          <Link
                            href={`/vocabularies/${set.id}/flashcards`}
                            className="text-xs font-semibold text-slate-700 hover:text-black"
                          >
                            Flashcards
                          </Link>
                          <Link
                            href={`/vocabularies/${set.id}/quiz`}
                            className="text-xs font-semibold text-black hover:text-slate-700"
                          >
                            Quiz
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
