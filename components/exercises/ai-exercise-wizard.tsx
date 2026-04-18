"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FileText, Loader2, Upload, Wand2, X } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import {
  type AiGeneratedQuestion,
  useCreateUserAiExerciseMutation,
  useGenerateExerciseAiFromPdfMutation,
  useGenerateExerciseAiFromPromptMutation,
} from "@/store/services/exercisesApi";

type WizardMode = "pdf" | "prompt" | null;
type Step = "pick" | "form" | "preview";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isPdfFile(file: File) {
  return (
    file.type === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf")
  );
}

export default function AiExerciseWizard() {
  const { t } = useI18n();
  const router = useRouter();

  const [mode, setMode] = useState<WizardMode>(null);
  const [step, setStep] = useState<Step>("pick");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [topic, setTopic] = useState("general");
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("A2");
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [grammarFocus, setGrammarFocus] = useState("");
  const [vocabularyFocus, setVocabularyFocus] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium",
  );
  const [context, setContext] = useState("");
  const [additionalInstruction, setAdditionalInstruction] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [pdfDropActive, setPdfDropActive] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const [questions, setQuestions] = useState<AiGeneratedQuestion[]>([]);
  const [parseErrors, setParseErrors] = useState<
    { blockIndex: number; message: string }[]
  >([]);
  const [rawText, setRawText] = useState("");
  const [pdfTruncated, setPdfTruncated] = useState(false);

  const [genPrompt, { isLoading: loadingPrompt }] =
    useGenerateExerciseAiFromPromptMutation();
  const [genPdf, { isLoading: loadingPdf }] =
    useGenerateExerciseAiFromPdfMutation();
  const [saveExercise, { isLoading: saving }] =
    useCreateUserAiExerciseMutation();

  const loading = loadingPrompt || loadingPdf;

  useEffect(() => {
    if (!pdfFile) {
      setPdfPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(pdfFile);
    setPdfPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [pdfFile]);

  const setPdfFromFileList = (list: FileList | null) => {
    const file = list?.[0];
    if (!file) return;
    if (!isPdfFile(file)) {
      window.dispatchEvent(
        new CustomEvent("elapp:notify", {
          detail: {
            title: t("Lỗi"),
            message: t("Chỉ hỗ trợ định dạng PDF."),
            type: "warning",
            duration: 2400,
          },
        }),
      );
      return;
    }
    setPdfFile(file);
  };

  const clearPdf = () => {
    setPdfFile(null);
    if (pdfInputRef.current) pdfInputRef.current.value = "";
  };

  const pickMode = (m: WizardMode) => {
    setMode(m);
    setStep("form");
  };

  const runGenerate = async () => {
    if (!mode) return;
    setParseErrors([]);
    setQuestions([]);
    setRawText("");

    if (mode === "prompt") {
      const res = await genPrompt({
        title: title.trim() || t("Tạo bài tập bằng AI"),
        topic: topic.trim() || "general",
        level,
        number_of_questions: numberOfQuestions,
        grammar_focus: grammarFocus,
        vocabulary_focus: vocabularyFocus,
        difficulty,
        context,
        additional_instruction: additionalInstruction,
      }).unwrap();

      setRawText(res.rawText);
      setParseErrors(res.parseErrors ?? []);
      setQuestions(res.questions ?? []);
      setStep("preview");
      return;
    }

    if (!pdfFile) {
      window.dispatchEvent(
        new CustomEvent("elapp:notify", {
          detail: {
            title: t("Lỗi"),
            message: t("Vui lòng chọn file PDF"),
            type: "warning",
            duration: 2200,
          },
        }),
      );
      return;
    }

    const fd = new FormData();
    fd.append("file_pdf", pdfFile);
    fd.append("title", title.trim() || "PDF exercise");
    fd.append("description", description);
    fd.append("topic", topic.trim() || "general");
    fd.append("level", level);
    fd.append("number_of_questions", String(numberOfQuestions));
    fd.append("grammar_focus", grammarFocus);
    fd.append("vocabulary_focus", vocabularyFocus);
    fd.append("difficulty", difficulty);
    fd.append("additional_instruction", additionalInstruction);

    const res = await genPdf(fd).unwrap();
    setRawText(res.rawText);
    setParseErrors(res.parseErrors ?? []);
    setQuestions(res.questions ?? []);
    setPdfTruncated(Boolean(res.pdfTruncated));
    setStep("preview");
  };

  const updateQuestion = (index: number, patch: Partial<AiGeneratedQuestion>) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  const handleSave = async () => {
    if (!mode || questions.length === 0) return;
    try {
      const body: Record<string, unknown> = {
        title: title.trim() || t("Tạo bài tập bằng AI"),
        description: mode === "pdf" ? description : "",
        topic: topic.trim() || "general",
        level,
        source: mode === "pdf" ? "ai_pdf" : "ai_prompt",
        grammar_focus: grammarFocus,
        vocabulary_focus: vocabularyFocus,
        difficulty,
        additional_instruction: additionalInstruction,
        context: mode === "prompt" ? context : "",
        questions: questions.map((q) => ({
          prompt: q.prompt,
          options: q.options,
          correctIndex: q.correctIndex,
          correctAnswer: q.correctIndex,
          explanation: q.explanation ?? "",
        })),
      };

      const { id } = await saveExercise(body).unwrap();
      router.push(`/exercises/${id}`);
    } catch {
      window.dispatchEvent(
        new CustomEvent("elapp:notify", {
          detail: {
            title: t("Lỗi"),
            message: t("Không tải được bài tập. Vui lòng kiểm tra token đăng nhập hoặc kết nối backend."),
            type: "error",
            duration: 3200,
          },
        }),
      );
    }
  };

  if (step === "pick") {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <button
          type="button"
          onClick={() => pickMode("pdf")}
          className="flex flex-col items-start rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-slate-400 hover:shadow"
        >
          <FileText className="mb-3 h-10 w-10 text-slate-700" />
          <h2 className="text-lg font-bold">{t("Tài liệu PDF")}</h2>
          <p className="mt-2 text-sm text-slate-600">
            {t(
              "Upload PDF để AI đọc nội dung và tạo câu hỏi trắc nghiệm.",
            )}
          </p>
        </button>
        <button
          type="button"
          onClick={() => pickMode("prompt")}
          className="flex flex-col items-start rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-slate-400 hover:shadow"
        >
          <Wand2 className="mb-3 h-10 w-10 text-slate-700" />
          <h2 className="text-lg font-bold">{t("Theo yêu cầu")}</h2>
          <p className="mt-2 text-sm text-slate-600">
            {t("Mô tả chủ đề và mục tiêu — không cần file.")}
          </p>
        </button>
      </div>
    );
  }

  if (step === "form") {
    return (
      <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-slate-600">
            {mode === "pdf" ? t("Tài liệu PDF") : t("Theo yêu cầu")}
          </p>
          <button
            type="button"
            className="text-sm text-slate-500 underline"
            onClick={() => {
              setStep("pick");
              setMode(null);
            }}
          >
            {t("Trước")}
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="font-medium text-slate-700">{t("Tiêu đề")}</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="…"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-slate-700">topic</span>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
        </div>

        {mode === "pdf" ? (
          <label className="block text-sm">
            <span className="font-medium text-slate-700">description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          <label className="block text-sm">
            <span className="font-medium text-slate-700">CEFR</span>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as (typeof LEVELS)[number])}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              {LEVELS.map((lv) => (
                <option key={lv} value={lv}>
                  {lv}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium text-slate-700">{t("Số câu hỏi")}</span>
            <input
              type="number"
              min={1}
              max={50}
              value={numberOfQuestions}
              onChange={(e) => setNumberOfQuestions(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-slate-700">{t("Độ khó")}</span>
            <select
              value={difficulty}
              onChange={(e) =>
                setDifficulty(e.target.value as "easy" | "medium" | "hard")
              }
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="easy">{t("Dễ")}</option>
              <option value="medium">{t("Trung bình")}</option>
              <option value="hard">{t("Khó")}</option>
            </select>
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="font-medium text-slate-700">
              {t("Trọng tâm ngữ pháp")}
            </span>
            <input
              value={grammarFocus}
              onChange={(e) => setGrammarFocus(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="e.g. present simple"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-slate-700">
              {t("Trọng tâm từ vựng")}
            </span>
            <input
              value={vocabularyFocus}
              onChange={(e) => setVocabularyFocus(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
        </div>

        {mode === "prompt" ? (
          <label className="block text-sm">
            <span className="font-medium text-slate-700">
              {t("Ngữ cảnh / chủ đề tình huống")}
            </span>
            <input
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="travel, school, business…"
            />
          </label>
        ) : null}

        <label className="block text-sm">
          <span className="font-medium text-slate-700">
            {t("Hướng dẫn thêm cho AI")}
          </span>
          <textarea
            value={additionalInstruction}
            onChange={(e) => setAdditionalInstruction(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>

        {mode === "pdf" ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {t("Tài liệu PDF")}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {pdfFile
                  ? t(
                      "Đã tải PDF. Chỉ một file — xóa file hiện tại nếu muốn chọn PDF khác.",
                    )
                  : t(
                      "Kéo thả file PDF vào đây, hoặc bấm nút bên dưới để chọn từ máy.",
                    )}
              </p>
            </div>

            <input
              ref={pdfInputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="sr-only"
              aria-hidden
              tabIndex={-1}
              disabled={Boolean(pdfFile)}
              onChange={(e) => {
                setPdfFromFileList(e.target.files);
              }}
            />

            {!pdfFile ? (
              <div
                role="region"
                aria-label={t("Tài liệu PDF")}
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setPdfDropActive(true);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setPdfDropActive(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setPdfDropActive(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setPdfDropActive(false);
                  setPdfFromFileList(e.dataTransfer.files);
                }}
                className={`rounded-2xl border-2 border-dashed transition-colors ${
                  pdfDropActive
                    ? "border-slate-900 bg-slate-100"
                    : "border-slate-300 bg-slate-50/90"
                }`}
              >
                <div
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      pdfInputRef.current?.click();
                    }
                  }}
                  onClick={() => pdfInputRef.current?.click()}
                  className="flex cursor-pointer flex-col items-center justify-center px-6 py-8"
                >
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
                    <Upload className="h-7 w-7 text-slate-700" aria-hidden />
                  </div>
                  <p className="text-center text-sm font-semibold text-slate-900">
                    {pdfDropActive
                      ? t("Thả file để tải lên")
                      : t("Chọn file PDF")}
                  </p>
                  <p className="mt-1 max-w-md text-center text-xs leading-relaxed text-slate-600">
                    {t("Chỉ hỗ trợ định dạng PDF.")}
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      pdfInputRef.current?.click();
                    }}
                    className="mt-4 rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    {t("Chọn file từ máy")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div
                  className="overflow-hidden rounded-2xl border-2 border-emerald-200/90 bg-emerald-50/40 shadow-sm"
                  aria-live="polite"
                >
                  <div className="flex flex-wrap items-center gap-2 border-b border-emerald-100/80 bg-emerald-50/80 px-4 py-2.5">
                    <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                      {t("Đã tải lên")}
                    </span>
                    <p className="text-xs font-medium text-emerald-900">
                      {t(
                        "Không thể tải thêm khi đã có file — bấm Gỡ file để chọn PDF khác.",
                      )}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-emerald-100">
                        <FileText className="h-6 w-6 text-emerald-700" aria-hidden />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {pdfFile.name}
                        </p>
                        <p className="text-xs text-slate-600">
                          PDF · {formatFileSize(pdfFile.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => clearPdf()}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-800 shadow-sm hover:bg-rose-50"
                    >
                      <X className="h-3.5 w-3.5" />
                      {t("Gỡ file")}
                    </button>
                  </div>
                </div>

                {pdfPreviewUrl ? (
                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2.5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                        {t("Xem trước PDF")}
                      </p>
                    </div>
                    <div className="h-[min(70vh,560px)] w-full bg-slate-200/60">
                      <iframe
                        title={t("Xem trước PDF")}
                        src={`${pdfPreviewUrl}#toolbar=1&navpanes=0`}
                        className="h-full w-full border-0 bg-white"
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        ) : null}

        <div className="flex justify-end">
          <button
            type="button"
            disabled={loading}
            onClick={() => void runGenerate()}
            className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="h-4 w-4" />
            )}
            {loading ? t("Đang tạo câu hỏi…") : t("Tạo bằng AI")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold">{t("Xem trước")}</h2>
        <div className="flex gap-2">
          <button
            type="button"
            className="text-sm text-slate-500 underline"
            onClick={() => setStep("form")}
          >
            {t("Trước")}
          </button>
        </div>
      </div>

      {pdfTruncated ? (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {t("Nội dung PDF đã được rút gọn cho giới hạn ngữ cảnh AI.")}
        </p>
      ) : null}

      {parseErrors.length > 0 ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          <p className="font-semibold">{t("Lỗi định dạng câu hỏi")}</p>
          <ul className="mt-2 list-inside list-disc">
            {parseErrors.map((err) => (
              <li key={`${err.blockIndex}-${err.message}`}>
                Block {err.blockIndex}: {err.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="text-xs text-slate-500">
        {questions.length} {t("câu hỏi")} · raw output length {rawText.length}
      </p>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="py-2 pr-2">#</th>
              <th className="py-2 pr-2">Question</th>
              <th className="py-2 pr-2">A–D</th>
              <th className="py-2">@</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q, i) => (
              <tr key={i} className="border-b border-slate-100 align-top">
                <td className="py-2 pr-2">{i + 1}</td>
                <td className="py-2 pr-2">
                  <textarea
                    value={q.prompt}
                    onChange={(e) => updateQuestion(i, { prompt: e.target.value })}
                    rows={2}
                    className="w-full min-w-[200px] rounded border border-slate-200 px-2 py-1 text-xs"
                  />
                </td>
                <td className="py-2 pr-2">
                  <div className="space-y-1">
                    {q.options.map((opt, j) => (
                      <input
                        key={j}
                        value={opt}
                        onChange={(e) => {
                          const opts = [...q.options];
                          opts[j] = e.target.value;
                          updateQuestion(i, { options: opts });
                        }}
                        className="w-full rounded border border-slate-200 px-2 py-0.5 text-xs"
                      />
                    ))}
                  </div>
                </td>
                <td className="py-2">
                  <select
                    value={q.correctIndex}
                    onChange={(e) =>
                      updateQuestion(i, {
                        correctIndex: Number(e.target.value),
                        correctAnswer: Number(e.target.value),
                      })
                    }
                    className="rounded border border-slate-200 px-2 py-1 text-xs"
                  >
                    <option value={0}>a</option>
                    <option value={1}>b</option>
                    <option value={2}>c</option>
                    <option value={3}>d</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <p className="max-w-xl text-xs text-slate-500">
          {t("Chỉ tạo bằng AI — không nhập thủ công")} · {t("Không cộng XP")} ·{" "}
          {t("Chỉ bạn xem được bài này")}
        </p>
        <button
          type="button"
          disabled={saving || questions.length === 0}
          onClick={() => void handleSave()}
          className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {t("Lưu bài tập")}
        </button>
      </div>
    </div>
  );
}
