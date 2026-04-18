import { baseApi } from "@/store/api/baseApi";
import { setUser } from "@/store/slices/authSlice";
import type {
  AdminPlacementTestItem,
  AdminGeneratePlacementWithAiPayload,
  AdminPlacementTestPayload,
  AdminPlacementTestsResponse,
  ApiResponse,
  PlacementActiveTestItem,
  PlacementConfirmPayload,
  PlacementFinalizeResponse,
  PlacementResultItem,
  PlacementSkipPayload,
  PlacementSubmitPayload,
  User,
} from "@/types";

const syncUserState = async (
  dispatch: (action: unknown) => unknown,
  getState: () => { auth: { user: User | null } },
  queryFulfilled: Promise<{ data: PlacementFinalizeResponse }>,
) => {
  try {
    const { data } = await queryFulfilled;
    const prev = getState().auth.user;
    const next = data.user;
    dispatch(
      setUser({
        ...(prev ?? {}),
        ...next,
        name: next.fullName || next.name || prev?.name,
      }),
    );
    dispatch(baseApi.util.invalidateTags(["Profile"]));
  } catch {
    /* ignore */
  }
};

export const placementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminPlacementTests: builder.query<AdminPlacementTestItem[], void>({
      query: () => ({
        url: "/admin/placement-tests",
        method: "GET",
      }),
      providesTags: (result) => {
        const baseTags = [{ type: "AdminPlacementTests" as const, id: "LIST" }];

        if (!result?.length) {
          return baseTags;
        }

        return [
          ...baseTags,
          ...result.map((item) => ({
            type: "AdminPlacementTests" as const,
            id: item.id,
          })),
        ];
      },
      transformResponse: (response: ApiResponse<AdminPlacementTestsResponse>) =>
        response.data?.items ?? [],
    }),

    getAdminPlacementTestById: builder.query<AdminPlacementTestItem, string>({
      query: (id) => ({
        url: `/admin/placement-tests/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [
        { type: "AdminPlacementTests", id },
      ],
      transformResponse: (response: ApiResponse<AdminPlacementTestItem>) =>
        response.data as AdminPlacementTestItem,
    }),

    createAdminPlacementTest: builder.mutation<
      AdminPlacementTestItem,
      AdminPlacementTestPayload
    >({
      query: (body) => ({
        url: "/admin/placement-tests",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AdminPlacementTests", "AdminOverview", "PlacementActiveTest"],
      transformResponse: (response: ApiResponse<AdminPlacementTestItem>) =>
        response.data as AdminPlacementTestItem,
    }),

    generateAdminPlacementTestWithAi: builder.mutation<
      AdminPlacementTestItem,
      AdminGeneratePlacementWithAiPayload
    >({
      query: (body) => ({
        url: "/admin/placement-tests/generate-ai",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<AdminPlacementTestItem>) =>
        response.data as AdminPlacementTestItem,
    }),

    updateAdminPlacementTest: builder.mutation<
      AdminPlacementTestItem,
      { id: string; body: AdminPlacementTestPayload }
    >({
      query: ({ id, body }) => ({
        url: `/admin/placement-tests/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "AdminPlacementTests", id: "LIST" },
        { type: "AdminPlacementTests", id },
        "AdminOverview",
        "PlacementActiveTest",
      ],
      transformResponse: (response: ApiResponse<AdminPlacementTestItem>) =>
        response.data as AdminPlacementTestItem,
    }),

    activateAdminPlacementTest: builder.mutation<AdminPlacementTestItem, string>({
      query: (id) => ({
        url: `/admin/placement-tests/${id}/activate`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "AdminPlacementTests", id: "LIST" },
        { type: "AdminPlacementTests", id },
        "AdminOverview",
        "PlacementActiveTest",
      ],
      transformResponse: (response: ApiResponse<AdminPlacementTestItem>) =>
        response.data as AdminPlacementTestItem,
    }),

    deleteAdminPlacementTest: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/placement-tests/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AdminPlacementTests", "AdminOverview", "PlacementActiveTest"],
    }),

    getActivePlacementTest: builder.query<PlacementActiveTestItem | null, void>({
      query: () => ({
        url: "/placement-tests/active",
        method: "GET",
      }),
      providesTags: ["PlacementActiveTest"],
      transformResponse: (response: ApiResponse<PlacementActiveTestItem | null>) =>
        (response.data as PlacementActiveTestItem | null) ?? null,
    }),

    submitPlacementTest: builder.mutation<PlacementResultItem, PlacementSubmitPayload>({
      query: (body) => ({
        url: "/placement-tests/submit",
        method: "POST",
        body,
      }),
      invalidatesTags: ["PlacementAttempt"],
      transformResponse: (response: ApiResponse<PlacementResultItem>) =>
        response.data as PlacementResultItem,
    }),

    getPlacementAttemptById: builder.query<PlacementResultItem, string>({
      query: (attemptId) => ({
        url: `/placement-tests/attempts/${attemptId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, attemptId) => [
        { type: "PlacementAttempt", id: attemptId },
      ],
      transformResponse: (response: ApiResponse<PlacementResultItem>) =>
        response.data as PlacementResultItem,
    }),

    confirmPlacementResult: builder.mutation<
      PlacementFinalizeResponse,
      PlacementConfirmPayload
    >({
      query: (body) => ({
        url: "/placement-tests/confirm",
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { attemptId }) => [
        { type: "PlacementAttempt", id: attemptId },
        "Profile",
      ],
      transformResponse: (response: ApiResponse<PlacementFinalizeResponse>) =>
        response.data as PlacementFinalizeResponse,
      async onQueryStarted(_arg, { dispatch, queryFulfilled, getState }) {
        await syncUserState(dispatch, getState, queryFulfilled);
      },
    }),

    skipPlacementTest: builder.mutation<
      PlacementFinalizeResponse,
      PlacementSkipPayload
    >({
      query: (body) => ({
        url: "/placement-tests/skip",
        method: "POST",
        body,
      }),
      invalidatesTags: ["PlacementAttempt", "Profile"],
      transformResponse: (response: ApiResponse<PlacementFinalizeResponse>) =>
        response.data as PlacementFinalizeResponse,
      async onQueryStarted(_arg, { dispatch, queryFulfilled, getState }) {
        await syncUserState(dispatch, getState, queryFulfilled);
      },
    }),
  }),
});

export const {
  useActivateAdminPlacementTestMutation,
  useConfirmPlacementResultMutation,
  useCreateAdminPlacementTestMutation,
  useDeleteAdminPlacementTestMutation,
  useGenerateAdminPlacementTestWithAiMutation,
  useGetActivePlacementTestQuery,
  useGetAdminPlacementTestByIdQuery,
  useGetAdminPlacementTestsQuery,
  useGetPlacementAttemptByIdQuery,
  useSkipPlacementTestMutation,
  useSubmitPlacementTestMutation,
  useUpdateAdminPlacementTestMutation,
} = placementApi;
