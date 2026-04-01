"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BookOpen, Pencil, Plus, Search, Trophy } from "lucide-react";

import { AdminPageError, AdminPageLoading } from "@/components/admin/admin-query-state";
import { DeleteConfirmButton } from "@/components/admin/delete-confirm-button";
import { LearnMapAiCreateButton } from "@/components/admin/learn-map-ai-create-button";
import { AdminRoute } from "@/components/auth/admin-route";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatNumber, notify } from "@/lib/admin";
import { useDeleteAdminLearnMapMutation, useGetAdminLearnMapsQuery } from "@/lib/api/learnApi";
import { handleApiError } from "@/lib/api-error-handler";

function formatRequiredXp(value: number, totalXP: number) {
  if (value > 0) {
    return `${formatNumber(value)} XP`;
  }

  return `Tự động (${formatNumber(totalXP)} XP)`;
}

export default function AdminLearnMapsPage() {
  const { data, isLoading, isError, error } = useGetAdminLearnMapsQuery();
  const [deleteMap] = useDeleteAdminLearnMapMutation();
  const [query, setQuery] = useState("");

  const items = data?.items ?? [];
  const sortedItems = useMemo(
    () =>
      items
        .slice()
        .sort((a, b) => a.level - b.level || a.order - b.order || a.title.localeCompare(b.title)),
    [items],
  );

  const filteredItems = sortedItems.filter((item) => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) {
      return true;
    }

    return (
      item.title.toLowerCase().includes(keyword) ||
      item.slug.toLowerCase().includes(keyword) ||
      item.description.toLowerCase().includes(keyword) ||
      item.theme.toLowerCase().includes(keyword)
    );
  });

  const publishedCount = items.filter((item) => item.isPublished).length;

  const handleDelete = async (id: string, title: string) => {
    try {
      await deleteMap(id).unwrap();
      notify({ title: "Đã xóa map", message: title, type: "success" });
    } catch (deleteError) {
      const apiError = handleApiError(deleteError);
      notify({
        title: "Không thể xóa map",
        message: apiError.message,
        type: "error",
      });
    }
  };

  if (isLoading) {
    return <AdminPageLoading />;
  }

  if (isError) {
    const message =
      typeof error === "object" && error && "status" in error
        ? `Yêu cầu thất bại (${String(error.status)}).`
        : "Không tải được danh sách bản đồ học.";

    return <AdminPageError message={message} />;
  }

  return (
    <AdminRoute>
      <div className="space-y-6">
        <section className="rounded-[30px] border border-slate-200 bg-white px-6 py-7 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Danh sách bản đồ học</h1>
              <p className="mt-1 text-sm text-slate-500">
                Quản lý map học và thứ tự mở khóa theo level.{" "}
                <span className="font-semibold">
                  {items.length} bản đồ, {publishedCount} bản đồ đang xuất bản
                </span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link href="/admin/learn/achievements">
                <Button size="sm" variant="outline">
                  <Trophy className="mr-1.5 h-4 w-4" />
                  Huy hiệu
                </Button>
              </Link>
              <LearnMapAiCreateButton size="sm" buttonText="Tạo với AI" />
              <Link href="/admin/learn/maps/new">
                <Button size="sm">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Tạo mới
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="rounded-[30px] border border-slate-200 bg-white px-6 py-7 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm theo tên map, slug, theme..."
              className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-black"
            />
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Tên map</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Thứ tự</TableHead>
                  <TableHead>Tổng XP</TableHead>
                  <TableHead>XP hoàn thành</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-sm text-slate-500">
                      {query ? "Không có map nào khớp từ khóa." : "Chưa có map nào."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="align-top whitespace-normal">
                        <div className="flex items-start gap-2">
                          <BookOpen className="mt-0.5 h-4 w-4 text-slate-400" />
                          <div className="min-w-0 space-y-1">
                            <p className="font-semibold text-slate-900">{item.title}</p>
                            <p className="text-xs text-slate-500">{item.slug}</p>
                            <p className="max-w-[420px] break-words text-sm text-slate-600">
                              {item.description || "Chưa có mô tả."}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold">
                          {formatNumber(item.level)}
                        </span>
                      </TableCell>
                      <TableCell>{formatNumber(item.order)}</TableCell>
                      <TableCell>{formatNumber(item.totalXP ?? 0)}</TableCell>
                      <TableCell className="whitespace-normal">
                        {formatRequiredXp(item.requiredXPToComplete ?? 0, item.totalXP ?? 0)}
                      </TableCell>
                      <TableCell>
                        {item.isPublished ? (
                          <Badge className="rounded-full bg-emerald-600 text-white hover:bg-emerald-600">
                            Đang xuất bản
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="rounded-full border-amber-200 bg-amber-50 text-amber-700"
                          >
                            Bản nháp
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/learn/maps/${item.id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Chỉnh sửa
                          </Link>
                          <DeleteConfirmButton
                            itemLabel={item.title}
                            onConfirm={() => handleDelete(item.id, item.title)}
                            title="Xóa map?"
                            description={`Xóa "${item.title}" và toàn bộ step bên trong? Hành động này không thể hoàn tác.`}
                            confirmLabel="Xóa"
                            cancelLabel="Hủy"
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <p className="mt-3 text-xs text-slate-400">
            Hiển thị {filteredItems.length} / {items.length} bản đồ, sắp theo level rồi đến thứ tự
          </p>
        </section>
      </div>
    </AdminRoute>
  );
}
