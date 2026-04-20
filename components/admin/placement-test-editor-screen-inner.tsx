"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { AdminPageError, AdminPageLoading } from "@/components/admin/admin-query-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateAdminPlacementTestMutation,
  useGetAdminPlacementTestByIdQuery,
  useRegenerateAdminPlacementQuestionAudioMutation,
  useUpdateAdminPlacementTestMutation,
} from "@/store/services/placementApi";
import {
  ADMIN_LEVEL_OPTIONS,
  ADMIN_PLACEMENT_QUESTION_TYPE_OPTIONS,
  ADMIN_PLACEMENT_SKILL_OPTIONS,
  formatNumber,
  notify,
} from "@/lib/admin";
import {
  clearPlacementAiDraft,
  loadPlacementAiDraft,
} from "@/lib/placement-ai-draft";
import { handleApiError } from "@/lib/api-error-handler";
import {
  buildPlacementLevelRules,
  calculatePlacementMaxScore,
  CEFR_LEVELS,
} from "@/lib/placement";
import type {
  AdminPlacementLevelRuleItem,
  AdminPlacementQuestionItem,
  AdminPlacementTestItem,
  AdminPlacementTestPayload,
} from "@/types";

type Props = {
  testId?: string;
  source?: string;
};

type PlacementTestDraft = AdminPlacementTestItem & {
  levelFrom?: (typeof CEFR_LEVELS)[number];
  levelTo?: (typeof CEFR_LEVELS)[number];
};

const createId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function createEmptyPlacementQuestion(): AdminPlacementQuestionItem {
  return {
    id: createId("placement-question"),
    prompt: "",
    instruction: "",
    passage: "",
    type: "mcq",
    options: ["", ""],
    correctOptionIndex: 0,
    skillType: "grammar",
    targetLevel: "A1",
    weight: 1,
    explanation: "",
    isActive: true,
  };
}

function createEmptyPlacementTest(): PlacementTestDraft {
  return {
    id: createId("placement-test"),
    title: "",
    levelFrom: "A1",
    levelTo: "C2",
    description: "",
    instructions: "",
    durationMinutes: 10,
    isActive: false,
    questionCount: 1,
    activeQuestionCount: 1,
    maxScore: 1,
    questions: [createEmptyPlacementQuestion()],
    levelRules: [],
    createdAt: null,
    updatedAt: null,
  };
}

function toPlacementPayload(draft: PlacementTestDraft): AdminPlacementTestPayload {
  return {
    title: draft.title,
    levelFrom: draft.levelFrom,
    levelTo: draft.levelTo,
    description: draft.description,
    instructions: draft.instructions,
    durationMinutes: draft.durationMinutes,
    isActive: draft.isActive,
    questions: draft.questions,
    autoRules: true,
  };
}

function validatePlacementTestDraft(draft: PlacementTestDraft) {
  const title = draft.title.trim();

  if (!title) {
    throw new Error("Bài test cần có tiêu đề.");
  }

  const questions = draft.questions.map((question, index) => {
    const prompt = question.prompt.trim();
    const options = question.options.map((item) => item.trim()).filter(Boolean);

    if (!prompt) {
      throw new Error(`Câu ${index + 1} đang thiếu nội dung.`);
    }

    if (options.length < 2) {
      throw new Error(`Câu ${index + 1} cần ít nhất 2 đáp án.`);
    }

    if (
      !Number.isInteger(question.correctOptionIndex) ||
      question.correctOptionIndex < 0 ||
      question.correctOptionIndex >= options.length
    ) {
      throw new Error(`Câu ${index + 1} có đáp án đúng không hợp lệ.`);
    }

    return {
      ...question,
      prompt,
      instruction: question.instruction.trim(),
      passage: question.passage.trim(),
      options,
      weight: Math.max(1, Number(question.weight) || 1),
      explanation: question.explanation.trim(),
    };
  });

  const activeQuestions = questions.filter((question) => question.isActive);

  if (!activeQuestions.length) {
    throw new Error("Cần ít nhất 1 câu hỏi active để chấm placement test.");
  }

  const maxScore = calculatePlacementMaxScore(activeQuestions);
  const levelFrom =
    (draft.levelFrom as (typeof CEFR_LEVELS)[number] | undefined) ?? "A1";
  const levelTo =
    (draft.levelTo as (typeof CEFR_LEVELS)[number] | undefined) ?? "C2";

  if (CEFR_LEVELS.indexOf(levelFrom) > CEFR_LEVELS.indexOf(levelTo)) {
    throw new Error("Level bắt đầu cần nhỏ hơn hoặc bằng level kết thúc.");
  }

  const rules = buildPlacementLevelRules(activeQuestions, levelFrom, levelTo);

  return {
    ...draft,
    title,
    levelFrom,
    levelTo,
    description: draft.description.trim(),
    instructions: draft.instructions.trim(),
    durationMinutes: Math.max(1, Number(draft.durationMinutes) || 10),
    questions,
    levelRules: rules,
  };
}

export function PlacementTestEditorScreenInner({ testId, source }: Props) {
  const router = useRouter();
  const [draft, setDraft] = useState<PlacementTestDraft | null>(
    testId ? null : null
  );
  const [isInitializingDraft, setIsInitializingDraft] = useState(!testId);
  const [draftSource, setDraftSource] = useState<"manual" | "ai">("manual");
  const [step, setStep] = useState<"setup" | "questions" | "review">("setup");
  const { data, isLoading, error } = useGetAdminPlacementTestByIdQuery(testId as string, {
    skip: !testId,
  });
  const [createPlacementTest, { isLoading: isCreating }] =
    useCreateAdminPlacementTestMutation();
  const [updatePlacementTest, { isLoading: isUpdating }] =
    useUpdateAdminPlacementTestMutation();
  const [regenerateAudio, { isLoading: isRegeneratingAudio }] =
    useRegenerateAdminPlacementQuestionAudioMutation();

  const autoRules = useMemo(() => {
    if (!draft) return [];
    const levelFrom = (draft.levelFrom as (typeof CEFR_LEVELS)[number] | undefined) ?? "A1";
    const levelTo = (draft.levelTo as (typeof CEFR_LEVELS)[number] | undefined) ?? "C2";
    return buildPlacementLevelRules(draft.questions, levelFrom, levelTo);
  }, [draft]);

  useEffect(() => {
    if (data) {
      setDraft(data);
    }
  }, [data]);

  useEffect(() => {
    if (testId) {
      return;
    }

    if (source === "ai") {
      const aiDraft = loadPlacementAiDraft();

      if (aiDraft) {
        setDraft(aiDraft);
        setDraftSource("ai");
      } else {
        setDraft(createEmptyPlacementTest());
        setDraftSource("manual");
        notify({
          title: "Không tìm thấy AI draft",
          message: "Draft AI đã hết hoặc chưa được tạo. Hệ thống mở form thủ công.",
          type: "warning",
        });
      }

      setIsInitializingDraft(false);
      setStep("questions");
      return;
    }

    clearPlacementAiDraft();
    setDraft(createEmptyPlacementTest());
    setDraftSource("manual");
    setIsInitializingDraft(false);
    setStep("setup");
  }, [source, testId]);

  useEffect(() => {
    if (testId) {
      clearPlacementAiDraft();
    }
  }, [testId]);

  const activeQuestionCount = useMemo(
    () => draft?.questions.filter((question) => question.isActive).length ?? 0,
    [draft]
  );
  const maxScore = useMemo(
    () => (draft ? calculatePlacementMaxScore(draft.questions) : 0),
    [draft]
  );

  const isSaving = isCreating || isUpdating;

  const updateQuestion = (
    questionId: string,
    updater: (question: AdminPlacementQuestionItem) => AdminPlacementQuestionItem
  ) => {
    setDraft((current) =>
      current
        ? {
            ...current,
            questions: current.questions.map((question) =>
              question.id === questionId ? updater(question) : question
            ),
          }
        : current
    );
  };

  const handleRegenerateAudio = async (questionId: string) => {
    if (!testId) {
      notify({
        title: "Chưa thể tạo audio",
        message: "Hãy lưu placement test trước, sau đó mới retry TTS cho từng câu nghe.",
        type: "warning",
      });
      return;
    }

    try {
      const updated = await regenerateAudio({ id: testId, questionId }).unwrap();
      setDraft(updated);
      notify({
        title: "Đã tạo lại audio",
        message: "Audio URL đã được cập nhật vào câu hỏi.",
        type: "success",
      });
    } catch (error) {
      const apiError = handleApiError(error);
      notify({
        title: "Không thể tạo lại audio",
        message: apiError.message,
        type: "error",
      });
    }
  };

  const handleSave = async () => {
    if (!draft) {
      return;
    }

    try {
      const nextDraft = validatePlacementTestDraft(draft);
      const payload = toPlacementPayload(nextDraft);

      if (testId) {
        await updatePlacementTest({ id: testId, body: payload }).unwrap();
      } else {
        await createPlacementTest(payload).unwrap();
      }

      if (!testId) {
        clearPlacementAiDraft();
      }

      notify({
        title: testId ? "Đã cập nhật placement test" : "Đã tạo placement test",
        message: nextDraft.isActive
          ? "Bài test này đang là bài active cho user mới."
          : "Bạn có thể kích hoạt bài này ở danh sách.",
        type: "success",
      });
      router.push("/admin/placement-tests");
    } catch (error) {
      const apiError = handleApiError(error);
      notify({
        title: "Không thể lưu placement test",
        message: apiError.message,
        type: "error",
      });
    }
  };

  const handleNext = () => {
    try {
      const nextDraft = validatePlacementTestDraft(draft);
      setDraft(nextDraft);
      setStep((current) => (current === "setup" ? "questions" : "review"));
    } catch (error) {
      const apiError = handleApiError(error);
      notify({
        title: "Thiếu hoặc sai thông tin",
        message: apiError.message,
        type: "warning",
      });
    }
  };

  const handleBack = () => {
    setStep((current) => (current === "review" ? "questions" : "setup"));
  };

  if ((testId && isLoading && !draft) || (!testId && isInitializingDraft)) {
    return <AdminPageLoading />;
  }

  if (testId && error && !draft) {
    return <AdminPageError message="Không tìm thấy placement test để chỉnh sửa." />;
  }

  if (!draft) {
    return <AdminPageLoading />;
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
              Placement Test Editor
            </Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              {testId ? "Chỉnh sửa bài test đầu vào" : "Tạo bài test đầu vào"}
            </h2>
          </div>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/admin/placement-tests">
              <ArrowLeft className="h-4 w-4" />
              Quay lại danh sách
            </Link>
          </Button>
        </div>
      </section>

      {!testId && draftSource === "ai" ? (
        <Card className="border-sky-200 bg-sky-50 py-4 shadow-none">
          <CardContent className="pt-0 text-sm text-sky-900">
            Draft này được AI tạo từ form yêu cầu. Hãy rà soát lại title, question
            bank, scoring rules và mức độ phù hợp trước khi xác nhận tạo bài test.
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={step === "setup" ? "default" : "outline"}
          className="rounded-xl"
          onClick={() => setStep("setup")}
        >
          1. Setup
        </Button>
        <Button
          type="button"
          variant={step === "questions" ? "default" : "outline"}
          className="rounded-xl"
          onClick={() => setStep("questions")}
        >
          2. Questions
        </Button>
        <Button
          type="button"
          variant={step === "review" ? "default" : "outline"}
          className="rounded-xl"
          onClick={() => setStep("review")}
        >
          3. Review
        </Button>
      </div>

      <Card className="border-slate-200 py-5">
        <CardContent className="space-y-6 pt-6">
          {step === "setup" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label className="mb-2 block">Tiêu đề</Label>
              <Input
                value={draft.title}
                onChange={(event) =>
                  setDraft((current) => (current ? { ...current, title: event.target.value } : current))
                }
              />
            </div>
            <div>
              <Label className="mb-2 block">Duration (phút)</Label>
              <Input
                type="number"
                min={1}
                value={draft.durationMinutes}
                onChange={(event) =>
                  setDraft((current) =>
                    current
                      ? { ...current, durationMinutes: Math.max(1, Number(event.target.value) || 10) }
                      : current
                  )
                }
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="mb-2 block">Level từ</Label>
                <select
                  value={(draft.levelFrom as string | undefined) ?? "A1"}
                  onChange={(event) =>
                    setDraft((current) =>
                      current
                        ? { ...current, levelFrom: event.target.value as (typeof CEFR_LEVELS)[number] }
                        : current
                    )
                  }
                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                >
                  {CEFR_LEVELS.map((option) => (
                    <option key={`levelFrom-${option}`} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="mb-2 block">Level đến</Label>
                <select
                  value={(draft.levelTo as string | undefined) ?? "C2"}
                  onChange={(event) =>
                    setDraft((current) =>
                      current
                        ? { ...current, levelTo: event.target.value as (typeof CEFR_LEVELS)[number] }
                        : current
                    )
                  }
                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                >
                  {CEFR_LEVELS.map((option) => (
                    <option key={`levelTo-${option}`} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-emerald-900">Bài test active</p>
                  <p className="mt-1 text-sm text-emerald-800">Chỉ một bài được active.</p>
                </div>
                <Switch
                  checked={draft.isActive}
                  onCheckedChange={(checked) =>
                    setDraft((current) => (current ? { ...current, isActive: checked } : current))
                  }
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <Label className="mb-2 block">Mô tả</Label>
              <Textarea
                rows={3}
                value={draft.description}
                onChange={(event) =>
                  setDraft((current) =>
                    current ? { ...current, description: event.target.value } : current
                  )
                }
              />
            </div>
            <div className="md:col-span-2">
              <Label className="mb-2 block">Instructions</Label>
              <Textarea
                rows={4}
                value={draft.instructions}
                onChange={(event) =>
                  setDraft((current) =>
                    current ? { ...current, instructions: event.target.value } : current
                  )
                }
              />
            </div>
          </div>
          ) : null}

          {step === "review" ? (
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-slate-200 shadow-none">
              <CardContent className="pt-6">
                <p className="text-sm text-slate-500">Câu hỏi active</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">{formatNumber(activeQuestionCount)}</p>
              </CardContent>
            </Card>
            <Card className="border-slate-200 shadow-none">
              <CardContent className="pt-6">
                <p className="text-sm text-slate-500">Max score</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">{formatNumber(maxScore)}</p>
              </CardContent>
            </Card>
            <Card className="border-slate-200 shadow-none">
              <CardContent className="pt-6">
                <p className="text-sm text-slate-500">Scoring rules (auto)</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">
                  {formatNumber(autoRules.length)}
                </p>
              </CardContent>
            </Card>
          </div>
          ) : null}

          {step === "questions" ? (
          <Card className="border-slate-200 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Ngân hàng câu hỏi</CardTitle>
              <Button type="button" variant="outline" className="rounded-xl" onClick={() =>
                setDraft((current) =>
                  current
                    ? { ...current, questions: [...current.questions, createEmptyPlacementQuestion()] }
                    : current
                )
              }>
                <Plus className="h-4 w-4" />
                Thêm câu hỏi
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {draft.questions.map((question, index) => (
                <div key={question.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">Câu hỏi {index + 1}</p>
                      <p className="text-sm text-slate-500">Objective scoring question.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {question.skillType === "listening" && !question.audioUrl ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isRegeneratingAudio}
                          onClick={() => handleRegenerateAudio(question.id)}
                        >
                          {isRegeneratingAudio ? "Đang tạo audio..." : "Tạo audio"}
                        </Button>
                      ) : null}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Active</span>
                        <Switch
                          checked={question.isActive}
                          onCheckedChange={(checked) =>
                            updateQuestion(question.id, (item) => ({ ...item, isActive: checked }))
                          }
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setDraft((current) => {
                            if (!current) {
                              return current;
                            }

                            const nextQuestions = current.questions.filter((item) => item.id !== question.id);
                            return {
                              ...current,
                              questions: nextQuestions.length ? nextQuestions : [createEmptyPlacementQuestion()],
                            };
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <Label className="mb-2 block">Prompt</Label>
                      <Textarea
                        rows={3}
                        value={question.prompt}
                        onChange={(event) =>
                          updateQuestion(question.id, (item) => ({ ...item, prompt: event.target.value }))
                        }
                      />
                    </div>
                    <div>
                      <Label className="mb-2 block">Instruction</Label>
                      <Input
                        value={question.instruction}
                        onChange={(event) =>
                          updateQuestion(question.id, (item) => ({ ...item, instruction: event.target.value }))
                        }
                      />
                    </div>
                    <div>
                      <Label className="mb-2 block">Passage</Label>
                      <Input
                        value={question.passage}
                        onChange={(event) =>
                          updateQuestion(question.id, (item) => ({ ...item, passage: event.target.value }))
                        }
                      />
                    </div>
                    <div>
                      <Label className="mb-2 block">Type</Label>
                      <select
                        value={question.type}
                        onChange={(event) =>
                          updateQuestion(question.id, (item) => ({
                            ...item,
                            type: event.target.value as AdminPlacementQuestionItem["type"],
                          }))
                        }
                        className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                      >
                        {ADMIN_PLACEMENT_QUESTION_TYPE_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label className="mb-2 block">Skill</Label>
                      <select
                        value={question.skillType}
                        onChange={(event) =>
                          updateQuestion(question.id, (item) => ({
                            ...item,
                            skillType: event.target.value as AdminPlacementQuestionItem["skillType"],
                          }))
                        }
                        className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                      >
                        {ADMIN_PLACEMENT_SKILL_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label className="mb-2 block">Target level</Label>
                      <select
                        value={question.targetLevel}
                        onChange={(event) =>
                          updateQuestion(question.id, (item) => ({
                            ...item,
                            targetLevel: event.target.value as AdminPlacementQuestionItem["targetLevel"],
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
                    <div>
                      <Label className="mb-2 block">Weight</Label>
                      <Input
                        type="number"
                        min={1}
                        value={question.weight}
                        onChange={(event) =>
                          updateQuestion(question.id, (item) => ({
                            ...item,
                            weight: Math.max(1, Number(event.target.value) || 1),
                          }))
                        }
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="mb-2 block">Đáp án</Label>
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <div key={`${question.id}-${optionIndex}`} className="flex items-center gap-2">
                            <Input
                              value={option}
                              onChange={(event) =>
                                updateQuestion(question.id, (item) => ({
                                  ...item,
                                  options: item.options.map((currentOption, currentIndex) =>
                                    currentIndex === optionIndex ? event.target.value : currentOption
                                  ),
                                }))
                              }
                            />
                            <Button
                              type="button"
                              variant={question.correctOptionIndex === optionIndex ? "default" : "outline"}
                              onClick={() =>
                                updateQuestion(question.id, (item) => ({
                                  ...item,
                                  correctOptionIndex: optionIndex,
                                }))
                              }
                            >
                              Đúng
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              disabled={question.options.length <= 2}
                              onClick={() =>
                                updateQuestion(question.id, (item) => {
                                  if (item.options.length <= 2) {
                                    return item;
                                  }

                                  const nextOptions = item.options.filter((_, currentIndex) => currentIndex !== optionIndex);
                                  const nextCorrectOptionIndex =
                                    item.correctOptionIndex === optionIndex
                                      ? 0
                                      : item.correctOptionIndex > optionIndex
                                        ? item.correctOptionIndex - 1
                                        : item.correctOptionIndex;

                                  return {
                                    ...item,
                                    options: nextOptions,
                                    correctOptionIndex: nextCorrectOptionIndex,
                                  };
                                })
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            updateQuestion(question.id, (item) => ({
                              ...item,
                              options: [...item.options, ""],
                            }))
                          }
                        >
                          <Plus className="h-4 w-4" />
                          Thêm đáp án
                        </Button>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <Label className="mb-2 block">Explanation</Label>
                      <Textarea
                        rows={2}
                        value={question.explanation}
                        onChange={(event) =>
                          updateQuestion(question.id, (item) => ({
                            ...item,
                            explanation: event.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          ) : null}

          {step === "review" ? (
          <Card className="border-slate-200 shadow-none">
            <CardHeader>
              <CardTitle className="text-base">Scoring (auto)</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              {autoRules.map((rule) => (
                <div key={rule.id} className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-slate-900">{rule.level}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {formatNumber(rule.minScore)} → {formatNumber(rule.maxScore)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
          ) : null}
        </CardContent>
        <CardFooter className="justify-end gap-3 border-t border-slate-100">
          <Button asChild type="button" variant="outline" className="rounded-xl">
            <Link href="/admin/placement-tests">Hủy</Link>
          </Button>
          {step !== "setup" ? (
            <Button type="button" variant="outline" className="rounded-xl" onClick={handleBack}>
              Quay lại
            </Button>
          ) : null}
          {step !== "review" ? (
            <Button type="button" className="rounded-xl" onClick={handleNext}>
              Tiếp tục
            </Button>
          ) : (
            <Button type="button" className="rounded-xl" onClick={handleSave} disabled={isSaving}>
              <ShieldCheck className="h-4 w-4" />
              {isSaving ? "Đang lưu..." : testId ? "Lưu thay đổi" : "Tạo placement test"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
