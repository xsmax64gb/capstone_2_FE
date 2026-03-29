import { baseApi } from "./baseApi";
import type { ApiResponse } from "@/types";

export type MapProgressStatus = "locked" | "active" | "completed";

export interface LearnMapProgress {
  status: MapProgressStatus;
  currentStepId: string | null;
  totalXPEarned: number;
  stepsCompleted: number;
  bossDefeated: boolean;
  bossAttempts: number;
  stars: number;
  unlockedAt?: string | null;
  completedAt?: string | null;
}

export interface LearnMapItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImageUrl: string;
  theme: string;
  order: number;
  prerequisiteMapId: string | null;
  unlocksMapId: string | null;
  totalXP: number;
  bossXPReward: number;
  isPublished: boolean;
  progress?: LearnMapProgress | null;
}

export interface LearnBossTask {
  id: string;
  description: string;
  completed?: boolean;
}

export interface LearnStep {
  id: string;
  mapId: string;
  order: number;
  title: string;
  type: "lesson" | "boss";
  scenarioTitle?: string;
  scenarioContext?: string;
  aiPersona?: string;
  aiSystemPrompt?: string;
  openingMessage?: string;
  xpReward?: number;
  minTurns?: number;
  passCriteria?: string[];
  vocabularyFocus?: string[];
  bossTasks?: LearnBossTask[];
  bossHPMax?: number;
  playerHPMax?: number;
  bossName?: string;
}

export interface LearnMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp?: string;
  grammarErrors?: { message: string; rule: string; span: string }[];
  suggestion?: string;
  evaluationScore?: number | null;
}

export interface LearnBossBattleState {
  id?: string;
  bossName?: string;
  bossHPMax: number;
  bossHPCurrent: number;
  playerHPMax: number;
  playerHPCurrent: number;
  tasks: LearnBossTask[];
  tasksCompleted: number;
  tasksRequired: number;
  result?: string;
}

export interface StartConversationResponse {
  conversation: {
    id: string;
    stepId: string;
    mapId: string;
    attempt: number;
    status: string;
    startedAt: string;
  };
  messages: LearnMessage[];
  bossBattle: LearnBossBattleState | null;
}

export const learnApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLearnMaps: builder.query<{ items: LearnMapItem[] }, void>({
      query: () => ({ url: "/learn/maps", method: "GET" }),
      providesTags: ["LearnMaps"],
      transformResponse: (response: ApiResponse<{ items: LearnMapItem[] }>) =>
        response.data as { items: LearnMapItem[] },
    }),

    getLearnMapBySlug: builder.query<
      { map: LearnMapItem; progress: LearnMapProgress | null; steps: LearnStep[] },
      string
    >({
      query: (slug) => ({ url: `/learn/maps/${slug}`, method: "GET" }),
      providesTags: (_r, _e, slug) => [{ type: "LearnMaps", id: slug }],
      transformResponse: (
        response: ApiResponse<{
          map: LearnMapItem;
          progress: LearnMapProgress | null;
          steps: LearnStep[];
        }>,
      ) => response.data as {
        map: LearnMapItem;
        progress: LearnMapProgress | null;
        steps: LearnStep[];
      },
    }),

    getLearnConversation: builder.query<
      {
        conversation: Record<string, unknown>;
        messages: LearnMessage[];
        bossBattle: LearnBossBattleState | null;
      },
      string
    >({
      query: (id) => ({ url: `/learn/conversations/${id}`, method: "GET" }),
      transformResponse: (response: ApiResponse<Record<string, unknown>>) =>
        response.data as {
          conversation: Record<string, unknown>;
          messages: LearnMessage[];
          bossBattle: LearnBossBattleState | null;
        },
    }),

    startLearnConversation: builder.mutation<StartConversationResponse, string>({
      query: (stepId) => ({
        url: `/learn/steps/${stepId}/conversations`,
        method: "POST",
      }),
      invalidatesTags: ["LearnMaps"],
      transformResponse: (response: ApiResponse<StartConversationResponse>) =>
        response.data as StartConversationResponse,
    }),

    sendLearnMessage: builder.mutation<
      {
        userMessage: LearnMessage;
        bossBattle: LearnBossBattleState | null;
        messages: LearnMessage[];
      },
      { conversationId: string; content: string }
    >({
      query: ({ conversationId, content }) => ({
        url: `/learn/conversations/${conversationId}/messages`,
        method: "POST",
        body: { content },
      }),
      transformResponse: (
        response: ApiResponse<{
          userMessage: LearnMessage;
          bossBattle: LearnBossBattleState | null;
          messages: LearnMessage[];
        }>,
      ) =>
        response.data as {
          userMessage: LearnMessage;
          bossBattle: LearnBossBattleState | null;
          messages: LearnMessage[];
        },
    }),

    endLearnConversation: builder.mutation<
      {
        conversation: {
          id: string;
          status: string;
          score: number | null;
          aiFeedback: string;
          xpEarned: number;
          goalsAchieved: string[];
          durationSec: number | null;
        };
        passed: boolean;
        bossWin?: boolean;
      },
      string
    >({
      query: (id) => ({
        url: `/learn/conversations/${id}/end`,
        method: "POST",
      }),
      invalidatesTags: ["LearnMaps"],
      transformResponse: (response: ApiResponse<Record<string, unknown>>) =>
        response.data as {
          conversation: {
            id: string;
            status: string;
            score: number | null;
            aiFeedback: string;
            xpEarned: number;
            goalsAchieved: string[];
            durationSec: number | null;
          };
          passed: boolean;
          bossWin?: boolean;
        },
    }),

    getAdminLearnMaps: builder.query<{ items: LearnMapItem[] }, void>({
      query: () => ({ url: "/admin/learn/maps", method: "GET" }),
      providesTags: ["AdminLearnMaps"],
      transformResponse: (response: ApiResponse<{ items: LearnMapItem[] }>) =>
        response.data as { items: LearnMapItem[] },
    }),

    createAdminLearnMap: builder.mutation<{ map: LearnMapItem }, Partial<LearnMapItem>>({
      query: (body) => ({
        url: "/admin/learn/maps",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AdminLearnMaps"],
      transformResponse: (response: ApiResponse<{ map: LearnMapItem }>) =>
        response.data as { map: LearnMapItem },
    }),

    updateAdminLearnMap: builder.mutation<
      { map: LearnMapItem },
      { id: string; body: Partial<LearnMapItem> }
    >({
      query: ({ id, body }) => ({
        url: `/admin/learn/maps/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["AdminLearnMaps"],
      transformResponse: (response: ApiResponse<{ map: LearnMapItem }>) =>
        response.data as { map: LearnMapItem },
    }),

    deleteAdminLearnMap: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/learn/maps/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AdminLearnMaps"],
    }),

    getAdminLearnSteps: builder.query<{ items: LearnStep[] }, string>({
      query: (mapId) => ({ url: `/admin/learn/maps/${mapId}/steps`, method: "GET" }),
      providesTags: (_r, _e, mapId) => [{ type: "AdminLearnSteps", id: mapId }],
      transformResponse: (response: ApiResponse<{ items: LearnStep[] }>) =>
        response.data as { items: LearnStep[] },
    }),

    createAdminLearnStep: builder.mutation<
      { step: LearnStep },
      { mapId: string; body: Partial<LearnStep> }
    >({
      query: ({ mapId, body }) => ({
        url: `/admin/learn/maps/${mapId}/steps`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, arg) => [
        "AdminLearnMaps",
        { type: "AdminLearnSteps", id: arg.mapId },
        "LearnMaps",
      ],
      transformResponse: (response: ApiResponse<{ step: LearnStep }>) =>
        response.data as { step: LearnStep },
    }),

    updateAdminLearnStep: builder.mutation<
      { step: LearnStep },
      { id: string; body: Partial<LearnStep>; mapId: string }
    >({
      query: ({ id, body }) => ({
        url: `/admin/learn/steps/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, arg) => [
        "AdminLearnMaps",
        { type: "AdminLearnSteps", id: arg.mapId },
        "LearnMaps",
      ],
      transformResponse: (response: ApiResponse<{ step: LearnStep }>) =>
        response.data as { step: LearnStep },
    }),

    deleteAdminLearnStep: builder.mutation<void, { id: string; mapId: string }>({
      query: ({ id }) => ({
        url: `/admin/learn/steps/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, arg) => [
        "AdminLearnMaps",
        { type: "AdminLearnSteps", id: arg.mapId },
        "LearnMaps",
      ],
    }),

    getAdminLearnAchievements: builder.query<
      {
        items: Array<{
          id: string;
          key: string;
          title: string;
          description: string;
          iconUrl: string;
          trigger: string;
          xpReward: number;
        }>;
      },
      void
    >({
      query: () => ({ url: "/admin/learn/achievements", method: "GET" }),
      providesTags: ["AdminLearnAchievements"],
      transformResponse: (response: ApiResponse<{ items: unknown[] }>) =>
        response.data as {
          items: Array<{
            id: string;
            key: string;
            title: string;
            description: string;
            iconUrl: string;
            trigger: string;
            xpReward: number;
          }>;
        },
    }),

    createAdminLearnAchievement: builder.mutation<
      void,
      { key: string; title: string; description?: string; xpReward?: number }
    >({
      query: (body) => ({
        url: "/admin/learn/achievements",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AdminLearnAchievements"],
    }),

    deleteAdminLearnAchievement: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/learn/achievements/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AdminLearnAchievements"],
    }),
  }),
});

export const {
  useGetLearnMapsQuery,
  useGetLearnMapBySlugQuery,
  useGetLearnConversationQuery,
  useStartLearnConversationMutation,
  useSendLearnMessageMutation,
  useEndLearnConversationMutation,
  useGetAdminLearnMapsQuery,
  useCreateAdminLearnMapMutation,
  useUpdateAdminLearnMapMutation,
  useDeleteAdminLearnMapMutation,
  useGetAdminLearnStepsQuery,
  useCreateAdminLearnStepMutation,
  useUpdateAdminLearnStepMutation,
  useDeleteAdminLearnStepMutation,
  useGetAdminLearnAchievementsQuery,
  useCreateAdminLearnAchievementMutation,
  useDeleteAdminLearnAchievementMutation,
} = learnApi;
