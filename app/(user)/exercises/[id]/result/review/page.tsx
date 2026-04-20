"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  RotateCcw,
  X,
  XCircle,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { ReviewSkeleton } from "@/components/exercises/skeletons";
import { useGetExerciseReviewQuery } from "@/store/services/exercisesApi";

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];

function parseAnswers(raw: string) {
  if (!raw.trim()) return null;
  const parsed = raw.split(",").map((item) => Number.parseInt(item, 10));
  if (parsed.some((item) => !Number.isFinite(item) || item < -1)) return null;
  return parsed;
}

export default function ExerciseReviewPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const id = params?.id ?? "";

  const answers = searchParams.get("answers") ?? "";
  const score = searchParams.get("score") ?? "";
  const total = searchParams.get("total") ?? "";
  const time = searchParams.get("time") ?? "";

  const parsedScore = Number.parseInt(score, 10);
  const parsedTotal = Number.parseInt(total, 10);
  const parsedAnswers = parseAnswers(answers);

  const hasValidPayload =
    Number.isFinite(parsedScore) &&
    Number.isFinite(parsedTotal) &&
    parsedScore >= 0 &&
    parsedTotal > 0 &&
    parsedScore <= parsedTotal &&
    parsedAnswers !== null &&
    parsedAnswers.length === parsedTotal;

  const { data, isLoading, isError } = useGetExerciseReviewQuery(
    { id, answers },
    { skip: !id || !hasValidPayload },
  );
  const review = data?.review ?? [];

  const correctCount = review.filter((q) => q.isCorrect).length;
  const wrongCount = review.filter((q) => !q.isCorrect).length;

  const resultUrl = `?score=${score}&total=${total}&answers=${encodeURIComponent(answers)}&time=${time}`;

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
        {/* Back */}
        <nav className="mb-6">
          <Link
            href={`/exercises/${id}/result${resultUrl}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại kết quả
          </Link>
        </nav>

        {/* Header */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">📝 Xem lại đáp án</h1>
          <p className="mt-1 text-sm text-slate-500">
            Kiểm tra từng câu và đọc giải thích để hiểu rõ chỗ sai, cải thiện nhanh hơn.
          </p>

          {hasValidPayload && review.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm font-bold text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                {correctCount} câu đúng
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 text-sm font-bold text-rose-700">
                <XCircle className="h-4 w-4" />
                {wrongCount} câu sai
              </div>
            </div>
          )}
        </div>

        {/* Invalid payload */}
        {!hasValidPayload && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <p className="inline-flex items-center gap-2 text-sm font-bold text-amber-800">
              <AlertTriangle className="h-4 w-4" />
              Dữ liệu không hợp lệ
            </p>
            <p className="mt-2 text-sm text-amber-700">
              Vui lòng hoàn thành một lượt làm bài và mở trang xem lại từ trang kết quả.
            </p>
            <Link
              href={`/exercises/${id}/attempt`}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-700"
            >
              <RotateCcw className="h-4 w-4" />
              Bắt đầu làm bài
            </Link>
          </div>
        )}

        {hasValidPayload && isLoading && <ReviewSkeleton />}

        {hasValidPayload && isError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
            Không tải được dữ liệu giải thích.
          </div>
        )}

        {/* Questions */}
        {hasValidPayload && !isLoading && !isError && (
          <>
            {review.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <p className="font-semibold text-slate-700">Không có dữ liệu xem lại</p>
                <p className="mt-1 text-sm text-slate-500">Hãy nộp bài trước để xem giải thích.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {review.map((question, index) => {
                  const correct = question.isCorrect;
                  return (
                    <article
                      key={question.questionId}
                      className={`overflow-hidden rounded-2xl border shadow-sm ${
                        correct ? "border-emerald-200" : "border-rose-200"
                      } bg-white`}
                    >
                      {/* Header bar */}
                      <div
                        className={`flex items-center gap-3 px-5 py-3 ${
                          correct ? "bg-emerald-50" : "bg-rose-50"
                        }`}
                      >
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                            correct
                              ? "bg-emerald-200 text-emerald-800"
                              : "bg-rose-200 text-rose-800"
                          }`}
                        >
                          {index + 1}
                        </span>
                        <h2 className="flex-1 text-sm font-semibold text-slate-800">
                          {question.prompt}
                        </h2>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                            correct
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {correct ? (
                            <>
                              <Check className="h-3 w-3" /> Đúng
                            </>
                          ) : (
                            <>
                              <X className="h-3 w-3" /> Sai
                            </>
                          )}
                        </span>
                      </div>

                      {/* Options */}
                      <div className="px-5 py-4">
                        <div className="space-y-2">
                          {question.options.map((opt, i) => {
                            const isSelected = i === question.selectedIndex;
                            const isCorrectOpt = i === question.correctIndex;
                            const letter = OPTION_LETTERS[i] ?? String(i + 1);

                            let optClass =
                              "border-slate-100 bg-slate-50 text-slate-600";
                            if (isCorrectOpt)
                              optClass =
                                "border-emerald-200 bg-emerald-50 text-emerald-800 font-semibold";
                            if (isSelected && !isCorrectOpt)
                              optClass =
                                "border-rose-200 bg-rose-50 text-rose-700 font-semibold";

                            return (
                              <div
                                key={`${question.questionId}-opt-${i}`}
                                className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm ${optClass}`}
                              >
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/60 text-xs font-black border border-current/20">
                                  {letter}
                                </span>
                                <span className="flex-1">{opt}</span>
                                {isCorrectOpt && (
                                  <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                                )}
                                {isSelected && !isCorrectOpt && (
                                  <X className="h-4 w-4 shrink-0 text-rose-500" />
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Answers summary */}
                        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Bạn chọn
                            </p>
                            <p
                              className={`mt-0.5 text-sm font-semibold ${
                                question.isCorrect ? "text-emerald-700" : "text-rose-600"
                              }`}
                            >
                              {question.selectedText ?? (
                                <span className="italic text-slate-400">Không trả lời</span>
                              )}
                            </p>
                          </div>
                          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">
                              Đáp án đúng
                            </p>
                            <p className="mt-0.5 text-sm font-semibold text-emerald-800">
                              {question.correctText ?? "—"}
                            </p>
                          </div>
                        </div>

                        {/* Explanation */}
                        {question.explanation && (
                          <div className="mt-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-sky-500">
                              💡 Giải thích
                            </p>
                            <p className="mt-1.5 text-sm leading-relaxed text-sky-900">
                              {question.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}

                {/* Bottom actions */}
                <div className="flex flex-wrap gap-3 pt-2">
                  <Link
                    href={`/exercises/${id}/attempt`}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-700"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Làm lại bài tập
                  </Link>
                  <Link
                    href={`/exercises/${id}/result${resultUrl}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Về trang kết quả
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </ProtectedRoute>
  );
}
