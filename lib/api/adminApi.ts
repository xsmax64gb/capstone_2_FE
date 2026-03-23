import { baseApi } from "./baseApi";
import type {
  AdminAiLevelItem,
  AdminAiLevelPayload,
  AdminAiLevelsResponse,
  AdminExerciseItem,
  AdminExercisePayload,
  AdminExercisesResponse,
  AdminOverviewResponse,
  AdminReportsResponse,
  AdminVocabularyItem,
  AdminVocabularyPayload,
  AdminVocabularyResponse,
  AdminUsersResponse,
  ApiResponse,
} from "@/types";

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminOverview: builder.query<AdminOverviewResponse, void>({
      query: () => ({
        url: "/admin/overview",
        method: "GET",
      }),
      providesTags: ["AdminOverview"],
      transformResponse: (response: ApiResponse<AdminOverviewResponse>) =>
        response.data as AdminOverviewResponse,
    }),

    getAdminUsers: builder.query<AdminUsersResponse, void>({
      query: () => ({
        url: "/admin/users",
        method: "GET",
      }),
      providesTags: ["AdminUsers"],
      transformResponse: (response: ApiResponse<AdminUsersResponse>) =>
        response.data as AdminUsersResponse,
    }),

    getAdminReports: builder.query<AdminReportsResponse, void>({
      query: () => ({
        url: "/admin/reports",
        method: "GET",
      }),
      providesTags: ["AdminReports"],
      transformResponse: (response: ApiResponse<AdminReportsResponse>) =>
        response.data as AdminReportsResponse,
    }),

    getAdminExercises: builder.query<AdminExerciseItem[], void>({
      query: () => ({
        url: "/admin/exercises",
        method: "GET",
      }),
      providesTags: ["AdminExercises"],
      transformResponse: (response: ApiResponse<AdminExercisesResponse>) =>
        response.data?.items ?? [],
    }),

    createAdminExercise: builder.mutation<AdminExerciseItem, AdminExercisePayload>({
      query: (body) => ({
        url: "/admin/exercises",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AdminExercises", "AdminOverview"],
      transformResponse: (response: ApiResponse<AdminExerciseItem>) =>
        response.data as AdminExerciseItem,
    }),

    updateAdminExercise: builder.mutation<
      AdminExerciseItem,
      { id: string; body: Partial<AdminExercisePayload> }
    >({
      query: ({ id, body }) => ({
        url: `/admin/exercises/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["AdminExercises", "AdminOverview"],
      transformResponse: (response: ApiResponse<AdminExerciseItem>) =>
        response.data as AdminExerciseItem,
    }),

    deleteAdminExercise: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/exercises/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AdminExercises", "AdminOverview"],
    }),

    getAdminVocabulary: builder.query<AdminVocabularyItem[], void>({
      query: () => ({
        url: "/admin/vocabulary",
        method: "GET",
      }),
      providesTags: ["AdminVocabulary"],
      transformResponse: (response: ApiResponse<AdminVocabularyResponse>) =>
        response.data?.items ?? [],
    }),

    createAdminVocabulary: builder.mutation<
      AdminVocabularyItem,
      AdminVocabularyPayload
    >({
      query: (body) => ({
        url: "/admin/vocabulary",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AdminVocabulary", "AdminOverview"],
      transformResponse: (response: ApiResponse<AdminVocabularyItem>) =>
        response.data as AdminVocabularyItem,
    }),

    updateAdminVocabulary: builder.mutation<
      AdminVocabularyItem,
      { id: string; body: Partial<AdminVocabularyPayload> }
    >({
      query: ({ id, body }) => ({
        url: `/admin/vocabulary/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["AdminVocabulary", "AdminOverview"],
      transformResponse: (response: ApiResponse<AdminVocabularyItem>) =>
        response.data as AdminVocabularyItem,
    }),

    deleteAdminVocabulary: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/vocabulary/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AdminVocabulary", "AdminOverview"],
    }),

    getAdminAiLevels: builder.query<AdminAiLevelItem[], void>({
      query: () => ({
        url: "/admin/ai-levels",
        method: "GET",
      }),
      providesTags: ["AdminAiLevels"],
      transformResponse: (response: ApiResponse<AdminAiLevelsResponse>) =>
        response.data?.items ?? [],
    }),

    createAdminAiLevel: builder.mutation<AdminAiLevelItem, AdminAiLevelPayload>({
      query: (body) => ({
        url: "/admin/ai-levels",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AdminAiLevels", "AdminReports", "AdminOverview"],
      transformResponse: (response: ApiResponse<AdminAiLevelItem>) =>
        response.data as AdminAiLevelItem,
    }),

    updateAdminAiLevel: builder.mutation<
      AdminAiLevelItem,
      { id: string; body: Partial<AdminAiLevelPayload> }
    >({
      query: ({ id, body }) => ({
        url: `/admin/ai-levels/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["AdminAiLevels", "AdminReports", "AdminOverview"],
      transformResponse: (response: ApiResponse<AdminAiLevelItem>) =>
        response.data as AdminAiLevelItem,
    }),

    deleteAdminAiLevel: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/ai-levels/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AdminAiLevels", "AdminReports", "AdminOverview"],
    }),
  }),
});

export const {
  useCreateAdminAiLevelMutation,
  useCreateAdminExerciseMutation,
  useCreateAdminVocabularyMutation,
  useDeleteAdminAiLevelMutation,
  useDeleteAdminExerciseMutation,
  useDeleteAdminVocabularyMutation,
  useGetAdminAiLevelsQuery,
  useGetAdminExercisesQuery,
  useGetAdminOverviewQuery,
  useGetAdminReportsQuery,
  useGetAdminUsersQuery,
  useGetAdminVocabularyQuery,
  useUpdateAdminAiLevelMutation,
  useUpdateAdminExerciseMutation,
  useUpdateAdminVocabularyMutation,
} = adminApi;
