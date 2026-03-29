"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { AdminPageError, AdminPageLoading } from "@/components/admin/admin-query-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  ADMIN_LEVEL_OPTIONS,
  ADMIN_PLACEMENT_QUESTION_TYPE_OPTIONS,
  ADMIN_PLACEMENT_SKILL_OPTIONS,
  formatNumber,
  notify,
} from "@/lib/admin";
import {
  calculatePlacementMaxScore,
  createEmptyPlacementLevelRule,
  createEmptyPlacementQuestion,
  createEmptyPlacementTest,
  getPlacementTestById,
  type PlacementLevelRule,
  type PlacementQuestion,
  type PlacementTest,
  upsertPlacementTest,
} from "@/lib/mock/placement-tests";

type Props = {
  testId?: string;
};

function updateQuestionAt(
  questions: PlacementQuestion[],
  questionId: string,
  updater: (question: PlacementQuestion) => PlacementQuestion
) {
  return questions.map((question) =>
    question.id === questionId ? updater(question) : question
  );
}

function updateRuleAt(
  rules: PlacementLevelRule[],
  ruleId: string,
  updater: (rule: PlacementLevelRule) => PlacementLevelRule
) {
  return rules.map((rule) => (rule.id === ruleId ? updater(rule) : rule));
}

function validatePlacementTestDraft(draft: PlacementTest) {
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

    if ((Number(question.weight) || 0) <= 0) {
      throw new Error(`Câu ${index + 1} cần weight lớn hơn 0.`);
    }

    return {
      ...question,
      prompt,
      instruction: question.instruction.trim(),
      passage: question.passage.trim(),
      options,
      weight: Number(question.weight) || 1,
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
      minScore: Number(rule.minScore) || 0,
      maxScore: Number(rule.maxScore) || 0,
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

    if (index > 0) {
      const previous = rules[index - 1];
      if (rule.minScore !== previous.maxScore + 1) {
        throw new Error("Các rule cần nối liên tục và không overlap.");
      }
    }
  }

  const maxScore = activeQuestions.reduce(
    (total, question) => total + (Number(question.weight) || 1),
    0
  );

  if (rules[rules.length - 1].maxScore < maxScore) {
    throw new Error(
      `Rule cuối phải bao phủ đến ít nhất ${formatNumber(maxScore)} điểm.`
    );
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
  const [draft, setDraft] = useState<PlacementTest | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!testId) {
      setDraft(createEmptyPlacementTest());
      setMissing(false);
      setIsReady(true);
      return;
    }

    const existing = getPlacementTestById(testId);

    if (!existing) {
      setMissing(true);
      setIsReady(true);
      return;
    }

    setDraft(existing);
    setMissing(false);
    setIsReady(true);
  }, [testId]);

  const activeQuestionCount = useMemo(
    () => draft?.questions.filter((question) => question.isActive).length ?? 0,
    [draft]
  );

  const maxScore = useMemo(
    () => (draft ? calculatePlacementMaxScore(draft) : 0),
    [draft]
  );

  const setDraftField = <K extends keyof PlacementTest>(field: K, value: PlacementTest[K]) => {
    setDraft((current) => (current ? { ...current, [field]: value } : current));
  };

  const addQuestion = () => {
    setDraft((current) =>
      current
        ? {
            ...current,
            questions: [...current.questions, createEmptyPlacementQuestion()],
          }
        : current
    );
  };

  const removeQuestion = (questionId: string) => {
    setDraft((current) => {
      if (!current) return current;

      const nextQuestions = current.questions.filter((question) => question.id !== questionId);

      return {
        ...current,
        questions: nextQuestions.length ? nextQuestions : [createEmptyPlacementQuestion()],
      };
    });
  };

  const addRule = () => {
    setDraft((current) =>
      current
        ? {
            ...current,
            levelRules: [...current.levelRules, createEmptyPlacementLevelRule("A1")],
          }
        : current
    );
  };

  const removeRule = (ruleId: string) => {
    setDraft((current) => {
      if (!current) return current;

      const nextRules = current.levelRules.filter((rule) => rule.id !== ruleId);

      return {
        ...current,
        levelRules: nextRules.length ? nextRules : [createEmptyPlacementLevelRule("A1")],
      };
    });
  };

  const handleSave = () => {
    if (!draft) {
      return;
    }

    try {
      const nextDraft = validatePlacementTestDraft(draft);
      upsertPlacementTest(nextDraft);
      notify({
        title: testId ? "Đã cập nhật placement test" : "Đã tạo placement test",
        message: nextDraft.isActive
          ? "Bài test này đang là bài active cho user mới."
          : "Bạn có thể kích hoạt bài này bất cứ lúc nào ở danh sách.",
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

  if (!isReady) {
    return <AdminPageLoading />;
  }

  if (missing || !draft) {
    return <AdminPageError message="Không tìm thấy placement test để chỉnh sửa." />;
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
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
              Admin có thể tạo ngân hàng câu hỏi, cấu hình rule chấm điểm và đánh dấu
              bài nào đang active cho người dùng mới.
            </p>
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
                onChange={(event) => setDraftField("title", event.target.value)}
                placeholder="VD: Placement test tháng 4"
              />
            </div>

            <div>
              <Label className="mb-2 block">Duration (phút)</Label>
              <Input
                type="number"
                min={1}
                value={draft.durationMinutes}
                onChange={(event) =>
                  setDraftField("durationMinutes", Number(event.target.value) || 10)
                }
              />
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-emerald-900">Bài test active</p>
                  <p className="mt-1 text-sm leading-6 text-emerald-800">
                    Chỉ 1 bài được active. Khi bạn bật bài này, các bài khác sẽ tự động
                    chuyển về inactive.
                  </p>
                </div>
                <Switch
                  checked={draft.isActive}
                  onCheckedChange={(checked) => setDraftField("isActive", checked)}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <Label className="mb-2 block">Mô tả</Label>
              <Textarea
                rows={3}
                value={draft.description}
                onChange={(event) => setDraftField("description", event.target.value)}
                placeholder="Mục tiêu, phạm vi và cách dùng của bài placement test này."
              />
            </div>

            <div className="md:col-span-2">
              <Label className="mb-2 block">Instructions</Label>
              <Textarea
                rows={4}
                value={draft.instructions}
                onChange={(event) => setDraftField("instructions", event.target.value)}
                placeholder="Hướng dẫn cho user trước khi bắt đầu làm bài test."
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-sm text-slate-500">Câu hỏi active</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                {formatNumber(activeQuestionCount)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-sm text-slate-500">Max score</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                {formatNumber(maxScore)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-sm text-slate-500">Scoring rules</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                {formatNumber(draft.levelRules.length)}
              </p>
            </div>
          </div>

          <Card className="border-slate-200 bg-slate-50/70 py-5 shadow-none">
            <CardHeader>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle className="text-base">Ngân hàng câu hỏi</CardTitle>
                  <CardDescription>
                    Tạo câu hỏi objective để hệ thống chấm điểm khách quan.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="w-fit rounded-full">
                  {formatNumber(draft.questions.length)} câu trong form
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {draft.questions.map((question, index) => (
                <Card key={question.id} className="border-slate-200 bg-white py-5 shadow-none">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <CardTitle className="text-base">Câu hỏi {index + 1}</CardTitle>
                        <CardDescription>
                          Đánh dấu active để câu hỏi này được dùng khi user làm test.
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
                          <span className="text-xs font-medium text-slate-500">Active</span>
                          <Switch
                            checked={question.isActive}
                            onCheckedChange={(checked) =>
                              setDraft((current) =>
                                current
                                  ? {
                                      ...current,
                                      questions: updateQuestionAt(
                                        current.questions,
                                        question.id,
                                        (item) => ({ ...item, isActive: checked })
                                      ),
                                    }
                                  : current
                              )
                            }
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-lg"
                          onClick={() => removeQuestion(question.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="mb-2 block">Prompt</Label>
                      <Textarea
                        rows={3}
                        value={question.prompt}
                        onChange={(event) =>
                          setDraft((current) =>
                            current
                              ? {
                                  ...current,
                                  questions: updateQuestionAt(
                                    current.questions,
                                    question.id,
                                    (item) => ({ ...item, prompt: event.target.value })
                                  ),
                                }
                              : current
                          )
                        }
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label className="mb-2 block">Instruction</Label>
                        <Input
                          value={question.instruction}
                          onChange={(event) =>
                            setDraft((current) =>
                              current
                                ? {
                                    ...current,
                                    questions: updateQuestionAt(
                                      current.questions,
                                      question.id,
                                      (item) => ({ ...item, instruction: event.target.value })
                                    ),
                                  }
                                : current
                            )
                          }
                          placeholder="Có thể để trống"
                        />
                      </div>
                      <div>
                        <Label className="mb-2 block">Weight</Label>
                        <Input
                          type="number"
                          min={1}
                          value={question.weight}
                          onChange={(event) =>
                            setDraft((current) =>
                              current
                                ? {
                                    ...current,
                                    questions: updateQuestionAt(
                                      current.questions,
                                      question.id,
                                      (item) => ({
                                        ...item,
                                        weight: Math.max(1, Number(event.target.value) || 1),
                                      })
                                    ),
                                  }
                                : current
                            )
                          }
                        />
                      </div>
                      <div>
                        <Label className="mb-2 block">Question type</Label>
                        <select
                          value={question.type}
                          onChange={(event) =>
                            setDraft((current) =>
                              current
                                ? {
                                    ...current,
                                    questions: updateQuestionAt(
                                      current.questions,
                                      question.id,
                                      (item) => ({
                                        ...item,
                                        type: event.target.value as PlacementQuestion["type"],
                                      })
                                    ),
                                  }
                                : current
                            )
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
                            setDraft((current) =>
                              current
                                ? {
                                    ...current,
                                    questions: updateQuestionAt(
                                      current.questions,
                                      question.id,
                                      (item) => ({
                                        ...item,
                                        skillType: event.target.value as PlacementQuestion["skillType"],
                                      })
                                    ),
                                  }
                                : current
                            )
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
                            setDraft((current) =>
                              current
                                ? {
                                    ...current,
                                    questions: updateQuestionAt(
                                      current.questions,
                                      question.id,
                                      (item) => ({
                                        ...item,
                                        targetLevel: event.target.value as PlacementQuestion["targetLevel"],
                                      })
                                    ),
                                  }
                                : current
                            )
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
                        <Label className="mb-2 block">Đáp án đúng</Label>
                        <select
                          value={String(question.correctOptionIndex)}
                          onChange={(event) =>
                            setDraft((current) =>
                              current
                                ? {
                                    ...current,
                                    questions: updateQuestionAt(
                                      current.questions,
                                      question.id,
                                      (item) => ({
                                        ...item,
                                        correctOptionIndex: Number(event.target.value) || 0,
                                      })
                                    ),
                                  }
                                : current
                            )
                          }
                          className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                        >
                          {question.options.map((option, optionIndex) => (
                            <option key={`${question.id}-correct-${optionIndex}`} value={optionIndex}>
                              {String.fromCharCode(65 + optionIndex)}. {option || `Option ${optionIndex + 1}`}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label className="mb-2 block">Passage</Label>
                      <Textarea
                        rows={3}
                        value={question.passage}
                        onChange={(event) =>
                          setDraft((current) =>
                            current
                              ? {
                                  ...current,
                                  questions: updateQuestionAt(
                                    current.questions,
                                    question.id,
                                    (item) => ({ ...item, passage: event.target.value })
                                  ),
                                }
                              : current
                          )
                        }
                        placeholder="Có thể để trống với câu hỏi ngắn."
                      />
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">Danh sách đáp án</p>
                          <p className="mt-1 text-xs text-slate-500">
                            Cần tối thiểu 2 đáp án. Xóa đáp án sẽ tự reset correct answer nếu cần.
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-lg"
                          onClick={() =>
                            setDraft((current) =>
                              current
                                ? {
                                    ...current,
                                    questions: updateQuestionAt(
                                      current.questions,
                                      question.id,
                                      (item) => ({ ...item, options: [...item.options, ""] })
                                    ),
                                  }
                                : current
                            )
                          }
                        >
                          <Plus className="h-4 w-4" />
                          Thêm đáp án
                        </Button>
                      </div>
                      <div className="mt-4 space-y-3">
                        {question.options.map((option, optionIndex) => (
                          <div
                            key={`${question.id}-option-${optionIndex}`}
                            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3"
                          >
                            <span className="min-w-6 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                              {String.fromCharCode(65 + optionIndex)}
                            </span>
                            <Input
                              value={option}
                              onChange={(event) =>
                                setDraft((current) =>
                                  current
                                    ? {
                                        ...current,
                                        questions: updateQuestionAt(
                                          current.questions,
                                          question.id,
                                          (item) => ({
                                            ...item,
                                            options: item.options.map((itemOption, itemIndex) =>
                                              itemIndex === optionIndex ? event.target.value : itemOption
                                            ),
                                          })
                                        ),
                                      }
                                    : current
                                )
                              }
                              placeholder={`Đáp án ${optionIndex + 1}`}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="rounded-lg text-slate-500 hover:text-rose-600"
                              disabled={question.options.length <= 2}
                              onClick={() =>
                                setDraft((current) => {
                                  if (!current) return current;

                                  return {
                                    ...current,
                                    questions: updateQuestionAt(
                                      current.questions,
                                      question.id,
                                      (item) => {
                                        if (item.options.length <= 2) {
                                          return item;
                                        }

                                        const nextOptions = item.options.filter(
                                          (_, itemIndex) => itemIndex !== optionIndex
                                        );
                                        const nextCorrectIndex =
                                          item.correctOptionIndex === optionIndex
                                            ? 0
                                            : item.correctOptionIndex > optionIndex
                                              ? item.correctOptionIndex - 1
                                              : item.correctOptionIndex;

                                        return {
                                          ...item,
                                          options: nextOptions,
                                          correctOptionIndex: nextCorrectIndex,
                                        };
                                      }
                                    ),
                                  };
                                })
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="mb-2 block">Explanation</Label>
                      <Textarea
                        rows={3}
                        value={question.explanation}
                        onChange={(event) =>
                          setDraft((current) =>
                            current
                              ? {
                                  ...current,
                                  questions: updateQuestionAt(
                                    current.questions,
                                    question.id,
                                    (item) => ({ ...item, explanation: event.target.value })
                                  ),
                                }
                              : current
                          )
                        }
                        placeholder="Giải thích ngắn để admin dễ rà soát."
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button type="button" variant="outline" className="rounded-xl" onClick={addQuestion}>
                <Plus className="h-4 w-4" />
                Thêm câu hỏi
              </Button>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-slate-50/70 py-5 shadow-none">
            <CardHeader>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle className="text-base">Quy định chấm điểm</CardTitle>
                  <CardDescription>
                    Thiết lập band điểm để detect level sau khi user hoàn thành bài test.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="w-fit rounded-full">
                  Max score hiện tại: {formatNumber(maxScore)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {draft.levelRules.map((rule) => (
                <div
                  key={rule.id}
                  className="grid gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 md:grid-cols-[1fr_1fr_1fr_auto]"
                >
                  <div>
                    <Label className="mb-2 block">Level</Label>
                    <select
                      value={rule.level}
                      onChange={(event) =>
                        setDraft((current) =>
                          current
                            ? {
                                ...current,
                                levelRules: updateRuleAt(current.levelRules, rule.id, (item) => ({
                                  ...item,
                                  level: event.target.value as PlacementLevelRule["level"],
                                })),
                              }
                            : current
                        )
                      }
                      className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                    >
                      {ADMIN_LEVEL_OPTIONS.map((option) => (
                        <option key={`${rule.id}-${option}`} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="mb-2 block">Min score</Label>
                    <Input
                      type="number"
                      min={0}
                      value={rule.minScore}
                      onChange={(event) =>
                        setDraft((current) =>
                          current
                            ? {
                                ...current,
                                levelRules: updateRuleAt(current.levelRules, rule.id, (item) => ({
                                  ...item,
                                  minScore: Math.max(0, Number(event.target.value) || 0),
                                })),
                              }
                            : current
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block">Max score</Label>
                    <Input
                      type="number"
                      min={0}
                      value={rule.maxScore}
                      onChange={(event) =>
                        setDraft((current) =>
                          current
                            ? {
                                ...current,
                                levelRules: updateRuleAt(current.levelRules, rule.id, (item) => ({
                                  ...item,
                                  maxScore: Math.max(0, Number(event.target.value) || 0),
                                })),
                              }
                            : current
                        )
                      }
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-lg"
                      onClick={() => removeRule(rule.id)}
                      disabled={draft.levelRules.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <Button type="button" variant="outline" className="rounded-xl" onClick={addRule}>
                <Plus className="h-4 w-4" />
                Thêm scoring rule
              </Button>

              <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4 text-sm text-sky-900">
                Rule cần nối liên tục từ `0` đến ít nhất `max score`. Khi user làm xong,
                hệ thống sẽ detect level theo band điểm này và sau đó vẫn hỏi user xác nhận.
              </div>
            </CardContent>
          </Card>
        </CardContent>
        <CardFooter className="justify-end gap-3 border-t border-slate-100">
          <Button asChild type="button" variant="outline" className="rounded-xl">
            <Link href="/admin/placement-tests">Hủy</Link>
          </Button>
          <Button type="button" className="rounded-xl" onClick={handleSave}>
            <ShieldCheck className="h-4 w-4" />
            {testId ? "Lưu thay đổi" : "Tạo placement test"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
