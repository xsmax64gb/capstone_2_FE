"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  Pencil,
  Plus,
  Search,
} from "lucide-react";
import {
  useCreateAdminExerciseMutation,
  useDeleteAdminExerciseMutation,
  useGetAdminExercisesQuery,
  useUpdateAdminExerciseMutation,
} from "@/lib/api/adminApi";
import {
  ADMIN_EXERCISE_TYPE_OPTIONS,
  ADMIN_LEVEL_OPTIONS,
  formatDateTime,
  formatNumber,
  notify,
} from "@/lib/admin";
import type { AdminExerciseItem, AdminExercisePayload } from "@/types";
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

type ExerciseFormState = {
  title: string;
  description: string;
  type: string;
  level: string;
  topic: string;
  coverImage: string;
  durationMinutes: string;
  rewardsXp: string;
  skillsText: string;
  questionsJson: string;
};

const emptyForm: ExerciseFormState = {
  title: "",
  description: "",
  type: "mcq",
  level: "A1",
  topic: "general",
  coverImage: "",
  durationMinutes: "8",
  rewardsXp: "0",
  skillsText: "",
  questionsJson: "[]",
};

function mapExerciseToForm(item: AdminExerciseItem): ExerciseFormState {
  return {
    title: item.title,
    description: item.description,
    type: item.type,
    level: item.level,
    topic: item.topic,
    coverImage: item.coverImage,
    durationMinutes: String(item.durationMinutes),
    rewardsXp: String(item.rewardsXp),
    skillsText: item.skills.join(", "),
    questionsJson: "[]",
  };
}

function buildPayload(form: ExerciseFormState): AdminExercisePayload {
  let questions: AdminExercisePayload["questions"] = [];

  try {
    const parsed = JSON.parse(form.questionsJson || "[]");
    questions = Array.isArray(parsed) ? parsed : [];
  } catch {
    throw new Error("Questions JSON không hợp lệ");
  }

  return {
    title: form.title.trim(),
    description: form.description.trim(),
    type: form.type,
    level: form.level,
    topic: form.topic.trim() || "general",
    coverImage: form.coverImage.trim(),
    durationMinutes: Number(form.durationMinutes) || 8,
    rewardsXp: Number(form.rewardsXp) || 0,
    skills: form.skillsText
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    questions,
  };
}

export default function AdminExercisesPage() {
  const { data, isLoading, isError, error } = useGetAdminExercisesQuery();
  const [createExercise, { isLoading: isCreating }] =
    useCreateAdminExerciseMutation();
  const [updateExercise, { isLoading: isUpdating }] =
    useUpdateAdminExerciseMutation();
  const [deleteExercise] = useDeleteAdminExerciseMutation();

  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminExerciseItem | null>(null);
  const [form, setForm] = useState<ExerciseFormState>(emptyForm);

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

  const openEdit = (item: AdminExerciseItem) => {
    setEditingItem(item);
    setForm(mapExerciseToForm(item));
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const payload = buildPayload(form);

      if (!payload.title) {
        notify({
          title: "Thiếu tiêu đề",
          message: "Exercise cần có title trước khi lưu.",
          type: "warning",
        });
        return;
      }

      if (editingItem) {
        await updateExercise({ id: editingItem.id, body: payload }).unwrap();
        notify({ title: "Đã cập nhật exercise", type: "success" });
      } else {
        await createExercise(payload).unwrap();
        notify({ title: "Đã tạo exercise mới", type: "success" });
      }

      setDialogOpen(false);
      setForm(emptyForm);
    } catch (submitError) {
      notify({
        title: "Không thể lưu exercise",
        message:
          submitError instanceof Error
            ? submitError.message
            : "Kiểm tra lại dữ liệu nhập.",
        type: "error",
      });
    }
  };

  const handleDelete = async (item: AdminExerciseItem) => {
    try {
      await deleteExercise(item.id).unwrap();
      notify({ title: "Đã xóa exercise", type: "success" });
    } catch {
      notify({
        title: "Không thể xóa exercise",
        message: "Vui lòng thử lại.",
        type: "error",
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
              Exercise Admin
            </Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              Quản trị exercises
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
              Bảng lớn để duyệt nội dung, preview nhanh và thao tác thêm, sửa,
              xóa ngay trong cùng một màn.
            </p>
          </div>

          <Button onClick={openCreate} className="rounded-xl">
            <Plus className="h-4 w-4" />
            Thêm exercise
          </Button>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
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
                  <TableRow
                    key={item.id}
                    className="cursor-pointer"
                    data-state={selectedItem?.id === item.id ? "selected" : undefined}
                    onClick={() => setSelectedId(item.id)}
                  >
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
                            itemLabel={item.title}
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
            <CardTitle>Preview exercise</CardTitle>
            <CardDescription>
              Xem nhanh metadata trước khi chỉnh sửa.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedItem ? (
              <>
                <div className="rounded-3xl border border-slate-200 bg-[linear-gradient(135deg,_#f8fafc_0%,_#eef6ff_100%)] p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {selectedItem.title}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {selectedItem.description || "Chưa có mô tả."}
                      </p>
                    </div>
                    <BookOpen className="h-5 w-5 text-sky-600" />
                  </div>
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
                      Type
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {selectedItem.type}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Duration
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {formatNumber(selectedItem.durationMinutes)} phút
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Reward
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      +{formatNumber(selectedItem.rewardsXp)} XP
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                  <p className="text-sm font-semibold text-slate-900">Skills</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedItem.skills.length > 0 ? (
                      selectedItem.skills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="outline"
                          className="rounded-full border-slate-200 bg-slate-50 text-slate-600"
                        >
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500">Chưa có skill.</span>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                  <p className="text-sm font-semibold text-slate-900">Thông tin thêm</p>
                  <div className="mt-3 space-y-3 text-sm text-slate-600">
                    <div className="flex items-center justify-between">
                      <span>Topic</span>
                      <span className="font-medium text-slate-900">
                        {selectedItem.topic}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Question count</span>
                      <span className="font-medium text-slate-900">
                        {formatNumber(selectedItem.questionCount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Updated at</span>
                      <span className="font-medium text-slate-900">
                        {formatDateTime(selectedItem.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500">Chưa có exercise nào.</p>
            )}
          </CardContent>
        </Card>
      </section>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Chỉnh sửa exercise" : "Tạo exercise mới"}
            </DialogTitle>
            <DialogDescription>
              Quản trị metadata và dữ liệu câu hỏi từ một form duy nhất.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Tiêu đề
              </label>
              <Input
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({ ...current, title: event.target.value }))
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
                Type
              </label>
              <select
                value={form.type}
                onChange={(event) =>
                  setForm((current) => ({ ...current, type: event.target.value }))
                }
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
              >
                {ADMIN_EXERCISE_TYPE_OPTIONS.map((option) => (
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
                Cover image
              </label>
              <Input
                value={form.coverImage}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    coverImage: event.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Duration (phút)
              </label>
              <Input
                type="number"
                value={form.durationMinutes}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    durationMinutes: event.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Rewards XP
              </label>
              <Input
                type="number"
                value={form.rewardsXp}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    rewardsXp: event.target.value,
                  }))
                }
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Mô tả
              </label>
              <Textarea
                rows={3}
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Skills (phân tách bằng dấu phẩy)
              </label>
              <Input
                value={form.skillsText}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    skillsText: event.target.value,
                  }))
                }
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Questions JSON
              </label>
              <Textarea
                rows={10}
                value={form.questionsJson}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    questionsJson: event.target.value,
                  }))
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
              {editingItem ? "Lưu thay đổi" : "Tạo exercise"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
