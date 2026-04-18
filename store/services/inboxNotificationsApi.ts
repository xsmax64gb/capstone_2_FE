import { baseApi } from "@/store/api/baseApi";
import type { ApiResponse } from "@/types";

export type InboxCategory = "admin_broadcast" | "admin_direct" | "milestone";

export interface InboxNotificationItem {
  id: string;
  title: string;
  body: string;
  category: InboxCategory;
  read: boolean;
  readAt: string | null;
  createdAt: string | null;
  meta: Record<string, unknown>;
}

export interface InboxNotificationsPage {
  items: InboxNotificationItem[];
  unreadCount: number;
  total: number;
  limit: number;
  offset: number;
}

export interface AdminSendInboxPayload {
  scope: "all" | "user";
  userId?: string;
  title: string;
  body?: string;
}

export const inboxNotificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInboxNotifications: builder.query<
      InboxNotificationsPage,
      { limit?: number; offset?: number } | void
    >({
      query: (params) => ({
        url: "/me/notifications",
        params: params ?? undefined,
      }),
      providesTags: ["InboxNotifications"],
      transformResponse: (response: ApiResponse<InboxNotificationsPage>) =>
        response.data as InboxNotificationsPage,
    }),

    getInboxUnreadCount: builder.query<{ unreadCount: number }, void>({
      query: () => "/me/notifications/unread-count",
      providesTags: ["InboxNotifications"],
      transformResponse: (response: ApiResponse<{ unreadCount: number }>) =>
        response.data as { unreadCount: number },
    }),

    markInboxNotificationRead: builder.mutation<InboxNotificationItem, string>({
      query: (id) => ({
        url: `/me/notifications/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["InboxNotifications"],
      transformResponse: (response: ApiResponse<InboxNotificationItem>) =>
        response.data as InboxNotificationItem,
    }),

    markAllInboxNotificationsRead: builder.mutation<{ modified: number }, void>({
      query: () => ({
        url: "/me/notifications/read-all",
        method: "PATCH",
      }),
      invalidatesTags: ["InboxNotifications"],
      transformResponse: (response: ApiResponse<{ modified: number }>) =>
        response.data as { modified: number },
    }),

    adminSendInboxNotification: builder.mutation<
      { notificationId?: string | null; recipients?: number },
      AdminSendInboxPayload
    >({
      query: (body) => ({
        url: "/admin/notifications",
        method: "POST",
        body,
      }),
      transformResponse: (
        response: ApiResponse<{
          notificationId?: string | null;
          recipients?: number;
        }>,
      ) => response.data as { notificationId?: string | null; recipients?: number },
    }),
  }),
});

export const {
  useGetInboxNotificationsQuery,
  useGetInboxUnreadCountQuery,
  useMarkInboxNotificationReadMutation,
  useMarkAllInboxNotificationsReadMutation,
  useAdminSendInboxNotificationMutation,
} = inboxNotificationsApi;
