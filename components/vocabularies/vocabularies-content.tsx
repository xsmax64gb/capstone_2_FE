"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BookOpen,
  CheckCircle2,
  History,
  Layers3,
  Search,
  Sparkles,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { LEVEL_LABELS, TOPIC_LABELS } from "@/app/(user)/vocabularies/data";
import { VocabulariesListSkeleton } from "@/components/vocabularies/skeletons";
import {
  useGetVocabularySummaryQuery,
  useGetVocabulariesQuery,
} from "@/store/services/vocabulariesApi";
import type { VocabularySet } from "@/store/services/vocabulariesApi";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useI18n } from "@/lib/i18n/context";

export default function VocabulariesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [selectedLevel, setSelectedLevel] = useState<string>(
    searchParams.get("level") || "all",
  );
  const [selectedTopic, setSelectedTopic] = useState<string>(
    searchParams.get("topic") || "all",
  );

  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const updateFilters = (newFilters: {
    query?: string;
    level?: string;
    topic?: string;
    page?: number;
  }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newFilters.query !== undefined) {
      if (newFilters.query) {
        params.set("query", newFilters.query);
      } else {
        params.delete("query");
      }
    }

    if (newFilters.level !== undefined) {
      if (newFilters.level && newFilters.level !== "all") {
        params.set("level", newFilters.level);
      } else {
        params.delete("level");
      }
    }

    if (newFilters.topic !== undefined) {
      if (newFilters.topic && newFilters.topic !== "all") {
        params.set("topic", newFilters.topic);
      } else {
        params.delete("topic");
      }
    }

    if (newFilters.page !== undefined) {
      if (newFilters.page > 1) {
        params.set("page", newFilters.page.toString());
      } else {
        params.delete("page");
      }
    }

    router.push(`?${params.toString()}`);
  };

  const {
    data: listData,
    isLoading,
    isError,
  } = useGetVocabulariesQuery({
    query: query || undefined,
    level: selectedLevel !== "all" ? selectedLevel : undefined,
    topic: selectedTopic !== "all" ? selectedTopic : undefined,
    page: currentPage,
    limit: 8,
  });

  const { data: summaryData } = useGetVocabularySummaryQuery();

  const items: VocabularySet[] = listData?.items ?? [];
  const pagination = listData?.pagination;
  const totalSets = summaryData?.totalSets ?? 0;
  const totalWords = summaryData?.totalWords ?? 0;

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-10">
        {/* Header */}
        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {t("Phòng thí nghiệm từ vựng")}
              </h1>
              <p className="mt-1 text-slate-500">
                {t(
                  "Học từ vựng thông qua flashcards và quiz, được hỗ trợ bởi dữ liệu thực tế.",
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/vocabularies/overview"
                className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Layers3 className="mr-1.5 h-4 w-4" />
                {t("Bảng tổng quan từ vựng")}
              </Link>
              <Link
                href="/vocabularies/recommended"
                className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Sparkles className="mr-1.5 h-4 w-4" />
                {t("Gợi ý")}
              </Link>
              <Link
                href="/vocabularies/history"
                className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <History className="mr-1.5 h-4 w-4" />
                {t("Lịch sử")}
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center">
              <p className="text-2xl font-bold">{totalSets}</p>
              <p className="text-xs text-slate-500">{t("Tổng số bộ")}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center">
              <p className="text-2xl font-bold">{totalWords}</p>
              <p className="text-xs text-slate-500">{t("Tổng số từ")}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center">
              <p className="text-2xl font-bold">
                {summaryData?.masteredCount ?? 0}
              </p>
              <p className="text-xs text-slate-500">{t("Đã thuộc")}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center">
              <p className="text-2xl font-bold">
                {summaryData?.learningCount ?? 0}
              </p>
              <p className="text-xs text-slate-500">{t("Đang học")}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  updateFilters({ query: e.target.value, page: 1 });
                }}
                placeholder={t("Tìm bộ từ, từ...")}
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-black"
              />
            </label>

            <select
              value={selectedLevel}
              onChange={(e) => {
                setSelectedLevel(e.target.value);
                updateFilters({ level: e.target.value, page: 1 });
              }}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-black"
            >
              <option value="all">{t("Tất cả cấp độ")}</option>
              <option value="A1">{t("A1 — Người mới bắt đầu")}</option>
              <option value="A2">{t("A2 — Sơ cấp")}</option>
              <option value="B1">{t("B1 — Trung cấp")}</option>
              <option value="B2">{t("B2 — Trung cấp cao")}</option>
              <option value="C1">{t("C1 — Nâng cao")}</option>
              <option value="C2">{t("C2 — Thành thạo")}</option>
            </select>

            <select
              value={selectedTopic}
              onChange={(e) => {
                setSelectedTopic(e.target.value);
                updateFilters({ topic: e.target.value, page: 1 });
              }}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-black"
            >
              <option value="all">{t("Tất cả chủ đề")}</option>
              <option value="daily-life">{t("Đời sống hằng ngày")}</option>
              <option value="work">{t("Công việc")}</option>
              <option value="travel">{t("Du lịch")}</option>
              <option value="technology">{t("Công nghệ")}</option>
            </select>
          </div>
        </section>

        {/* Loading state */}
        {isLoading && <VocabulariesListSkeleton />}

        {/* Error state */}
        {isError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
            {t("Không tải được từ vựng. Vui lòng thử lại.")}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && items.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="font-semibold">
              {t("Không tìm thấy bộ từ vựng nào")}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {t("Hãy thử thay đổi từ khóa, cấp độ hoặc chủ đề lọc.")}
            </p>
          </div>
        )}

        {/* Grid */}
        {!isLoading && !isError && items.length > 0 && (
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {items.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                {/* Cover image */}
                <div className="relative h-36 w-full overflow-hidden bg-slate-100">
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
                    <h3 className="text-xl font-bold text-white">
                      {item.title}
                    </h3>
                  </div>
                </div>

                <div className="space-y-3 p-5">
                  {/* Description */}
                  <p className="line-clamp-2 text-sm text-slate-600">
                    {item.description || t("Không có mô tả.")}
                  </p>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-semibold">
                      {LEVEL_LABELS[item.level] ?? item.level}
                    </span>
                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      <BookOpen className="mr-1 h-3.5 w-3.5" />
                      {TOPIC_LABELS[item.topic] ?? item.topic}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      {item.wordCount} {t("từ")}
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                    <Link
                      href={`/vocabularies/${item.id}`}
                      className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-2 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      {t("Chi tiết")}
                    </Link>
                    <Link
                      href={`/vocabularies/${item.id}/flashcards`}
                      className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-2 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      {t("Flashcard")}
                    </Link>
                    <Link
                      href={`/vocabularies/${item.id}/quiz`}
                      className="inline-flex items-center justify-center rounded-lg bg-black px-2 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                    >
                      {t("Quiz")}
                    </Link>
                    <Link
                      href={`/vocabularies/${item.id}`}
                      className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-2 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) {
                        updateFilters({ page: currentPage - 1 });
                      }
                    }}
                    className={
                      currentPage <= 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>

                {Array.from(
                  { length: pagination.totalPages },
                  (_, i) => i + 1,
                ).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      isActive={page === currentPage}
                      onClick={(e) => {
                        e.preventDefault();
                        updateFilters({ page });
                      }}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < pagination.totalPages) {
                        updateFilters({ page: currentPage + 1 });
                      }
                    }}
                    className={
                      currentPage >= pagination.totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* Suggested route */}
        {!isLoading && !isError && items.length > 0 && (
          <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="inline-flex items-center text-lg font-bold">
              <Sparkles className="mr-2 h-4 w-4" />
              {t("Lộ trình gợi ý")}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              {t(
                "Mở Bảng tổng quan từ vựng để xem tất cả từ, sau đó học với Flashcards, và hoàn thành với Quiz.",
              )}
            </p>
          </section>
        )}
      </main>
    </ProtectedRoute>
  );
}
