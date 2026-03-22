"use client";

import { ShieldAlert, UserPlus, Users2 } from "lucide-react";
import { useGetAdminUsersQuery } from "@/lib/api/adminApi";
import { formatDateTime, formatNumber, formatPercent } from "@/lib/admin";
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

export default function AdminUsersPage() {
  const { data, isLoading, isError, error } = useGetAdminUsersQuery();

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
      label: "Tổng hồ sơ",
      value: formatNumber(data.summary.totalUsers),
      hint: `${formatNumber(data.summary.adminUsers)} tài khoản admin`,
      icon: Users2,
    },
    {
      label: "Đã onboard",
      value: formatNumber(data.summary.onboardingCompleted),
      hint: `${formatNumber(data.summary.onboardingPending)} còn pending`,
      icon: UserPlus,
    },
    {
      label: "Placement trung bình",
      value: formatPercent(data.summary.averagePlacementScore),
      hint: "Tính từ toàn bộ tài khoản hiện có",
      icon: ShieldAlert,
    },
  ];

  return (
    <>
      <section className="rounded-[30px] border border-slate-200 bg-white px-6 py-7 shadow-sm">
        <Badge
          variant="outline"
          className="rounded-full border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500"
        >
          User Operations
        </Badge>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
          Vận hành học viên và tài khoản bằng dữ liệu thật.
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
          Bảng dưới đây đang đọc trực tiếp từ collection `users`, kèm phân bố
          level, role và trạng thái onboarding.
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

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-slate-200 py-5">
          <CardHeader>
            <CardTitle>Phân bố người dùng</CardTitle>
            <CardDescription>
              Thống kê này phản ánh ngay dữ liệu level và role hiện tại.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="mb-3 text-sm font-semibold text-slate-900">Theo level</p>
              <div className="space-y-3">
                {data.breakdowns.byLevel.map((item) => (
                  <div
                    key={item.level}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
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
              <p className="mb-3 text-sm font-semibold text-slate-900">Theo role</p>
              <div className="space-y-3">
                {data.breakdowns.byRole.map((item) => (
                  <div
                    key={item.role}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3"
                  >
                    <span className="text-sm capitalize text-slate-600">{item.role}</span>
                    <span className="text-sm font-semibold text-slate-900">
                      {formatNumber(item.count)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 py-5">
          <CardHeader>
            <CardTitle>Danh sách người dùng</CardTitle>
            <CardDescription>
              Hiển thị tài khoản mới nhất cùng trạng thái onboarding và role.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Onboarding</TableHead>
                  <TableHead>Placement</TableHead>
                  <TableHead>Tạo lúc</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium text-slate-900">
                      {user.fullName}
                    </TableCell>
                    <TableCell className="text-slate-600">{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="rounded-full border-slate-200 bg-slate-50 capitalize text-slate-600"
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.currentLevel || "N/A"}</TableCell>
                    <TableCell>
                      <span
                        className={
                          user.onboardingDone ? "text-emerald-600" : "text-amber-600"
                        }
                      >
                        {user.onboardingDone ? "Done" : "Pending"}
                      </span>
                    </TableCell>
                    <TableCell>{formatPercent(user.placementScore || 0)}</TableCell>
                    <TableCell className="text-slate-500">
                      {formatDateTime(user.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
