"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen, History, Layers3 } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { MODE_LABELS } from "../data";
import { VocabularyHistorySkeleton } from "@/components/vocabularies/skeletons";
import { useGetVocabularyHistoryQuery } from "@/lib/api/vocabulariesApi";
import { formatDuration } from "../data";

export default function VocabularyHistoryPage() {
  const { data, isLoading, isError } = useGetVocabularyHistoryQuery();

  const items = data ?? [];

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

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
            <History className="h-6 w-6 text-blue-500" />
            <h1 className="text-3xl font-bold tracking-tight">
              Attempt History
            </h1>
          </div>
          <p className="text-sm text-slate-500">
            Your past vocabulary study sessions.
          </p>
        </section>

        {isLoading && <VocabularyHistorySkeleton />}

        {isError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
            Failed to load history.
          </div>
        )}

        {!isLoading && !isError && items.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <History className="mx-auto mb-3 h-12 w-12 text-slate-300" />
            <p className="font-semibold">No history yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Complete a vocabulary set to see your history here.
            </p>
          </div>
        )}

        {!isLoading && !isError && items.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left">
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Vocabulary Set
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Mode
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Score
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Date
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.attemptId} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-slate-400" />
                        <span className="font-semibold">{item.setName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {MODE_LABELS[item.mode] ?? item.mode}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold">
                        {item.score}/{item.total}
                      </span>
                      <span className="ml-1 text-xs text-slate-500">
                        (
                        {Math.round(
                          (item.score / Math.max(1, item.total)) * 100,
                        )}
                        %)
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {formatDuration(item.durationSec)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {formatDate(item.submittedAt)}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/vocabularies/${item.setId}`}
                        className="text-xs font-semibold text-slate-700 hover:text-black"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
