"use client";

import { BellRing, Lock, Settings2, ShieldCheck } from "lucide-react";
import { useGetAdminSettingsQuery } from "@/lib/api/adminApi";
import { formatNumber } from "@/lib/admin";
import { AdminPageError, AdminPageLoading } from "@/components/admin/admin-query-state";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminSettingsPage() {
  const { data, isLoading, isError, error } = useGetAdminSettingsQuery();

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
      label: "Roles",
      value: formatNumber(data.catalogs.roles.length),
      hint: data.catalogs.roles.join(", "),
      icon: Settings2,
    },
    {
      label: "Exercise types",
      value: formatNumber(data.catalogs.exerciseTypes.length),
      hint: data.catalogs.exerciseTypes.join(", "),
      icon: ShieldCheck,
    },
    {
      label: "AI statuses",
      value: formatNumber(data.catalogs.aiSessionStatuses.length),
      hint: data.catalogs.aiSessionStatuses.join(", "),
      icon: BellRing,
    },
  ];

  return (
    <>
      <section className="rounded-[30px] border border-slate-200 bg-white px-6 py-7 shadow-sm">
        <Badge
          variant="outline"
          className="rounded-full border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500"
        >
          System Settings
        </Badge>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
          Cấu hình và catalog hệ thống từ backend admin.
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
          Màn này không còn text mẫu nữa; dữ liệu đang phản ánh môi trường chạy,
          current admin và các enum đang được backend sử dụng.
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
            <CardTitle>Môi trường và quyền truy cập</CardTitle>
            <CardDescription>
              Snapshot hiện tại của backend admin.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Node env</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {data.environment.nodeEnv}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Port</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {data.environment.port}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">API base path</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {data.environment.apiBasePath}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Current admin</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {data.access.currentAdmin?.fullName || "N/A"}
              </p>
              <p className="text-sm text-slate-500">
                {data.access.currentAdmin?.email || "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 py-5">
          <CardHeader>
            <CardTitle>Catalog hệ thống</CardTitle>
            <CardDescription>
              Các enum backend đang expose để admin kiểm tra nhanh.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-sm font-semibold text-slate-900">Levels</p>
              <p className="mt-2 text-sm text-slate-600">
                {data.catalogs.levels.join(", ")}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
              <p className="text-sm font-semibold text-slate-900">Roles</p>
              <p className="mt-2 text-sm text-slate-600">
                {data.catalogs.roles.join(", ")}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
              <p className="text-sm font-semibold text-slate-900">Accounts</p>
              <p className="mt-2 text-sm text-slate-600">
                {formatNumber(data.access.totalUsers)} users,{" "}
                {formatNumber(data.access.adminUsers)} admins
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Lock className="h-4 w-4" />
              Swagger enabled: {data.environment.swaggerEnabled ? "Yes" : "No"}
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
