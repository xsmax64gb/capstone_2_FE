import { baseApi } from "@/store/api/baseApi";
import type { ApiResponse } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

export type VocabularyLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export type VocabularyTopic = "daily-life" | "work" | "travel" | "technology" | "general";

export interface VocabularyWord {
  id: string;
  word: string;
  phonetic: string;
  meaning: string;
  example: string;
  partOfSpeech: string;
  synonyms: string[];
  antonyms: string[];
}

export interface VocabularySet {
  id: string;
  title: string;
  description: string;
  level: VocabularyLevel;
  topic: VocabularyTopic;
  coverImage: string;
  wordCount: number;
  durationMinutes: number;
  rewardsXp: number;
  words: VocabularyWord[];
  /** Quiz 100% — đã thuộc cả bộ (theo lần làm quiz tốt nhất) */
  quizMastered?: boolean;
  bestQuizPercent?: number;
  xpEligibleForSet?: boolean;
  ownerId?: string | null;
  isPersonal?: boolean;
  source?: string;
}

export interface VocabularyFlashcard {
  id: string;
  front: string;
  back: string;
}

export interface VocabularyQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface VocabularySummary {
  totalSets: number;
  totalWords: number;
  masteredCount: number;
  learningCount: number;
  newCount: number;
}

export interface VocabularyHistoryItem {
  attemptId: string;
  setId: string;
  setName: string;
  submittedAt: string;
  score: number;
  total: number;
  durationSec: number;
  mode: "flashcards" | "quiz";
}

export interface VocabularyLeaderboardItem {
  rank: number;
  name: string;
  score: number;
  durationSec: number;
}

export interface VocabularyHintsResponse {
  vocabularyId: string;
  title: string;
  personalized: string[];
  strategies: string[];
}

export interface VocabularyReviewItem {
  wordId: string;
  word: string;
  prompt: string;
  options: string[];
  selectedIndex: number;
  selectedText: string | null;
  correctIndex: number;
  correctText: string | null;
  isCorrect: boolean;
  explanation: string;
}

export interface VocabularyReviewResponse {
  vocabularyId: string;
  review: VocabularyReviewItem[];
}

export interface VocabularyListResponse {
  items: VocabularySet[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PersonalVocabParseError {
  line: number;
  raw: string;
  message: string;
}

export interface PersonalVocabItem {
  word: string;
  pronunciation?: string;
  meaning?: string;
  example?: string;
}

export interface PersonalVocabAiGenerateResponse {
  rawText: string;
  model?: string;
  items: PersonalVocabItem[];
  errors: PersonalVocabParseError[];
  pdfTruncated?: boolean;
}

export interface VocabularyDetailResponse {
  vocabulary: VocabularySet;
  related: VocabularySet[];
}

export interface VocabularyLeaderboardResponse {
  vocabularyId: string;
  wordCount: number;
  leaderboard: VocabularyLeaderboardItem[];
}

export interface SubmitVocabularyBody {
  mode: "flashcards" | "quiz";
  answers: (number | null)[];
  wordIds?: string[];
  /** Nội dung đáp án đã chọn (quiz) — backend so khớp với nghĩa đúng trong DB */
  selectedLabels?: string[];
  durationSec?: number;
}

export interface SubmitVocabularyResponse {
  attemptId: string;
  score: number;
  total: number;
  percent: number;
  time: number;
  earnedXp: number;
  xpAwarded?: boolean;
  xpReason?: string;
  userExp?: number;
  resultLabel: string;
  answers: (number | null)[];
}

// ─── API Slice ────────────────────────────────────────────────────────────────

export const vocabulariesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getVocabularies: builder.query<
      VocabularyListResponse,
      {
        query?: string;
        level?: string;
        topic?: string;
        personal?: boolean;
        page?: number;
        limit?: number;
      } | void
    >({
      query: (params) => ({
        url: "/vocabularies",
        method: "GET",
        params: params ?? undefined,
      }),
      transformResponse: (response: ApiResponse<VocabularyListResponse>) =>
        response.data as VocabularyListResponse,
      providesTags: ["Vocabularies"],
    }),

    getVocabularySummary: builder.query<VocabularySummary, void>({
      query: () => ({
        url: "/vocabularies/summary",
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<VocabularySummary>) =>
        response.data as VocabularySummary,
      providesTags: ["VocabularySummary"],
    }),

    getRecommendedVocabularies: builder.query<
      VocabularySet[],
      { limit?: number } | void
    >({
      query: (params) => ({
        url: "/vocabularies/recommended",
        method: "GET",
        params: params ?? undefined,
      }),
      transformResponse: (response: ApiResponse<VocabularySet[]>) =>
        response.data as VocabularySet[],
    }),

    getVocabularyHistory: builder.query<
      VocabularyHistoryItem[],
      { limit?: number } | void
    >({
      query: (params) => ({
        url: "/vocabularies/history",
        method: "GET",
        params: params ?? undefined,
      }),
      transformResponse: (response: ApiResponse<VocabularyHistoryItem[]>) =>
        response.data as VocabularyHistoryItem[],
    }),

    getVocabularyById: builder.query<VocabularyDetailResponse, string>({
      query: (id) => ({
        url: `/vocabularies/${id}`,
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<VocabularyDetailResponse>) =>
        response.data as VocabularyDetailResponse,
    }),

    getVocabularyHints: builder.query<VocabularyHintsResponse, string>({
      query: (id) => ({
        url: `/vocabularies/${id}/hints`,
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<VocabularyHintsResponse>) =>
        response.data as VocabularyHintsResponse,
    }),

    getVocabularyLeaderboard: builder.query<VocabularyLeaderboardResponse, string>({
      query: (id) => ({
        url: `/vocabularies/${id}/leaderboard`,
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<VocabularyLeaderboardResponse>) =>
        response.data as VocabularyLeaderboardResponse,
    }),

    getVocabularyReview: builder.query<
      VocabularyReviewResponse,
      { id: string; answers?: string }
    >({
      query: ({ id, answers }) => ({
        url: `/vocabularies/${id}/review`,
        method: "GET",
        params: { answers },
      }),
      transformResponse: (response: ApiResponse<VocabularyReviewResponse>) =>
        response.data as VocabularyReviewResponse,
    }),

    submitVocabularyAttempt: builder.mutation<
      SubmitVocabularyResponse,
      { id: string; body: SubmitVocabularyBody }
    >({
      query: ({ id, body }) => ({
        url: `/vocabularies/${id}/submit`,
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<SubmitVocabularyResponse>) =>
        response.data as SubmitVocabularyResponse,
      invalidatesTags: ["Vocabularies", "VocabularySummary"],
    }),

    generatePersonalVocabularyFromPrompt: builder.mutation<
      PersonalVocabAiGenerateResponse,
      Record<string, unknown>
    >({
      query: (body) => ({
        url: "/vocabularies/personal/generate-prompt",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<PersonalVocabAiGenerateResponse>) =>
        response.data as PersonalVocabAiGenerateResponse,
    }),

    generatePersonalVocabularyFromPdf: builder.mutation<
      PersonalVocabAiGenerateResponse,
      FormData
    >({
      query: (body) => ({
        url: "/vocabularies/personal/generate-pdf",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<PersonalVocabAiGenerateResponse>) =>
        response.data as PersonalVocabAiGenerateResponse,
    }),

    createPersonalVocabularyManual: builder.mutation<
      { id: string },
      Record<string, unknown>
    >({
      query: (body) => ({
        url: "/vocabularies/personal/manual",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<{ id: string }>) =>
        response.data as { id: string },
      invalidatesTags: ["Vocabularies"],
    }),

    createPersonalVocabularyAi: builder.mutation<
      { id: string },
      Record<string, unknown>
    >({
      query: (body) => ({
        url: "/vocabularies/personal/ai",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<{ id: string }>) =>
        response.data as { id: string },
      invalidatesTags: ["Vocabularies", "FeatureQuotas"],
    }),

    updatePersonalVocabularySet: builder.mutation<
      { id: string },
      { id: string; body: Record<string, unknown> }
    >({
      query: ({ id, body }) => ({
        url: `/vocabularies/personal/${id}`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: ApiResponse<{ id: string }>) =>
        response.data as { id: string },
      invalidatesTags: ["Vocabularies"],
    }),

    deletePersonalVocabularySet: builder.mutation<void, string>({
      query: (id) => ({
        url: `/vocabularies/personal/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Vocabularies", "VocabularySummary"],
    }),
  }),
});

export const {
  useGetVocabulariesQuery,
  useGetVocabularySummaryQuery,
  useGetRecommendedVocabulariesQuery,
  useGetVocabularyHistoryQuery,
  useGetVocabularyByIdQuery,
  useGetVocabularyHintsQuery,
  useGetVocabularyLeaderboardQuery,
  useGetVocabularyReviewQuery,
  useSubmitVocabularyAttemptMutation,
  useGeneratePersonalVocabularyFromPromptMutation,
  useGeneratePersonalVocabularyFromPdfMutation,
  useCreatePersonalVocabularyManualMutation,
  useCreatePersonalVocabularyAiMutation,
  useUpdatePersonalVocabularySetMutation,
  useDeletePersonalVocabularySetMutation,
} = vocabulariesApi;
