"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { VocabularyReviewSkeleton } from "@/components/vocabularies/skeletons";
import { useGetVocabularyByIdQuery } from "@/lib/api/vocabulariesApi";

export default function VocabularyReviewPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  const { data, isLoading, isError } = useGetVocabularyByIdQuery(id, {
    skip: !id,
  });
  const vocabulary = data?.vocabulary;
  const words = vocabulary?.words ?? [];

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-3xl px-6 py-10 lg:px-10">
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

        <h1 className="mb-8 text-2xl font-bold">Answer Review</h1>

        {isLoading && <VocabularyReviewSkeleton />}

        {isError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
            Failed to load review data.
          </div>
        )}

        {!isLoading && !isError && (
          <div className="space-y-4">
            {words.map((word, index) => (
              <div
                key={word.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{word.word}</span>
                    {word.phonetic && (
                      <span className="text-sm text-slate-500">
                        {word.phonetic}
                      </span>
                    )}
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    {index + 1}
                  </span>
                </div>

                <p className="mb-2 text-sm">
                  <span className="font-semibold">Meaning:</span> {word.meaning}
                </p>

                {word.example && (
                  <p className="text-sm italic text-slate-500">
                    "{word.example}"
                  </p>
                )}

                {/* Correct indicator */}
                <div className="mt-3 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs text-emerald-700">
                    Reviewed: {word.word}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
