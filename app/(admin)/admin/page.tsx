"use client";

import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Sparkles,
  Users2,
} from "lucide-react";
import { useGetAdminOverviewQuery } from "@/lib/api/adminApi";
import { formatCompactNumber, formatDateTime, formatUptime } from "@/lib/admin";
import { AdminPageError, AdminPageLoading } from "@/components/admin/admin-query-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const quickActions = [
  {
    title: "Quản lý người dùng",
    description: "Xem danh sách tài khoản, role và tiến độ onboarding.",
    href: "/admin/users",
  },
  {
    title: "Quản trị exercises",
    description: "Duyệt ngân hàng bài tập với preview lớn và CRUD đầy đủ.",
    href: "/admin/exercises",
  },
  {
    title: "Quản trị vocabulary",
    description: "Quản lý bộ từ vựng và các từ (word, meaning, example), hỗ trợ import hàng loạt.",
    href: "/admin/vocabulary",
  },
  {
    title: "Quản trị AI",
    description: "Điều chỉnh level AI, stage flow và activation.",
    href: "/admin/ai",
  },
  {
    title: "Báo cáo vận hành",
    description: "Xem attempts, speaking minutes và phân bố level.",
    href: "/admin/reports",
  },
] as const;

export default function AdminDashboardPage() {
  const { data, isLoading, isError, error } = useGetAdminOverviewQuery();

  if (isLoading) {
    return <AdminPageLoading />;
  }

  if (isError || !data) {
    const message =
      typeof error === "object" && error && "status" in error
        ? `Yêu cầu thất bại (${String(error.status)}).`
        : undefined;

    return <AdminPageError message={message} />;
  }

  const overviewStats = [
    {
      label: "Tổng người dùng",
      value: formatCompactNumber(data.summary.totalUsers),
      hint: `${formatCompactNumber(data.summary.onboardingCompleted)} đã hoàn tất onboarding`,
      icon: Users2,
    },
    {
      label: "Lượt làm bài",
      value: formatCompactNumber(data.summary.totalAttempts),
      hint: `${formatCompactNumber(data.summary.attemptsLast7Days)} trong 7 ngày gần đây`,
      icon: CheckCircle2,
    },
    {
      label: "Phiên AI đang chạy",
      value: formatCompactNumber(data.summary.activeAiSessions),
      hint: "Số session speaking hiện còn in progress",
      icon: Sparkles,
    },
    {
      label: "Tổng content items",
      value: formatCompactNumber(data.summary.totalContentItems),
      hint: `${formatCompactNumber(data.systemSnapshot.totals.exercises)} exercises và ${formatCompactNumber(data.systemSnapshot.totals.vocabularies)} vocabulary`,
      icon: BookOpen,
    },
  ];

  const focusItems = [
    `Onboarding còn chờ: ${formatCompactNumber(data.summary.onboardingPending)} tài khoản.`,
    `Admin accounts hiện có: ${formatCompactNumber(data.summary.adminUsers)}.`,
    `API snapshot cập nhật lúc ${formatDateTime(data.systemSnapshot.apiTimestamp)}.`,
  ];

  const heroHighlights = [
    {
      label: "Người dùng",
      value: formatCompactNumber(data.summary.totalUsers),
    },
    {
      label: "Attempts 7 ngày",
      value: formatCompactNumber(data.summary.attemptsLast7Days),
    },
    {
      label: "AI active",
      value: formatCompactNumber(data.summary.activeAiSessions),
    },
  ];

  return (
    <>
      <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-8">
          <div className="relative overflow-hidden rounded-[28px] border border-sky-100 bg-[linear-gradient(135deg,_#f8fbff_0%,_#eef6ff_48%,_#f8fafc_100%)] px-6 py-7 text-slate-900">
            <div className="pointer-events-none absolute -right-16 top-0 h-44 w-44 rounded-full bg-sky-200/70 blur-3xl" />
            <div className="pointer-events-none absolute left-0 top-12 h-32 w-32 rounded-full bg-white/80 blur-3xl" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0),rgba(255,255,255,0.55))]" />
            <div className="relative">
              <Badge className="rounded-full border border-sky-200 bg-white/90 px-3 py-1 text-sky-700 shadow-sm hover:bg-white">
                SmartLingo Admin
              </Badge>
              <h2 className="mt-5 max-w-2xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                Dashboard quản trị tổng hợp toàn cảnh hệ thống.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Toàn bộ số liệu dưới đây được tổng hợp trực tiếp từ users,
                exercises, exercise attempts, AI sessions và vocabulary đang có
                trong hệ thống.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {heroHighlights.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/80 bg-white/75 px-4 py-3 shadow-sm backdrop-blur"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      {item.label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild className="rounded-xl bg-slate-950 text-white hover:bg-slate-800">
                  <Link href="/admin/users">Mở khu người dùng</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-xl border-slate-200 bg-white/80 text-slate-700 hover:bg-white hover:text-slate-950"
                >
                  <Link href="/admin/reports">Theo dõi báo cáo</Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <Card className="border-slate-200 bg-slate-50/90 py-5">
              <CardHeader className="pb-0">
                <CardTitle className="text-base">Nhịp vận hành hiện tại</CardTitle>
                <CardDescription>
                  Tóm tắt nhanh những chỉ số cần theo dõi trong ngày.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3 text-sm text-slate-600">
                  <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2">
                    <span>System status</span>
                    <span className="font-semibold capitalize text-emerald-600">
                      {data.systemSnapshot.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2">
                    <span>Server uptime</span>
                    <span className="font-semibold text-slate-900">
                      {formatUptime(data.systemSnapshot.uptime)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2">
                    <span>Updated at</span>
                    <span className="font-semibold text-slate-900">
                      {formatDateTime(data.systemSnapshot.apiTimestamp)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 py-5">
              <CardHeader className="pb-0">
                <CardTitle className="text-base">Cảnh báo ưu tiên</CardTitle>
                <CardDescription>
                  Các mốc thực tế đáng chú ý để tiếp tục xử lý.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {focusItems.map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                    >
                      <p className="text-sm text-slate-700">{item}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overviewStats.map((item) => {
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
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-slate-200 py-5">
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
            <CardDescription>
              Feed này được ghép từ user mới, exercise attempts và AI sessions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.recentActivity.map((item) => (
              <article
                key={`${item.type}-${item.title}-${item.timestamp}`}
                className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-slate-900">
                    {item.title}
                  </h3>
                  <span className="text-xs font-medium text-slate-500">
                    {formatDateTime(item.timestamp)}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {item.detail}
                </p>
              </article>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card className="border-slate-200 py-5">
            <CardHeader>
              <CardTitle>Điểm cần theo dõi</CardTitle>
              <CardDescription>
                Các số liệu đang được backend tổng hợp cho admin.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <span className="text-sm text-slate-600">Exercises</span>
                <span className="text-sm font-semibold text-slate-900">
                  {formatCompactNumber(data.systemSnapshot.totals.exercises)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <span className="text-sm text-slate-600">Vocabulary</span>
                <span className="text-sm font-semibold text-slate-900">
                  {formatCompactNumber(data.systemSnapshot.totals.vocabularies)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <span className="text-sm text-slate-600">Onboarding pending</span>
                <span className="text-sm font-semibold text-slate-900">
                  {formatCompactNumber(data.summary.onboardingPending)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 py-5">
            <CardHeader>
              <CardTitle>Đi nhanh tới module</CardTitle>
              <CardDescription>
                Các khu vực quản trị chính của hệ thống.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {quickActions.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition-colors hover:border-slate-300 hover:bg-white"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {item.title}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {item.description}
                      </p>
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <Clock3 className="h-4 w-4" />
            <Activity className="h-4 w-4" />
            Dữ liệu phản ánh trạng thái thực tế của backend tại thời điểm gọi API.
          </div>
        </div>
      </section>
    </>
  );
}
