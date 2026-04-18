"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Medal, Trophy } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { VocabularyLeaderboardSkeleton } from "@/components/vocabularies/skeletons";
import { useGetVocabularyLeaderboardQuery } from "@/store/services/vocabulariesApi";
import { formatDuration } from "../../data";

export default function VocabularyLeaderboardPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  const { data, isLoading, isError } = useGetVocabularyLeaderboardQuery(id, {
    skip: !id,
  });
  const leaderboard = data?.leaderboard ?? [];

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-10">
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

        <h1 className="mb-8 flex items-center gap-2 text-2xl font-bold">
          <Trophy className="h-6 w-6 text-amber-500" />
          Leaderboard
        </h1>

        {isLoading && <VocabularyLeaderboardSkeleton />}

        {isError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
            Failed to load leaderboard.
          </div>
        )}

        {!isLoading && !isError && leaderboard.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <Trophy className="mx-auto mb-3 h-12 w-12 text-slate-300" />
            <p className="font-semibold">No rankings yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Be the first to complete this vocabulary set!
            </p>
          </div>
        )}

        {!isLoading && !isError && leaderboard.length > 0 && (
          <div className="space-y-3">
            {leaderboard.map((entry) => (
              <div
                key={entry.rank}
                className={`flex items-center gap-4 rounded-xl border px-5 py-4 shadow-sm ${
                  entry.rank === 1
                    ? "border-amber-300 bg-amber-50"
                    : entry.rank === 2
                      ? "border-slate-300 bg-slate-50"
                      : entry.rank === 3
                        ? "border-orange-200 bg-orange-50"
                        : "border-slate-200 bg-white"
                }`}
              >
                {/* Rank */}
                <div className="flex h-10 w-10 items-center justify-center">
                  {entry.rank === 1 ? (
                    <Medal className="h-7 w-7 text-amber-500" />
                  ) : entry.rank === 2 ? (
                    <Medal className="h-7 w-7 text-slate-400" />
                  ) : entry.rank === 3 ? (
                    <Medal className="h-7 w-7 text-orange-400" />
                  ) : (
                    <span className="text-lg font-bold text-slate-400">
                      #{entry.rank}
                    </span>
                  )}
                </div>

                {/* Name */}
                <div className="flex-1">
                  <p className="font-semibold">{entry.name}</p>
                  <p className="text-xs text-slate-500">
                    {formatDuration(entry.durationSec)}
                  </p>
                </div>

                {/* Score */}
                <div className="text-right">
                  <p className="text-xl font-bold">{entry.score}</p>
                  <p className="text-xs text-slate-500">points</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
