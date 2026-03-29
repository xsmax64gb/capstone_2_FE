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
  useUpdateAdminPlacementTestMutation,
} from "@/lib/api/placementApi";
import {
  ADMIN_LEVEL_OPTIONS,
  ADMIN_PLACEMENT_QUESTION_TYPE_OPTIONS,
  ADMIN_PLACEMENT_SKILL_OPTIONS,
  formatNumber,
  notify,
} from "@/lib/admin";
import { CEFR_LEVELS, calculatePlacementMaxScore } from "@/lib/placement";
import type {
  AdminPlacementLevelRuleItem,
  AdminPlacementQuestionItem,
  AdminPlacementTestItem,
  AdminPlacementTestPayload,
} from "@/types";

type Props = {
  testId?: string;
};

type PlacementTestDraft = AdminPlacementTestItem;

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

function createEmptyPlacementLevelRule(level: AdminPlacementLevelRuleItem["level"] = "A1") {
  return { id: createId("placement-rule"), level, minScore: 0, maxScore: 0 };
}

function createEmptyPlacementTest(): PlacementTestDraft {
  return {
    id: createId("placement-test"),
    title: "",
    description: "",
    instructions: "",
    durationMinutes: 10,
    isActive: false,
    questionCount: 1,
    activeQuestionCount: 1,
    maxScore: 1,
    questions: [createEmptyPlacementQuestion()],
    levelRules: CEFR_LEVELS.map((level) => createEmptyPlacementLevelRule(level)),
    createdAt: null,
    updatedAt: null,
  };
}

function toPlacementPayload(draft: PlacementTestDraft): AdminPlacementTestPayload {
  return {
    title: draft.title,
    description: draft.description,
    instructions: draft.instructions,
    durationMinutes: draft.durationMinutes,
    isActive: draft.isActive,
    questions: draft.questions,
    levelRules: draft.levelRules,
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

  const rules = draft.levelRules
    .map((rule) => ({
      ...rule,
      minScore: Math.max(0, Number(rule.minScore) || 0),
      maxScore: Math.max(0, Number(rule.maxScore) || 0),
    }))
    .sort((a, b) => a.minScore - b.minScore);

  if (!rules.length) {
    throw new Error("Cần cấu hình ít nhất 1 scoring rule.");
  }

  for (let index = 0; index < rules.length; index += 1) {
    const rule = rules[index];

    if (rule.minScore > rule.maxScore) {
      throw new Error(`Rule ${rule.level} có minScore lớn hơn maxScore.`);
    }

    if (index === 0 && rule.minScore !== 0) {
      throw new Error("Rule đầu tiên phải bắt đầu từ 0 điểm.");
    }

    if (index > 0 && rule.minScore !== rules[index - 1].maxScore + 1) {
      throw new Error("Các rule cần nối liên tục và không overlap.");
    }
  }

  const maxScore = calculatePlacementMaxScore(activeQuestions);

  if (rules[rules.length - 1].maxScore < maxScore) {
    throw new Error(`Rule cuối phải bao phủ đến ít nhất ${formatNumber(maxScore)} điểm.`);
  }

  return {
    ...draft,
    title,
    description: draft.description.trim(),
    instructions: draft.instructions.trim(),
    durationMinutes: Math.max(1, Number(draft.durationMinutes) || 10),
    questions,
    levelRules: rules,
  };
}

export function PlacementTestEditorScreenInner({ testId }: Props) {
  const router = useRouter();
  const [draft, setDraft] = useState<PlacementTestDraft | null>(
    testId ? null : createEmptyPlacementTest()
  );
  const { data, isLoading, error } = useGetAdminPlacementTestByIdQuery(testId as string, {
    skip: !testId,
  });
  const [createPlacementTest, { isLoading: isCreating }] =
    useCreateAdminPlacementTestMutation();
  const [updatePlacementTest, { isLoading: isUpdating }] =
    useUpdateAdminPlacementTestMutation();

  useEffect(() => {
    if (data) {
      setDraft(data);
    }
  }, [data]);

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

  const updateRule = (
    ruleId: string,
    updater: (rule: AdminPlacementLevelRuleItem) => AdminPlacementLevelRuleItem
  ) => {
    setDraft((current) =>
      current
        ? {
            ...current,
            levelRules: current.levelRules.map((rule) =>
              rule.id === ruleId ? updater(rule) : rule
            ),
          }
        : current
    );
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

      notify({
        title: testId ? "Đã cập nhật placement test" : "Đã tạo placement test",
        message: nextDraft.isActive
          ? "Bài test này đang là bài active cho user mới."
          : "Bạn có thể kích hoạt bài này ở danh sách.",
        type: "success",
      });
      router.push("/admin/placement-tests");
    } catch (error) {
      notify({
        title: "Không thể lưu placement test",
        message: error instanceof Error ? error.message : "Kiểm tra lại dữ liệu nhập.",
        type: "error",
      });
    }
  };

  if (testId && isLoading && !draft) {
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

      <Card className="border-slate-200 py-5">
        <CardContent className="space-y-6 pt-6">
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
                <p className="text-sm text-slate-500">Scoring rules</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">
                  {formatNumber(draft.levelRules.length)}
                </p>
              </CardContent>
            </Card>
          </div>

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

          <Card className="border-slate-200 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Quy định chấm điểm</CardTitle>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() =>
                  setDraft((current) =>
                    current
                      ? { ...current, levelRules: [...current.levelRules, createEmptyPlacementLevelRule()] }
                      : current
                  )
                }
              >
                <Plus className="h-4 w-4" />
                Thêm rule
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {draft.levelRules.map((rule) => (
                <div
                  key={rule.id}
                  className="grid gap-3 rounded-2xl border border-slate-200 p-4 md:grid-cols-[1fr_1fr_1fr_auto]"
                >
                  <select
                    value={rule.level}
                    onChange={(event) =>
                      updateRule(rule.id, (item) => ({
                        ...item,
                        level: event.target.value as AdminPlacementLevelRuleItem["level"],
                      }))
                    }
                    className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                  >
                    {ADMIN_LEVEL_OPTIONS.map((option) => (
                      <option key={`${rule.id}-${option}`} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    min={0}
                    value={rule.minScore}
                    onChange={(event) =>
                      updateRule(rule.id, (item) => ({
                        ...item,
                        minScore: Math.max(0, Number(event.target.value) || 0),
                      }))
                    }
                  />
                  <Input
                    type="number"
                    min={0}
                    value={rule.maxScore}
                    onChange={(event) =>
                      updateRule(rule.id, (item) => ({
                        ...item,
                        maxScore: Math.max(0, Number(event.target.value) || 0),
                      }))
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setDraft((current) => {
                        if (!current) {
                          return current;
                        }

                        const nextRules = current.levelRules.filter((item) => item.id !== rule.id);
                        return {
                          ...current,
                          levelRules: nextRules.length ? nextRules : [createEmptyPlacementLevelRule()],
                        };
                      })
                    }
                    disabled={draft.levelRules.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </CardContent>
        <CardFooter className="justify-end gap-3 border-t border-slate-100">
          <Button asChild type="button" variant="outline" className="rounded-xl">
            <Link href="/admin/placement-tests">Hủy</Link>
          </Button>
          <Button type="button" className="rounded-xl" onClick={handleSave} disabled={isSaving}>
            <ShieldCheck className="h-4 w-4" />
            {isSaving ? "Đang lưu..." : testId ? "Lưu thay đổi" : "Tạo placement test"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
