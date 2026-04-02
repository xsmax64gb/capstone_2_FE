"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, BookOpen, Clock3, Sparkles } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { LEVEL_LABELS, TOPIC_LABELS } from "../data";
import { RecommendedVocabulariesSkeleton } from "@/components/vocabularies/skeletons";
import { useGetRecommendedVocabulariesQuery } from "@/lib/api/vocabulariesApi";

export default function RecommendedVocabulariesPage() {
  const params = useParams<{ id: string }>();

  const { data, isLoading, isError } = useGetRecommendedVocabulariesQuery();

  const items = data ?? [];

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
            <Sparkles className="h-6 w-6 text-amber-500" />
            <h1 className="text-3xl font-bold tracking-tight">Recommended</h1>
          </div>
          <p className="text-sm text-slate-500">
            Personalized vocabulary sets based on your progress and level.
          </p>
        </section>

        {isLoading && <RecommendedVocabulariesSkeleton />}

        {isError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
            Failed to load recommendations.
          </div>
        )}

        {!isLoading && !isError && items.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <Sparkles className="mx-auto mb-3 h-12 w-12 text-slate-300" />
            <p className="font-semibold">No recommendations yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Complete more vocabulary sets to get personalized suggestions.
            </p>
          </div>
        )}

        {!isLoading && !isError && items.length > 0 && (
          <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Cover */}
                <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                  {item.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <BookOpen className="h-12 w-12 text-slate-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="text-lg font-bold text-white">
                      {item.title}
                    </h3>
                  </div>
                </div>

                <div className="space-y-3 p-5">
                  <p className="line-clamp-2 text-sm text-slate-600">
                    {item.description || "No description"}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-semibold">
                      {LEVEL_LABELS[item.level] ?? item.level}
                    </span>
                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      {TOPIC_LABELS[item.topic] ?? item.topic}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      {item.wordCount} words
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <Link
                      href={`/vocabularies/${item.id}`}
                      className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-center text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Detail
                    </Link>
                    <Link
                      href={`/vocabularies/${item.id}/flashcards`}
                      className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-center text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Flashcards
                    </Link>
                    <Link
                      href={`/vocabularies/${item.id}/quiz`}
                      className="flex-1 rounded-lg bg-black px-3 py-2 text-center text-xs font-semibold text-white hover:bg-slate-800"
                    >
                      Quiz
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </ProtectedRoute>
  );
}
