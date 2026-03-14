import { baseApi } from "./baseApi";
import type { ApiResponse } from "@/types";

type ExerciseType = "mcq" | "fill_blank" | "matching";
type ExerciseLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface ExerciseQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ExerciseItem {
  id: string;
  title: string;
  description: string;
  type: ExerciseType;
  level: ExerciseLevel;
  topic: string;
  questionCount: number;
  durationMinutes: number;
  rewardsXp: number;
  coverImage: string;
  skills: string[];
  questions?: ExerciseQuestion[];
}

export interface ExerciseHistoryItem {
  attemptId: string;
  exerciseId: string;
  submittedAt: string;
  score: number;
  total: number;
  durationSec: number;
  userName?: string;
  answers?: number[];
  exercise?: ExerciseItem;
  durationText?: string;
}

export interface ExerciseLeaderboardItem {
  rank: number;
  name: string;
  score: number;
  durationSec: number;
}

export interface ExerciseSummary {
  totalExercises: number;
  totalQuestions: number;
  totalXp: number;
  pastAttempts: number;
}

export interface ExerciseListResponse {
  items: ExerciseItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ExerciseDetailResponse {
  exercise: ExerciseItem;
  related: ExerciseItem[];
}

export interface ExerciseHintsResponse {
  exerciseId: string;
  title: string;
  personalized: string[];
  strategies: string[];
}

export interface ExerciseLeaderboardResponse {
  exerciseId: string;
  questionCount: number;
  leaderboard: ExerciseLeaderboardItem[];
}

export interface ExerciseReviewResponse {
  exerciseId: string;
  review: Array<{
    questionId: string;
    prompt: string;
    options: string[];
    selectedIndex: number;
    selectedText: string | null;
    correctIndex: number;
    correctText: string | null;
    isCorrect: boolean;
    explanation: string;
  }>;
}

export interface SubmitExerciseBody {
  answers: number[];
  durationSec?: number;
  userName?: string;
}

export interface SubmitExerciseResponse {
  attemptId: string;
  score: number;
  total: number;
  percent: number;
  time: number;
  earnedXp: number;
  resultLabel: string;
  answers: number[];
}

export const exercisesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getExercises: builder.query<
      ExerciseListResponse,
      {
        query?: string;
        level?: string;
        type?: string;
        topic?: string;
        page?: number;
        limit?: number;
        includeQuestions?: boolean;
      } | void
    >({
      query: (params) => ({
        url: "/exercises",
        method: "GET",
        params: params ?? undefined,
      }),
      transformResponse: (response: ApiResponse<ExerciseListResponse>) =>
        response.data as ExerciseListResponse,
    }),

    getExerciseSummary: builder.query<ExerciseSummary, void>({
      query: () => ({
        url: "/exercises/summary",
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<ExerciseSummary>) =>
        response.data as ExerciseSummary,
    }),

    getRecommendedExercises: builder.query<
      ExerciseItem[],
      { limit?: number } | void
    >({
      query: (params) => ({
        url: "/exercises/recommended",
        method: "GET",
        params: params ?? undefined,
      }),
      transformResponse: (response: ApiResponse<ExerciseItem[]>) =>
        response.data as ExerciseItem[],
    }),

    getExerciseHistory: builder.query<
      ExerciseHistoryItem[],
      { limit?: number } | void
    >({
      query: (params) => ({
        url: "/exercises/history",
        method: "GET",
        params: params ?? undefined,
      }),
      transformResponse: (response: ApiResponse<ExerciseHistoryItem[]>) =>
        response.data as ExerciseHistoryItem[],
    }),

    getExerciseById: builder.query<ExerciseDetailResponse, string>({
      query: (id) => ({
        url: `/exercises/${id}`,
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<ExerciseDetailResponse>) =>
        response.data as ExerciseDetailResponse,
    }),

    getExerciseHints: builder.query<ExerciseHintsResponse, string>({
      query: (id) => ({
        url: `/exercises/${id}/hints`,
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<ExerciseHintsResponse>) =>
        response.data as ExerciseHintsResponse,
    }),

    getExerciseLeaderboard: builder.query<ExerciseLeaderboardResponse, string>({
      query: (id) => ({
        url: `/exercises/${id}/leaderboard`,
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<ExerciseLeaderboardResponse>) =>
        response.data as ExerciseLeaderboardResponse,
    }),

    getExerciseReview: builder.query<
      ExerciseReviewResponse,
      { id: string; answers?: string }
    >({
      query: ({ id, answers }) => ({
        url: `/exercises/${id}/review`,
        method: "GET",
        params: { answers },
      }),
      transformResponse: (response: ApiResponse<ExerciseReviewResponse>) =>
        response.data as ExerciseReviewResponse,
    }),

    submitExerciseAttempt: builder.mutation<
      SubmitExerciseResponse,
      { id: string; body: SubmitExerciseBody }
    >({
      query: ({ id, body }) => ({
        url: `/exercises/${id}/submit`,
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<SubmitExerciseResponse>) =>
        response.data as SubmitExerciseResponse,
    }),
  }),
});

export const {
  useGetExercisesQuery,
  useGetExerciseSummaryQuery,
  useGetRecommendedExercisesQuery,
  useGetExerciseHistoryQuery,
  useGetExerciseByIdQuery,
  useGetExerciseHintsQuery,
  useGetExerciseLeaderboardQuery,
  useGetExerciseReviewQuery,
  useSubmitExerciseAttemptMutation,
} = exercisesApi;
