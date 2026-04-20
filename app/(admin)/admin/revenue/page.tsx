"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BadgeCheck,
  CircleDollarSign,
  CreditCard,
  Filter,
  RefreshCcw,
  Search,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import type { AdminRevenueRecentPaidItem } from "@/types";

// ─── Constants ──────────────────────────────────────────────────────────────

const rangeOptions = [
  { value: "7d", label: "7 ngày" },
  { value: "30d", label: "30 ngày" },
  { value: "90d", label: "90 ngày" },
] as const;

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatCurrency = (value: number, currency = "VND") =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);

const formatPercent = (value: number) => `${Math.round(value * 100) / 100}%`;

const extractErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error && "data" in error) {
    const data = (error as { data?: { message?: string; error?: string } }).data;
    if (data?.message) return data.message;
    if (data?.error) return data.error;
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

// ─── Method Display Map ───────────────────────────────────────────────────────
const methodLabel: Record<string, string> = {
  bank_transfer: "Chuyển khoản",
  cash: "Tiền mặt",
  card: "Thẻ ngân hàng",
};

// ─── Tooltip ─────────────────────────────────────────────────────────────────

type RevenueChartTooltipPayloadItem = {
  payload?: { date?: string; revenue?: number; paidTransactions?: number };
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
  if (!active || !point?.date) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-2xl">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
        Ngày {formatChartDateLabel(point.date)}
      </p>
      <p className="mt-2 text-sm font-bold text-slate-900">
        {formatCurrency(Number(point.revenue ?? 0), currency)}
      </p>
      <p className="mt-0.5 text-xs text-slate-500">
        {formatNumber(Number(point.paidTransactions ?? 0))} giao dịch thành công
      </p>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ method }: { method: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
      <CreditCard className="h-3 w-3" />
      {methodLabel[method] ?? method}
    </span>
  );
}

// ─── Stat Metric Card ─────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  trend,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
}) {
  return (
    <Card className="border-slate-200 py-5 shadow-sm">
      <CardContent className="flex items-start justify-between gap-4 pt-1">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            {value}
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
            {trend === "up" && <ArrowUpRight className="h-4 w-4 text-slate-600" />}
            {trend === "down" && <ArrowDownRight className="h-4 w-4 text-slate-500" />}
            {hint}
          </p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Breakdown Row ────────────────────────────────────────────────────────────

function BreakdownRow({
  label,
  count,
  amount,
  currency,
  total,
  color,
}: {
  label: string;
  count: number;
  amount: number;
  currency: string;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <div className="flex items-center gap-3 text-right">
          <span className="text-slate-500">{formatNumber(count)} GD</span>
          <span className="font-semibold text-slate-900 min-w-[80px] text-right">
            {formatCurrency(amount, currency)}
          </span>
        </div>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminRevenuePage() {
  const [activeRange, setActiveRange] =
    useState<(typeof rangeOptions)[number]["value"]>("30d");
  const [lastSyncMessage, setLastSyncMessage] = useState<string | null>(null);

  // Transaction filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMethod, setFilterMethod] = useState<string>("all");
  const [filterPricing, setFilterPricing] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const queryParams = useMemo(() => ({ range: activeRange }), [activeRange]);

  const overviewQuery = useGetAdminRevenueOverviewQuery(queryParams);
  const chartQuery = useGetAdminRevenueChartQuery(queryParams);
  const statisticsQuery = useGetAdminRevenueStatisticsQuery(queryParams);
  const [syncPayments, { isLoading: isSyncing }] = useSyncPaymentsMutation();

  const overview = overviewQuery.data;
  const chart = chartQuery.data;
  const statistics = statisticsQuery.data;

  const isInitialLoading =
    (overviewQuery.isLoading || chartQuery.isLoading || statisticsQuery.isLoading) &&
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
      notify({ title: "Đồng bộ thành công", message: summary.message, type: "success" });
      refreshAll();
    } catch (syncError) {
      notify({
        title: "Không đồng bộ được",
        message: extractErrorMessage(syncError, "Không thể đồng bộ thanh toán lúc này."),
        type: "error",
      });
    }
  };

  const chartPoints = revenueChart?.points ?? [];

  // ── Derive unique filter options from data ─────────────────────────────────
  const allTransactions: AdminRevenueRecentPaidItem[] =
    revenueStatistics?.recentPaid ?? [];

  const uniqueMethods = useMemo(
    () => [...new Set(allTransactions.map((t) => t.paymentMethod))],
    [allTransactions],
  );
  const uniquePricings = useMemo(
    () => [
      ...new Set(
        allTransactions.map((t) => t.pricingKey ?? "unknown").filter(Boolean),
      ),
    ],
    [allTransactions],
  );

  // ── Filter + paginate ──────────────────────────────────────────────────────
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter((t) => {
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        t.invoiceNumber.toLowerCase().includes(q) ||
        (t.externalRef ?? "").toLowerCase().includes(q) ||
        (t.xgateReference ?? "").toLowerCase().includes(q);
      const matchMethod = filterMethod === "all" || t.paymentMethod === filterMethod;
      const matchPricing =
        filterPricing === "all" || (t.pricingKey ?? "unknown") === filterPricing;
      return matchSearch && matchMethod && matchPricing;
    });
  }, [allTransactions, searchQuery, filterMethod, filterPricing]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / pageSize));
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const resetFilters = () => {
    setSearchQuery("");
    setFilterMethod("all");
    setFilterPricing("all");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchQuery !== "" || filterMethod !== "all" || filterPricing !== "all";

  // ── Summary total for breakdown bars ──────────────────────────────────────
  const totalBreakdownCount = revenueStatistics?.totals?.transactions ?? 0;

  const breakdownColors: Record<string, string> = {
    paid: "bg-slate-900",
    failed: "bg-slate-400",
    pending: "bg-slate-300",
    bank_transfer: "bg-slate-800",
    cash: "bg-slate-600",
    card: "bg-slate-500",
    plus: "bg-slate-900",
    ultra: "bg-slate-700",
    go: "bg-slate-500",
    free: "bg-slate-300",
  };
  const defaultColor = "bg-slate-400";

  return (
    <div className="space-y-6">
      {isInitialLoading ? (
        <AdminPageLoading />
      ) : !hasRevenueData ? (
        <AdminPageError message={revenueErrorMessage} />
      ) : (
        <>
          {/* ── Hero Header ───────────────────────────────────────────────── */}
          <section className="rounded-[30px] border border-slate-200 bg-white px-6 py-7 shadow-sm">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <Badge
                  variant="outline"
                  className="rounded-full border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500"
                >
                  <TrendingUp className="mr-1.5 h-3 w-3" />
                  Revenue
                </Badge>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
                  Quản lý doanh thu hệ thống
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                  Tổng hợp từ `payments`, cập nhật theo bộ lọc thời gian và hiển thị
                  trực tiếp các giao dịch đã được ghi nhận trong hệ thống.
                  <span className="ml-1 font-medium text-slate-900">
                    Phạm vi: {revenueOverview.range.label}
                  </span>
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  {formatDateTime(revenueOverview.range.from)} →{" "}
                  {formatDateTime(revenueOverview.range.to)} · Lần TT gần nhất:{" "}
                  {formatDateTime(revenueOverview.summary.latestPaidAt)}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-slate-100 p-1">
                  {rangeOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setActiveRange(opt.value);
                        setCurrentPage(1);
                      }}
                      className={`px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                        activeRange === opt.value
                          ? "rounded-lg bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={refreshAll}
                  className="rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                >
                  <RefreshCcw className="mr-1.5 h-3.5 w-3.5" />
                  Làm mới
                </Button>

                <Button
                  type="button"
                  size="sm"
                  onClick={() => void handleSyncPayments()}
                  disabled={isSyncing}
                  className="rounded-xl bg-slate-900 font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  <RefreshCcw
                    className={`mr-1.5 h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`}
                  />
                  {isSyncing ? "Đang đồng bộ…" : "Đồng bộ"}
                </Button>
              </div>
            </div>

            {lastSyncMessage && (
              <div className="mt-5 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <BadgeCheck className="h-4 w-4 shrink-0" />
                {lastSyncMessage}
              </div>
            )}
          </section>

          {/* ── KPI Metric Cards ──────────────────────────────────────────── */}
          <div className="grid gap-4 sm:grid-cols-3">
            <MetricCard
              label="Doanh thu hệ thống"
              value={formatCurrency(
                revenueOverview.summary.systemRevenue,
                revenueOverview.summary.currency,
              )}
              hint={`${formatNumber(revenueOverview.summary.systemPaidTransactions)} giao dịch đã thanh toán`}
              icon={Wallet}
              trend="up"
            />
            <MetricCard
              label={`Doanh thu ${revenueOverview.range.label}`}
              value={formatCurrency(
                revenueOverview.summary.revenueInRange,
                revenueOverview.summary.currency,
              )}
              hint={`${formatNumber(revenueOverview.summary.paidTransactions)} giao dịch thành công`}
              icon={CircleDollarSign}
              trend="up"
            />
            <MetricCard
              label="Tỷ lệ thành công"
              value={formatPercent(revenueOverview.summary.successRate)}
              hint={`${formatNumber(revenueOverview.summary.pendingTransactions)} chờ xử lý · ${formatNumber(revenueOverview.summary.failedTransactions)} thất bại`}
              icon={Activity}
              trend={revenueOverview.summary.successRate > 50 ? "up" : "down"}
            />
          </div>

          {/* ── Chart + Breakdown ─────────────────────────────────────────── */}
          <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
            {/* -- Chart -- */}
            <Card className="overflow-hidden border-slate-200/80 shadow-sm">
              <CardHeader className="border-b border-slate-100 bg-slate-50/60 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900">
                      Biểu đồ doanh thu
                    </CardTitle>
                    <CardDescription className="mt-0.5 text-xs">
                      Tổng doanh thu theo ngày — {revenueOverview.range.label}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-slate-900" />
                    Doanh thu (VND)
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                {chartPoints.length === 0 ? (
                  <div className="flex h-[300px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-400">
                    Chưa có giao dịch nào trong khoảng này.
                  </div>
                ) : (
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={chartPoints}
                        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0f172a" stopOpacity={0.16} />
                            <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="4 4"
                          stroke="#f1f5f9"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="date"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={10}
                          minTickGap={28}
                          tick={{ fontSize: 11, fill: "#94a3b8" }}
                          tickFormatter={(v) => formatChartAxisLabel(String(v))}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          allowDecimals={false}
                          tick={{ fontSize: 11, fill: "#94a3b8" }}
                          tickFormatter={(v) => formatCompactNumber(Number(v))}
                        />
                        <Tooltip
                          cursor={{ stroke: "#64748b", strokeDasharray: "4 4", strokeOpacity: 0.35 }}
                          content={({ active, payload }) => (
                            <RevenueChartTooltip
                              active={active}
                              payload={payload as RevenueChartTooltipPayloadItem[]}
                              currency={revenueChart.totals.currency}
                            />
                          )}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#0f172a"
                          fill="url(#revenueGrad)"
                          strokeWidth={2.5}
                          dot={false}
                          activeDot={{ r: 5, fill: "#0f172a", stroke: "#fff", strokeWidth: 2 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* -- Breakdowns -- */}
            <Card className="overflow-hidden border-slate-200/80 shadow-sm">
              <CardHeader className="border-b border-slate-100 bg-slate-50/60 pb-4">
                <CardTitle className="text-base font-bold text-slate-900">
                  Thống kê phân nhóm
                </CardTitle>
                <CardDescription className="text-xs">
                  Theo trạng thái · phương thức · gói đăng ký
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 p-4">
                {/* total chip */}
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Tổng giao dịch
                  </span>
                  <span className="text-xl font-bold text-slate-900">
                    {formatNumber(revenueStatistics.totals.transactions)}
                  </span>
                </div>

                {(
                  [
                    { key: "status", title: "Theo trạng thái" },
                    { key: "paymentMethod", title: "Theo phương thức" },
                    { key: "pricing", title: "Theo gói" },
                  ] as const
                ).map(({ key, title }) => {
                  const items =
                    revenueStatistics.breakdowns[
                      key as keyof typeof revenueStatistics.breakdowns
                    ] ?? [];

                  return (
                    <div key={key}>
                      <p className="mb-2.5 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                        {title}
                      </p>
                      <div className="space-y-3">
                        {items.length === 0 ? (
                          <p className="text-xs text-slate-400">Không có dữ liệu.</p>
                        ) : (
                          items.map((item) => (
                            <BreakdownRow
                              key={`${key}-${item.key}`}
                              label={
                                key === "paymentMethod"
                                  ? (methodLabel[item.key] ?? item.key)
                                  : item.key
                              }
                              count={item.count}
                              amount={item.amount}
                              currency={revenueStatistics.totals.currency}
                              total={totalBreakdownCount}
                              color={breakdownColors[item.key] ?? defaultColor}
                            />
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* ── Transactions Table ────────────────────────────────────────── */}
          <Card className="overflow-hidden border-slate-200/80 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/60 pb-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
                    <BadgeCheck className="h-4.5 w-4.5 text-slate-700" />
                    Giao dịch đã thanh toán gần đây
                  </CardTitle>
                  <CardDescription className="mt-0.5 text-xs">
                    {filteredTransactions.length} / {allTransactions.length} giao dịch
                    {hasActiveFilters ? " (đang lọc)" : ""}
                  </CardDescription>
                </div>

                {/* Filter bar */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="tx-search"
                      placeholder="Tìm hóa đơn…"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="h-8 w-44 rounded-lg pl-8 text-sm"
                    />
                  </div>

                  {/* Method filter */}
                  <Select
                    value={filterMethod}
                    onValueChange={(v) => {
                      setFilterMethod(v);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger id="tx-method-filter" className="h-8 w-40 rounded-lg text-sm">
                      <Filter className="mr-1.5 h-3.5 w-3.5 text-slate-400" />
                      <SelectValue placeholder="Phương thức" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả phương thức</SelectItem>
                      {uniqueMethods.map((m) => (
                        <SelectItem key={m} value={m}>
                          {methodLabel[m] ?? m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Pricing filter */}
                  {uniquePricings.length > 0 && (
                    <Select
                      value={filterPricing}
                      onValueChange={(v) => {
                        setFilterPricing(v);
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger id="tx-pricing-filter" className="h-8 w-36 rounded-lg text-sm">
                        <SelectValue placeholder="Gói" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả gói</SelectItem>
                        {uniquePricings.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {/* Page size */}
                  <Select
                    value={String(pageSize)}
                    onValueChange={(v) => {
                      setPageSize(Number(v));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger id="tx-page-size" className="h-8 w-28 rounded-lg text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAGE_SIZE_OPTIONS.map((s) => (
                        <SelectItem key={s} value={String(s)}>
                          {s} / trang
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Reset */}
                  {hasActiveFilters && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={resetFilters}
                      className="h-8 gap-1 rounded-lg px-2 text-xs text-slate-500 hover:text-slate-900"
                    >
                      <X className="h-3.5 w-3.5" />
                      Xóa lọc
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {paginatedTransactions.length === 0 ? (
                <div className="flex h-40 items-center justify-center text-sm text-slate-400">
                  {hasActiveFilters
                    ? "Không tìm thấy giao dịch phù hợp."
                    : "Chưa có giao dịch thành công trong khoảng này."}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-slate-100 bg-slate-50/40">
                      <TableHead className="py-3 pl-6 text-xs font-bold uppercase tracking-[0.1em] text-slate-500">
                        Hóa đơn
                      </TableHead>
                      <TableHead className="py-3 text-xs font-bold uppercase tracking-[0.1em] text-slate-500">
                        Gói
                      </TableHead>
                      <TableHead className="py-3 text-xs font-bold uppercase tracking-[0.1em] text-slate-500">
                        Phương thức
                      </TableHead>
                      <TableHead className="py-3 text-right text-xs font-bold uppercase tracking-[0.1em] text-slate-500">
                        Số tiền
                      </TableHead>
                      <TableHead className="py-3 pr-6 text-right text-xs font-bold uppercase tracking-[0.1em] text-slate-500">
                        Thời gian
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTransactions.map((item, idx) => (
                      <TableRow
                        key={item.invoiceNumber}
                        className={`border-b border-slate-50 transition-colors hover:bg-slate-50/70 ${
                          idx % 2 === 0 ? "" : "bg-slate-50/30"
                        }`}
                      >
                        <TableCell className="py-3.5 pl-6">
                          <span className="font-mono text-sm font-semibold text-slate-900">
                            {item.invoiceNumber}
                          </span>
                          {item.externalRef && (
                            <p className="mt-0.5 text-[10px] text-slate-400">
                              ref: {item.externalRef}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="py-3.5">
                          {item.pricingKey ? (
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold capitalize text-slate-700 ring-1 ring-slate-200">
                              {item.pricingKey}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </TableCell>
                        <TableCell className="py-3.5">
                          <StatusBadge method={item.paymentMethod} />
                        </TableCell>
                        <TableCell className="py-3.5 text-right">
                          <span className="text-sm font-bold text-slate-900">
                            {formatCurrency(
                              item.amount,
                              item.currency || revenueStatistics.totals.currency,
                            )}
                          </span>
                        </TableCell>
                        <TableCell className="py-3.5 pr-6 text-right">
                          <span className="text-xs text-slate-500">
                            {formatDateTime(item.paidAt)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>

            {/* Pagination footer */}
            {filteredTransactions.length > 0 && (
              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-6 py-3">
                <p className="text-xs text-slate-500">
                  Trang {currentPage} / {totalPages} · {filteredTransactions.length} giao dịch
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="h-7 rounded-lg px-2.5 text-xs"
                  >
                    ‹ Trước
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => {
                      if (totalPages <= 7) return true;
                      return Math.abs(p - currentPage) <= 2 || p === 1 || p === totalPages;
                    })
                    .reduce<(number | "…")[]>((acc, p, i, arr) => {
                      if (i > 0 && (arr[i - 1] as number) !== p - 1) acc.push("…");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === "…" ? (
                        <span key={`ellipsis-${i}`} className="px-1 text-xs text-slate-400">
                          …
                        </span>
                      ) : (
                        <Button
                          key={p}
                          type="button"
                          variant={currentPage === p ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(p as number)}
                          className="h-7 min-w-[28px] rounded-lg px-2 text-xs"
                        >
                          {p}
                        </Button>
                      ),
                    )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="h-7 rounded-lg px-2.5 text-xs"
                  >
                    Sau ›
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
