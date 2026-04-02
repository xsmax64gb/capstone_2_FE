import { baseApi } from "@/store/api/baseApi";
import type {
  AdminAiLevelItem,
  AdminAiLevelPayload,
  AdminAiLevelsResponse,
  AdminCreateUserPayload,
  AdminExerciseItem,
  AdminExercisePayload,
  AdminExercisesResponse,
  AdminOverviewResponse,
  AdminReportsResponse,
  AdminUpdateUserPayload,
  AdminUsersQueryParams,
  AdminVocabularySetItem,
  AdminVocabularyWordItem,
  AdminVocabularyPayload,
  AdminVocabularyWordsBulkPayload,
  AdminVocabularyWordsBulkResponse,
  AdminVocabularyWordPayload,
  AdminVocabularyResponse,
  AdminUsersResponse,
  ApiResponse,
  User,
} from "@/types";

const appendFormDataValue = (
  formData: FormData,
  key: string,
  value: string | number | boolean | File | null | undefined,
) => {
  if (value === undefined || value === null) {
    return;
  }

  if (value instanceof File) {
    formData.append(key, value);
    return;
  }

  formData.append(key, String(value));
};

const toExerciseFormData = (payload: AdminExercisePayload) => {
  const formData = new FormData();

  appendFormDataValue(formData, "title", payload.title);
  appendFormDataValue(formData, "description", payload.description);
  appendFormDataValue(formData, "type", payload.type);
  appendFormDataValue(formData, "level", payload.level);
  appendFormDataValue(formData, "topic", payload.topic);
  appendFormDataValue(formData, "coverImage", payload.coverImage);
  appendFormDataValue(formData, "durationMinutes", payload.durationMinutes);
  appendFormDataValue(formData, "rewardsXp", payload.rewardsXp);
  appendFormDataValue(formData, "skills", JSON.stringify(payload.skills ?? []));
  appendFormDataValue(
    formData,
    "questions",
    JSON.stringify(payload.questions ?? []),
  );
  appendFormDataValue(formData, "coverImageFile", payload.coverImageFile);

  return formData;
};

const toVocabularySetFormData = (payload: Partial<AdminVocabularyPayload>) => {
  const formData = new FormData();

  appendFormDataValue(formData, "name", payload.name);
  appendFormDataValue(formData, "description", payload.description);
  appendFormDataValue(formData, "level", payload.level);
  appendFormDataValue(formData, "topic", payload.topic);
  appendFormDataValue(formData, "coverImageFile", payload.coverImageFile);
  appendFormDataValue(formData, "isActive", payload.isActive);
  appendFormDataValue(formData, "sortOrder", payload.sortOrder);

  return formData;
};

const toVocabularyWordBody = (
  payload: Partial<AdminVocabularyWordPayload>,
) => ({
  word: payload.word,
  meaning: payload.meaning,
  example: payload.example,
});

const toQueryString = (
  params?: Record<string, string | number | undefined>,
) => {
  const searchParams = new URLSearchParams();

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === "") {
      return;
    }
    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

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

    getAdminUsers: builder.query<
      AdminUsersResponse,
      AdminUsersQueryParams | void
    >({
      query: (params) => ({
        url: `/admin/users${toQueryString({
          page: params?.page,
          limit: params?.limit,
          query: params?.query,
          role: params?.role,
          level: params?.level,
          onboardingDone: params?.onboardingDone,
          isActive: params?.isActive,
          sortBy: params?.sortBy,
          sortOrder: params?.sortOrder,
        })}`,
        method: "GET",
      }),
      providesTags: ["AdminUsers"],
      transformResponse: (response: ApiResponse<AdminUsersResponse>) =>
        response.data as AdminUsersResponse,
    }),

    getAdminUserById: builder.query<User, string>({
      query: (id) => ({
        url: `/admin/users/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "AdminUsers", id }],
      transformResponse: (response: ApiResponse<User>) => response.data as User,
    }),

    createAdminUser: builder.mutation<User, AdminCreateUserPayload>({
      query: (body) => ({
        url: "/admin/users",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AdminUsers", "AdminOverview"],
      transformResponse: (response: ApiResponse<User>) => response.data as User,
    }),

    updateAdminUser: builder.mutation<
      User,
      { id: string; body: AdminUpdateUserPayload }
    >({
      query: ({ id, body }) => ({
        url: `/admin/users/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["AdminUsers", "AdminOverview"],
      transformResponse: (response: ApiResponse<User>) => response.data as User,
    }),

    updateAdminUserRole: builder.mutation<
      User,
      { id: string; role: "user" | "admin" }
    >({
      query: ({ id, role }) => ({
        url: `/admin/users/${id}/role`,
        method: "PATCH",
        body: { role },
      }),
      invalidatesTags: ["AdminUsers", "AdminOverview"],
      transformResponse: (response: ApiResponse<User>) => response.data as User,
    }),

    updateAdminUserStatus: builder.mutation<
      User,
      { id: string; isActive: boolean }
    >({
      query: ({ id, isActive }) => ({
        url: `/admin/users/${id}/status`,
        method: "PATCH",
        body: { isActive },
      }),
      invalidatesTags: ["AdminUsers", "AdminOverview"],
      transformResponse: (response: ApiResponse<User>) => response.data as User,
    }),

    resetAdminUserPassword: builder.mutation<
      { id: string },
      { id: string; newPassword: string }
    >({
      query: ({ id, newPassword }) => ({
        url: `/admin/users/${id}/password`,
        method: "PATCH",
        body: { newPassword },
      }),
      invalidatesTags: ["AdminUsers"],
      transformResponse: (response: ApiResponse<{ id: string }>) =>
        response.data as { id: string },
    }),

    deleteAdminUser: builder.mutation<{ id: string }, string>({
      query: (id) => ({
        url: `/admin/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AdminUsers", "AdminOverview"],
      transformResponse: (response: ApiResponse<{ id: string }>) =>
        response.data as { id: string },
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

    createAdminExercise: builder.mutation<
      AdminExerciseItem,
      AdminExercisePayload
    >({
      query: (body) => ({
        url: "/admin/exercises",
        method: "POST",
        body: toExerciseFormData(body),
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
        body: toExerciseFormData({
          title: body.title ?? "",
          description: body.description ?? "",
          type: body.type ?? "",
          level: body.level ?? "",
          topic: body.topic ?? "",
          coverImage: body.coverImage ?? "",
          coverImageFile: body.coverImageFile ?? null,
          durationMinutes: body.durationMinutes ?? 0,
          rewardsXp: body.rewardsXp ?? 0,
          skills: body.skills ?? [],
          questions: body.questions ?? [],
        }),
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

    getAdminVocabulary: builder.query<AdminVocabularySetItem[], void>({
      query: () => ({
        url: "/admin/vocabulary",
        method: "GET",
      }),
      providesTags: ["AdminVocabulary"],
      transformResponse: (response: ApiResponse<AdminVocabularyResponse>) =>
        response.data?.items ?? [],
    }),

    getAdminVocabularyById: builder.query<AdminVocabularySetItem, string>({
      query: (id) => ({
        url: `/admin/vocabulary/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "AdminVocabulary", id }],
      transformResponse: (response: ApiResponse<AdminVocabularySetItem>) =>
        response.data as AdminVocabularySetItem,
    }),

    createAdminVocabulary: builder.mutation<
      AdminVocabularySetItem,
      AdminVocabularyPayload
    >({
      query: (body) => ({
        url: "/admin/vocabulary",
        method: "POST",
        body: toVocabularySetFormData(body),
      }),
      invalidatesTags: ["AdminVocabulary", "AdminOverview"],
      transformResponse: (response: ApiResponse<AdminVocabularySetItem>) =>
        response.data as AdminVocabularySetItem,
    }),

    updateAdminVocabulary: builder.mutation<
      AdminVocabularySetItem,
      { id: string; body: Partial<AdminVocabularyPayload> }
    >({
      query: ({ id, body }) => ({
        url: `/admin/vocabulary/${id}`,
        method: "PUT",
        body: toVocabularySetFormData(body),
      }),
      invalidatesTags: ["AdminVocabulary", "AdminOverview"],
      transformResponse: (response: ApiResponse<AdminVocabularySetItem>) =>
        response.data as AdminVocabularySetItem,
    }),

    deleteAdminVocabulary: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/vocabulary/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AdminVocabulary", "AdminOverview"],
    }),

    createAdminVocabularyWord: builder.mutation<
      AdminVocabularyWordItem,
      { setId: string; body: AdminVocabularyWordPayload }
    >({
      query: ({ setId, body }) => ({
        url: `/admin/vocabulary/${setId}/words`,
        method: "POST",
        body: toVocabularyWordBody(body),
      }),
      invalidatesTags: ["AdminVocabulary", "AdminOverview"],
      transformResponse: (response: ApiResponse<AdminVocabularyWordItem>) =>
        response.data as AdminVocabularyWordItem,
    }),

    createAdminVocabularyWordsBulk: builder.mutation<
      AdminVocabularyWordsBulkResponse,
      { setId: string; body: AdminVocabularyWordsBulkPayload }
    >({
      query: ({ setId, body }) => ({
        url: `/admin/vocabulary/${setId}/words/bulk`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["AdminVocabulary", "AdminOverview"],
      transformResponse: (
        response: ApiResponse<AdminVocabularyWordsBulkResponse>,
      ) => response.data as AdminVocabularyWordsBulkResponse,
    }),

    updateAdminVocabularyWord: builder.mutation<
      AdminVocabularyWordItem,
      {
        setId: string;
        wordId: string;
        body: Partial<AdminVocabularyWordPayload>;
      }
    >({
      query: ({ setId, wordId, body }) => ({
        url: `/admin/vocabulary/${setId}/words/${wordId}`,
        method: "PUT",
        body: toVocabularyWordBody(body),
      }),
      invalidatesTags: ["AdminVocabulary", "AdminOverview"],
      transformResponse: (response: ApiResponse<AdminVocabularyWordItem>) =>
        response.data as AdminVocabularyWordItem,
    }),

    deleteAdminVocabularyWord: builder.mutation<
      void,
      { setId: string; wordId: string }
    >({
      query: ({ setId, wordId }) => ({
        url: `/admin/vocabulary/${setId}/words/${wordId}`,
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

    createAdminAiLevel: builder.mutation<AdminAiLevelItem, AdminAiLevelPayload>(
      {
        query: (body) => ({
          url: "/admin/ai-levels",
          method: "POST",
          body,
        }),
        invalidatesTags: ["AdminAiLevels", "AdminReports", "AdminOverview"],
        transformResponse: (response: ApiResponse<AdminAiLevelItem>) =>
          response.data as AdminAiLevelItem,
      },
    ),

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
  useCreateAdminUserMutation,
  useCreateAdminVocabularyMutation,
  useCreateAdminVocabularyWordMutation,
  useCreateAdminVocabularyWordsBulkMutation,
  useDeleteAdminAiLevelMutation,
  useDeleteAdminExerciseMutation,
  useDeleteAdminUserMutation,
  useDeleteAdminVocabularyMutation,
  useDeleteAdminVocabularyWordMutation,
  useGetAdminAiLevelsQuery,
  useGetAdminExercisesQuery,
  useGetAdminOverviewQuery,
  useGetAdminReportsQuery,
  useGetAdminUserByIdQuery,
  useGetAdminUsersQuery,
  useGetAdminVocabularyByIdQuery,
  useGetAdminVocabularyQuery,
  useResetAdminUserPasswordMutation,
  useUpdateAdminAiLevelMutation,
  useUpdateAdminExerciseMutation,
  useUpdateAdminUserMutation,
  useUpdateAdminUserRoleMutation,
  useUpdateAdminUserStatusMutation,
  useUpdateAdminVocabularyMutation,
  useUpdateAdminVocabularyWordMutation,
} = adminApi;
