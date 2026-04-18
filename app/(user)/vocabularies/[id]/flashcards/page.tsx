"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  RotateCcw,
  Shuffle,
  Volume2,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useGetVocabularyByIdQuery } from "@/store/services/vocabulariesApi";
import { VocabularyAttemptSkeleton } from "@/components/vocabularies/skeletons";
import { useI18n } from "@/lib/i18n/context";

type StudyMode = "all" | "unknown";

const shuffleArray = <T,>(input: T[]) => {
  const output = [...input];
  for (let i = output.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [output[i], output[j]] = [output[j], output[i]];
  }
  return output;
};

export default function FlashcardsPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const router = useRouter();
  const { t, lang } = useI18n();

  const { data, isLoading, isError } = useGetVocabularyByIdQuery(id, {
    skip: !id,
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownIds, setKnownIds] = useState<string[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [studyMode, setStudyMode] = useState<StudyMode>("all");
  const [deckIds, setDeckIds] = useState<string[]>([]);

  const words = data?.vocabulary?.words ?? [];
  const allWordIds = useMemo(() => words.map((word) => word.id), [words]);
  const wordIdSignature = useMemo(() => allWordIds.join("|"), [allWordIds]);
  const wordMap = useMemo(
    () => new Map(words.map((word) => [word.id, word])),
    [words],
  );
  const knownSet = useMemo(() => new Set(knownIds), [knownIds]);
  const unknownIds = useMemo(
    () => allWordIds.filter((wordId) => !knownSet.has(wordId)),
    [allWordIds, knownSet],
  );

  const hasSpeechSupport =
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    typeof SpeechSynthesisUtterance !== "undefined";

  const safeCancelSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    try {
      window.speechSynthesis.cancel();
    } catch {
      // Some browsers may throw DOMException(NotFoundError) while cancelling.
    }
  };

  useEffect(() => {
    if (!wordIdSignature) {
      setDeckIds([]);
      setCurrentIndex(0);
      setIsFlipped(false);
      setKnownIds([]);
      setStudyMode("all");
      return;
    }

    setDeckIds(allWordIds);
    setCurrentIndex(0);
    setIsFlipped(false);
    setKnownIds([]);
    setStudyMode("all");
  }, [id, wordIdSignature, allWordIds]);

  useEffect(() => {
    if (studyMode !== "unknown") {
      return;
    }

    if (unknownIds.length === 0) {
      setStudyMode("all");
      setDeckIds(allWordIds);
      setCurrentIndex(0);
      setIsFlipped(false);
      return;
    }

    setDeckIds((currentDeck) => {
      const keptOrder = currentDeck.filter((wordId) =>
        unknownIds.includes(wordId),
      );
      const missing = unknownIds.filter(
        (wordId) => !keptOrder.includes(wordId),
      );
      return [...keptOrder, ...missing];
    });
  }, [studyMode, unknownIds, allWordIds]);

  useEffect(() => {
    if (deckIds.length === 0) {
      setCurrentIndex(0);
      return;
    }

    setCurrentIndex((index) => (index >= deckIds.length ? 0 : index));
  }, [deckIds]);

  useEffect(() => {
    return () => safeCancelSpeech();
  }, []);

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
            {t("Không tải được flashcards.")}
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  const effectiveDeckIds =
    deckIds.length > 0
      ? deckIds
      : studyMode === "unknown"
        ? unknownIds
        : allWordIds;
  const deckCount = effectiveDeckIds.length;
  const safeCurrentIndex = deckCount > 0 ? currentIndex % deckCount : 0;
  const activeWordId = deckCount > 0 ? effectiveDeckIds[safeCurrentIndex] : "";
  const currentWord = activeWordId ? wordMap.get(activeWordId) : undefined;
  const progress =
    deckCount > 0 ? ((safeCurrentIndex + 1) / deckCount) * 100 : 0;

  const stopSpeaking = () => {
    setIsSpeaking(false);
    safeCancelSpeech();
  };

  const toggleKnown = () => {
    if (!currentWord) {
      return;
    }

    setKnownIds((prev) =>
      prev.includes(currentWord.id)
        ? prev.filter((wordId) => wordId !== currentWord.id)
        : [...prev, currentWord.id],
    );
  };

  const goNext = () => {
    if (deckCount === 0) {
      return;
    }

    setCurrentIndex((index) => (index + 1) % deckCount);
    setIsFlipped(false);
    stopSpeaking();
  };

  const goPrev = () => {
    if (deckCount === 0) {
      return;
    }

    setCurrentIndex((index) => (index - 1 + deckCount) % deckCount);
    setIsFlipped(false);
    stopSpeaking();
  };

  const speakCurrentWord = () => {
    if (!currentWord || !hasSpeechSupport) {
      return;
    }

    const synth = window.speechSynthesis;
    safeCancelSpeech();

    const utterance = new SpeechSynthesisUtterance(currentWord.word);
    utterance.lang = "en-US";
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    try {
      synth.speak(utterance);
    } catch {
      setIsSpeaking(false);
    }
  };

  const shuffleDeck = () => {
    if (deckCount <= 1) {
      return;
    }

    setDeckIds(shuffleArray(effectiveDeckIds));
    setCurrentIndex(0);
    setIsFlipped(false);
    stopSpeaking();
  };

  const startUnknownReview = () => {
    if (unknownIds.length === 0) {
      return;
    }

    setDeckIds(unknownIds);
    setCurrentIndex(0);
    setIsFlipped(false);
    setStudyMode("unknown");
    stopSpeaking();
  };

  const backToAllCards = () => {
    setDeckIds(allWordIds);
    setCurrentIndex(0);
    setIsFlipped(false);
    setStudyMode("all");
    stopSpeaking();
  };

  const resetStudy = () => {
    setKnownIds([]);
    setDeckIds(allWordIds);
    setCurrentIndex(0);
    setIsFlipped(false);
    setStudyMode("all");
    stopSpeaking();
  };

  const handleComplete = () => {
    stopSpeaking();

    const shouldStartQuiz = window.confirm(
      t("Bạn muốn làm bài trắc nghiệm (quiz) ngay bây giờ không?"),
    );

    if (shouldStartQuiz) {
      router.push(`/vocabularies/${id}/quiz`);
      return;
    }

    router.push(`/vocabularies/${id}`);
  };

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-4xl px-6 py-10 lg:px-10">
        <div className="mb-6">
          <button
            onClick={() => router.push(`/vocabularies/${id}`)}
            className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-black"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {lang === "vi"
              ? `Quay lại: ${data.vocabulary.title}`
              : `Back to ${data.vocabulary.title}`}
          </button>
        </div>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{t("Thẻ ghi nhớ")}</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              {t(
                "Lật thẻ, đánh dấu đã nhớ, ôn thẻ chưa nhớ, rồi chuyển sang quiz.",
              )}
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600">
            <span>
              {deckCount > 0 ? safeCurrentIndex + 1 : 0} / {deckCount}
            </span>
            <span className="text-slate-300">|</span>
            <span>
              {studyMode === "unknown"
                ? t("Chỉ thẻ chưa thuộc")
                : t("Tất cả thẻ")}
            </span>
          </div>
        </div>

        <div className="mb-8 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-2.5 rounded-full bg-gradient-to-r from-slate-900 to-slate-700 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {deckCount === 0 && (
          <div className="mb-8 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-slate-500">
            {t("Bộ này chưa có thẻ flashcard nào.")}
          </div>
        )}

        {currentWord && (
          <div className="mb-8">
            <div
              className="mx-auto max-w-2xl"
              style={{ perspective: "1600px" }}
            >
              <div
                key={currentWord.id}
                role="button"
                tabIndex={0}
                className="relative h-80 w-full rounded-3xl text-left transition-transform hover:scale-[1.01] focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                onClick={() => setIsFlipped((flipped) => !flipped)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setIsFlipped((flipped) => !flipped);
                  }
                }}
                aria-label={t("Lật thẻ flashcard")}
              >
                <div
                  className="relative h-full w-full rounded-3xl transition-transform duration-700"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                  }}
                >
                  <div
                    className="absolute inset-0 flex h-full w-full flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <div className="mb-5 flex items-center justify-between">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        {t("Mặt trước")}
                      </span>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          speakCurrentWord();
                        }}
                        disabled={!hasSpeechSupport}
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Volume2
                          className={`h-3.5 w-3.5 ${isSpeaking ? "animate-pulse" : ""}`}
                        />
                        {t("Phát âm")}
                      </button>
                    </div>
                    <div className="flex flex-1 flex-col items-center justify-center text-center">
                      <p className="text-4xl font-bold tracking-tight text-slate-900">
                        {currentWord.word}
                      </p>
                      {currentWord.phonetic && (
                        <p className="mt-3 text-base text-slate-500">
                          {currentWord.phonetic}
                        </p>
                      )}
                    </div>
                    <p className="mt-3 text-center text-xs text-slate-400">
                      Click to flip
                    </p>
                  </div>

                  <div
                    className="absolute inset-0 flex h-full w-full flex-col rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    <div className="mb-5">
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        {t("Mặt sau")}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col items-center justify-center text-center">
                      <p className="text-2xl font-semibold text-slate-800">
                        {currentWord.meaning}
                      </p>
                      {currentWord.example && (
                        <p className="mt-4 max-w-xl text-sm italic leading-6 text-slate-500">
                          "{currentWord.example}"
                        </p>
                      )}
                    </div>
                    <p className="mt-3 text-center text-xs text-slate-400">
                      {t("Chạm để lật lại")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
            <p className="text-slate-500">{t("Đã nhớ")}</p>
            <p className="text-lg font-bold text-emerald-600">
              {knownIds.length}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
            <p className="text-slate-500">{t("Chưa nhớ")}</p>
            <p className="text-lg font-bold text-amber-600">
              {unknownIds.length}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
            <p className="text-slate-500">{t("Bộ thẻ hiện tại")}</p>
            <p className="text-lg font-bold text-slate-800">{deckCount}</p>
          </div>
        </div>

        {studyMode === "unknown" && deckCount > 0 && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4">
            <p className="text-sm font-semibold text-amber-900">
              {t(
                "Chế độ ôn: chỉ các thẻ chưa đánh dấu đã nhớ",
              )}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {deckIds.map((wordId) => {
                const word = wordMap.get(wordId);
                if (!word) {
                  return null;
                }

                return (
                  <span
                    key={wordId}
                    className="rounded-full border border-amber-300 bg-white px-3 py-1 text-xs font-semibold text-amber-900"
                  >
                    {word.word}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={goPrev}
            disabled={deckCount === 0}
            className="inline-flex items-center rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("Trước")}
          </button>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={toggleKnown}
              disabled={!currentWord}
              className={`inline-flex items-center rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                currentWord && knownSet.has(currentWord.id)
                  ? "bg-emerald-600 text-white"
                  : "border border-slate-200 text-slate-700 hover:bg-slate-50"
              } disabled:cursor-not-allowed disabled:opacity-40`}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {currentWord && knownSet.has(currentWord.id)
                ? t("Đã nhớ")
                : t("Đánh dấu đã nhớ")}
            </button>

            <button
              onClick={goNext}
              disabled={deckCount === 0}
              className="inline-flex items-center rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t("Tiếp theo")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={shuffleDeck}
            disabled={deckCount <= 1}
            className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Shuffle className="mr-2 h-4 w-4" />
            {t("Xáo trộn")}
          </button>

          {studyMode === "unknown" ? (
            <button
              onClick={backToAllCards}
              className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              {t("Về tất cả thẻ")}
            </button>
          ) : (
            <button
              onClick={startUnknownReview}
              disabled={unknownIds.length === 0}
              className="inline-flex items-center rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t("Ôn thẻ chưa nhớ")} ({unknownIds.length})
            </button>
          )}

          <button
            onClick={resetStudy}
            className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            {t("Đặt lại tiến độ")}
          </button>

          <button
            onClick={handleComplete}
            className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            {t("Hoàn thành")}
          </button>
        </div>
      </main>
    </ProtectedRoute>
  );
}
