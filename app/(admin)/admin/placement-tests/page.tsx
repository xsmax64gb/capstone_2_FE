"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Pencil, Plus, Search, ShieldCheck, Sparkles } from "lucide-react";

import { AdminPageError, AdminPageLoading } from "@/components/admin/admin-query-state";
import { DeleteConfirmButton } from "@/components/admin/delete-confirm-button";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useActivateAdminPlacementTestMutation,
  useDeleteAdminPlacementTestMutation,
  useGetAdminPlacementTestsQuery,
} from "@/lib/api/placementApi";
import { formatDateTime, formatNumber, notify } from "@/lib/admin";

export default function AdminPlacementTestsPage() {
  const [query, setQuery] = useState("");
  const { data: items = [], isLoading, error } = useGetAdminPlacementTestsQuery();
  const [activatePlacementTest, { isLoading: isActivating }] =
    useActivateAdminPlacementTestMutation();
  const [deletePlacementTest, { isLoading: isDeleting }] =
    useDeleteAdminPlacementTestMutation();

  const filteredItems = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    if (!keyword) {
      return items;
    }

    return items.filter((item) =>
      [item.title, item.description, item.instructions]
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [items, query]);

  const activeTest = items.find((item) => item.isActive) ?? null;
  const totalQuestions = items.reduce(
    (total, item) => total + item.activeQuestionCount,
    0
  );

  const handleDelete = async (id: string, title: string) => {
    await deletePlacementTest(id).unwrap();
    notify({
      title: "Đã xóa placement test",
      message: `Đã xóa "${title}".`,
      type: "success",
    });
  };

  const handleActivate = async (id: string, title: string) => {
    await activatePlacementTest(id).unwrap();
    notify({
      title: "Đã kích hoạt placement test",
      message: `"${title}" đang là bài test đầu vào cho user mới.`,
      type: "success",
    });
  };

  if (isLoading) {
    return <AdminPageLoading />;
  }

  if (error) {
    return <AdminPageError message="Không tải được danh sách placement tests." />;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-slate-200 bg-white px-6 py-7 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge
              variant="outline"
              className="rounded-full border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500"
            >
              Placement Admin
            </Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              Quản lý bài test đầu vào
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
              Chỉ một bài được active tại một thời điểm. Người dùng mới sẽ làm đúng
              bài active đó trước khi hệ thống gợi ý level.
            </p>
          </div>

          <Button asChild className="rounded-xl">
            <Link href="/admin/placement-tests/new">
              <Plus className="h-4 w-4" />
              Tạo placement test
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border-slate-200 py-5">
          <CardContent className="flex items-start justify-between gap-4 pt-1">
            <div>
              <p className="text-sm text-slate-500">Tổng bài test</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                {formatNumber(items.length)}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 py-5">
          <CardContent className="flex items-start justify-between gap-4 pt-1">
            <div>
              <p className="text-sm text-slate-500">Bài đang active</p>
              <p className="mt-2 line-clamp-2 text-xl font-semibold tracking-tight text-slate-950">
                {activeTest?.title || "Chưa có bài active"}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <Sparkles className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 py-5">
          <CardContent className="flex items-start justify-between gap-4 pt-1">
            <div>
              <p className="text-sm text-slate-500">Câu hỏi active</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                {formatNumber(totalQuestions)}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <Plus className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="border-slate-200 py-5">
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Danh sách placement tests</CardTitle>
              <CardDescription>
                {formatNumber(filteredItems.length)} mục đang hiển thị
              </CardDescription>
            </div>
            <label className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm theo title hoặc mô tả..."
                className="pl-9"
              />
            </label>
          </div>
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
              <p className="text-lg font-semibold text-slate-900">
                Chưa có placement test phù hợp
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Tạo bài test đầu tiên để onboarding có thể gọi bài active cho user mới.
              </p>
              <Button asChild className="mt-5 rounded-xl">
                <Link href="/admin/placement-tests/new">
                  <Plus className="h-4 w-4" />
                  Tạo placement test
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Câu hỏi</TableHead>
                  <TableHead>Max score</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900">{item.title}</p>
                        <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                          {item.description || "Không có mô tả"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.isActive ? (
                        <Badge className="rounded-full bg-emerald-600 text-white hover:bg-emerald-600">
                          Active
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="rounded-full border-slate-200 bg-slate-50 text-slate-500"
                        >
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{formatNumber(item.activeQuestionCount)}</TableCell>
                    <TableCell>{formatNumber(item.maxScore)}</TableCell>
                    <TableCell>{formatNumber(item.durationMinutes)} phút</TableCell>
                    <TableCell className="text-slate-500">
                      {formatDateTime(item.updatedAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant={item.isActive ? "secondary" : "outline"}
                          className="rounded-lg"
                          onClick={() => handleActivate(item.id, item.title)}
                          disabled={item.isActive || isActivating}
                        >
                          {item.isActive ? "Đang active" : "Kích hoạt"}
                        </Button>
                        <Button
                          asChild
                          type="button"
                          size="sm"
                          variant="outline"
                          className="rounded-lg"
                        >
                          <Link href={`/admin/placement-tests/${item.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <DeleteConfirmButton
                          itemLabel={item.title}
                          disabled={isDeleting}
                          onConfirm={() => handleDelete(item.id, item.title)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
