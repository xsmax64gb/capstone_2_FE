"use client";

import Link from "next/link";
import { useState } from "react";
import { Pencil, Plus, Search } from "lucide-react";

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
  useDeleteAdminExerciseMutation,
  useGetAdminExercisesQuery,
} from "@/store/services/adminApi";
import { formatDateTime, formatNumber, notify } from "@/lib/admin";

export default function AdminExercisesPage() {
  const { data, isLoading, isError, error } = useGetAdminExercisesQuery();
  const [deleteExercise] = useDeleteAdminExerciseMutation();
  const [query, setQuery] = useState("");

  const items = data ?? [];
  const filteredItems = items.filter((item) => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return true;

    return (
      item.title.toLowerCase().includes(keyword) ||
      item.topic.toLowerCase().includes(keyword) ||
      item.level.toLowerCase().includes(keyword) ||
      item.type.toLowerCase().includes(keyword)
    );
  });

  const handleDelete = async (id: string, title: string) => {
    try {
      await deleteExercise(id).unwrap();
      notify({ title: "Đã xóa exercise", type: "success" });
    } catch {
      notify({
        title: "Không thể xóa exercise",
        message: `Vui lòng thử lại với "${title}".`,
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
        : undefined;

    return <AdminPageError message={message} />;
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
              Exercise Admin
            </Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              Quản trị exercises
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
              Trang này chỉ dùng để duyệt danh sách. Tạo mới hoặc chỉnh sửa sẽ mở
              sang màn hình riêng.
            </p>
          </div>

          <Button asChild className="rounded-xl">
            <Link href="/admin/exercises/new">
              <Plus className="h-4 w-4" />
              Tạo exercise mới
            </Link>
          </Button>
        </div>
      </section>

      <Card className="border-slate-200 py-5">
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Danh sách exercises</CardTitle>
              <CardDescription>
                {formatNumber(filteredItems.length)} mục đang hiển thị
              </CardDescription>
            </div>
            <label className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm theo title, topic, level..."
                className="pl-9"
              />
            </label>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ảnh</TableHead>
                <TableHead>Tiêu đề</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Topic</TableHead>
                <TableHead>Câu hỏi</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="h-12 w-16 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                      {item.coverImage ? (
                        <img
                          src={item.coverImage}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[11px] font-medium text-slate-400">
                          No image
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-slate-900">
                    {item.title}
                  </TableCell>
                  <TableCell>{item.level}</TableCell>
                  <TableCell>{item.type}</TableCell>
                  <TableCell>{item.topic}</TableCell>
                  <TableCell>{formatNumber(item.questionCount)}</TableCell>
                  <TableCell className="text-slate-500">
                    {formatDateTime(item.updatedAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button asChild type="button" size="sm" variant="outline" className="rounded-lg">
                        <Link href={`/admin/exercises/${item.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <DeleteConfirmButton
                        itemLabel={item.title}
                        onConfirm={() => handleDelete(item.id, item.title)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
