"use client";

import Link from "next/link";
import { useState } from "react";
import { BookOpen, Pencil, Plus, Search } from "lucide-react";

import { AdminPageError, AdminPageLoading } from "@/components/admin/admin-query-state";
import { DeleteConfirmButton } from "@/components/admin/delete-confirm-button";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useDeleteAdminVocabularyMutation,
  useGetAdminVocabularyQuery,
} from "@/store/services/adminApi";
import { formatDateTime, notify } from "@/lib/admin";

export default function AdminVocabulariesPage() {
  const { data, isLoading, isError, error } = useGetAdminVocabularyQuery();
  const [deleteVocabulary] = useDeleteAdminVocabularyMutation();
  const [query, setQuery] = useState("");

  const items = data ?? [];
  const filteredItems = items.filter((item) => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return true;
    return (
      item.name.toLowerCase().includes(keyword) ||
      item.topic.toLowerCase().includes(keyword) ||
      item.level.toLowerCase().includes(keyword)
    );
  });

  const handleDelete = async (id: string, name: string) => {
    try {
      await deleteVocabulary(id).unwrap();
      notify({ title: "Đã xóa bộ từ vựng", type: "success" });
    } catch {
      notify({
        title: "Không thể xóa bộ từ vựng",
        message: `Vui lòng thử lại với "${name}".`,
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
            <h1 className="text-3xl font-bold tracking-tight">Vocabulary Sets</h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage vocabulary sets and their words.{" "}
              <span className="font-semibold">{items.length} total sets</span>
            </p>
          </div>
          <Link href="/admin/vocabularies/new">
            <Button size="sm">
              <Plus className="mr-1.5 h-4 w-4" />
              Create new
            </Button>
          </Link>
        </div>
      </section>

      <section className="rounded-[30px] border border-slate-200 bg-white px-6 py-7 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, topic, level..."
            className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-black"
          />
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Name</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Topic</TableHead>
                <TableHead>Words</TableHead>
                <TableHead>Cover</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-sm text-slate-500">
                    {query ? "No vocabulary sets match your search." : "No vocabulary sets yet."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-slate-400" />
                        <span className="font-semibold">{item.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold">
                        {item.level}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm capitalize text-slate-600">
                        {item.topic || "general"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-semibold">{item.wordCount}</span>
                    </TableCell>
                    <TableCell>
                      {item.coverImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.coverImageUrl}
                          alt={item.name}
                          className="h-8 w-12 rounded object-cover"
                        />
                      ) : (
                        <span className="text-xs text-slate-400">No image</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-500">
                        {formatDateTime(item.updatedAt)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/vocabularies/${item.id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Link>
                        <DeleteConfirmButton
                          itemLabel={item.name}
                          onConfirm={() => handleDelete(item.id, item.name)}
                          title="Xóa bộ từ vựng?"
                          description={`Xóa "${item.name}" và tất cả ${item.wordCount} từ bên trong? Hành động này không thể hoàn tác.`}
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
          Showing {filteredItems.length} of {items.length} sets
        </p>
      </section>
    </div>
  );
}
