"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Crosshair, Sparkles, Target } from "lucide-react";
import { useRouter } from "next/navigation";

import { AdminPageError, AdminPageLoading } from "@/components/admin/admin-query-state";
import { DeleteConfirmButton } from "@/components/admin/delete-confirm-button";
import { LearnStepAiCreateButton } from "@/components/admin/learn-step-ai-create-button";
import { AdminRoute } from "@/components/auth/admin-route";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatNumber, notify } from "@/lib/admin";
import {
  type AdminLearnStepAiDraft,
  type LearnStep,
  useCreateAdminLearnStepMutation,
  useDeleteAdminLearnStepMutation,
  useGetAdminLearnMapsQuery,
  useGetAdminLearnStepsQuery,
  useUpdateAdminLearnStepMutation,
} from "@/lib/api/learnApi";
import { handleApiError } from "@/lib/api-error-handler";
import {
  clearLearnStepAiDraft,
  loadLearnStepAiDraft,
} from "@/lib/learn-step-ai-draft";

type Props = {
  mapId: string;
  stepId?: string;
  source?: string;
};

type StepFormState = {
  title: string;
  type: "lesson" | "boss";
  order: string;
  scenarioTitle: string;
  scenarioContext: string;
  scenarioScript: string;
  aiPersona: string;
  aiSystemPrompt: string;
  openingMessage: string;
  minTurns: string;
  xpReward: string;
  gradingDifficulty: "easy" | "medium" | "hard";
  minimumPassScore: string;
  passCriteria: string;
  vocabularyFocus: string;
  grammarFocus: string;
  bossName: string;
  bossTasksJson: string;
};

const DEFAULT_BOSS_TASKS = `[
  { "id": "task-1", "description": "Ask a complete question and respond naturally." }
]`;

const SELECT_FIELD_CLASSNAME =
  "mt-1 flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-black";

function createInitialStepForm(order = 0): StepFormState {
  return {
    title: "",
    type: "lesson",
    order: String(order),
    scenarioTitle: "",
    scenarioContext: "",
    scenarioScript: "",
    aiPersona: "Friendly English speaking coach",
    aiSystemPrompt:
      "You are a friendly English tutor. Keep replies short, practical, and natural.",
    openingMessage: "Hi! Let's practice speaking English together. Ready?",
    minTurns: "2",
    xpReward: "20",
    gradingDifficulty: "medium",
    minimumPassScore: "",
    passCriteria: "",
    vocabularyFocus: "",
    grammarFocus: "",
    bossName: "Boss cuối chặng",
    bossTasksJson: DEFAULT_BOSS_TASKS,
  };
}

function toStepFormState(step: LearnStep): StepFormState {
  return {
    title: step.title || "",
    type: step.type,
    order: String(step.order ?? 0),
    scenarioTitle: step.scenarioTitle || "",
    scenarioContext: step.scenarioContext || "",
    scenarioScript: step.scenarioScript || "",
    aiPersona: step.aiPersona || "",
    aiSystemPrompt: step.aiSystemPrompt || "",
    openingMessage: step.openingMessage || "",
    minTurns: String(step.minTurns ?? 1),
    xpReward: String(step.xpReward ?? 0),
    gradingDifficulty: step.gradingDifficulty || "medium",
    minimumPassScore:
      step.minimumPassScore == null || Number.isNaN(step.minimumPassScore)
        ? ""
        : String(step.minimumPassScore),
    passCriteria: (step.passCriteria || []).join(", "),
    vocabularyFocus: (step.vocabularyFocus || []).join(", "),
    grammarFocus: (step.grammarFocus || []).join(", "),
    bossName: step.bossName || "",
    bossTasksJson: JSON.stringify(step.bossTasks || [], null, 2),
  };
}

function aiDraftToStepFormState(draft: AdminLearnStepAiDraft): StepFormState {
  return {
    title: draft.title || "",
    type: draft.type,
    order: String(draft.order ?? 0),
    scenarioTitle: draft.scenarioTitle || "",
    scenarioContext: draft.scenarioContext || "",
    scenarioScript: draft.scenarioScript || "",
    aiPersona: draft.aiPersona || "",
    aiSystemPrompt: draft.aiSystemPrompt || "",
    openingMessage: draft.openingMessage || "",
    minTurns: String(draft.minTurns ?? 1),
    xpReward: String(draft.xpReward ?? 0),
    gradingDifficulty: draft.gradingDifficulty || "medium",
    minimumPassScore:
      draft.minimumPassScore == null || Number.isNaN(draft.minimumPassScore)
        ? ""
        : String(draft.minimumPassScore),
    passCriteria: (draft.passCriteria || []).join(", "),
    vocabularyFocus: (draft.vocabularyFocus || []).join(", "),
    grammarFocus: (draft.grammarFocus || []).join(", "),
    bossName: draft.bossName || "",
    bossTasksJson: JSON.stringify(draft.bossTasks || [], null, 2),
  };
}

function parseCommaSeparated(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseBossTasks(value: string) {
  let parsed: unknown;

  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error("Boss tasks phải là JSON hợp lệ.");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("Boss tasks phải là một mảng JSON.");
  }

  const tasks = parsed
    .map((item, index) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const task = item as { id?: unknown; description?: unknown };
      const id = String(task.id || `task-${index + 1}`).trim();
      const description = String(task.description || "").trim();

      if (!id || !description) {
        return null;
      }

      return { id, description };
    })
    .filter((item): item is { id: string; description: string } => Boolean(item));

  if (tasks.length === 0) {
    throw new Error("Boss phải có ít nhất 1 nhiệm vụ hợp lệ.");
  }

  return tasks;
}

function getDifficultyLabel(difficulty: StepFormState["gradingDifficulty"]) {
  switch (difficulty) {
    case "easy":
      return "Dễ";
    case "hard":
      return "Khó";
    default:
      return "Trung bình";
  }
}

function getDifficultyBadgeClass(difficulty: StepFormState["gradingDifficulty"]) {
  if (difficulty === "easy") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (difficulty === "hard") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

function getNextOrder(steps: LearnStep[]) {
  if (steps.length === 0) {
    return 0;
  }

  return Math.max(...steps.map((step) => step.order ?? 0)) + 1;
}

export function LearnStepEditorScreen({ mapId, stepId, source }: Props) {
  const router = useRouter();
  const isEdit = Boolean(stepId);
  const { data: mapsData, isLoading: mapsLoading, isError: isMapsError } = useGetAdminLearnMapsQuery();
  const {
    data: stepsData,
    isLoading: stepsLoading,
    isError: isStepsError,
  } = useGetAdminLearnStepsQuery(mapId, {
    skip: !mapId,
  });

  const [form, setForm] = useState<StepFormState>(createInitialStepForm());
  const [hasLoadedInitialForm, setHasLoadedInitialForm] = useState(false);
  const [draftSource, setDraftSource] = useState<"manual" | "ai">("manual");
  const [createStep, { isLoading: isCreating }] = useCreateAdminLearnStepMutation();
  const [updateStep, { isLoading: isUpdating }] = useUpdateAdminLearnStepMutation();
  const [deleteStep, { isLoading: isDeleting }] = useDeleteAdminLearnStepMutation();

  const map = mapsData?.items?.find((item) => item.id === mapId);
  const steps = useMemo(
    () => (stepsData?.items ?? []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [stepsData],
  );
  const step = steps.find((item) => item.id === stepId);
  const isSubmitting = isCreating || isUpdating;

  useEffect(() => {
    if (!isEdit) {
      setHasLoadedInitialForm(false);
    }
  }, [isEdit, mapId, source]);

  useEffect(() => {
    if (!stepsData || hasLoadedInitialForm) {
      return;
    }

    if (isEdit) {
      if (step) {
        setForm(toStepFormState(step));
        setDraftSource("manual");
        setHasLoadedInitialForm(true);
      }
      return;
    }

    if (source === "ai") {
      const aiDraft = loadLearnStepAiDraft(mapId);

      if (aiDraft) {
        setForm(aiDraftToStepFormState(aiDraft));
        setDraftSource("ai");
      } else {
        setForm(createInitialStepForm(getNextOrder(steps)));
        setDraftSource("manual");
        notify({
          title: "Không tìm thấy AI draft",
          message: "Draft AI đã hết hoặc chưa được tạo. Hệ thống mở form thủ công.",
          type: "warning",
        });
      }

      setHasLoadedInitialForm(true);
      return;
    }

    clearLearnStepAiDraft();
    setForm(createInitialStepForm(getNextOrder(steps)));
    setDraftSource("manual");
    setHasLoadedInitialForm(true);
  }, [hasLoadedInitialForm, isEdit, mapId, source, step, steps, stepsData]);

  useEffect(() => {
    if (isEdit) {
      clearLearnStepAiDraft();
    }
  }, [isEdit]);

  const setField = <K extends keyof StepFormState>(key: K, value: StepFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.title.trim()) {
      notify({ title: "Thiếu tên step", type: "error" });
      return;
    }

    let bossTasks: Array<{ id: string; description: string }> = [];

    if (form.type === "boss") {
      try {
        bossTasks = parseBossTasks(form.bossTasksJson);
      } catch (error) {
        notify({
          title: "Boss tasks chưa hợp lệ",
          message: error instanceof Error ? error.message : "Vui lòng kiểm tra lại JSON.",
          type: "error",
        });
        return;
      }
    }

    const body = {
      title: form.title.trim(),
      type: form.type,
      order: Number(form.order || 0),
      scenarioTitle: form.scenarioTitle.trim(),
      scenarioContext: form.scenarioContext.trim(),
      scenarioScript: form.scenarioScript.trim(),
      aiPersona: form.aiPersona.trim(),
      aiSystemPrompt: form.aiSystemPrompt.trim(),
      openingMessage: form.openingMessage.trim(),
      minTurns: Number(form.minTurns || 1),
      xpReward: Number(form.xpReward || 0),
      gradingDifficulty: form.gradingDifficulty,
      minimumPassScore: form.minimumPassScore ? Number(form.minimumPassScore) : null,
      passCriteria: parseCommaSeparated(form.passCriteria),
      vocabularyFocus: parseCommaSeparated(form.vocabularyFocus),
      grammarFocus: parseCommaSeparated(form.grammarFocus),
      bossName: form.type === "boss" ? form.bossName.trim() : "",
      bossTasks,
      bossHPMax: form.type === "boss" ? 100 : undefined,
      playerHPMax: form.type === "boss" ? 100 : undefined,
    };

    try {
      if (isEdit && stepId) {
        await updateStep({
          id: stepId,
          mapId,
          body,
        }).unwrap();
        notify({ title: "Đã cập nhật step", type: "success" });
      } else {
        await createStep({
          mapId,
          body,
        }).unwrap();
        clearLearnStepAiDraft();
        notify({ title: "Đã tạo step mới", type: "success" });
      }

      router.push(`/admin/learn/maps/${mapId}`);
      router.refresh();
    } catch (error) {
      const apiError = handleApiError(error);
      notify({
        title: "Không thể lưu step",
        message: apiError.message,
        type: "error",
      });
    }
  };

  const handleDelete = async () => {
    if (!stepId || !step) {
      return;
    }

    try {
      await deleteStep({ id: stepId, mapId }).unwrap();
      notify({ title: "Đã xóa step", message: step.title, type: "success" });
      router.push(`/admin/learn/maps/${mapId}`);
      router.refresh();
    } catch (error) {
      const apiError = handleApiError(error);
      notify({
        title: "Không thể xóa step",
        message: apiError.message,
        type: "error",
      });
    }
  };

  if (mapsLoading || stepsLoading || (isEdit && !hasLoadedInitialForm && !isStepsError)) {
    return <AdminPageLoading />;
  }

  if (isMapsError || !map) {
    return <AdminPageError message="Không tìm thấy map để tạo hoặc sửa step." />;
  }

  if (isStepsError) {
    return <AdminPageError message="Không tải được danh sách step của map này." />;
  }

  if (isEdit && !step) {
    return <AdminPageError message="Không tìm thấy step cần chỉnh sửa." />;
  }

  return (
    <AdminRoute>
      <div className="space-y-6">
        <section className="rounded-[30px] border border-slate-200 bg-white px-6 py-7 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Link
                href={`/admin/learn/maps/${mapId}`}
                className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-black"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to map
              </Link>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
                {isEdit ? "Chỉnh sửa chặng" : "Tạo chặng mới"}
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
                Đây là trang riêng để tạo hoặc chỉnh sửa chặng. Kịch bản, độ khó chấm điểm và
                vocab/ngữ pháp sẽ được cấu hình tập trung tại đây.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {!isEdit ? (
                <LearnStepAiCreateButton
                  mapId={mapId}
                  nextOrder={getNextOrder(steps)}
                  className="rounded-xl"
                />
              ) : null}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Map: <span className="font-semibold text-slate-900">{map.title}</span>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_360px]">
          <div className="space-y-6">
            <Card className="border-slate-200 py-5">
              <CardHeader>
                <CardTitle>Step settings</CardTitle>
                <CardDescription>
                  Cấu hình nội dung, prompt và luật chấm điểm cho bài luyện nói.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="step-title">Title</Label>
                      <Input
                        id="step-title"
                        value={form.title}
                        onChange={(event) => setField("title", event.target.value)}
                        placeholder="Check-in at the airport"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="step-type">Type</Label>
                      <select
                        id="step-type"
                        className={SELECT_FIELD_CLASSNAME}
                        value={form.type}
                        onChange={(event) =>
                          setField("type", event.target.value as StepFormState["type"])
                        }
                      >
                        <option value="lesson">Lesson</option>
                        <option value="boss">Boss</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="step-order">Order</Label>
                      <Input
                        id="step-order"
                        type="number"
                        min={0}
                        value={form.order}
                        onChange={(event) => setField("order", event.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="step-ai-persona">AI persona</Label>
                      <Input
                        id="step-ai-persona"
                        value={form.aiPersona}
                        onChange={(event) => setField("aiPersona", event.target.value)}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="step-scenario-title">Scenario title</Label>
                      <Input
                        id="step-scenario-title"
                        value={form.scenarioTitle}
                        onChange={(event) => setField("scenarioTitle", event.target.value)}
                        placeholder="Passenger asks about baggage and boarding gate"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="step-scenario-context">Scenario context</Label>
                      <Textarea
                        id="step-scenario-context"
                        rows={4}
                        value={form.scenarioContext}
                        onChange={(event) => setField("scenarioContext", event.target.value)}
                        placeholder="Mô tả vai trò người học, bối cảnh và mục tiêu giao tiếp."
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="step-scenario-script">Scenario script</Label>
                      <Textarea
                        id="step-scenario-script"
                        rows={7}
                        value={form.scenarioScript}
                        onChange={(event) => setField("scenarioScript", event.target.value)}
                        placeholder="Viết kịch bản chi tiết để AI bám theo khi luyện nói."
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="step-system-prompt">AI system prompt</Label>
                      <Textarea
                        id="step-system-prompt"
                        rows={5}
                        className="font-mono text-xs"
                        value={form.aiSystemPrompt}
                        onChange={(event) => setField("aiSystemPrompt", event.target.value)}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="step-opening-message">Opening message</Label>
                      <Textarea
                        id="step-opening-message"
                        rows={3}
                        value={form.openingMessage}
                        onChange={(event) => setField("openingMessage", event.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="step-min-turns">Minimum turns</Label>
                      <Input
                        id="step-min-turns"
                        type="number"
                        min={1}
                        value={form.minTurns}
                        onChange={(event) => setField("minTurns", event.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="step-xp-reward">XP reward</Label>
                      <Input
                        id="step-xp-reward"
                        type="number"
                        min={0}
                        value={form.xpReward}
                        onChange={(event) => setField("xpReward", event.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="step-difficulty">Grading difficulty</Label>
                      <select
                        id="step-difficulty"
                        className={SELECT_FIELD_CLASSNAME}
                        value={form.gradingDifficulty}
                        onChange={(event) =>
                          setField(
                            "gradingDifficulty",
                            event.target.value as StepFormState["gradingDifficulty"],
                          )
                        }
                      >
                        <option value="easy">Dễ</option>
                        <option value="medium">Trung bình</option>
                        <option value="hard">Khó</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="step-pass-score">Minimum pass score</Label>
                      <Input
                        id="step-pass-score"
                        type="number"
                        min={0}
                        max={100}
                        value={form.minimumPassScore}
                        onChange={(event) => setField("minimumPassScore", event.target.value)}
                      />
                      <p className="text-xs text-slate-500">
                        Để trống nếu muốn dùng ngưỡng mặc định theo độ khó.
                      </p>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="step-pass-criteria">Pass criteria</Label>
                      <Input
                        id="step-pass-criteria"
                        value={form.passCriteria}
                        onChange={(event) => setField("passCriteria", event.target.value)}
                        placeholder="ask about price, confirm time, speak naturally"
                      />
                      <p className="text-xs text-slate-500">
                        Nhập các tiêu chí, cách nhau bằng dấu phẩy.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="step-vocabulary-focus">Vocabulary focus</Label>
                      <Input
                        id="step-vocabulary-focus"
                        value={form.vocabularyFocus}
                        onChange={(event) => setField("vocabularyFocus", event.target.value)}
                        placeholder="departure, boarding pass, luggage"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="step-grammar-focus">Grammar focus</Label>
                      <Input
                        id="step-grammar-focus"
                        value={form.grammarFocus}
                        onChange={(event) => setField("grammarFocus", event.target.value)}
                        placeholder="polite questions, present simple, modal verbs"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-end gap-3">
                    <Button type="submit" className="rounded-xl" disabled={isSubmitting}>
                      {isSubmitting ? "Đang lưu..." : isEdit ? "Lưu chặng" : "Tạo chặng"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {form.type === "boss" ? (
              <Card className="border-rose-200 py-5">
                <CardHeader>
                  <CardTitle>Boss settings</CardTitle>
                  <CardDescription>
                    Boss cần mục tiêu rõ ràng để học viên chỉ pass map khi vượt trận cuối.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="step-boss-name">Boss name</Label>
                    <Input
                      id="step-boss-name"
                      value={form.bossName}
                      onChange={(event) => setField("bossName", event.target.value)}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="step-boss-tasks">Boss tasks (JSON)</Label>
                    <Textarea
                      id="step-boss-tasks"
                      rows={10}
                      className="font-mono text-xs"
                      value={form.bossTasksJson}
                      onChange={(event) => setField("bossTasksJson", event.target.value)}
                    />
                    <p className="text-xs text-slate-500">
                      Mỗi nhiệm vụ cần có `id` và `description`.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>

          <div className="space-y-6">
            <Card className="border-slate-200 py-5">
              <CardHeader>
                <CardTitle>Summary</CardTitle>
                <CardDescription>Kiểm tra nhanh trước khi lưu.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Step
                  </p>
                  <p className="mt-2 font-semibold text-slate-900">
                    {form.title || "Untitled step"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="outline" className="rounded-full">
                      {form.type === "boss" ? "Boss" : "Lesson"}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`rounded-full ${getDifficultyBadgeClass(form.gradingDifficulty)}`}
                    >
                      {getDifficultyLabel(form.gradingDifficulty)}
                    </Badge>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Map context
                  </p>
                  <p className="mt-2 text-sm text-slate-700">
                    Level {formatNumber(map.level ?? 1)} · Order {formatNumber(map.order ?? 0)}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">{map.description || "Chưa có mô tả map."}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Order / XP
                    </p>
                    <p className="mt-2 text-sm text-slate-700">
                      Step {formatNumber(Number(form.order || 0))} · {formatNumber(Number(form.xpReward || 0))} XP
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Pass rule
                    </p>
                    <p className="mt-2 text-sm text-slate-700">
                      {form.minimumPassScore ? `${form.minimumPassScore}/100` : "Auto by difficulty"}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                  <div className="flex items-start gap-3">
                    <Sparkles className="mt-0.5 h-4 w-4 text-slate-500" />
                    <p>
                      Kịch bản, vocab focus và grammar focus sẽ được dùng trực tiếp trong prompt chấm
                      điểm của AI.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {isEdit ? (
              <Card className="border-rose-200 py-5">
                <CardHeader>
                  <CardTitle>Danger zone</CardTitle>
                  <CardDescription>Xóa step sẽ gỡ nó khỏi map hiện tại.</CardDescription>
                </CardHeader>
                <CardContent>
                  <DeleteConfirmButton
                    itemLabel={step?.title || "step"}
                    title="Xóa step?"
                    description={`Xóa step "${step?.title}" khỏi map "${map.title}"? Hành động này không thể hoàn tác.`}
                    confirmLabel="Xóa step"
                    cancelLabel="Hủy"
                    onConfirm={handleDelete}
                    disabled={isDeleting}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card className="border-slate-200 py-5">
                <CardContent className="pt-1">
                  <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                    <Target className="mt-0.5 h-4 w-4 text-slate-500" />
                    <p>
                      Map này hiện có {formatNumber(steps.length)} step. Step mới sẽ xuất hiện trong
                      bảng của map sau khi lưu.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end">
              <Button variant="outline" className="rounded-xl" asChild>
                <Link href={`/admin/learn/maps/${mapId}`}>Quay lại map</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AdminRoute>
  );
}
