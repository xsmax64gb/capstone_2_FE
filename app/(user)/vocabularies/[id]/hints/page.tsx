"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Lightbulb, Sparkles, Target } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { VocabularyHintsSkeleton } from "../../skeletons";
import { useGetVocabularyHintsQuery } from "@/lib/api/vocabulariesApi";

export default function VocabularyHintsPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  const { data, isLoading, isError } = useGetVocabularyHintsQuery(id, { skip: !id });

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

        <h1 className="mb-2 text-2xl font-bold">
          <Sparkles className="mr-2 inline h-6 w-6 text-amber-500" />
          Study Hints
        </h1>
        {data?.title && (
          <p className="mb-8 text-sm text-slate-500">{data.title}</p>
        )}

        {isLoading && <VocabularyHintsSkeleton />}

        {isError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
            Failed to load hints.
          </div>
        )}

        {!isLoading && !isError && data && (
          <>
            {/* Personalized tips */}
            <section className="mb-8">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                Personalized Tips
              </h2>
              <div className="space-y-3">
                {data.personalized.map((tip, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4"
                  >
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-200 text-xs font-bold text-amber-800">
                      {index + 1}
                    </span>
                    <p className="text-sm text-amber-900">{tip}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Strategies */}
            <section className="mb-8">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
                <Target className="h-5 w-5 text-blue-500" />
                Study Strategies
              </h2>
              <div className="space-y-3">
                {data.strategies.map((strategy, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4"
                  >
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-bold text-blue-800">
                      {index + 1}
                    </span>
                    <p className="text-sm text-blue-900">{strategy}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* CTA */}
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/vocabularies/${id}/flashcards`}
                className="inline-flex items-center rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Start Flashcards
              </Link>
              <Link
                href={`/vocabularies/${id}/quiz`}
                className="inline-flex items-center rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Take Quiz
              </Link>
            </div>
          </>
        )}
      </main>
    </ProtectedRoute>
  );
}
