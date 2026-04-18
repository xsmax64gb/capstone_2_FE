"use client";

import { useMemo, useState } from "react";
import { Activity, CircleDollarSign, RefreshCcw, Wallet } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AdminPageError,
  AdminPageLoading,
} from "@/components/admin/admin-query-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatCompactNumber,
  formatDateTime,
  formatNumber,
  notify,
} from "@/lib/admin";
import {
  useGetAdminRevenueChartQuery,
  useGetAdminRevenueOverviewQuery,
  useGetAdminRevenueStatisticsQuery,
  useSyncPaymentsMutation,
} from "@/store/services/paymentApi";

const rangeOptions = [
  { value: "7d", label: "7 ngày" },
  { value: "30d", label: "30 ngày" },
  { value: "90d", label: "90 ngày" },
] as const;

const formatCurrency = (value: number, currency = "VND") =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);

const formatPercent = (value: number) => `${Math.round(value * 100) / 100}%`;

const extractErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error && "data" in error) {
    const data = (error as { data?: { message?: string; error?: string } })
      .data;
    if (data?.message) {
      return data.message;
    }

    if (data?.error) {
      return data.error;
    }
  }

  if (typeof error === "object" && error && "status" in error) {
    return `Yêu cầu thất bại (${String((error as { status: unknown }).status)}).`;
  }

  return fallback;
};

const formatChartAxisLabel = (dateKey: string) => {
  const [, month, day] = String(dateKey).split("-");
  return month && day ? `${day}-${month}` : dateKey;
};

const formatChartDateLabel = (dateKey: string) => {
  const [year, month, day] = String(dateKey).split("-");
  return year && month && day ? `${day}/${month}/${year}` : dateKey;
};

type RevenueChartTooltipPayloadItem = {
  payload?: {
    date?: string;
    revenue?: number;
    paidTransactions?: number;
  };
};

function RevenueChartTooltip({
  active,
  payload,
  currency,
}: {
  active?: boolean;
  payload?: RevenueChartTooltipPayloadItem[];
  currency: string;
}) {
  const point = payload?.[0]?.payload;

  if (!active || !point?.date) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        Ngày {formatChartDateLabel(point.date)}
      </p>
      <p className="mt-2 text-sm font-semibold text-slate-900">
        Doanh thu: {formatCurrency(Number(point.revenue ?? 0), currency)}
      </p>
      <p className="mt-1 text-sm text-slate-600">
        Giao dịch thành công: {formatNumber(Number(point.paidTransactions ?? 0))}
      </p>
    </div>
  );
}

export default function AdminRevenuePage() {
  const [activeRange, setActiveRange] =
    useState<(typeof rangeOptions)[number]["value"]>("30d");
  const [lastSyncMessage, setLastSyncMessage] = useState<string | null>(null);

  const queryParams = useMemo(
    () => ({
      range: activeRange,
    }),
    [activeRange],
  );

  const overviewQuery = useGetAdminRevenueOverviewQuery(queryParams);
  const chartQuery = useGetAdminRevenueChartQuery(queryParams);
  const statisticsQuery = useGetAdminRevenueStatisticsQuery(queryParams);
  const [syncPayments, { isLoading: isSyncing }] = useSyncPaymentsMutation();

  const overview = overviewQuery.data;
  const chart = chartQuery.data;
  const statistics = statisticsQuery.data;

  const isInitialLoading =
    (overviewQuery.isLoading ||
      chartQuery.isLoading ||
      statisticsQuery.isLoading) &&
    (!overview || !chart || !statistics);
  const hasRevenueData = Boolean(overview && chart && statistics);
  const revenueOverview = overview as NonNullable<typeof overview>;
  const revenueChart = chart as NonNullable<typeof chart>;
  const revenueStatistics = statistics as NonNullable<typeof statistics>;
  const revenueErrorMessage = extractErrorMessage(
    overviewQuery.error || chartQuery.error || statisticsQuery.error,
    "Không tải được dữ liệu doanh thu.",
  );

  const refreshAll = () => {
    void overviewQuery.refetch();
    void chartQuery.refetch();
    void statisticsQuery.refetch();
  };

  const handleSyncPayments = async () => {
    try {
      const summary = await syncPayments().unwrap();
      setLastSyncMessage(summary.message);
      notify({
        title: "Đồng bộ thanh toán thành công",
        message: summary.message,
        type: "success",
      });
      refreshAll();
    } catch (syncError) {
      notify({
        title: "Không đồng bộ được",
        message: extractErrorMessage(
          syncError,
          "Không thể đồng bộ thanh toán lúc này.",
        ),
        type: "error",
      });
    }
  };

  const metrics = hasRevenueData
    ? [
        {
          label: "Doanh thu hệ thống",
          value: formatCurrency(
            revenueOverview.summary.systemRevenue,
            revenueOverview.summary.currency,
          ),
          hint: `${formatNumber(revenueOverview.summary.systemPaidTransactions)} giao dịch đã thanh toán`,
          icon: Wallet,
        },
        {
          label: `Doanh thu ${revenueOverview.range.label}`,
          value: formatCurrency(
            revenueOverview.summary.revenueInRange,
            revenueOverview.summary.currency,
          ),
          hint: `${formatNumber(revenueOverview.summary.paidTransactions)} giao dịch thành công`,
          icon: CircleDollarSign,
        },
        {
          label: "Tỷ lệ thành công",
          value: formatPercent(revenueOverview.summary.successRate),
          hint: `${formatNumber(revenueOverview.summary.pendingTransactions)} chờ xử lý, ${formatNumber(revenueOverview.summary.failedTransactions)} thất bại`,
          icon: Activity,
        },
      ]
    : [];

  const chartPoints = revenueChart?.points ?? [];

  return (
    <div className="space-y-6">
      {isInitialLoading ? (
        <AdminPageLoading />
      ) : !hasRevenueData ? (
        <AdminPageError message={revenueErrorMessage} />
      ) : (
        <>
          <section className="rounded-[30px] border border-slate-200 bg-white px-6 py-7 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <Badge
                  variant="outline"
                  className="rounded-full border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500"
                >
                  Revenue Analytics
                </Badge>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
                  Quản lý doanh thu hệ thống từ thanh toán.
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                  Dữ liệu được tổng hợp từ payments và cập nhật theo bộ lọc thời
                  gian. Dùng đồng bộ thủ công khi cần trigger đối soát ngay.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {rangeOptions.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    variant={
                      activeRange === option.value ? "default" : "outline"
                    }
                    className="rounded-full"
                    onClick={() => setActiveRange(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  onClick={refreshAll}
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Làm mới
                </Button>
                <Button
                  type="button"
                  onClick={() => void handleSyncPayments()}
                  disabled={isSyncing}
                  className="rounded-full bg-slate-950 text-white hover:bg-slate-800"
                >
                  <RefreshCcw
                    className={`mr-2 h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
                  />
                  {isSyncing ? "Đang đồng bộ" : "Đồng bộ thanh toán"}
                </Button>
              </div>
            </div>

            <div className="mt-5 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
              <p>
                Phạm vi: {revenueOverview.range.label} (
                {formatDateTime(revenueOverview.range.from)} -{" "}
                {formatDateTime(revenueOverview.range.to)})
              </p>
              <p className="md:text-right">
                Lần thanh toán gần nhất:{" "}
                {formatDateTime(revenueOverview.summary.latestPaidAt)}
              </p>
            </div>

            {lastSyncMessage ? (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {lastSyncMessage}
              </div>
            ) : null}
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            {metrics.map((item) => {
              const Icon = item.icon;

              return (
                <Card key={item.label} className="border-slate-200 py-5">
                  <CardContent className="flex items-start justify-between gap-4 pt-1">
                    <div>
                      <p className="text-sm text-slate-500">{item.label}</p>
                      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                        {item.value}
                      </p>
                      <p className="mt-2 text-sm text-slate-500">{item.hint}</p>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                      <Icon className="h-5 w-5" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            <Card className="border-slate-200 py-5">
              <CardHeader>
                <CardTitle>Biểu đồ doanh thu</CardTitle>
                <CardDescription>
                  Tổng doanh thu thanh toán theo ngày trong khoảng đã chọn.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {chartPoints.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                    Chưa có giao dịch đã thanh toán trong khoảng này.
                  </div>
                ) : (
                  <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={chartPoints}
                        margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                        <XAxis
                          dataKey="date"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={10}
                          minTickGap={24}
                          tickFormatter={(value) =>
                            formatChartAxisLabel(String(value))
                          }
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          allowDecimals={false}
                          tickFormatter={(value) =>
                            formatCompactNumber(Number(value))
                          }
                        />
                        <Tooltip
                          cursor={{
                            stroke: "#0f766e",
                            strokeDasharray: "4 4",
                            strokeOpacity: 0.28,
                          }}
                          content={({ active, payload }) => (
                            <RevenueChartTooltip
                              active={active}
                              payload={
                                payload as RevenueChartTooltipPayloadItem[]
                              }
                              currency={revenueChart.totals.currency}
                            />
                          )}
                        />
                        <Area
                          type="linear"
                          dataKey="revenue"
                          stroke="#0f766e"
                          fill="#5eead4"
                          fillOpacity={0.35}
                          strokeWidth={2.2}
                          dot={false}
                          activeDot={{
                            r: 5,
                            fill: "#0f766e",
                            stroke: "#ffffff",
                            strokeWidth: 2,
                          }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200 py-5">
              <CardHeader>
                <CardTitle>Thống kê tổng hợp</CardTitle>
                <CardDescription>
                  Tổng hợp theo trạng thái, phương thức thanh toán và gói giá.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm">
                  <p className="text-slate-500">Tổng giao dịch trong khoảng</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-950">
                    {formatNumber(revenueStatistics.totals.transactions)}
                  </p>
                </div>

                {["status", "paymentMethod", "pricing"].map((groupKey) => {
                  const titleMap: Record<string, string> = {
                    status: "Theo trạng thái",
                    paymentMethod: "Theo phương thức",
                    pricing: "Theo gói",
                  };

                  const items =
                    revenueStatistics.breakdowns[
                      groupKey as keyof typeof revenueStatistics.breakdowns
                    ] ?? [];

                  return (
                    <div
                      key={groupKey}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-4"
                    >
                      <p className="text-sm font-semibold text-slate-900">
                        {titleMap[groupKey]}
                      </p>
                      <div className="mt-3 space-y-2">
                        {items.length === 0 ? (
                          <p className="text-xs text-slate-500">
                            Không có dữ liệu.
                          </p>
                        ) : (
                          items.map((item) => (
                            <div
                              key={`${groupKey}-${item.key}`}
                              className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 text-sm"
                            >
                              <span className="text-slate-600">{item.key}</span>
                              <span className="font-semibold text-slate-900">
                                {formatNumber(item.count)}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </section>

          <section>
            <Card className="border-slate-200 py-5">
              <CardHeader>
                <CardTitle>Giao dịch đã thanh toán gần đây</CardTitle>
                <CardDescription>
                  Danh sách 10 giao dịch mới nhất đã được đối soát thành công.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {revenueStatistics.recentPaid.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                    Chưa có giao dịch thành công trong khoảng này.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Hóa đơn</TableHead>
                        <TableHead>Số tiền</TableHead>
                        <TableHead>Phương thức</TableHead>
                        <TableHead>Thời gian</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {revenueStatistics.recentPaid.map((item) => (
                        <TableRow key={item.invoiceNumber}>
                          <TableCell className="font-medium text-slate-900">
                            {item.invoiceNumber}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(
                              item.amount,
                              item.currency ||
                                revenueStatistics.totals.currency,
                            )}
                          </TableCell>
                          <TableCell>{item.paymentMethod}</TableCell>
                          <TableCell>{formatDateTime(item.paidAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}
