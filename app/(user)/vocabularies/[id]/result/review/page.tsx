"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { VocabularyReviewSkeleton } from "@/components/vocabularies/skeletons";
import { useGetVocabularyReviewQuery } from "@/store/services/vocabulariesApi";

function ReviewContent() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const id = params?.id ?? "";
  const attemptId = searchParams.get("attemptId") ?? undefined;

  const { data, isLoading, isError } = useGetVocabularyReviewQuery(
    { id, attemptId },
    { skip: !id },
  );
  const review = data?.review ?? [];

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10 lg:px-10">
        <div className="mb-8">
          <Link
            href={`/vocabularies/${id}`}
            className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-black"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại từ vựng
          </Link>
        </div>

        <h1 className="mb-8 text-2xl font-bold">Xem lại đáp án</h1>

        {isLoading && <VocabularyReviewSkeleton />}

        {isError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
            Không tải được dữ liệu xem lại.
          </div>
        )}

        {!isLoading && !isError && review.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
            Chưa có dữ liệu bài làm để xem lại.
          </div>
        )}

        {!isLoading && !isError && review.length > 0 && (
          <div className="space-y-4">
            {review.map((item, index) => (
              <div
                key={`${item.wordId}-${index}`}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Câu {index + 1}
                    </p>
                    <h2 className="mt-1 text-lg font-bold text-slate-900">
                      {item.prompt}
                    </h2>
                    {item.word ? (
                      <p className="mt-1 text-sm text-slate-500">
                        Từ: {item.word}
                      </p>
                    ) : null}
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                      item.isCorrect
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {item.isCorrect ? (
                      <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                    ) : (
                      <XCircle className="mr-1 h-3.5 w-3.5" />
                    )}
                    {item.isCorrect ? "Đúng" : "Sai"}
                  </span>
                </div>

                <div className="grid gap-2">
                  {item.options.map((option, optionIndex) => {
                    const isSelected = item.selectedIndex === optionIndex;
                    const isCorrect = item.correctIndex === optionIndex;
                    return (
                      <div
                        key={`${item.wordId}-${optionIndex}`}
                        className={`rounded-lg border px-3 py-2 text-sm ${
                          isCorrect
                            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                            : isSelected
                              ? "border-rose-200 bg-rose-50 text-rose-800"
                              : "border-slate-200 bg-slate-50 text-slate-700"
                        }`}
                      >
                        {option}
                        {isCorrect ? " · Đáp án đúng" : ""}
                        {!isCorrect && isSelected ? " · Bạn đã chọn" : ""}
                      </div>
                    );
                  })}
                </div>

                {item.explanation ? (
                  <p className="mt-4 text-sm italic text-slate-500">
                    {item.explanation}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        )}
    </main>
  );
}

export default function VocabularyReviewPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<VocabularyReviewSkeleton />}>
        <ReviewContent />
      </Suspense>
    </ProtectedRoute>
  );
}
