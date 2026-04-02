"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Plus, Sparkles, Trash2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";

import { AdminPageError, AdminPageLoading } from "@/components/admin/admin-query-state";
import { ImageUploadPreview } from "@/components/admin/image-upload-preview";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateAdminExerciseMutation,
  useGetAdminExercisesQuery,
  useUpdateAdminExerciseMutation,
} from "@/store/services/adminApi";
import {
  ADMIN_EXERCISE_TYPE_OPTIONS,
  ADMIN_LEVEL_OPTIONS,
  formatNumber,
  notify,
} from "@/lib/admin";
import type { AdminExerciseItem, AdminExercisePayload } from "@/types";

type Props = {
  exerciseId?: string;
};

type ExerciseQuestionEditor = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: string;
  explanation: string;
  score: string;
};

type ExerciseFormState = {
  title: string;
  description: string;
  type: string;
  level: string;
  topic: string;
  coverImage: string;
  coverImageFile: File | null;
  durationMinutes: string;
  rewardsXp: string;
  skillsText: string;
};

const BULK_IMPORT_TEMPLATE = `[
  {
    "prompt": "Choose the correct answer: She ___ to school every day.",
    "options": ["go", "goes", "going", "gone"],
    "correctIndex": 1,
    "explanation": "He/She/It o thi dong tu them -es.",
    "score": 1
  }
]`;

const createEmptyQuestion = (index = 0): ExerciseQuestionEditor => ({
  id: `question-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
  prompt: "",
  options: ["", ""],
  correctIndex: "0",
  explanation: "",
  score: "1",
});

const emptyForm: ExerciseFormState = {
  title: "",
  description: "",
  type: "mcq",
  level: "A1",
  topic: "general",
  coverImage: "",
  coverImageFile: null,
  durationMinutes: "8",
  rewardsXp: "0",
  skillsText: "",
};

const mapExerciseToForm = (item: AdminExerciseItem): ExerciseFormState => ({
  title: item.title,
  description: item.description,
  type: item.type,
  level: item.level,
  topic: item.topic,
  coverImage: item.coverImage,
  coverImageFile: null,
  durationMinutes: String(item.durationMinutes),
  rewardsXp: String(item.rewardsXp),
  skillsText: item.skills.join(", "),
});

const buildBasePayload = (form: ExerciseFormState) => ({
  title: form.title.trim(),
  description: form.description.trim(),
  type: form.type,
  level: form.level,
  topic: form.topic.trim() || "general",
  coverImage: form.coverImage.trim(),
  coverImageFile: form.coverImageFile,
  durationMinutes: Number(form.durationMinutes) || 8,
  rewardsXp: Number(form.rewardsXp) || 0,
  skills: form.skillsText
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean),
});

const toQuestionPayload = (
  questions: ExerciseQuestionEditor[],
): AdminExercisePayload["questions"] =>
  questions.map((question, index) => {
    const options = question.options.map((item) => item.trim()).filter(Boolean);

    if (!question.prompt.trim()) {
      throw new Error(`Câu ${index + 1} đang thiếu nội dung câu hỏi`);
    }

    if (options.length < 2) {
      throw new Error(`Câu ${index + 1} cần ít nhất 2 đáp án`);
    }

    const correctIndex = Number(question.correctIndex);

    if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= options.length) {
      throw new Error(`Câu ${index + 1} có correctIndex không hợp lệ`);
    }

    return {
      prompt: question.prompt.trim(),
      question: question.prompt.trim(),
      options,
      correctAnswer: options[correctIndex],
      correctIndex,
      explanation: question.explanation.trim(),
      score: Number(question.score) || 1,
    };
  });

const mapBulkQuestionsToEditor = (input: unknown): ExerciseQuestionEditor[] => {
  if (!Array.isArray(input)) {
    throw new Error("Dữ liệu import phải là một mảng JSON");
  }

  return input.map((item, index) => {
    if (!item || typeof item !== "object") {
      throw new Error(`Phần tử ${index + 1} không hợp lệ`);
    }

    const record = item as {
      prompt?: unknown;
      question?: unknown;
      options?: unknown;
      correctIndex?: unknown;
      explanation?: unknown;
      score?: unknown;
    };

    const prompt = String(record.prompt || record.question || "").trim();
    const options = Array.isArray(record.options)
      ? record.options.map((option) => String(option).trim()).filter(Boolean)
      : [];

    if (!prompt) {
      throw new Error(`Phần tử ${index + 1} đang thiếu prompt`);
    }

    if (options.length < 2) {
      throw new Error(`Phần tử ${index + 1} cần ít nhất 2 options`);
    }

    return {
      id: createEmptyQuestion(index).id,
      prompt,
      options,
      correctIndex: String(Number(record.correctIndex ?? 0)),
      explanation: String(record.explanation || ""),
      score: String(Number(record.score ?? 1) || 1),
    };
  });
};

export function ExerciseEditorScreen({ exerciseId }: Props) {
  const router = useRouter();
  const { data, isLoading, isError, error } = useGetAdminExercisesQuery();
  const [createExercise, { isLoading: isCreating }] =
    useCreateAdminExerciseMutation();
  const [updateExercise, { isLoading: isUpdating }] =
    useUpdateAdminExerciseMutation();

  const [form, setForm] = useState<ExerciseFormState>(emptyForm);
  const [editingItem, setEditingItem] = useState<AdminExerciseItem | null>(null);
  const [questions, setQuestions] = useState<ExerciseQuestionEditor[]>([createEmptyQuestion()]);
  const [questionsDirty, setQuestionsDirty] = useState(false);
  const [bulkImportText, setBulkImportText] = useState(BULK_IMPORT_TEMPLATE);

  const items = data ?? [];

  useEffect(() => {
    if (!exerciseId) {
      setEditingItem(null);
      setForm(emptyForm);
      setQuestions([createEmptyQuestion()]);
      setQuestionsDirty(false);
      return;
    }

    const item = items.find((entry) => entry.id === exerciseId);
    if (!item) {
      return;
    }

    setEditingItem(item);
    setForm(mapExerciseToForm(item));
    setQuestions([createEmptyQuestion()]);
    setQuestionsDirty(false);
  }, [exerciseId, items]);

  const markQuestionsDirty = () => setQuestionsDirty(true);

  const updateQuestion = (
    questionId: string,
    field: keyof ExerciseQuestionEditor,
    value: string | string[],
  ) => {
    markQuestionsDirty();
    setQuestions((current) =>
      current.map((question) =>
        question.id === questionId ? { ...question, [field]: value } : question,
      ),
    );
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    markQuestionsDirty();
    setQuestions((current) =>
      current.map((question) => {
        if (question.id !== questionId) {
          return question;
        }

        const nextOptions = question.options.map((option, index) =>
          index === optionIndex ? value : option,
        );

        return {
          ...question,
          options: nextOptions,
        };
      }),
    );
  };

  const addOption = (questionId: string) => {
    markQuestionsDirty();
    setQuestions((current) =>
      current.map((question) =>
        question.id === questionId
          ? { ...question, options: [...question.options, ""] }
          : question,
      ),
    );
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    markQuestionsDirty();
    setQuestions((current) =>
      current.map((question) => {
        if (question.id !== questionId) {
          return question;
        }

        if (question.options.length <= 2) {
          return question;
        }

        const nextOptions = question.options.filter((_, index) => index !== optionIndex);
        const currentCorrectIndex = Number(question.correctIndex);
        const nextCorrectIndex =
          currentCorrectIndex === optionIndex
            ? 0
            : currentCorrectIndex > optionIndex
              ? currentCorrectIndex - 1
              : currentCorrectIndex;

        return {
          ...question,
          options: nextOptions,
          correctIndex: String(nextCorrectIndex),
        };
      }),
    );
  };

  const addQuestion = () => {
    markQuestionsDirty();
    setQuestions((current) => [...current, createEmptyQuestion(current.length)]);
  };

  const removeQuestion = (questionId: string) => {
    markQuestionsDirty();
    setQuestions((current) =>
      current.length === 1
        ? [createEmptyQuestion()]
        : current.filter((question) => question.id !== questionId),
    );
  };

  const applyBulkImport = (mode: "append" | "replace") => {
    try {
      const parsed = JSON.parse(bulkImportText);
      const importedQuestions = mapBulkQuestionsToEditor(parsed);

      markQuestionsDirty();
      setQuestions((current) =>
        mode === "replace" ? importedQuestions : [...current, ...importedQuestions],
      );

      notify({
        title: mode === "replace" ? "Đã thay toàn bộ câu hỏi" : "Đã thêm câu hỏi hàng loạt",
        message: `${formatNumber(importedQuestions.length)} câu đã được nạp vào form.`,
        type: "success",
      });
    } catch (bulkError) {
      notify({
        title: "Không thể import câu hỏi",
        message:
          bulkError instanceof Error
            ? bulkError.message
            : "Kiểm tra lại định dạng JSON mẫu.",
        type: "error",
      });
    }
  };

  const handleSubmit = async () => {
    try {
      const basePayload = buildBasePayload(form);

      if (!basePayload.title) {
        notify({
          title: "Thiếu tiêu đề",
          message: "Exercise cần có title trước khi lưu.",
          type: "warning",
        });
        return;
      }

      const normalizedQuestions =
        questionsDirty || !editingItem ? toQuestionPayload(questions) : undefined;

      if (!editingItem && (!normalizedQuestions || normalizedQuestions.length === 0)) {
        notify({
          title: "Thiếu câu hỏi",
          message: "Exercise mới cần ít nhất 1 câu hỏi.",
          type: "warning",
        });
        return;
      }

      if (editingItem) {
        const updateBody: Partial<AdminExercisePayload> = { ...basePayload };
        if (normalizedQuestions) {
          updateBody.questions = normalizedQuestions;
        }

        await updateExercise({ id: editingItem.id, body: updateBody }).unwrap();
        notify({ title: "Đã cập nhật exercise", type: "success" });
      } else {
        await createExercise({
          ...basePayload,
          questions: normalizedQuestions ?? [],
        }).unwrap();
        notify({ title: "Đã tạo exercise mới", type: "success" });
      }

      router.push("/admin/exercises");
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

  const renderQuestionCard = (
    question: ExerciseQuestionEditor,
    index: number,
    description: string,
  ) => (
    <Card key={question.id} className="border-slate-200 bg-white py-5 shadow-none">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base">Câu hỏi {index + 1}</CardTitle>
            <CardDescription>{description}</CardDescription>
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
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Nội dung câu hỏi
          </label>
          <Textarea
            rows={3}
            value={question.prompt}
            onChange={(event) =>
              updateQuestion(question.id, "prompt", event.target.value)
            }
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Danh sách đáp án</p>
              <p className="mt-1 text-xs text-slate-500">
                Chọn đáp án đúng rồi thêm hoặc xóa từng option riêng lẻ.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-lg"
              onClick={() => addOption(question.id)}
            >
              <Plus className="h-4 w-4" />
              Thêm đáp án
            </Button>
          </div>

          <RadioGroup
            value={question.correctIndex}
            onValueChange={(value) => updateQuestion(question.id, "correctIndex", value)}
            className="mt-4 gap-3"
          >
            {question.options.map((option, optionIndex) => (
              <div
                key={`${question.id}-option-${optionIndex}`}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3"
              >
                <RadioGroupItem
                  value={String(optionIndex)}
                  id={`${question.id}-correct-${optionIndex}`}
                />
                <Label
                  htmlFor={`${question.id}-correct-${optionIndex}`}
                  className="min-w-8 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400"
                >
                  {String.fromCharCode(65 + optionIndex)}
                </Label>
                <Input
                  value={option}
                  onChange={(event) =>
                    updateOption(question.id, optionIndex, event.target.value)
                  }
                  placeholder={`Đáp án ${optionIndex + 1}`}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="rounded-lg text-slate-500 hover:text-rose-600"
                  onClick={() => removeOption(question.id, optionIndex)}
                  disabled={question.options.length <= 2}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Đáp án đúng
            </label>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {question.options[Number(question.correctIndex)]?.trim() || "Chưa chọn đáp án đúng"}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Score
            </label>
            <Input
              type="number"
              value={question.score}
              onChange={(event) =>
                updateQuestion(question.id, "score", event.target.value)
              }
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Giải thích
          </label>
          <Textarea
            rows={3}
            value={question.explanation}
            onChange={(event) =>
              updateQuestion(question.id, "explanation", event.target.value)
            }
          />
        </div>
      </CardContent>
    </Card>
  );

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

  if (exerciseId && !editingItem) {
    return <AdminPageError message="Không tìm thấy exercise để chỉnh sửa." />;
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
              Exercise Editor
            </Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              {editingItem ? "Chỉnh sửa exercise" : "Tạo exercise mới"}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
              Màn hình biên tập tách biệt, có nhập từng câu và import nhiều câu theo mẫu chuẩn.
            </p>
          </div>

          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/admin/exercises">
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
                Skills
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
            <div className="md:col-span-2 lg:col-span-1">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Cover image
              </label>
              <Input
                type="file"
                accept="image/*"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    coverImageFile: event.target.files?.[0] ?? null,
                  }))
                }
              />
              <div className="mt-3 max-w-xs">
                <ImageUploadPreview
                  file={form.coverImageFile}
                  currentUrl={form.coverImage}
                  alt="Exercise cover preview"
                  emptyText="Chọn ảnh bìa để xem trước trước khi upload."
                  ratio={4 / 3}
                />
              </div>
            </div>
          </div>

            <Card className="border-slate-200 bg-slate-50/70 py-5 shadow-none">
              <CardHeader>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <CardTitle className="text-base">Ngân hàng câu hỏi</CardTitle>
                    <CardDescription>
                      Thêm từng câu một hoặc import nhiều câu theo mẫu JSON chuẩn.
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="w-fit rounded-full">
                    {formatNumber(questions.length)} câu trong form
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {editingItem && !questionsDirty ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    Nếu bạn thêm, xóa hoặc import ở đây thì hệ thống sẽ cập nhật lại
                    toàn bộ questions của bài tập này.
                  </div>
                ) : null}

                <Tabs defaultValue="single" className="gap-4">
                  <TabsList className="w-full justify-start rounded-xl bg-slate-100 p-1 md:w-fit">
                    <TabsTrigger value="single">Thêm từng câu</TabsTrigger>
                    <TabsTrigger value="bulk">Thêm nhiều câu</TabsTrigger>
                  </TabsList>

                  <TabsContent value="single" className="space-y-4">
                    {questions.map((question, index) =>
                      renderQuestionCard(
                        question,
                        index,
                        "Chọn đáp án đúng bằng radio và thêm option khi cần.",
                      ),
                    )}

                    <Button type="button" variant="outline" className="rounded-xl" onClick={addQuestion}>
                      <Plus className="h-4 w-4" />
                      Thêm một câu hỏi
                    </Button>
                  </TabsContent>

                  <TabsContent value="bulk" className="space-y-4">
                    <Card className="border-slate-200 bg-white py-5 shadow-none">
                      <CardHeader>
                        <CardTitle className="text-base">Mẫu import nhiều câu</CardTitle>
                        <CardDescription>
                          Dán một mảng JSON. Mỗi phần tử gồm `prompt`, `options`,
                          `correctIndex`, `explanation`, `score`.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                          <p className="font-medium text-slate-900">Quy định</p>
                          <p className="mt-2">`options` phải là mảng đáp án.</p>
                          <p className="mt-1">`correctIndex` bắt đầu từ `0`.</p>
                          <p className="mt-1">Mỗi object tương ứng một câu hỏi.</p>
                        </div>
                        <Textarea
                          rows={16}
                          value={bulkImportText}
                          onChange={(event) => setBulkImportText(event.target.value)}
                          className="font-mono text-xs"
                        />
                      </CardContent>
                      <CardFooter className="flex flex-wrap gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-xl"
                          onClick={() => applyBulkImport("append")}
                        >
                          <Upload className="h-4 w-4" />
                          Thêm vào danh sách
                        </Button>
                        <Button
                          type="button"
                          className="rounded-xl"
                          onClick={() => applyBulkImport("replace")}
                        >
                          <Sparkles className="h-4 w-4" />
                          Thay toàn bộ danh sách
                        </Button>
                      </CardFooter>
                    </Card>

                    <Card className="border-slate-200 bg-white py-5 shadow-none">
                      <CardHeader>
                        <CardTitle className="text-base">Preview câu hỏi đã thêm</CardTitle>
                        <CardDescription>
                          Danh sách này đồng bộ trực tiếp với form. Bạn vẫn có thể sửa,
                          xóa hoặc thêm tiếp ở đây như bình thường.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {questions.map((question, index) =>
                          renderQuestionCard(
                            question,
                            index,
                            "Preview sau import, có thể chỉnh trực tiếp trước khi lưu.",
                          ),
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </CardContent>

          <CardFooter className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-6">
            <Button asChild type="button" variant="outline" className="rounded-xl">
              <Link href="/admin/exercises">Hủy</Link>
            </Button>
            <Button
              type="button"
              onClick={() => void handleSubmit()}
              className="rounded-xl"
              disabled={isCreating || isUpdating}
            >
              {editingItem ? "Lưu thay đổi" : "Tạo exercise"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
}
