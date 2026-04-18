"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Clock3 } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import {
  useGetVocabularyByIdQuery,
  useSubmitVocabularyAttemptMutation,
} from "@/store/services/vocabulariesApi";
import { VocabularyAttemptSkeleton } from "@/components/vocabularies/skeletons";
import { useI18n } from "@/lib/i18n/context";

export default function QuizPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const router = useRouter();
  const { t, lang } = useI18n();

  const { data, isLoading, isError } = useGetVocabularyByIdQuery(id, {
    skip: !id,
  });
  const [submit] = useSubmitVocabularyAttemptMutation();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [startedAt] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);

  const words = data?.vocabulary?.words ?? [];
  const questionWordSig = useMemo(
    () =>
      words
        .slice(0, 10)
        .map((w) => w.id)
        .join("|"),
    [words],
  );

  // Memoize so options don't re-shuffle on every timer tick
  const questions = useMemo(() => {
    const filler = t("Không có trong danh sách");
    return words.slice(0, 10).map((word) => {
      const otherMeanings = words
        .filter((w) => w.id !== word.id)
        .map((w) => w.meaning)
        .slice(0, 3);
      while (otherMeanings.length < 3) {
        otherMeanings.push(filler);
      }
      const options = [word.meaning, ...otherMeanings].sort(
        () => Math.random() - 0.5,
      );
      const correctIndex = options.indexOf(word.meaning);
      const prompt =
        lang === "vi"
          ? `Nghĩa của "${word.word}" là gì?`
          : `What does "${word.word}" mean?`;
      return {
        wordId: word.id,
        prompt,
        options,
        correctIndex: correctIndex >= 0 ? correctIndex : 0,
      };
    });
  }, [words, lang, t]);

  const questionsShuffleKey = useMemo(
    () =>
      questions
        .map((q) => `${q.wordId}|${q.options.join("\u001f")}`)
        .join("\u001e"),
    [questions],
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  useEffect(() => {
    if (!questionWordSig || questions.length === 0) {
      return;
    }
    setAnswers(new Array(questions.length).fill(null));
    setCurrentIndex(0);
  }, [questionWordSig, questionsShuffleKey, questions.length]);

  const current = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const allAnswered =
    questions.length > 0 &&
    answers.length === questions.length &&
    answers.every(
      (a) => typeof a === "number" && !Number.isNaN(a) && a >= 0,
    );

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  const handleSubmit = async () => {
    const durationSec = Math.round((Date.now() - startedAt) / 1000);
    const wordIds = questions.map((q) => q.wordId);
    const selectedLabels = questions.map((q, i) => {
      const idx = answers[i];
      if (idx == null || idx < 0) return "";
      return q.options[idx] ?? "";
    });
    const result = await submit({
      id,
      body: { mode: "quiz", answers, wordIds, selectedLabels, durationSec },
    }).unwrap();

    router.push(
      `/vocabularies/${id}/result?score=${result.score}&total=${result.total}&percent=${result.percent}&time=${durationSec}&mode=quiz&attemptId=${result.attemptId}`,
    );
  };

  const goNext = () => {
    if (isLast) return;
    setCurrentIndex((i) => i + 1);
  };

  const goPrev = () => {
    if (currentIndex === 0) return;
    setCurrentIndex((i) => i - 1);
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <main className="mx-auto w-full max-w-3xl px-6 py-10 lg:px-10">
          <VocabularyAttemptSkeleton />
        </main>
      </ProtectedRoute>
    );
  }

  if (isError || !data?.vocabulary) {
    return (
      <ProtectedRoute>
        <main className="mx-auto w-full max-w-3xl px-6 py-10 lg:px-10">
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
            {t("Không tải được quiz.")}
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-3xl px-6 py-10 lg:px-10">
        {/* Back */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.push(`/vocabularies/${id}`)}
            className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-black"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("Quay lại")}
          </button>
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-700">
            <Clock3 className="h-4 w-4" />
            {formatTime(elapsed)}
          </div>
        </div>

        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t("Trắc nghiệm")}</h1>
          <span className="text-sm text-slate-500">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>

        {/* Progress */}
        <div className="mb-8 h-2 w-full rounded-full bg-slate-200">
          <div
            className="h-2 rounded-full bg-black transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Question */}
        {current && (
          <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="mb-6 text-lg font-semibold">{current.prompt}</p>
            <div className="space-y-3">
              {current.options.map((option, optIdx) => {
                const isSelected = answers[currentIndex] === optIdx;
                return (
                  <button
                    key={optIdx}
                    onClick={() =>
                      setAnswers((prev) => {
                        const next = [...prev];
                        next[currentIndex] = optIdx;
                        return next;
                      })
                    }
                    className={`w-full rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-colors ${
                      isSelected
                        ? "border-black bg-black text-white"
                        : "border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="inline-flex items-center rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("Trước")}
          </button>

          {isLast ? (
            <button
              onClick={handleSubmit}
              disabled={!allAnswered}
              className="inline-flex items-center rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t("Nộp quiz")}
            </button>
          ) : (
            <button
              onClick={goNext}
              className="inline-flex items-center rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              {t("Tiếp theo")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          )}
        </div>

        {!allAnswered && (
          <p className="mt-3 text-center text-xs text-slate-500">
            {t("Hãy trả lời hết các câu để nộp bài.")}
          </p>
        )}
      </main>
    </ProtectedRoute>
  );
}
