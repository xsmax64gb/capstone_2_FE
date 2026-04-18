"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  FileJson,
  Info,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
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

// ─── Types ───────────────────────────────────────────────────────────────────

type Props = { exerciseId?: string };

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

// ─── Constants ───────────────────────────────────────────────────────────────

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];

const BULK_IMPORT_TEMPLATE = `[
  {
    "prompt": "Choose the correct answer: She ___ to school every day.",
    "options": ["go", "goes", "going", "gone"],
    "correctIndex": 1,
    "explanation": "He/She/It + động từ thêm -s/-es ở thì hiện tại đơn.",
    "score": 1
  },
  {
    "prompt": "Which word means 'happy'?",
    "options": ["sad", "angry", "joyful", "tired"],
    "correctIndex": 2,
    "explanation": "'Joyful' có nghĩa là vui vẻ, hạnh phúc.",
    "score": 1
  }
]`;

const FIELD_HINTS: Record<string, string> = {
  title: "Tên hiển thị cho học viên. Nên ngắn gọn, rõ ràng chủ đề.",
  description: "Mô tả ngắn về nội dung bài tập. Học viên sẽ thấy trước khi bắt đầu.",
  type: "Dạng câu hỏi: Trắc nghiệm (MCQ), Điền chỗ trống, hay Nối cặp.",
  level: "Cấp độ CEFR của bài tập, từ A1 (sơ cấp) đến C2 (thành thạo).",
  topic: "Chủ đề nội dung. Ví dụ: daily-life, work, travel, technology.",
  durationMinutes: "Thời gian ước tính hoàn thành bài (phút). Dùng để hiển thị cho học viên.",
  rewardsXp: "Số XP tối đa học viên nhận được khi đạt 100% điểm.",
  skillsText: "Các kỹ năng luyện tập, cách nhau bởi dấu phẩy. VD: grammar, vocabulary, reading.",
  coverImage: "Ảnh bìa hiển thị trong danh sách bài tập. Khuyến nghị tỉ lệ 4:3.",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const createEmptyQuestion = (index = 0): ExerciseQuestionEditor => ({
  id: `q-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
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
    .map((s) => s.trim())
    .filter(Boolean),
});

const toQuestionPayload = (
  questions: ExerciseQuestionEditor[],
): AdminExercisePayload["questions"] =>
  questions.map((q, idx) => {
    const options = q.options.map((o) => o.trim()).filter(Boolean);
    if (!q.prompt.trim()) throw new Error(`Câu ${idx + 1}: Thiếu nội dung câu hỏi.`);
    if (options.length < 2) throw new Error(`Câu ${idx + 1}: Cần ít nhất 2 đáp án.`);
    const ci = Number(q.correctIndex);
    if (!Number.isInteger(ci) || ci < 0 || ci >= options.length)
      throw new Error(`Câu ${idx + 1}: Đáp án đúng không hợp lệ.`);
    return {
      prompt: q.prompt.trim(),
      question: q.prompt.trim(),
      options,
      correctAnswer: options[ci],
      correctIndex: ci,
      explanation: q.explanation.trim(),
      score: Number(q.score) || 1,
    };
  });

const mapBulkQuestionsToEditor = (input: unknown): ExerciseQuestionEditor[] => {
  if (!Array.isArray(input)) throw new Error("Dữ liệu import phải là một mảng JSON.");
  return input.map((item, idx) => {
    if (!item || typeof item !== "object") throw new Error(`Phần tử ${idx + 1} không hợp lệ.`);
    const r = item as {
      prompt?: unknown;
      question?: unknown;
      options?: unknown;
      correctIndex?: unknown;
      explanation?: unknown;
      score?: unknown;
    };
    const prompt = String(r.prompt || r.question || "").trim();
    const options = Array.isArray(r.options)
      ? r.options.map((o) => String(o).trim()).filter(Boolean)
      : [];
    if (!prompt) throw new Error(`Phần tử ${idx + 1}: Thiếu trường "prompt".`);
    if (options.length < 2)
      throw new Error(`Phần tử ${idx + 1}: "options" cần ít nhất 2 phần tử.`);
    return {
      id: createEmptyQuestion(idx).id,
      prompt,
      options,
      correctIndex: String(Number(r.correctIndex ?? 0)),
      explanation: String(r.explanation || ""),
      score: String(Number(r.score ?? 1) || 1),
    };
  });
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function FieldHint({ text }: { text: string }) {
  return (
    <p className="mt-1 flex items-start gap-1 text-xs text-slate-400">
      <Info className="mt-0.5 h-3 w-3 shrink-0" />
      {text}
    </p>
  );
}

function FormLabel({
  htmlFor,
  required,
  children,
}: {
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-sm font-semibold text-slate-700"
    >
      {children}
      {required && <span className="ml-1 text-rose-500">*</span>}
    </label>
  );
}

// ─── Question Card ────────────────────────────────────────────────────────────

function QuestionCard({
  question,
  index,
  onUpdate,
  onUpdateOption,
  onAddOption,
  onRemoveOption,
  onRemove,
}: {
  question: ExerciseQuestionEditor;
  index: number;
  onUpdate: (id: string, field: keyof ExerciseQuestionEditor, value: string | string[]) => void;
  onUpdateOption: (id: string, optIdx: number, val: string) => void;
  onAddOption: (id: string) => void;
  onRemoveOption: (id: string, optIdx: number) => void;
  onRemove: (id: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const correctLabel =
    question.options[Number(question.correctIndex)]?.trim() || null;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Card header */}
      <div
        className="flex cursor-pointer items-center gap-3 px-5 py-3.5 hover:bg-slate-50"
        onClick={() => setCollapsed((c) => !c)}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-xs font-black text-white">
          {index + 1}
        </span>
        <p className="flex-1 truncate text-sm font-semibold text-slate-800">
          {question.prompt.trim() || (
            <span className="italic text-slate-400">Chưa nhập câu hỏi…</span>
          )}
        </p>
        {correctLabel && (
          <span className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 sm:inline-block">
            ✓ {correctLabel}
          </span>
        )}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(question.id);
            }}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          {collapsed ? (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronUp className="h-4 w-4 text-slate-400" />
          )}
        </div>
      </div>

      {/* Card body */}
      {!collapsed && (
        <div className="space-y-5 border-t border-slate-100 px-5 py-5">
          {/* Prompt */}
          <div>
            <FormLabel htmlFor={`prompt-${question.id}`} required>
              Nội dung câu hỏi
            </FormLabel>
            <Textarea
              id={`prompt-${question.id}`}
              rows={3}
              placeholder="VD: Choose the correct answer: She ___ to school every day."
              value={question.prompt}
              onChange={(e) => onUpdate(question.id, "prompt", e.target.value)}
            />
          </div>

          {/* Options */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-800">Danh sách đáp án</p>
                <p className="text-xs text-slate-500">
                  Chọn radio để đánh dấu đáp án đúng. Tối thiểu 2 đáp án.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-lg"
                onClick={() => onAddOption(question.id)}
              >
                <Plus className="h-4 w-4" />
                Thêm đáp án
              </Button>
            </div>

            <RadioGroup
              value={question.correctIndex}
              onValueChange={(v) => onUpdate(question.id, "correctIndex", v)}
              className="space-y-2"
            >
              {question.options.map((option, optIdx) => {
                const letter = OPTION_LETTERS[optIdx] ?? String(optIdx + 1);
                const isCorrect = question.correctIndex === String(optIdx);
                return (
                  <div
                    key={`${question.id}-opt-${optIdx}`}
                    className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors ${
                      isCorrect
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <RadioGroupItem
                      value={String(optIdx)}
                      id={`${question.id}-ri-${optIdx}`}
                    />
                    <Label
                      htmlFor={`${question.id}-ri-${optIdx}`}
                      className={`w-6 text-xs font-black ${
                        isCorrect ? "text-emerald-700" : "text-slate-400"
                      }`}
                    >
                      {letter}
                    </Label>
                    <Input
                      value={option}
                      onChange={(e) => onUpdateOption(question.id, optIdx, e.target.value)}
                      placeholder={`Đáp án ${letter}`}
                      className={`flex-1 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0 ${
                        isCorrect ? "font-semibold text-emerald-800" : ""
                      }`}
                    />
                    <button
                      type="button"
                      disabled={question.options.length <= 2}
                      onClick={() => onRemoveOption(question.id, optIdx)}
                      className="rounded-lg p-1 text-slate-300 hover:text-rose-500 disabled:opacity-20 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </RadioGroup>

            {/* Correct answer preview */}
            <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-500">
                Đáp án đúng đang chọn
              </p>
              <p className="mt-0.5 text-sm font-semibold text-emerald-800">
                {correctLabel ?? (
                  <span className="italic text-slate-400">Chưa chọn đáp án đúng</span>
                )}
              </p>
            </div>
          </div>

          {/* Bottom fields: score + explanation */}
          <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
            <div>
              <FormLabel htmlFor={`score-${question.id}`}>
                Điểm câu này
              </FormLabel>
              <Input
                id={`score-${question.id}`}
                type="number"
                min={1}
                value={question.score}
                onChange={(e) => onUpdate(question.id, "score", e.target.value)}
              />
              <FieldHint text="Mỗi câu thường = 1 điểm." />
            </div>
            <div>
              <FormLabel htmlFor={`expl-${question.id}`}>
                Giải thích đáp án
              </FormLabel>
              <Textarea
                id={`expl-${question.id}`}
                rows={3}
                placeholder="Giải thích tại sao đáp án đúng. Học viên sẽ thấy khi xem lại bài."
                value={question.explanation}
                onChange={(e) => onUpdate(question.id, "explanation", e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ExerciseEditorScreen({ exerciseId }: Props) {
  const router = useRouter();
  const { data, isLoading, isError, error } = useGetAdminExercisesQuery();
  const [createExercise, { isLoading: isCreating }] = useCreateAdminExerciseMutation();
  const [updateExercise, { isLoading: isUpdating }] = useUpdateAdminExerciseMutation();

  const [form, setForm] = useState<ExerciseFormState>(emptyForm);
  const [editingItem, setEditingItem] = useState<AdminExerciseItem | null>(null);
  const [questions, setQuestions] = useState<ExerciseQuestionEditor[]>([createEmptyQuestion()]);
  const [questionsDirty, setQuestionsDirty] = useState(false);
  const [bulkImportText, setBulkImportText] = useState(BULK_IMPORT_TEMPLATE);

  const items = data ?? [];
  const isSaving = isCreating || isUpdating;

  useEffect(() => {
    if (!exerciseId) {
      setEditingItem(null);
      setForm(emptyForm);
      setQuestions([createEmptyQuestion()]);
      setQuestionsDirty(false);
      return;
    }
    const item = items.find((e) => e.id === exerciseId);
    if (!item) return;
    setEditingItem(item);
    setForm(mapExerciseToForm(item));
    setQuestions([createEmptyQuestion()]);
    setQuestionsDirty(false);
  }, [exerciseId, items]);

  const dirty = () => setQuestionsDirty(true);

  const updateQuestion = (
    qId: string,
    field: keyof ExerciseQuestionEditor,
    value: string | string[],
  ) => {
    dirty();
    setQuestions((qs) =>
      qs.map((q) => (q.id === qId ? { ...q, [field]: value } : q)),
    );
  };

  const updateOption = (qId: string, optIdx: number, val: string) => {
    dirty();
    setQuestions((qs) =>
      qs.map((q) =>
        q.id === qId
          ? { ...q, options: q.options.map((o, i) => (i === optIdx ? val : o)) }
          : q,
      ),
    );
  };

  const addOption = (qId: string) => {
    dirty();
    setQuestions((qs) =>
      qs.map((q) =>
        q.id === qId ? { ...q, options: [...q.options, ""] } : q,
      ),
    );
  };

  const removeOption = (qId: string, optIdx: number) => {
    dirty();
    setQuestions((qs) =>
      qs.map((q) => {
        if (q.id !== qId || q.options.length <= 2) return q;
        const nextOpts = q.options.filter((_, i) => i !== optIdx);
        const ci = Number(q.correctIndex);
        const nextCi = ci === optIdx ? 0 : ci > optIdx ? ci - 1 : ci;
        return { ...q, options: nextOpts, correctIndex: String(nextCi) };
      }),
    );
  };

  const addQuestion = () => {
    dirty();
    setQuestions((qs) => [...qs, createEmptyQuestion(qs.length)]);
  };

  const removeQuestion = (qId: string) => {
    dirty();
    setQuestions((qs) => (qs.length === 1 ? [createEmptyQuestion()] : qs.filter((q) => q.id !== qId)));
  };

  const applyBulkImport = (mode: "append" | "replace") => {
    try {
      const parsed = JSON.parse(bulkImportText);
      const imported = mapBulkQuestionsToEditor(parsed);
      dirty();
      setQuestions((qs) => (mode === "replace" ? imported : [...qs, ...imported]));
      notify({
        title: mode === "replace" ? "Đã thay toàn bộ câu hỏi" : "Đã thêm câu hỏi hàng loạt",
        message: `${formatNumber(imported.length)} câu đã được nạp vào form.`,
        type: "success",
      });
    } catch (err) {
      notify({
        title: "Không thể import câu hỏi",
        message: err instanceof Error ? err.message : "Kiểm tra lại định dạng JSON.",
        type: "error",
      });
    }
  };

  const handleSubmit = async () => {
    try {
      const base = buildBasePayload(form);
      if (!base.title) {
        notify({ title: "Thiếu tiêu đề", message: "Bài tập cần có tên trước khi lưu.", type: "warning" });
        return;
      }
      const normalizedQs =
        questionsDirty || !editingItem ? toQuestionPayload(questions) : undefined;
      if (!editingItem && (!normalizedQs || normalizedQs.length === 0)) {
        notify({ title: "Thiếu câu hỏi", message: "Bài tập mới cần ít nhất 1 câu hỏi.", type: "warning" });
        return;
      }

      if (editingItem) {
        const body: Partial<AdminExercisePayload> = { ...base };
        if (normalizedQs) body.questions = normalizedQs;
        await updateExercise({ id: editingItem.id, body }).unwrap();
        notify({ title: "Đã cập nhật bài tập", type: "success" });
      } else {
        await createExercise({ ...base, questions: normalizedQs ?? [] }).unwrap();
        notify({ title: "Đã tạo bài tập mới", type: "success" });
      }
      router.push("/admin/exercises");
    } catch (err) {
      notify({
        title: "Không thể lưu bài tập",
        message: err instanceof Error ? err.message : "Kiểm tra lại dữ liệu nhập.",
        type: "error",
      });
    }
  };

  // ── Loading / Error states ────────────────────────────────────────────────
  if (isLoading) return <AdminPageLoading />;

  if (isError) {
    const msg =
      typeof error === "object" && error && "status" in error
        ? `Yêu cầu thất bại (${String(error.status)}).`
        : undefined;
    return <AdminPageError message={msg} />;
  }

  if (exerciseId && !editingItem) {
    return <AdminPageError message="Không tìm thấy bài tập để chỉnh sửa." />;
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── Page Header ────────────────────────────────────────────────── */}
      <section className="rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Badge
              variant="outline"
              className="rounded-full border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500"
            >
              {editingItem ? "Chỉnh sửa bài tập" : "Tạo bài tập mới"}
            </Badge>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
              {editingItem ? `Chỉnh sửa: ${editingItem.title}` : "Tạo bài tập mới"}
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Điền đầy đủ thông tin bên dưới. Câu hỏi có thể nhập từng câu hoặc import JSON hàng loạt.
            </p>
          </div>
          <Button asChild variant="outline" className="shrink-0 rounded-xl">
            <Link href="/admin/exercises">
              <ArrowLeft className="h-4 w-4" />
              Quay lại danh sách
            </Link>
          </Button>
        </div>
      </section>

      {/* ── Basic Info ─────────────────────────────────────────────────── */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/60 pb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-slate-500" />
            <CardTitle className="text-base font-bold">Thông tin cơ bản</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Các trường có dấu <span className="text-rose-500 font-bold">*</span> là bắt buộc.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 pt-6">
          {/* Title */}
          <div className="md:col-span-2">
            <FormLabel htmlFor="title" required>Tiêu đề bài tập</FormLabel>
            <Input
              id="title"
              placeholder="VD: Grammar – Present Simple Tense"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
            <FieldHint text={FIELD_HINTS.title} />
          </div>

          {/* Level / Type / Topic / Duration / XP */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <div>
              <FormLabel htmlFor="level" required>Cấp độ (Level)</FormLabel>
              <select
                id="level"
                value={form.level}
                onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                {ADMIN_LEVEL_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <FieldHint text={FIELD_HINTS.level} />
            </div>

            <div>
              <FormLabel htmlFor="type" required>Dạng bài (Type)</FormLabel>
              <select
                id="type"
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                {ADMIN_EXERCISE_TYPE_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <FieldHint text={FIELD_HINTS.type} />
            </div>

            <div>
              <FormLabel htmlFor="topic">Chủ đề (Topic)</FormLabel>
              <Input
                id="topic"
                placeholder="daily-life, work, travel…"
                value={form.topic}
                onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
              />
              <FieldHint text={FIELD_HINTS.topic} />
            </div>

            <div>
              <FormLabel htmlFor="duration" required>Thời lượng (phút)</FormLabel>
              <Input
                id="duration"
                type="number"
                min={1}
                value={form.durationMinutes}
                onChange={(e) => setForm((f) => ({ ...f, durationMinutes: e.target.value }))}
              />
              <FieldHint text={FIELD_HINTS.durationMinutes} />
            </div>

            <div>
              <FormLabel htmlFor="xp">Điểm thưởng XP</FormLabel>
              <Input
                id="xp"
                type="number"
                min={0}
                value={form.rewardsXp}
                onChange={(e) => setForm((f) => ({ ...f, rewardsXp: e.target.value }))}
              />
              <FieldHint text={FIELD_HINTS.rewardsXp} />
            </div>

            <div>
              <FormLabel htmlFor="skills">Kỹ năng luyện tập</FormLabel>
              <Input
                id="skills"
                placeholder="grammar, vocabulary, reading"
                value={form.skillsText}
                onChange={(e) => setForm((f) => ({ ...f, skillsText: e.target.value }))}
              />
              <FieldHint text={FIELD_HINTS.skillsText} />
            </div>
          </div>

          {/* Description */}
          <div>
            <FormLabel htmlFor="description">Mô tả bài tập</FormLabel>
            <Textarea
              id="description"
              rows={3}
              placeholder="Mô tả ngắn gọn nội dung và mục tiêu của bài tập này."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
            <FieldHint text={FIELD_HINTS.description} />
          </div>

          {/* Cover image */}
          <div>
            <FormLabel htmlFor="cover">Ảnh bìa (Cover Image)</FormLabel>
            <Input
              id="cover"
              type="file"
              accept="image/*"
              onChange={(e) =>
                setForm((f) => ({ ...f, coverImageFile: e.target.files?.[0] ?? null }))
              }
            />
            <FieldHint text={FIELD_HINTS.coverImage} />
            <div className="mt-3 max-w-xs">
              <ImageUploadPreview
                file={form.coverImageFile}
                currentUrl={form.coverImage}
                alt="Ảnh bìa bài tập"
                emptyText="Chọn file để xem trước."
                ratio={4 / 3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Question Bank ───────────────────────────────────────────────── */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/60 pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-slate-500" />
              <div>
                <CardTitle className="text-base font-bold">Ngân hàng câu hỏi</CardTitle>
                <CardDescription className="mt-0.5 text-xs">
                  Nhập từng câu hoặc import JSON hàng loạt từ AI.
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="w-fit rounded-full text-xs">
              {formatNumber(questions.length)} câu trong form
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-5">
          {editingItem && !questionsDirty && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <p className="font-semibold">⚠️ Chỉnh sửa câu hỏi hiện có</p>
              <p className="mt-1 text-xs">
                Bài tập này đã có{" "}
                <strong>{editingItem.questionCount} câu</strong> trên hệ thống. Nếu bạn thêm, xóa
                hoặc import tại đây, toàn bộ câu hỏi cũ sẽ bị <strong>thay thế hoàn toàn</strong>.
              </p>
            </div>
          )}

          <Tabs defaultValue="single" className="gap-4">
            <TabsList className="rounded-xl bg-slate-100 p-1">
              <TabsTrigger value="single" className="gap-1.5 rounded-lg">
                <Pencil className="h-3.5 w-3.5" />
                Thêm từng câu
              </TabsTrigger>
              <TabsTrigger value="bulk" className="gap-1.5 rounded-lg">
                <FileJson className="h-3.5 w-3.5" />
                Import JSON
              </TabsTrigger>
            </TabsList>

            {/* ── Single mode ────────────────────────────────────── */}
            <TabsContent value="single" className="space-y-3">
              {questions.map((q, i) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  index={i}
                  onUpdate={updateQuestion}
                  onUpdateOption={updateOption}
                  onAddOption={addOption}
                  onRemoveOption={removeOption}
                  onRemove={removeQuestion}
                />
              ))}

              <Button
                type="button"
                variant="outline"
                className="w-full rounded-xl border-dashed"
                onClick={addQuestion}
              >
                <Plus className="h-4 w-4" />
                Thêm câu hỏi
              </Button>
            </TabsContent>

            {/* ── Bulk import mode ────────────────────────────────── */}
            <TabsContent value="bulk" className="space-y-4">
              {/* Format guide */}
              <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
                <p className="flex items-center gap-1.5 font-bold">
                  <Sparkles className="h-4 w-4 text-sky-500" />
                  Hướng dẫn định dạng JSON
                </p>
                <ul className="mt-2 space-y-1 text-xs text-sky-800">
                  <li>
                    • <strong>prompt</strong> — nội dung câu hỏi (bắt buộc)
                  </li>
                  <li>
                    • <strong>options</strong> — mảng đáp án, tối thiểu 2 phần tử (bắt buộc)
                  </li>
                  <li>
                    • <strong>correctIndex</strong> — vị trí đáp án đúng, bắt đầu từ{" "}
                    <code>0</code> (bắt buộc)
                  </li>
                  <li>
                    • <strong>explanation</strong> — giải thích cho học viên (khuyến nghị)
                  </li>
                  <li>
                    • <strong>score</strong> — điểm cho câu này, mặc định là <code>1</code>
                  </li>
                </ul>
                <p className="mt-2 text-xs text-sky-700">
                  💡 Bạn có thể dùng ChatGPT / Claude để sinh JSON theo mẫu trên, sau đó dán vào đây.
                </p>
              </div>

              {/* JSON textarea */}
              <div>
                <FormLabel htmlFor="bulk-json">Nội dung JSON</FormLabel>
                <Textarea
                  id="bulk-json"
                  rows={18}
                  value={bulkImportText}
                  onChange={(e) => setBulkImportText(e.target.value)}
                  className="font-mono text-xs"
                  placeholder="Dán mảng JSON câu hỏi vào đây…"
                />
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => applyBulkImport("append")}
                >
                  <Upload className="h-4 w-4" />
                  Thêm vào danh sách hiện có
                </Button>
                <Button
                  type="button"
                  className="rounded-xl bg-slate-900 hover:bg-slate-700"
                  onClick={() => applyBulkImport("replace")}
                >
                  <Sparkles className="h-4 w-4" />
                  Thay toàn bộ câu hỏi
                </Button>
              </div>

              {/* Preview after import */}
              {questions.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-bold text-slate-700">
                    Preview — {questions.length} câu đang trong form:
                  </p>
                  {questions.map((q, i) => (
                    <QuestionCard
                      key={q.id}
                      question={q}
                      index={i}
                      onUpdate={updateQuestion}
                      onUpdateOption={updateOption}
                      onAddOption={addOption}
                      onRemoveOption={removeOption}
                      onRemove={removeQuestion}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>

        {/* Footer / Save */}
        <CardFooter className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-4">
          <div className="text-xs text-slate-500">
            {questions.length > 0 && (
              <span className="inline-flex items-center gap-1 text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {questions.length} câu sẵn sàng
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <Button asChild type="button" variant="outline" className="rounded-xl">
              <Link href="/admin/exercises">Hủy</Link>
            </Button>
            <Button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={isSaving}
              className="rounded-xl bg-slate-900 hover:bg-slate-700"
            >
              {isSaving ? "Đang lưu…" : editingItem ? "Lưu thay đổi" : "Tạo bài tập"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
