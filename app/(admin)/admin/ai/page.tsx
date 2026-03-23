"use client";

import { useEffect, useState } from "react";
import { BrainCircuit, Pencil, Plus, Search } from "lucide-react";
import {
  useCreateAdminAiLevelMutation,
  useDeleteAdminAiLevelMutation,
  useGetAdminAiLevelsQuery,
  useUpdateAdminAiLevelMutation,
} from "@/lib/api/adminApi";
import { ADMIN_LEVEL_OPTIONS, formatDateTime, formatNumber, notify } from "@/lib/admin";
import type { AdminAiLevelItem, AdminAiLevelPayload } from "@/types";
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
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

type AiFormState = {
  level: string;
  title: string;
  description: string;
  minPlacementLevel: string;
  isActive: boolean;
  stagesJson: string;
};

const emptyForm: AiFormState = {
  level: "A1",
  title: "",
  description: "",
  minPlacementLevel: "A1",
  isActive: true,
  stagesJson: "[]",
};

function mapItemToForm(item: AdminAiLevelItem): AiFormState {
  return {
    level: item.level,
    title: item.title,
    description: item.description,
    minPlacementLevel: item.minPlacementLevel,
    isActive: item.isActive,
    stagesJson: JSON.stringify(item.stages, null, 2),
  };
}

function buildPayload(form: AiFormState): AdminAiLevelPayload {
  let stages: AdminAiLevelPayload["stages"] = [];

  try {
    const parsed = JSON.parse(form.stagesJson || "[]");
    stages = Array.isArray(parsed) ? parsed : [];
  } catch {
    throw new Error("Stages JSON không hợp lệ");
  }

  return {
    level: form.level,
    title: form.title.trim(),
    description: form.description.trim(),
    minPlacementLevel: form.minPlacementLevel,
    isActive: form.isActive,
    stages,
  };
}

export default function AdminAiPage() {
  const { data, isLoading, isError, error } = useGetAdminAiLevelsQuery();
  const [createItem, { isLoading: isCreating }] = useCreateAdminAiLevelMutation();
  const [updateItem, { isLoading: isUpdating }] = useUpdateAdminAiLevelMutation();
  const [deleteItem] = useDeleteAdminAiLevelMutation();

  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminAiLevelItem | null>(null);
  const [form, setForm] = useState<AiFormState>(emptyForm);

  const items = data ?? [];
  const filteredItems = items.filter((item) => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return true;

    return (
      item.level.toLowerCase().includes(keyword) ||
      item.title.toLowerCase().includes(keyword) ||
      item.description.toLowerCase().includes(keyword)
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

  const openEdit = (item: AdminAiLevelItem) => {
    setEditingItem(item);
    setForm(mapItemToForm(item));
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const payload = buildPayload(form);

      if (!payload.title) {
        notify({
          title: "Thiếu tiêu đề",
          message: "AI level cần title trước khi lưu.",
          type: "warning",
        });
        return;
      }

      if (editingItem) {
        await updateItem({ id: editingItem.id, body: payload }).unwrap();
        notify({ title: "Đã cập nhật AI level", type: "success" });
      } else {
        await createItem(payload).unwrap();
        notify({ title: "Đã tạo AI level", type: "success" });
      }

      setDialogOpen(false);
      setForm(emptyForm);
    } catch (submitError) {
      notify({
        title: "Không thể lưu AI level",
        message:
          submitError instanceof Error
            ? submitError.message
            : "Kiểm tra lại stages JSON.",
        type: "error",
      });
    }
  };

  const handleDelete = async (item: AdminAiLevelItem) => {
    try {
      await deleteItem(item.id).unwrap();
      notify({ title: "Đã xóa AI level", type: "success" });
    } catch {
      notify({
        title: "Không thể xóa AI level",
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
              AI Admin
            </Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              Quản trị AI speaking
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
              Theo dõi cấu hình level, stage flow và trạng thái active của toàn bộ
              hành trình AI.
            </p>
          </div>

          <Button onClick={openCreate} className="rounded-xl">
            <Plus className="h-4 w-4" />
            Thêm AI level
          </Button>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <Card className="border-slate-200 py-5">
          <CardHeader>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>AI level table</CardTitle>
                <CardDescription>
                  {formatNumber(filteredItems.length)} cấu hình đang hiển thị
                </CardDescription>
              </div>
              <label className="relative w-full max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Tìm theo level, title..."
                  className="pl-9"
                />
              </label>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Level</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Min placement</TableHead>
                  <TableHead>Stages</TableHead>
                  <TableHead>Status</TableHead>
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
                      {item.level}
                    </TableCell>
                    <TableCell>{item.title}</TableCell>
                    <TableCell>{item.minPlacementLevel}</TableCell>
                    <TableCell>{formatNumber(item.stageCount)}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          item.isActive
                            ? "rounded-full border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "rounded-full border-slate-200 bg-slate-50 text-slate-500"
                        }
                      >
                        {item.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
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
            <CardTitle>Preview AI level</CardTitle>
            <CardDescription>
              Xem nhanh thứ tự stage và rule pass của level đang chọn.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedItem ? (
              <>
                <div className="rounded-3xl border border-slate-200 bg-[linear-gradient(135deg,_#eef6ff_0%,_#ffffff_55%,_#f8fafc_100%)] p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-sky-600">
                        {selectedItem.level}
                      </p>
                      <p className="mt-2 text-xl font-semibold text-slate-950">
                        {selectedItem.title}
                      </p>
                    </div>
                    <BrainCircuit className="h-5 w-5 text-sky-600" />
                  </div>
                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    {selectedItem.description || "Chưa có mô tả cho level này."}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Placement
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {selectedItem.minPlacementLevel}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Stages
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {formatNumber(selectedItem.stageCount)}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {selectedItem.stages.length > 0 ? (
                    selectedItem.stages.map((stage) => (
                      <div
                        key={`${selectedItem.id}-${stage.stageId}`}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-slate-900">
                            {stage.order}. {stage.name}
                          </p>
                          <Badge
                            variant="outline"
                            className="rounded-full border-slate-200 bg-slate-50 text-slate-600"
                          >
                            {stage.type}
                          </Badge>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {stage.objective}
                        </p>
                        <p className="mt-3 text-xs text-slate-500">
                          Pass: {stage.passRules.minScore} điểm, {stage.passRules.minTurns} turns
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                      Level này chưa có stage nào.
                    </div>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500">Chưa có cấu hình AI nào.</p>
            )}
          </CardContent>
        </Card>
      </section>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Chỉnh sửa AI level" : "Tạo AI level mới"}
            </DialogTitle>
            <DialogDescription>
              Quản lý title, activation và toàn bộ stage flow bằng JSON.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
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
                Min placement level
              </label>
              <select
                value={form.minPlacementLevel}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    minPlacementLevel: event.target.value,
                  }))
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
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Title
              </label>
              <Input
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({ ...current, title: event.target.value }))
                }
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Description
              </label>
              <Textarea
                rows={4}
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
              />
            </div>
            <div className="md:col-span-2 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Kích hoạt level</p>
                <p className="text-sm text-slate-500">
                  Cho phép level này xuất hiện trong hành trình AI.
                </p>
              </div>
              <Switch
                checked={form.isActive}
                onCheckedChange={(checked) =>
                  setForm((current) => ({ ...current, isActive: checked }))
                }
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Stages JSON
              </label>
              <Textarea
                rows={14}
                value={form.stagesJson}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    stagesJson: event.target.value,
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
              {editingItem ? "Lưu thay đổi" : "Tạo AI level"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
