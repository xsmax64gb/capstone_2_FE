"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Send,
  AlertCircle,
} from "lucide-react";
import type { ExerciseItem } from "@/store/services/exercisesApi";
import { useSubmitExerciseAttemptMutation } from "@/store/services/exercisesApi";
import { useAuth } from "@/lib/auth-context";

// Option letter labels: A, B, C, D…
const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];

type AttemptClientProps = {
  exercise: ExerciseItem;
};

export function AttemptClient({ exercise }: AttemptClientProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [submitAttempt, { isLoading: isSubmitting }] = useSubmitExerciseAttemptMutation();

  const questionList = exercise.questions ?? [];
  const total = questionList.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [elapsedSec, setElapsedSec] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => setElapsedSec((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentQuestion = questionList[currentIndex];
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const progressPct = Math.round(((currentIndex + 1) / Math.max(total, 1)) * 100);
  const answeredPct = Math.round((answeredCount / Math.max(total, 1)) * 100);

  const selectAnswer = (index: number) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: index }));
  };

  const submit = async () => {
    setSubmitError(null);
    const answerIndexes = questionList.map((q) => answers[q.id] ?? -1);
    try {
      const result = await submitAttempt({
        id: exercise.id,
        body: {
          answers: answerIndexes,
          durationSec: elapsedSec,
          userName: user?.fullName || user?.name,
        },
      }).unwrap();

      const answersParam = result.answers.map((item) => String(item)).join(",");
      router.push(
        `/exercises/${exercise.id}/result?score=${result.score}&total=${result.total}&time=${result.time}&answers=${encodeURIComponent(answersParam)}&earnedXp=${result.earnedXp}&xpAwarded=${result.xpAwarded ? "1" : "0"}&xpReason=${encodeURIComponent(result.xpReason)}&completed=${result.exerciseCompleted ? "1" : "0"}&firstCompletion=${result.firstCompletion ? "1" : "0"}`,
      );
    } catch {
      setSubmitError("Nộp bài thất bại. Vui lòng thử lại.");
    }
  };

  // Empty state
  if (total === 0 || !currentQuestion) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 font-semibold text-slate-700">Bài tập chưa có câu hỏi</p>
          <p className="mt-1 text-sm text-slate-500">Vui lòng liên hệ quản trị viên.</p>
        </div>
      </main>
    );
  }

  const isAnswered = (qId: string) => answers[qId] !== undefined;
  const isLastQuestion = currentIndex === total - 1;
  const allAnswered = answeredCount === total;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
      {/* ── Top Bar ─────────────────────────────────────── */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href={`/exercises/${exercise.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Link>

        <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-bold text-slate-700 shadow-sm">
          <Clock3 className="h-4 w-4 text-slate-600" />
          {Math.floor(elapsedSec / 60)}:{String(elapsedSec % 60).padStart(2, "0")}
        </div>
      </div>

      {/* ── Progress Header ─────────────────────────────── */}
      <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {exercise.title}
            </p>
            <h1 className="mt-0.5 text-lg font-bold text-slate-900">
              Câu {currentIndex + 1}{" "}
              <span className="font-normal text-slate-400">/ {total}</span>
            </h1>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Đã trả lời</p>
            <p className="text-lg font-bold text-slate-900">
              {answeredCount}
              <span className="text-sm font-normal text-slate-400">/{total}</span>
            </p>
          </div>
        </div>

        {/* Navigation dots */}
        <div className="flex flex-wrap gap-1.5">
          {questionList.map((q, i) => {
            const isCurrent = i === currentIndex;
            const isDone = isAnswered(q.id);
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setCurrentIndex(i)}
                className={`h-6 w-6 rounded-md text-[10px] font-bold transition-all ${
                  isCurrent
                    ? "bg-slate-900 text-white scale-110 shadow"
                    : isDone
                      ? "border border-slate-300 bg-slate-200 text-slate-700"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-slate-900 transition-all duration-500"
            style={{ width: `${answeredPct}%` }}
          />
        </div>
      </div>

      {/* ── Question Card ────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* Question text */}
        <div className="mb-6">
          <span className="inline-block rounded-lg bg-slate-900 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white">
            Câu {currentIndex + 1}
          </span>
          <h2 className="mt-3 text-xl font-bold leading-relaxed text-slate-900">
            {currentQuestion.prompt}
          </h2>
        </div>

        {/* Options */}
        <div className="space-y-2.5">
          {currentQuestion.options.map((option, index) => {
            const selected = answers[currentQuestion.id] === index;
            const letter = OPTION_LETTERS[index] ?? String(index + 1);
            return (
              <button
                key={`${currentQuestion.id}-opt-${index}`}
                type="button"
                onClick={() => selectAnswer(index)}
                className={`group flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition-all duration-150 ${
                  selected
                    ? "border-slate-900 bg-slate-900 text-white shadow-md"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black transition-colors ${
                    selected
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                  }`}
                >
                  {letter}
                </span>
                <span className="leading-relaxed">{option}</span>
                {selected && <CheckCircle2 className="ml-auto h-4 w-4 shrink-0 text-white/80" />}
              </button>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={() => setCurrentIndex((p) => Math.max(p - 1, 0))}
            disabled={currentIndex === 0}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
            Câu trước
          </button>

          <div className="flex items-center gap-2">
            {!isLastQuestion && (
              <button
                type="button"
                onClick={() => setCurrentIndex((p) => Math.min(p + 1, total - 1))}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Câu sau
                <ChevronRight className="h-4 w-4" />
              </button>
            )}

            {isLastQuestion && (
              <button
                type="button"
                onClick={() => void submit()}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? "Đang nộp bài…" : "Nộp bài"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Submit from any position ──────────────────────── */}
      {!isLastQuestion && allAnswered && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
          <p className="font-semibold text-slate-900">Bạn đã trả lời tất cả {total} câu.</p>
          <p className="mt-0.5 text-slate-600">
            Tiếp tục xem lại hoặc nộp bài ngay.
          </p>
          <button
            type="button"
            onClick={() => void submit()}
            disabled={isSubmitting}
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
            {isSubmitting ? "Đang nộp bài…" : "Nộp bài ngay"}
          </button>
        </div>
      )}

      {/* Error */}
      {submitError && (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {submitError}
        </div>
      )}

      {/* Tip */}
      <p className="mt-4 text-center text-xs text-slate-400">
        Bạn có thể bấm vào số câu ở trên để chuyển nhanh giữa các câu hỏi.
      </p>
    </main>
  );
}
