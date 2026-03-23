"use client";

import { useEffect, useState } from "react";
import { Languages, Pencil, Plus, Search, Volume2 } from "lucide-react";
import {
  useCreateAdminVocabularyMutation,
  useDeleteAdminVocabularyMutation,
  useGetAdminVocabularyQuery,
  useUpdateAdminVocabularyMutation,
} from "@/lib/api/adminApi";
import {
  ADMIN_LEVEL_OPTIONS,
  formatDateTime,
  formatNumber,
  notify,
} from "@/lib/admin";
import type { AdminVocabularyItem, AdminVocabularyPayload } from "@/types";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

type VocabularyFormState = {
  word: string;
  meaning: string;
  phonetic: string;
  example: string;
  level: string;
  topic: string;
  imageUrl: string;
  audioUrl: string;
};

const emptyForm: VocabularyFormState = {
  word: "",
  meaning: "",
  phonetic: "",
  example: "",
  level: "A1",
  topic: "general",
  imageUrl: "",
  audioUrl: "",
};

function mapItemToForm(item: AdminVocabularyItem): VocabularyFormState {
  return {
    word: item.word,
    meaning: item.meaning,
    phonetic: item.phonetic,
    example: item.example,
    level: item.level,
    topic: item.topic,
    imageUrl: item.imageUrl,
    audioUrl: item.audioUrl,
  };
}

function buildPayload(form: VocabularyFormState): AdminVocabularyPayload {
  return {
    word: form.word.trim(),
    meaning: form.meaning.trim(),
    phonetic: form.phonetic.trim(),
    example: form.example.trim(),
    level: form.level,
    topic: form.topic.trim() || "general",
    imageUrl: form.imageUrl.trim(),
    audioUrl: form.audioUrl.trim(),
  };
}

export default function AdminVocabularyPage() {
  const { data, isLoading, isError, error } = useGetAdminVocabularyQuery();
  const [createItem, { isLoading: isCreating }] = useCreateAdminVocabularyMutation();
  const [updateItem, { isLoading: isUpdating }] = useUpdateAdminVocabularyMutation();
  const [deleteItem] = useDeleteAdminVocabularyMutation();

  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminVocabularyItem | null>(null);
  const [form, setForm] = useState<VocabularyFormState>(emptyForm);

  const items = data ?? [];
  const filteredItems = items.filter((item) => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return true;

    return (
      item.word.toLowerCase().includes(keyword) ||
      item.meaning.toLowerCase().includes(keyword) ||
      item.topic.toLowerCase().includes(keyword) ||
      item.level.toLowerCase().includes(keyword)
    );
  });

  useEffect(() => {
    if (!selectedId && filteredItems[0]) {
      setSelectedId(filteredItems[0].id);
      return;
    }

    if (selectedId && !filteredItems.some((item) => item.id === selectedId)) {
      setSelectedId(filteredItems[0]?.id ?? null);
    }
  }, [filteredItems, selectedId]);

  const selectedItem =
    filteredItems.find((item) => item.id === selectedId) ?? filteredItems[0] ?? null;

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

  const openCreate = () => {
    setEditingItem(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (item: AdminVocabularyItem) => {
    setEditingItem(item);
    setForm(mapItemToForm(item));
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const payload = buildPayload(form);

      if (!payload.word || !payload.meaning) {
        notify({
          title: "Thiếu dữ liệu",
          message: "Word và meaning là bắt buộc.",
          type: "warning",
        });
        return;
      }

      if (editingItem) {
        await updateItem({ id: editingItem.id, body: payload }).unwrap();
        notify({ title: "Đã cập nhật vocabulary", type: "success" });
      } else {
        await createItem(payload).unwrap();
        notify({ title: "Đã tạo vocabulary mới", type: "success" });
      }

      setDialogOpen(false);
      setForm(emptyForm);
    } catch {
      notify({
        title: "Không thể lưu vocabulary",
        message: "Kiểm tra lại dữ liệu nhập.",
        type: "error",
      });
    }
  };

  const handleDelete = async (item: AdminVocabularyItem) => {
    try {
      await deleteItem(item.id).unwrap();
      notify({ title: "Đã xóa vocabulary", type: "success" });
    } catch {
      notify({
        title: "Không thể xóa vocabulary",
        type: "error",
        message: "Vui lòng thử lại.",
      });
    }
  };

  return (
    <>
      <section className="rounded-[30px] border border-slate-200 bg-white px-6 py-7 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge
              variant="outline"
              className="rounded-full border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500"
            >
              Vocabulary Admin
            </Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              Quản trị vocabulary
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
              Tập trung vào bảng preview lớn, chỉnh sửa nhanh và quản lý từng mục
              từ vựng theo level, topic và media.
            </p>
          </div>

          <Button onClick={openCreate} className="rounded-xl">
            <Plus className="h-4 w-4" />
            Thêm từ vựng
          </Button>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <Card className="border-slate-200 py-5">
          <CardHeader>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>Vocabulary table</CardTitle>
                <CardDescription>
                  {formatNumber(filteredItems.length)} mục đang hiển thị
                </CardDescription>
              </div>
              <label className="relative w-full max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Tìm theo từ, nghĩa, topic..."
                  className="pl-9"
                />
              </label>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Word</TableHead>
                  <TableHead>Meaning</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Phonetic</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow
                    key={item.id}
                    className="cursor-pointer"
                    data-state={selectedItem?.id === item.id ? "selected" : undefined}
                    onClick={() => setSelectedId(item.id)}
                  >
                    <TableCell className="font-medium text-slate-900">
                      {item.word}
                    </TableCell>
                    <TableCell className="max-w-[220px] truncate text-slate-600">
                      {item.meaning}
                    </TableCell>
                    <TableCell>{item.level}</TableCell>
                    <TableCell>{item.topic}</TableCell>
                    <TableCell>{item.phonetic || "-"}</TableCell>
                    <TableCell className="text-slate-500">
                      {formatDateTime(item.updatedAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="rounded-lg"
                          onClick={(event) => {
                            event.stopPropagation();
                            openEdit(item);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <div onClick={(event) => event.stopPropagation()}>
                          <DeleteConfirmButton
                            itemLabel={item.word}
                            onConfirm={() => handleDelete(item)}
                          />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-slate-200 py-5">
          <CardHeader>
            <CardTitle>Preview vocabulary</CardTitle>
            <CardDescription>
              Thẻ xem nhanh để duyệt nghĩa, ví dụ và media.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedItem ? (
              <>
                <div className="rounded-3xl border border-slate-200 bg-[linear-gradient(135deg,_#fff7ed_0%,_#ffffff_55%,_#f8fafc_100%)] p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-2xl font-semibold tracking-tight text-slate-950">
                        {selectedItem.word}
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        {selectedItem.phonetic || "Chưa có phiên âm"}
                      </p>
                    </div>
                    <Languages className="h-5 w-5 text-amber-500" />
                  </div>
                  <p className="mt-5 text-sm leading-7 text-slate-700">
                    {selectedItem.meaning}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Level
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {selectedItem.level}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Topic
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {selectedItem.topic}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                  <p className="text-sm font-semibold text-slate-900">Ví dụ</p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {selectedItem.example || "Chưa có ví dụ minh họa."}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>Image</span>
                    <span className="font-medium text-slate-900">
                      {selectedItem.imageUrl ? "Available" : "N/A"}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
                    <span>Audio</span>
                    <span className="inline-flex items-center gap-2 font-medium text-slate-900">
                      <Volume2 className="h-4 w-4" />
                      {selectedItem.audioUrl ? "Available" : "N/A"}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500">Chưa có mục vocabulary nào.</p>
            )}
          </CardContent>
        </Card>
      </section>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Chỉnh sửa vocabulary" : "Tạo vocabulary mới"}
            </DialogTitle>
            <DialogDescription>
              Điền thông tin từ, nghĩa, ví dụ và liên kết media.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Word
              </label>
              <Input
                value={form.word}
                onChange={(event) =>
                  setForm((current) => ({ ...current, word: event.target.value }))
                }
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Phonetic
              </label>
              <Input
                value={form.phonetic}
                onChange={(event) =>
                  setForm((current) => ({ ...current, phonetic: event.target.value }))
                }
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Meaning
              </label>
              <Textarea
                rows={3}
                value={form.meaning}
                onChange={(event) =>
                  setForm((current) => ({ ...current, meaning: event.target.value }))
                }
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Example
              </label>
              <Textarea
                rows={3}
                value={form.example}
                onChange={(event) =>
                  setForm((current) => ({ ...current, example: event.target.value }))
                }
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Level
              </label>
              <select
                value={form.level}
                onChange={(event) =>
                  setForm((current) => ({ ...current, level: event.target.value }))
                }
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
              >
                {ADMIN_LEVEL_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Topic
              </label>
              <Input
                value={form.topic}
                onChange={(event) =>
                  setForm((current) => ({ ...current, topic: event.target.value }))
                }
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Image URL
              </label>
              <Input
                value={form.imageUrl}
                onChange={(event) =>
                  setForm((current) => ({ ...current, imageUrl: event.target.value }))
                }
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Audio URL
              </label>
              <Input
                value={form.audioUrl}
                onChange={(event) =>
                  setForm((current) => ({ ...current, audioUrl: event.target.value }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="rounded-xl"
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={() => void handleSubmit()}
              className="rounded-xl"
              disabled={isCreating || isUpdating}
            >
              {editingItem ? "Lưu thay đổi" : "Tạo vocabulary"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
