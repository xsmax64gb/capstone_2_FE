"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, Languages, Pencil, Plus, Search, Sparkles, Upload } from "lucide-react";
import {
  useCreateAdminVocabularyMutation,
  useCreateAdminVocabularyWordMutation,
  useCreateAdminVocabularyWordsBulkMutation,
  useDeleteAdminVocabularyMutation,
  useDeleteAdminVocabularyWordMutation,
  useGetAdminVocabularyQuery,
  useUpdateAdminVocabularyMutation,
  useUpdateAdminVocabularyWordMutation,
} from "@/lib/api/adminApi";
import {
  ADMIN_LEVEL_OPTIONS,
  formatDateTime,
  formatNumber,
  notify,
} from "@/lib/admin";
import type {
  AdminVocabularyPayload,
  AdminVocabularySetItem,
  AdminVocabularyWordItem,
  AdminVocabularyWordPayload,
} from "@/types";
import { AdminPageError, AdminPageLoading } from "@/components/admin/admin-query-state";
import { DeleteConfirmButton } from "@/components/admin/delete-confirm-button";
import { ImageUploadPreview } from "@/components/admin/image-upload-preview";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type VocabularySetFormState = {
  name: string;
  description: string;
  level: string;
  topic: string;
  coverImageFile: File | null;
  currentCoverImageUrl: string;
  isActive: boolean;
  sortOrder: string;
};

type VocabularyWordFormState = {
  word: string;
  meaning: string;
  example: string;
};

const emptySetForm: VocabularySetFormState = {
  name: "",
  description: "",
  level: "A1",
  topic: "general",
  coverImageFile: null,
  currentCoverImageUrl: "",
  isActive: true,
  sortOrder: "0",
};

const emptyWordForm: VocabularyWordFormState = {
  word: "",
  meaning: "",
  example: "",
};

const BULK_WORD_IMPORT_TEMPLATE = `[
  {
    "word": "schedule",
    "meaning": "lich trinh",
    "example": "I check my schedule before every meeting."
  },
  {
    "word": "improve",
    "meaning": "cai thien"
  }
]`;

const mapBulkWordsToPayload = (input: unknown): AdminVocabularyWordPayload[] => {
  if (!Array.isArray(input)) {
    throw new Error("Dữ liệu import phải là một mảng JSON");
  }

  return input.map((item, index) => {
    if (!item || typeof item !== "object") {
      throw new Error(`Phần tử ${index + 1} không hợp lệ`);
    }

    const record = item as {
      word?: unknown;
      meaning?: unknown;
      example?: unknown;
    };

    const word = String(record.word || "").trim();
    const meaning = String(record.meaning || "").trim();

    if (!word || !meaning) {
      throw new Error(`Phần tử ${index + 1} đang thiếu word hoặc meaning`);
    }

    return {
      word,
      meaning,
      example: String(record.example || "").trim(),
    };
  });
};

const mapSetToForm = (item: AdminVocabularySetItem): VocabularySetFormState => ({
  name: item.name,
  description: item.description,
  level: item.level,
  topic: item.topic,
  coverImageFile: null,
  currentCoverImageUrl: item.coverImageUrl ?? "",
  isActive: item.isActive,
  sortOrder: String(item.sortOrder ?? 0),
});

const mapWordToForm = (item: AdminVocabularyWordItem): VocabularyWordFormState => ({
  word: item.word,
  meaning: item.meaning,
  example: item.example,
});

const buildSetPayload = (form: VocabularySetFormState): AdminVocabularyPayload => ({
  name: form.name.trim(),
  description: form.description.trim(),
  level: form.level,
  topic: form.topic.trim() || "general",
  coverImageFile: form.coverImageFile,
  isActive: form.isActive,
  sortOrder: Number.parseInt(form.sortOrder, 10) || 0,
});

const buildWordPayload = (form: VocabularyWordFormState): AdminVocabularyWordPayload => ({
  word: form.word.trim(),
  meaning: form.meaning.trim(),
  example: form.example.trim(),
});

export default function AdminVocabularyPage() {
  const { data, isLoading, isError, error } = useGetAdminVocabularyQuery();
  const [createSet, { isLoading: isCreatingSet }] = useCreateAdminVocabularyMutation();
  const [updateSet, { isLoading: isUpdatingSet }] = useUpdateAdminVocabularyMutation();
  const [deleteSet] = useDeleteAdminVocabularyMutation();
  const [createWord, { isLoading: isCreatingWord }] = useCreateAdminVocabularyWordMutation();
  const [createWordsBulk, { isLoading: isBulkImportingWords }] = useCreateAdminVocabularyWordsBulkMutation();
  const [updateWord, { isLoading: isUpdatingWord }] = useUpdateAdminVocabularyWordMutation();
  const [deleteWord] = useDeleteAdminVocabularyWordMutation();

  const [query, setQuery] = useState("");
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);

  const [setDialogOpen, setSetDialogOpen] = useState(false);
  const [editingSet, setEditingSet] = useState<AdminVocabularySetItem | null>(null);
  const [setForm, setSetForm] = useState<VocabularySetFormState>(emptySetForm);

  const [wordDialogOpen, setWordDialogOpen] = useState(false);
  const [wordDialogTab, setWordDialogTab] = useState<"single" | "bulk">("single");
  const [editingWord, setEditingWord] = useState<AdminVocabularyWordItem | null>(null);
  const [wordForm, setWordForm] = useState<VocabularyWordFormState>(emptyWordForm);
  const [bulkWordImportText, setBulkWordImportText] = useState(BULK_WORD_IMPORT_TEMPLATE);

  const items = data ?? [];

  const filteredSets = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) {
      return items;
    }

    return items.filter((item) =>
      [item.name, item.description, item.topic, item.level].join(" ").toLowerCase().includes(keyword)
    );
  }, [items, query]);

  useEffect(() => {
    if (!selectedSetId && filteredSets[0]) {
      setSelectedSetId(filteredSets[0].id);
      return;
    }

    if (selectedSetId && !filteredSets.some((item) => item.id === selectedSetId)) {
      setSelectedSetId(filteredSets[0]?.id ?? null);
    }
  }, [filteredSets, selectedSetId]);

  const selectedSet =
    filteredSets.find((item) => item.id === selectedSetId) ?? filteredSets[0] ?? null;

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

  const openCreateSet = () => {
    setEditingSet(null);
    setSetForm(emptySetForm);
    setSetDialogOpen(true);
  };

  const openEditSet = (item: AdminVocabularySetItem) => {
    setEditingSet(item);
    setSetForm(mapSetToForm(item));
    setSetDialogOpen(true);
  };

  const openCreateWord = () => {
    if (!selectedSet) {
      notify({
        title: "Chưa chọn bộ từ vựng",
        message: "Hãy chọn hoặc tạo bộ trước khi thêm từ.",
        type: "warning",
      });
      return;
    }

    setEditingWord(null);
    setWordDialogTab("single");
    setWordForm(emptyWordForm);
    setWordDialogOpen(true);
  };

  const openEditWord = (item: AdminVocabularyWordItem) => {
    setEditingWord(item);
    setWordDialogTab("single");
    setWordForm(mapWordToForm(item));
    setWordDialogOpen(true);
  };

  const handleSubmitSet = async () => {
    try {
      const payload = buildSetPayload(setForm);
      if (!payload.name) {
        notify({
          title: "Thiếu dữ liệu",
          message: "Tên bộ từ vựng là bắt buộc.",
          type: "warning",
        });
        return;
      }
      if (!editingSet && !payload.coverImageFile) {
        notify({
          title: "Thiếu ảnh bìa",
          message: "Vui lòng upload ảnh bìa cho bộ từ vựng mới.",
          type: "warning",
        });
        return;
      }

      if (editingSet) {
        await updateSet({ id: editingSet.id, body: payload }).unwrap();
        notify({ title: "Đã cập nhật bộ từ vựng", type: "success" });
      } else {
        await createSet(payload).unwrap();
        notify({ title: "Đã tạo bộ từ vựng", type: "success" });
      }

      setSetDialogOpen(false);
      setSetForm(emptySetForm);
    } catch {
      notify({
        title: "Không thể lưu bộ từ vựng",
        message: "Vui lòng kiểm tra lại dữ liệu.",
        type: "error",
      });
    }
  };

  const handleDeleteSet = async (item: AdminVocabularySetItem) => {
    try {
      await deleteSet(item.id).unwrap();
      notify({ title: "Đã xóa bộ từ vựng", type: "success" });
    } catch {
      notify({
        title: "Không thể xóa bộ từ vựng",
        message: "Vui lòng thử lại.",
        type: "error",
      });
    }
  };

  const handleSubmitWord = async () => {
    if (!selectedSet) {
      notify({
        title: "Chưa chọn bộ từ vựng",
        message: "Hãy chọn bộ trước khi lưu từ mới.",
        type: "warning",
      });
      return;
    }

    try {
      const payload = buildWordPayload(wordForm);
      if (!payload.word || !payload.meaning) {
        notify({
          title: "Thiếu dữ liệu",
          message: "Word và meaning là bắt buộc.",
          type: "warning",
        });
        return;
      }

      if (editingWord) {
        await updateWord({
          setId: selectedSet.id,
          wordId: editingWord.id,
          body: payload,
        }).unwrap();
        notify({ title: "Đã cập nhật từ vựng", type: "success" });
      } else {
        await createWord({
          setId: selectedSet.id,
          body: payload,
        }).unwrap();
        notify({ title: "Đã thêm từ vựng", type: "success" });
      }

      setWordDialogOpen(false);
      setWordForm(emptyWordForm);
    } catch {
      notify({
        title: "Không thể lưu từ vựng",
        message: "Vui lòng kiểm tra lại dữ liệu.",
        type: "error",
      });
    }
  };

  const applyBulkWordImport = async (mode: "append" | "replace") => {
    if (!selectedSet) {
      notify({
        title: "Chưa chọn bộ từ vựng",
        message: "Hãy chọn bộ trước khi import.",
        type: "warning",
      });
      return;
    }

    try {
      const parsed = JSON.parse(bulkWordImportText);
      const items = mapBulkWordsToPayload(parsed);

      if (!items.length) {
        notify({
          title: "Dữ liệu rỗng",
          message: "Danh sách import không có từ nào hợp lệ.",
          type: "warning",
        });
        return;
      }

      const response = await createWordsBulk({
        setId: selectedSet.id,
        body: {
          mode,
          items,
        },
      }).unwrap();

      notify({
        title: mode === "replace" ? "Đã thay toàn bộ từ vựng" : "Đã import từ vựng",
        message:
          mode === "replace"
            ? `Đã thêm ${formatNumber(response.insertedCount)} từ, thay thế ${formatNumber(response.replacedDeletedCount)} từ cũ.`
            : `Đã thêm ${formatNumber(response.insertedCount)} từ vào bộ.`,
        type: "success",
      });
    } catch (bulkError) {
      notify({
        title: "Không thể import từ vựng",
        message:
          bulkError instanceof Error
            ? bulkError.message
            : "Kiểm tra lại định dạng JSON mẫu.",
        type: "error",
      });
    }
  };

  const handleDeleteWord = async (item: AdminVocabularyWordItem) => {
    if (!selectedSet) {
      return;
    }

    try {
      await deleteWord({ setId: selectedSet.id, wordId: item.id }).unwrap();
      notify({ title: "Đã xóa từ vựng", type: "success" });
    } catch {
      notify({
        title: "Không thể xóa từ vựng",
        message: "Vui lòng thử lại.",
        type: "error",
      });
    }
  };

  const renderSingleWordForm = () => (
    <>
      <div className="grid gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Word</label>
          <Input
            value={wordForm.word}
            onChange={(event) =>
              setWordForm((current) => ({ ...current, word: event.target.value }))
            }
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Meaning
          </label>
          <Textarea
            rows={2}
            value={wordForm.meaning}
            onChange={(event) =>
              setWordForm((current) => ({ ...current, meaning: event.target.value }))
            }
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Example
          </label>
          <Textarea
            rows={2}
            value={wordForm.example}
            onChange={(event) =>
              setWordForm((current) => ({ ...current, example: event.target.value }))
            }
          />
        </div>
      </div>
    </>
  );

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
              Quản trị bộ từ vựng
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
              Admin có thể tạo bộ từ vựng cho học sinh, sau đó thêm và quản lý từng
              từ trong mỗi bộ.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={openCreateSet} variant="outline" className="rounded-xl">
              <Plus className="h-4 w-4" />
              Thêm bộ từ vựng
            </Button>
            <Button onClick={openCreateWord} className="rounded-xl">
              <BookOpen className="h-4 w-4" />
              Thêm từ vào bộ
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="border-slate-200 py-5">
          <CardHeader>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>Danh sách bộ từ vựng</CardTitle>
                <CardDescription>
                  {formatNumber(filteredSets.length)} bộ đang hiển thị
                </CardDescription>
              </div>
              <label className="relative w-full max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Tìm theo tên bộ, topic, level..."
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
                  <TableHead>Tên bộ</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Từ vựng</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSets.map((item) => (
                  <TableRow
                    key={item.id}
                    className="cursor-pointer"
                    data-state={selectedSet?.id === item.id ? "selected" : undefined}
                    onClick={() => setSelectedSetId(item.id)}
                  >
                    <TableCell>
                      {item.coverImageUrl ? (
                        <img
                          src={item.coverImageUrl}
                          alt={`Cover ${item.name}`}
                          className="h-10 w-16 rounded-md border border-slate-200 object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-16 items-center justify-center rounded-md border border-dashed border-slate-300 text-[10px] text-slate-400">
                          N/A
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">{item.name}</TableCell>
                    <TableCell>{item.level}</TableCell>
                    <TableCell>{item.topic}</TableCell>
                    <TableCell>{formatNumber(item.wordCount ?? item.words.length)}</TableCell>
                    <TableCell>{item.isActive ? "Active" : "Hidden"}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="rounded-lg"
                          onClick={(event) => {
                            event.stopPropagation();
                            openEditSet(item);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <div onClick={(event) => event.stopPropagation()}>
                          <DeleteConfirmButton
                            itemLabel={item.name}
                            onConfirm={() => handleDeleteSet(item)}
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
            <CardTitle>Chi tiết bộ từ vựng</CardTitle>
            <CardDescription>
              {selectedSet
                ? `Cập nhật từ vựng cho bộ "${selectedSet.name}"`
                : "Chọn một bộ để xem danh sách từ"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedSet ? (
              <>
                <div className="rounded-3xl border border-slate-200 bg-[linear-gradient(135deg,_#fff7ed_0%,_#ffffff_55%,_#f8fafc_100%)] p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-2xl font-semibold tracking-tight text-slate-950">
                        {selectedSet.name}
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        {selectedSet.topic} • {selectedSet.level} •{" "}
                        {selectedSet.isActive ? "Active" : "Hidden"}
                      </p>
                    </div>
                    <Languages className="h-5 w-5 text-amber-500" />
                  </div>
                  <p className="mt-5 text-sm leading-7 text-slate-700">
                    {selectedSet.description || "Chưa có mô tả cho bộ từ vựng này."}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                    <p className="text-sm font-semibold text-slate-900">
                      Danh sách từ ({formatNumber(selectedSet.words.length)})
                    </p>
                    <Button size="sm" onClick={openCreateWord} className="rounded-lg">
                      <Plus className="h-4 w-4" />
                      Thêm từ
                    </Button>
                  </div>

                  {selectedSet.words.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Word</TableHead>
                          <TableHead>Meaning</TableHead>
                          <TableHead>Updated</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedSet.words.map((word) => (
                          <TableRow key={word.id}>
                            <TableCell className="font-medium">{word.word}</TableCell>
                            <TableCell className="max-w-[220px] truncate text-slate-600">
                              {word.meaning}
                            </TableCell>
                            <TableCell className="text-slate-500">
                              {formatDateTime(word.updatedAt)}
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="rounded-lg"
                                  onClick={() => openEditWord(word)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <DeleteConfirmButton
                                  itemLabel={word.word}
                                  onConfirm={() => handleDeleteWord(word)}
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="px-4 py-6 text-sm text-slate-500">
                      Bộ này chưa có từ vựng nào.
                    </p>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500">Chưa có bộ từ vựng nào.</p>
            )}
          </CardContent>
        </Card>
      </section>

      <Dialog open={setDialogOpen} onOpenChange={setSetDialogOpen}>
        <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingSet ? "Chỉnh sửa bộ từ vựng" : "Tạo bộ từ vựng mới"}
            </DialogTitle>
            <DialogDescription>
              Nhập thông tin bộ từ vựng cho học sinh.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Tên bộ
              </label>
              <Input
                value={setForm.name}
                onChange={(event) =>
                  setSetForm((current) => ({ ...current, name: event.target.value }))
                }
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Mô tả
              </label>
              <Textarea
                rows={3}
                value={setForm.description}
                onChange={(event) =>
                  setSetForm((current) => ({ ...current, description: event.target.value }))
                }
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Level
              </label>
              <select
                value={setForm.level}
                onChange={(event) =>
                  setSetForm((current) => ({ ...current, level: event.target.value }))
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
                value={setForm.topic}
                onChange={(event) =>
                  setSetForm((current) => ({ ...current, topic: event.target.value }))
                }
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Cover image
              </label>
              <Input
                type="file"
                accept="image/*"
                onChange={(event) =>
                  setSetForm((current) => ({
                    ...current,
                    coverImageFile: event.target.files?.[0] ?? null,
                  }))
                }
              />
              <div className="mt-3 max-w-xs">
                <ImageUploadPreview
                  file={setForm.coverImageFile}
                  currentUrl={setForm.currentCoverImageUrl}
                  alt="Vocabulary set cover preview"
                  emptyText="Chọn ảnh bìa cho bộ từ vựng."
                  ratio={16 / 9}
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {setForm.coverImageFile
                  ? `Đã chọn: ${setForm.coverImageFile.name}`
                  : setForm.currentCoverImageUrl
                    ? "Giữ ảnh hiện tại nếu không chọn ảnh mới."
                    : "Hãy chọn ảnh bìa để học sinh dễ nhận diện bộ từ vựng."}
              </p>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Sort order
              </label>
              <Input
                value={setForm.sortOrder}
                onChange={(event) =>
                  setSetForm((current) => ({ ...current, sortOrder: event.target.value }))
                }
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Trạng thái
              </label>
              <select
                value={setForm.isActive ? "active" : "hidden"}
                onChange={(event) =>
                  setSetForm((current) => ({
                    ...current,
                    isActive: event.target.value === "active",
                  }))
                }
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
              >
                <option value="active">Active</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSetDialogOpen(false)}
              className="rounded-xl"
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={() => void handleSubmitSet()}
              className="rounded-xl"
              disabled={isCreatingSet || isUpdatingSet}
            >
              {editingSet ? "Lưu thay đổi" : "Tạo bộ từ vựng"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={wordDialogOpen} onOpenChange={setWordDialogOpen}>
        <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingWord ? "Chỉnh sửa từ vựng" : "Thêm từ vựng vào bộ"}
            </DialogTitle>
            <DialogDescription>
              {selectedSet
                ? `Bộ hiện tại: ${selectedSet.name}`
                : "Chọn bộ từ vựng trước khi thêm từ."}
            </DialogDescription>
          </DialogHeader>

          {editingWord ? (
            renderSingleWordForm()
          ) : (
            <Tabs
              value={wordDialogTab}
              onValueChange={(value) => setWordDialogTab(value as "single" | "bulk")}
              className="gap-4"
            >
              <TabsList className="w-full justify-start rounded-xl bg-slate-100 p-1 md:w-fit">
                <TabsTrigger value="single">Thêm từng từ</TabsTrigger>
                <TabsTrigger value="bulk">Thêm nhiều từ</TabsTrigger>
              </TabsList>

              <TabsContent value="single" className="space-y-4">
                {renderSingleWordForm()}
              </TabsContent>

              <TabsContent value="bulk" className="space-y-4">
                <Card className="border-slate-200 bg-white py-5 shadow-none">
                  <CardHeader>
                    <CardTitle className="text-base">Mẫu import nhiều từ</CardTitle>
                    <CardDescription>
                      Dán mảng JSON theo định dạng hệ thống để thêm nhanh từ vựng.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                      <p className="font-medium text-slate-900">Quy định</p>
                      <p className="mt-2">Mỗi phần tử cần có `word`, `meaning`.</p>
                      <p className="mt-1">`example` là tùy chọn.</p>
                      <p className="mt-1">Không cần nhập phonetic, audio, synonyms, antonyms.</p>
                    </div>
                    <Textarea
                      rows={16}
                      value={bulkWordImportText}
                      onChange={(event) => setBulkWordImportText(event.target.value)}
                      className="font-mono text-xs"
                    />
                  </CardContent>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => void applyBulkWordImport("append")}
                      disabled={isBulkImportingWords}
                    >
                      <Upload className="h-4 w-4" />
                      Thêm vào bộ hiện tại
                    </Button>
                    <Button
                      type="button"
                      className="rounded-xl"
                      onClick={() => void applyBulkWordImport("replace")}
                      disabled={isBulkImportingWords}
                    >
                      <Sparkles className="h-4 w-4" />
                      Thay toàn bộ từ trong bộ
                    </Button>
                  </DialogFooter>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setWordDialogOpen(false)}
              className="rounded-xl"
            >
              Hủy
            </Button>
            {editingWord || wordDialogTab === "single" ? (
              <Button
                type="button"
                onClick={() => void handleSubmitWord()}
                className="rounded-xl"
                disabled={isCreatingWord || isUpdatingWord}
              >
                {editingWord ? "Lưu thay đổi" : "Thêm từ vựng"}
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
