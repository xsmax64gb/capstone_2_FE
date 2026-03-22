import { baseApi } from "./baseApi";
import type {
  AdminContentResponse,
  AdminOverviewResponse,
  AdminReportsResponse,
  AdminSettingsResponse,
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
      transformResponse: (response: ApiResponse<AdminOverviewResponse>) =>
        response.data as AdminOverviewResponse,
    }),

    getAdminUsers: builder.query<AdminUsersResponse, void>({
      query: () => ({
        url: "/admin/users",
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<AdminUsersResponse>) =>
        response.data as AdminUsersResponse,
    }),

    getAdminContent: builder.query<AdminContentResponse, void>({
      query: () => ({
        url: "/admin/content",
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<AdminContentResponse>) =>
        response.data as AdminContentResponse,
    }),

    getAdminReports: builder.query<AdminReportsResponse, void>({
      query: () => ({
        url: "/admin/reports",
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<AdminReportsResponse>) =>
        response.data as AdminReportsResponse,
    }),

    getAdminSettings: builder.query<AdminSettingsResponse, void>({
      query: () => ({
        url: "/admin/settings",
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<AdminSettingsResponse>) =>
        response.data as AdminSettingsResponse,
    }),
  }),
});

export const {
  useGetAdminContentQuery,
  useGetAdminOverviewQuery,
  useGetAdminReportsQuery,
  useGetAdminSettingsQuery,
  useGetAdminUsersQuery,
} = adminApi;
