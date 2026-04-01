"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Pencil, Plus, Route, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

import { AdminPageError, AdminPageLoading } from "@/components/admin/admin-query-state";
import { DeleteConfirmButton } from "@/components/admin/delete-confirm-button";
import { LearnMapAiCreateButton } from "@/components/admin/learn-map-ai-create-button";
import { LearnStepAiCreateButton } from "@/components/admin/learn-step-ai-create-button";
import { AdminRoute } from "@/components/auth/admin-route";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { formatNumber, notify } from "@/lib/admin";
import {
  useCreateAdminLearnMapMutation,
  useDeleteAdminLearnMapMutation,
  useDeleteAdminLearnStepMutation,
  useGetAdminLearnMapsQuery,
  useGetAdminLearnStepsQuery,
  useUpdateAdminLearnMapMutation,
} from "@/lib/api/learnApi";
import { handleApiError } from "@/lib/api-error-handler";
import {
  clearLearnMapAiDraft,
  loadLearnMapAiDraft,
} from "@/lib/learn-map-ai-draft";

type Props = {
  mapId?: string;
  source?: string;
};

type LearnMapFormState = {
  title: string;
  slug: string;
  description: string;
  theme: string;
  level: string;
  order: string;
  requiredXPToComplete: string;
  bossXPReward: string;
  isPublished: boolean;
};

const emptyForm: LearnMapFormState = {
  title: "",
  slug: "",
  description: "",
  theme: "",
  level: "1",
  order: "0",
  requiredXPToComplete: "0",
  bossXPReward: "50",
  isPublished: true,
};

const createSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

function mapToForm(map: NonNullable<ReturnType<typeof useGetAdminLearnMapsQuery>["data"]>["items"][number]) {
  return {
    title: map.title,
    slug: map.slug,
    description: map.description,
    theme: map.theme || "",
    level: String(map.level ?? 1),
    order: String(map.order ?? 0),
    requiredXPToComplete: String(map.requiredXPToComplete ?? 0),
    bossXPReward: String(map.bossXPReward ?? 0),
    isPublished: Boolean(map.isPublished),
  };
}

function formatRequiredXp(value: number, totalXP: number) {
  if (value > 0) {
    return `${formatNumber(value)} XP`;
  }

  return `Tự động (${formatNumber(totalXP)} XP)`;
}

export function LearnMapEditorScreen({ mapId, source }: Props) {
  const router = useRouter();
  const isEdit = Boolean(mapId);
  const { data, isLoading, isError } = useGetAdminLearnMapsQuery();
  const map = data?.items?.find((item) => item.id === mapId);
  const {
    data: stepsData,
    isLoading: stepsLoading,
    isError: isStepsError,
  } = useGetAdminLearnStepsQuery(mapId ?? "", {
    skip: !mapId,
  });

  const [form, setForm] = useState<LearnMapFormState>(emptyForm);
  const [isInitializingForm, setIsInitializingForm] = useState(!isEdit);
  const [draftSource, setDraftSource] = useState<"manual" | "ai">("manual");
  const [createMap, { isLoading: isCreating }] = useCreateAdminLearnMapMutation();
  const [updateMap, { isLoading: isUpdating }] = useUpdateAdminLearnMapMutation();
  const [deleteMap] = useDeleteAdminLearnMapMutation();
  const [deleteStep] = useDeleteAdminLearnStepMutation();

  useEffect(() => {
    if (!isEdit) {
      return;
    }

    if (!map) {
      return;
    }

    setForm(mapToForm(map));
  }, [isEdit, map]);

  useEffect(() => {
    if (isEdit) {
      clearLearnMapAiDraft();
      setIsInitializingForm(false);
      return;
    }

    if (source === "ai") {
      const aiDraft = loadLearnMapAiDraft();

      if (aiDraft) {
        setForm({
          title: aiDraft.title,
          slug: aiDraft.slug,
          description: aiDraft.description,
          theme: aiDraft.theme,
          level: String(aiDraft.level ?? 1),
          order: String(aiDraft.order ?? 0),
          requiredXPToComplete: String(aiDraft.requiredXPToComplete ?? 0),
          bossXPReward: String(aiDraft.bossXPReward ?? 0),
          isPublished: Boolean(aiDraft.isPublished),
        });
        setDraftSource("ai");
      } else {
        setForm(emptyForm);
        setDraftSource("manual");
        notify({
          title: "Không tìm thấy AI draft",
          message: "Draft AI đã hết hoặc chưa được tạo. Hệ thống mở form thủ công.",
          type: "warning",
        });
      }

      setIsInitializingForm(false);
      return;
    }

    clearLearnMapAiDraft();
    setForm(emptyForm);
    setDraftSource("manual");
    setIsInitializingForm(false);
  }, [isEdit, source]);

  const steps = stepsData?.items ?? [];
  const totalStepXP = useMemo(
    () => steps.reduce((sum, step) => sum + (step.xpReward ?? 0), 0),
    [steps],
  );
  const nextStepOrder = useMemo(
    () => (steps.length > 0 ? Math.max(...steps.map((step) => step.order ?? 0)) + 1 : 0),
    [steps],
  );

  const setField = <K extends keyof LearnMapFormState>(key: K, value: LearnMapFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.title.trim()) {
      notify({ title: "Thiếu tên bản đồ", type: "error" });
      return;
    }

    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim() || createSlug(form.title),
      description: form.description.trim(),
      theme: form.theme.trim(),
      level: Number(form.level || 1),
      order: Number(form.order || 0),
      requiredXPToComplete: Number(form.requiredXPToComplete || 0),
      bossXPReward: Number(form.bossXPReward || 0),
      isPublished: form.isPublished,
    };

    try {
      if (isEdit && mapId) {
        await updateMap({ id: mapId, body: payload }).unwrap();
        notify({ title: "Đã cập nhật bản đồ", type: "success" });
      } else {
        const response = await createMap(payload).unwrap();
        clearLearnMapAiDraft();
        notify({ title: "Đã tạo bản đồ mới", type: "success" });
        router.push(`/admin/learn/maps/${response.map.id}`);
        return;
      }
    } catch (error) {
      const apiError = handleApiError(error);
      notify({
        title: "Không thể lưu bản đồ",
        message: apiError.message,
        type: "error",
      });
    }
  };

  const handleDeleteMap = async () => {
    if (!mapId || !map) return;

    try {
      await deleteMap(mapId).unwrap();
      notify({ title: "Đã xóa bản đồ", type: "success" });
      router.push("/admin/learn/maps");
    } catch (error) {
      const apiError = handleApiError(error);
      notify({
        title: "Không thể xóa bản đồ",
        message: apiError.message,
        type: "error",
      });
    }
  };

  const handleDeleteStep = async (stepId: string, stepTitle: string) => {
    if (!mapId) return;

    try {
      await deleteStep({ id: stepId, mapId }).unwrap();
      notify({
        title: "Đã xóa step",
        message: stepTitle,
        type: "success",
      });
    } catch (error) {
      const apiError = handleApiError(error);
      notify({
        title: "Không thể xóa step",
        message: apiError.message,
        type: "error",
      });
    }
  };

  if (isEdit && isLoading) {
    return <AdminPageLoading />;
  }

  if (!isEdit && isInitializingForm) {
    return <AdminPageLoading />;
  }

  if (isEdit && (isError || !map)) {
    return <AdminPageError message="Không tìm thấy bản đồ cần chỉnh sửa." />;
  }

  return (
    <AdminRoute>
      <div className="space-y-6">
        <section className="rounded-[30px] border border-slate-200 bg-white px-6 py-7 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Link
                href="/admin/learn/maps"
                className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-black"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to maps
              </Link>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
                {isEdit ? "Chỉnh sửa map học" : "Tạo map học"}
              </h1>
              {!isEdit && draftSource === "ai" ? (
                <Badge
                  variant="outline"
                  className="mt-3 rounded-full border-emerald-200 bg-emerald-50 text-emerald-700"
                >
                  Draft từ AI
                </Badge>
              ) : null}
              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                {isEdit
                  ? "Chỉnh sửa cấu hình map tại đây. Việc tạo hoặc sửa chặng sẽ mở sang trang riêng để thao tác dễ hơn."
                  : "Tạo map mới trước, sau đó dùng nút Tạo chặng ở màn hình chỉnh sửa để mở trang tạo chặng riêng."}
              </p>
            </div>

            {!isEdit ? <LearnMapAiCreateButton className="rounded-xl" /> : null}
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_360px]">
          <div className="space-y-6">
            <Card className="border-slate-200 py-5">
              <CardHeader>
                <CardTitle>Map settings</CardTitle>
                <CardDescription>
                  Cấu hình level, XP và trạng thái xuất bản của bản đồ học.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="map-title">Title</Label>
                      <Input
                        id="map-title"
                        value={form.title}
                        onChange={(event) => setField("title", event.target.value)}
                        placeholder="Airport 101"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="map-slug">Slug</Label>
                      <Input
                        id="map-slug"
                        value={form.slug}
                        onChange={(event) => setField("slug", event.target.value)}
                        placeholder="airport-101"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="map-description">Description</Label>
                      <Textarea
                        id="map-description"
                        rows={4}
                        value={form.description}
                        onChange={(event) => setField("description", event.target.value)}
                        placeholder="Mô tả ngắn gọn mục tiêu của map..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="map-theme">Theme</Label>
                      <Input
                        id="map-theme"
                        value={form.theme}
                        onChange={(event) => setField("theme", event.target.value)}
                        placeholder="travel"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="map-level">Level</Label>
                      <Input
                        id="map-level"
                        type="number"
                        min={1}
                        value={form.level}
                        onChange={(event) => setField("level", event.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="map-order">Order</Label>
                      <Input
                        id="map-order"
                        type="number"
                        min={0}
                        value={form.order}
                        onChange={(event) => setField("order", event.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="map-required-xp">XP required to complete</Label>
                      <Input
                        id="map-required-xp"
                        type="number"
                        min={0}
                        value={form.requiredXPToComplete}
                        onChange={(event) => setField("requiredXPToComplete", event.target.value)}
                      />
                      <p className="text-xs text-slate-500">
                        Đặt `0` để hệ thống tự dùng tổng XP hiện có trong map.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="map-boss-xp">Boss XP reward</Label>
                      <Input
                        id="map-boss-xp"
                        type="number"
                        min={0}
                        value={form.bossXPReward}
                        onChange={(event) => setField("bossXPReward", event.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <div>
                      <p className="font-semibold text-slate-900">Published</p>
                      <p className="text-sm text-slate-500">
                        Bật để người học có thể thấy bản đồ này trong lộ trình.
                      </p>
                    </div>
                    <Switch
                      checked={form.isPublished}
                      onCheckedChange={(checked) => setField("isPublished", checked)}
                    />
                  </div>

                  <div className="flex flex-wrap justify-end gap-3">
                    <Button
                      type="submit"
                      className="rounded-xl"
                      disabled={isCreating || isUpdating}
                    >
                      {isCreating || isUpdating
                        ? "Saving..."
                        : isEdit
                          ? "Save map"
                          : "Create map"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {isEdit ? (
              <Card className="border-slate-200 py-5">
                <CardHeader>
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <CardTitle>Steps in this map</CardTitle>
                      <CardDescription>
                        Step được quản lý theo trang riêng để thao tác nhanh và dễ đọc hơn.
                      </CardDescription>
                    </div>
                    {mapId ? (
                      <div className="flex flex-wrap gap-2">
                        <LearnStepAiCreateButton
                          mapId={mapId}
                          nextOrder={nextStepOrder}
                          className="rounded-xl"
                        />
                        <Button asChild className="rounded-xl">
                          <Link href={`/admin/learn/maps/${mapId}/steps/new`}>
                            <Plus className="h-4 w-4" />
                            Tạo chặng
                          </Link>
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </CardHeader>
                <CardContent>
                  {stepsLoading ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">
                      Đang tải danh sách step...
                    </div>
                  ) : isStepsError ? (
                    <AdminPageError message="Không tải được danh sách step." />
                  ) : (
                    <div className="overflow-hidden rounded-xl border border-slate-200">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50">
                            <TableHead>Order</TableHead>
                            <TableHead>Step</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Difficulty</TableHead>
                            <TableHead>Pass</TableHead>
                            <TableHead>XP</TableHead>
                            <TableHead>Turns</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {steps.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={8} className="h-24 text-center text-sm text-slate-500">
                                Chưa có chặng nào trong map này. Bấm "Tạo chặng" để mở trang tạo chặng riêng.
                              </TableCell>
                            </TableRow>
                          ) : (
                            steps.map((step) => (
                              <TableRow key={step.id}>
                                <TableCell className="font-semibold">
                                  {formatNumber(step.order ?? 0)}
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    <p className="font-semibold text-slate-900">{step.title}</p>
                                    <p className="text-xs text-slate-500">
                                      {step.scenarioTitle || "Chưa có scenario title"}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="rounded-full">
                                    {step.type}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="rounded-full border-slate-200 bg-slate-50">
                                    {step.gradingDifficulty || "medium"}
                                  </Badge>
                                </TableCell>
                                <TableCell>{step.minimumPassScore ?? "auto"}</TableCell>
                                <TableCell>{formatNumber(step.xpReward ?? 0)}</TableCell>
                                <TableCell>{formatNumber(step.minTurns ?? 0)}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <Link
                                      href={`/admin/learn/maps/${mapId}/steps/${step.id}`}
                                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                      Edit
                                    </Link>
                                    <DeleteConfirmButton
                                      itemLabel={step.title}
                                      title="Xóa step?"
                                      description={`Xóa step "${step.title}" khỏi map này? Hành động này không thể hoàn tác.`}
                                      confirmLabel="Xóa"
                                      cancelLabel="Hủy"
                                      onConfirm={() => handleDeleteStep(step.id, step.title)}
                                    />
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : null}
          </div>

          <div className="space-y-6">
            <Card className="border-slate-200 py-5">
              <CardHeader>
                <CardTitle>Summary</CardTitle>
                <CardDescription>
                  Tổng quan nhanh để kiểm tra trước khi lưu.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Map title
                  </p>
                  <p className="mt-2 font-semibold text-slate-900">{form.title || "Untitled map"}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Level / Order
                    </p>
                    <p className="mt-2 text-sm text-slate-700">
                      Level {formatNumber(Number(form.level || 1))} · Order {formatNumber(Number(form.order || 0))}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Status
                    </p>
                    <p className="mt-2 text-sm text-slate-700">
                      {form.isPublished ? "Published" : "Draft"}
                    </p>
                  </div>
                </div>

                {isEdit && map ? (
                  <>
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        XP available
                      </p>
                      <p className="mt-2 text-sm text-slate-700">
                        Tổng map: {formatNumber(map.totalXP ?? 0)} XP
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Step XP: {formatNumber(totalStepXP)} · Boss bonus: {formatNumber(Number(form.bossXPReward || 0))}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Required XP
                      </p>
                      <p className="mt-2 text-sm text-slate-700">
                        {formatRequiredXp(map.requiredXPToComplete ?? 0, map.totalXP ?? 0)}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Steps
                      </p>
                      <p className="mt-2 text-sm text-slate-700">{formatNumber(steps.length)} step(s)</p>
                    </div>
                  </>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                    Sau khi tạo map, bạn sẽ dùng nút "Tạo chặng" để mở sang trang tạo chặng riêng.
                  </div>
                )}

                {isEdit ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50/70 px-4 py-4">
                    <div className="flex items-start gap-3">
                      <Route className="mt-0.5 h-4 w-4 text-rose-600" />
                      <div className="space-y-3">
                        <div>
                          <p className="font-semibold text-rose-900">Danger zone</p>
                          <p className="mt-1 text-sm text-rose-700">
                            Xóa map sẽ xóa luôn toàn bộ step bên trong.
                          </p>
                        </div>
                        <DeleteConfirmButton
                          itemLabel={map?.title || "map"}
                          title="Xóa bản đồ học?"
                          description={`Xóa bản đồ "${map?.title}" cùng tất cả step bên trong? Hành động này không thể hoàn tác.`}
                          confirmLabel="Xóa map"
                          cancelLabel="Hủy"
                          onConfirm={handleDeleteMap}
                        />
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                  <div className="flex items-start gap-3">
                    <Sparkles className="mt-0.5 h-4 w-4 text-slate-500" />
                    <p>
                      Danh sách map sẽ được sắp theo <strong>level</strong> rồi đến <strong>order</strong>,
                      đúng như flow học nói hiện tại.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminRoute>
  );
}
