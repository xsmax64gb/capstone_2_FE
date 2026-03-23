"use client";

import { Activity, BarChart3, TrendingUp } from "lucide-react";
import { useGetAdminReportsQuery } from "@/lib/api/adminApi";
import {
  formatMinutes,
  formatNumber,
  formatPercent,
} from "@/lib/admin";
import { AdminPageError, AdminPageLoading } from "@/components/admin/admin-query-state";
import { Badge } from "@/components/ui/badge";
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

export default function AdminReportsPage() {
  const { data, isLoading, isError, error } = useGetAdminReportsQuery();

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

  const metrics = [
    {
      label: "Exercise attempts",
      value: formatNumber(data.summary.totalExerciseAttempts),
      hint: "Tổng lượt nộp bài trong hệ thống",
      icon: TrendingUp,
    },
    {
      label: "Speaking minutes",
      value: formatMinutes(data.summary.totalSpeakingMinutes),
      hint: "Tính từ các AI session đã có startedAt và endedAt",
      icon: Activity,
    },
    {
      label: "Điểm trung bình",
      value: formatPercent(data.summary.averageExercisePercent),
      hint: "Trung bình percent của toàn bộ exercise attempts",
      icon: BarChart3,
    },
  ];

  return (
    <>
      <section className="rounded-[30px] border border-slate-200 bg-white px-6 py-7 shadow-sm">
        <Badge
          variant="outline"
          className="rounded-full border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500"
        >
          Reporting
        </Badge>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
          Báo cáo hiệu suất, sử dụng và vận hành.
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
          Các card và bảng dưới đây được dựng từ `exercise_attempts`,
          `ai_sessions`, `users` và `exercises`.
        </p>
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

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="border-slate-200 py-5">
          <CardHeader>
            <CardTitle>Hoạt động 7 ngày gần nhất</CardTitle>
            <CardDescription>
              So sánh nhanh số attempts và AI sessions theo ngày.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Attempts</TableHead>
                  <TableHead>AI Sessions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.weeklyActivity.map((item) => (
                  <TableRow key={item.date}>
                    <TableCell className="font-medium text-slate-900">
                      {item.label}
                    </TableCell>
                    <TableCell>{formatNumber(item.attempts)}</TableCell>
                    <TableCell>{formatNumber(item.aiSessions)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-6 grid gap-3">
              {data.summary.aiSessionStatusBreakdown.map((item) => (
                <div
                  key={item.status}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <span className="text-sm text-slate-600 capitalize">
                    {item.status?.replaceAll("_", " ")}
                  </span>
                  <span className="text-sm font-semibold text-slate-900">
                    {formatNumber(item.count)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 py-5">
          <CardHeader>
            <CardTitle>Phân bố và top nội dung</CardTitle>
            <CardDescription>
              Dùng để nhìn nhanh cohort level và bài tập có nhiều lượt làm nhất.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="mb-3 text-sm font-semibold text-slate-900">Level distribution</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {data.levelDistribution.map((item) => (
                  <div
                    key={item.level}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3"
                  >
                    <span className="text-sm text-slate-600">{item.level}</span>
                    <span className="text-sm font-semibold text-slate-900">
                      {formatNumber(item.count)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold text-slate-900">Top exercises</p>
              <div className="space-y-3">
                {data.topExercises.map((item) => (
                  <div
                    key={item.exerciseId}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                  >
                    <p className="text-sm font-semibold text-slate-900">
                      {item.title}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-sm text-slate-600">
                      <span>{formatNumber(item.attempts)} attempts</span>
                      <span>{formatPercent(item.averagePercent)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
