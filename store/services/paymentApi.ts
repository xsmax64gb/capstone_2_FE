import { baseApi } from "@/store/api/baseApi";
import type {
  AdminRevenueChartResponse,
  PaymentCancelResponse,
  AdminRevenueOverviewResponse,
  AdminRevenueStatisticsResponse,
  ApiResponse,
  FeatureQuotaOverviewResponse,
  PaymentCreateRequest,
  PaymentPackage,
  PaymentPackageCatalogResponse,
  PaymentPackageUpsertRequest,
  PaymentReconcileResponse,
  PaymentRecord,
  PaymentSyncSummary,
  PaymentVerifyRequest,
  PaymentVerifyResponse,
} from "@/types";

type RevenueQueryParams = {
  from?: string;
  to?: string;
  range?: string;
  rangeDays?: number;
};

const toQueryParams = (
  params?: Record<string, string | number | undefined>,
) => {
  const sanitized: Record<string, string | number> = {};

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    sanitized[key] = value;
  });

  return sanitized;
};

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPaymentPackages: builder.query<
      PaymentPackageCatalogResponse,
      { includeInactive?: boolean } | void
    >({
      query: (params) => ({
        url: "/payment-packages",
        method: "GET",
        params: toQueryParams({
          include_inactive: params?.includeInactive ? "true" : undefined,
        }),
      }),
      providesTags: ["PaymentPackages"],
      transformResponse: (
        response: ApiResponse<PaymentPackageCatalogResponse>,
      ) =>
        response.data ?? {
          packages: [],
          featureCatalog: [],
          scopeConfig: {
            accessLevelOptions: ["basic", "standard", "advanced", "full"],
            quotaPeriodOptions: [
              "day",
              "week",
              "month",
              "billing_cycle",
              "lifetime",
            ],
          },
          activeLimit: 3,
        },
    }),

    createPaymentPackage: builder.mutation<
      PaymentPackage,
      PaymentPackageUpsertRequest
    >({
      query: (body) => ({
        url: "/payment-packages",
        method: "POST",
        body,
      }),
      invalidatesTags: ["PaymentPackages"],
      transformResponse: (response: ApiResponse<PaymentPackage>) =>
        response.data as PaymentPackage,
    }),

    updatePaymentPackage: builder.mutation<
      PaymentPackage,
      { packageId: string; data: PaymentPackageUpsertRequest }
    >({
      query: ({ packageId, data }) => ({
        url: `/payment-packages/${packageId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["PaymentPackages"],
      transformResponse: (response: ApiResponse<PaymentPackage>) =>
        response.data as PaymentPackage,
    }),

    getPayments: builder.query<PaymentRecord[], { limit?: number } | void>({
      query: (params) => ({
        url: "/payments",
        method: "GET",
        params: toQueryParams({
          limit: params?.limit,
        }),
      }),
      providesTags: ["Payments"],
      transformResponse: (response: ApiResponse<PaymentRecord[]>) =>
        response.data ?? [],
    }),

    getMyFeatureQuotas: builder.query<FeatureQuotaOverviewResponse, void>({
      query: () => ({
        url: "/feature-quotas",
        method: "GET",
      }),
      providesTags: ["FeatureQuotas"],
      transformResponse: (
        response: ApiResponse<FeatureQuotaOverviewResponse>,
      ) => response.data as FeatureQuotaOverviewResponse,
    }),

    createPayment: builder.mutation<PaymentRecord, PaymentCreateRequest>({
      query: (body) => ({
        url: "/payments",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Payments", "AdminRevenue"],
      transformResponse: (response: ApiResponse<PaymentRecord>) =>
        response.data as PaymentRecord,
    }),

    reconcilePayment: builder.mutation<
      PaymentReconcileResponse,
      { invoiceNumber: string }
    >({
      query: (body) => ({
        url: "/payments/reconcile",
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        "AdminRevenue",
        "FeatureQuotas",
        { type: "Payments", id: arg.invoiceNumber },
      ],
      transformResponse: (response: ApiResponse<PaymentReconcileResponse>) =>
        response.data as PaymentReconcileResponse,
    }),

    cancelPayment: builder.mutation<
      PaymentCancelResponse,
      { invoiceNumber: string }
    >({
      query: (body) => ({
        url: "/payments/cancel",
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        "AdminRevenue",
        { type: "Payments", id: arg.invoiceNumber },
      ],
      transformResponse: (response: ApiResponse<PaymentCancelResponse>) =>
        response.data as PaymentCancelResponse,
    }),

    syncPayments: builder.mutation<PaymentSyncSummary, void>({
      query: () => ({
        url: "/payments/sync",
        method: "POST",
      }),
      invalidatesTags: ["Payments", "AdminRevenue"],
      transformResponse: (response: ApiResponse<PaymentSyncSummary>) =>
        response.data as PaymentSyncSummary,
    }),

    verifyPayment: builder.mutation<
      PaymentVerifyResponse,
      PaymentVerifyRequest
    >({
      query: (body) => ({
        url: "/payments/verify",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Payments", "FeatureQuotas"],
      transformResponse: (response: ApiResponse<PaymentVerifyResponse>) =>
        response.data as PaymentVerifyResponse,
    }),

    getAdminRevenueOverview: builder.query<
      AdminRevenueOverviewResponse,
      RevenueQueryParams | void
    >({
      query: (params) => ({
        url: "/admin/revenue/overview",
        method: "GET",
        params: toQueryParams(params ?? undefined),
      }),
      providesTags: ["AdminRevenue"],
      transformResponse: (
        response: ApiResponse<AdminRevenueOverviewResponse>,
      ) => response.data as AdminRevenueOverviewResponse,
    }),

    getAdminRevenueChart: builder.query<
      AdminRevenueChartResponse,
      RevenueQueryParams | void
    >({
      query: (params) => ({
        url: "/admin/revenue/chart",
        method: "GET",
        params: toQueryParams(params ?? undefined),
      }),
      providesTags: ["AdminRevenue"],
      transformResponse: (response: ApiResponse<AdminRevenueChartResponse>) =>
        response.data as AdminRevenueChartResponse,
    }),

    getAdminRevenueStatistics: builder.query<
      AdminRevenueStatisticsResponse,
      RevenueQueryParams | void
    >({
      query: (params) => ({
        url: "/admin/revenue/statistics",
        method: "GET",
        params: toQueryParams(params ?? undefined),
      }),
      providesTags: ["AdminRevenue"],
      transformResponse: (
        response: ApiResponse<AdminRevenueStatisticsResponse>,
      ) => response.data as AdminRevenueStatisticsResponse,
    }),
  }),
});

export const {
  useCreatePaymentMutation,
  useCancelPaymentMutation,
  useCreatePaymentPackageMutation,
  useGetAdminRevenueChartQuery,
  useGetAdminRevenueOverviewQuery,
  useGetAdminRevenueStatisticsQuery,
  useGetMyFeatureQuotasQuery,
  useGetPaymentPackagesQuery,
  useGetPaymentsQuery,
  useReconcilePaymentMutation,
  useSyncPaymentsMutation,
  useUpdatePaymentPackageMutation,
  useVerifyPaymentMutation,
} = paymentApi;
