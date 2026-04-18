"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Brain,
  Clock3,
  Sparkles,
  Trophy,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { LEVEL_LABELS, TOPIC_LABELS } from "../data";
import { VocabularyDetailSkeleton } from "@/components/vocabularies/skeletons";
import {
  useGetVocabularyByIdQuery,
  useGetVocabularyLeaderboardQuery,
} from "@/store/services/vocabulariesApi";
import { useI18n } from "@/lib/i18n/context";

export default function VocabularyDetailPage() {
  const { t } = useI18n();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  const { data, isLoading, isError } = useGetVocabularyByIdQuery(id, {
    skip: !id,
  });

  const { data: leaderboardData } = useGetVocabularyLeaderboardQuery(id, {
    skip: !id,
  });

  const vocabulary = data?.vocabulary;
  const related = data?.related ?? [];
  const topRank = leaderboardData?.leaderboard?.[0];

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-10">
        {/* Back navigation */}
        <section className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/vocabularies"
            className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-black"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("Quay lại Lớp học từ vựng")}
          </Link>
          {vocabulary && (
            <div className="flex gap-2">
              <Link
                href={`/vocabularies/${vocabulary.id}/hints`}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Sparkles className="mr-1.5 inline h-3.5 w-3.5" />
                {t("Gợi ý AI")}
              </Link>
              <Link
                href={`/vocabularies/${vocabulary.id}/leaderboard`}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Trophy className="mr-1.5 inline h-3.5 w-3.5" />
                {t("Bảng xếp hạng")}
              </Link>
            </div>
          )}
        </section>

        {isLoading && <VocabularyDetailSkeleton />}

        {isError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
            {t("Không tải được chi tiết bộ từ.")}
          </div>
        )}

        {!isLoading && !isError && !vocabulary && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="font-semibold">
              {t("Không tìm thấy bộ từ vựng")}
            </p>
          </div>
        )}

        {!isLoading && !isError && vocabulary && (
          <>
            {/* Cover + Header */}
            <section className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="relative h-52 w-full bg-slate-100">
                {vocabulary.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={vocabulary.coverImage}
                    alt={vocabulary.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <BookOpen className="h-16 w-16 text-slate-300" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h1 className="text-3xl font-bold text-white">
                    {vocabulary.title}
                  </h1>
                  <p className="mt-1 text-sm text-white/80">
                    {vocabulary.description || t("Không có mô tả.")}
                  </p>
                </div>
              </div>

              {/* Metadata grid */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 p-6 md:grid-cols-4">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                    <Brain className="h-4 w-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">{t("Cấp độ")}</p>
                    <p className="text-sm font-semibold">
                      {LEVEL_LABELS[vocabulary.level] ?? vocabulary.level}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                    <BookOpen className="h-4 w-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">{t("Chủ đề")}</p>
                    <p className="text-sm font-semibold">
                      {TOPIC_LABELS[vocabulary.topic] ?? vocabulary.topic}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                    <BookOpen className="h-4 w-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">{t("từ")}</p>
                    <p className="text-sm font-semibold">
                      {vocabulary.wordCount}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                    <Clock3 className="h-4 w-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">{t("Thời lượng")}</p>
                    <p className="text-sm font-semibold">
                      {vocabulary.durationMinutes} {t("phút")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3 border-t border-slate-100 px-6 pb-6">
                <Link
                  href={`/vocabularies/${vocabulary.id}/flashcards`}
                  className="inline-flex items-center rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {t("Học Flashcard")}
                </Link>
                <Link
                  href={`/vocabularies/${vocabulary.id}/quiz`}
                  className="inline-flex items-center rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  {t("Làm Quiz")}
                </Link>
              </div>
            </section>

            {/* Words list */}
            <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold">
                {t("Các từ trong bộ này")}
              </h2>
              <div className="space-y-3">
                {vocabulary.words.map((word) => (
                  <div
                    key={word.id}
                    className="flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{word.word}</span>
                        {word.phonetic && (
                          <span className="text-sm text-slate-500">
                            {word.phonetic}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-slate-600">
                        {word.meaning}
                      </p>
                      {word.example && (
                        <p className="mt-1 text-xs italic text-slate-400">
                          {word.example}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Related sets */}
            {related.length > 0 && (
              <section className="mb-8">
                <h2 className="mb-4 text-lg font-bold">
                  {t("Bộ từ vựng liên quan")}
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {related.map((set) => (
                    <Link
                      key={set.id}
                      href={`/vocabularies/${set.id}`}
                      className="overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-300"
                    >
                      <h3 className="font-semibold">{set.title}</h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {TOPIC_LABELS[set.topic] ?? set.topic} · {set.wordCount}{" "}
                        {t("từ")}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Top rank */}
            {topRank && (
              <section className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-6">
                <h3 className="mb-2 text-sm font-semibold text-amber-800">
                  {t("Người dẫn đầu")}
                </h3>
                <p className="text-amber-900">
                  <span className="font-bold">{topRank.name}</span>{" "}
                  {t("với điểm")}{" "}
                  <span className="font-bold">{topRank.score}</span>
                </p>
              </section>
            )}
          </>
        )}
      </main>
    </ProtectedRoute>
  );
}
