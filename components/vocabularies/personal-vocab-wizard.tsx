"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2, Upload, Wand2, X } from "lucide-react";
import { handleApiError } from "@/lib/api-error-handler";
import { notify } from "@/lib/admin";
import {
  AI_VOCABULARY_BUILDER_FEATURE_KEY,
  getFeatureQuotaBadgeText,
  getFeatureQuotaBlockedMessage,
  getFeatureQuotaItem,
  isFeatureQuotaBlocked,
} from "@/lib/feature-quota";
import { useI18n } from "@/lib/i18n/context";
import {
  type PersonalVocabItem,
  useCreatePersonalVocabularyAiMutation,
  useCreatePersonalVocabularyManualMutation,
  useGeneratePersonalVocabularyFromPdfMutation,
  useGeneratePersonalVocabularyFromPromptMutation,
} from "@/store/services/vocabulariesApi";
import { useGetMyFeatureQuotasQuery } from "@/store/services/paymentApi";

type Mode = "manual" | "ai" | null;
type AiMode = "prompt" | "pdf";
type Step = "pick" | "form" | "preview";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

function isPdfFile(file: File) {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

export default function PersonalVocabWizard() {
  const { t } = useI18n();
  const router = useRouter();

  const [mode, setMode] = useState<Mode>(null);
  const [step, setStep] = useState<Step>("pick");
  const [aiMode, setAiMode] = useState<AiMode>("prompt");

  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("general");
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("B1");
  const [numberOfWords, setNumberOfWords] = useState(30);
  const [includePronunciation, setIncludePronunciation] = useState(false);
  const [includeMeaning, setIncludeMeaning] = useState(true);
  const [includeExample, setIncludeExample] = useState(false);
  const [additionalInstruction, setAdditionalInstruction] = useState("");

  const [manualText, setManualText] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [pdfDropActive, setPdfDropActive] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const [rawText, setRawText] = useState("");
  const [items, setItems] = useState<PersonalVocabItem[]>([]);
  const [errors, setErrors] = useState<Array<{ line: number; raw: string; message: string }>>([]);

  const [genPrompt, { isLoading: generatingPrompt }] =
    useGeneratePersonalVocabularyFromPromptMutation();
  const [genPdf, { isLoading: generatingPdf }] =
    useGeneratePersonalVocabularyFromPdfMutation();
  const [saveManual, { isLoading: savingManual }] =
    useCreatePersonalVocabularyManualMutation();
  const [saveAi, { isLoading: savingAi }] = useCreatePersonalVocabularyAiMutation();
  const { data: featureQuotaOverview } = useGetMyFeatureQuotasQuery();

  const generating = generatingPrompt || generatingPdf;
  const saving = savingManual || savingAi;
  const aiVocabularyQuota = useMemo(
    () =>
      getFeatureQuotaItem(
        featureQuotaOverview,
        AI_VOCABULARY_BUILDER_FEATURE_KEY,
      ),
    [featureQuotaOverview],
  );
  const isAiVocabularyBlocked = isFeatureQuotaBlocked(aiVocabularyQuota);
  const aiVocabularyQuotaBadge = getFeatureQuotaBadgeText(aiVocabularyQuota);
  const aiVocabularyBlockedMessage = getFeatureQuotaBlockedMessage(
    aiVocabularyQuota,
    t("Tạo từ vựng bằng AI"),
  );

  useEffect(() => {
    if (!pdfFile) {
      setPdfPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(pdfFile);
    setPdfPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
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

  const pick = (m: Mode) => {
    setMode(m);
    setStep("form");
  };

  const handlePickAi = () => {
    if (isAiVocabularyBlocked) {
      notify({
        title: t("Đã hết quota tạo AI"),
        message: aiVocabularyBlockedMessage,
        type: "warning",
      });
      return;
    }

    setAiMode("prompt");
    pick("ai");
  };

  const resetPreview = () => {
    setRawText("");
    setItems([]);
    setErrors([]);
  };

  const parseManual = () => {
    // Delegate parsing to backend by saving? For preview, we implement lightweight parsing by calling manual save endpoint is too destructive.
    // We'll reuse AI generate endpoint? Not appropriate.
    // Minimal approach: send manual text to backend create endpoint only on save; preview/edit uses a local heuristic:
    const lines = manualText.replace(/\r\n/g, "\n").split("\n").map((l) => l.trim()).filter(Boolean);
    const parsed: PersonalVocabItem[] = [];
    const errs: Array<{ line: number; raw: string; message: string }> = [];

    const ipaRe = /^\/[^/].*\/$/;
    const splitLine = (raw: string) => {
      if (raw.includes("|")) return raw.split("|").map((p) => p.trim());
      return raw.split(" - ").map((p) => p.trim());
    };

    lines.forEach((raw, i) => {
      const parts = splitLine(raw);
      if (parts.length < 2) {
        errs.push({ line: i + 1, raw, message: "Missing meaning" });
        return;
      }
      if (parts.length > 4) {
        errs.push({ line: i + 1, raw, message: "Too many separators" });
        return;
      }
      const word = parts[0]?.trim();
      if (!word) {
        errs.push({ line: i + 1, raw, message: "Missing word" });
        return;
      }
      let pronunciation = "";
      let meaning = "";
      let example = "";
      if (parts.length === 2) {
        meaning = parts[1]?.trim();
      } else if (parts.length === 3) {
        if (ipaRe.test(parts[1] || "")) {
          pronunciation = parts[1].trim();
          meaning = parts[2].trim();
        } else {
          meaning = parts[1].trim();
          example = parts[2].trim();
        }
      } else {
        if (ipaRe.test(parts[1] || "")) {
          pronunciation = parts[1].trim();
          meaning = parts[2].trim();
          example = parts[3].trim();
        } else {
          meaning = parts[1].trim();
          example = parts[2].trim();
        }
      }

      if (includeMeaning && !meaning) {
        errs.push({ line: i + 1, raw, message: "Missing meaning" });
        return;
      }

      parsed.push({ word, pronunciation, meaning, example });
    });

    setRawText(manualText.trim());
    setItems(parsed);
    setErrors(errs);
    setStep("preview");
  };

  const runAiGenerate = async () => {
    resetPreview();
    if (isAiVocabularyBlocked) {
      notify({
        title: t("Đã hết quota tạo AI"),
        message: aiVocabularyBlockedMessage,
        type: "warning",
      });
      return;
    }

    try {
      if (aiMode === "prompt") {
        const res = await genPrompt({
          title: title.trim() || t("Thêm từ vựng"),
          topic,
          level,
          number_of_words: numberOfWords,
          include_pronunciation: includePronunciation,
          include_meaning: includeMeaning,
          include_example: includeExample,
          additional_instruction: additionalInstruction,
        }).unwrap();
        setRawText(res.rawText);
        setItems(res.items ?? []);
        setErrors(res.errors ?? []);
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
      fd.append("title", title.trim() || "Personal vocab (PDF)");
      fd.append("topic", topic);
      fd.append("level", level);
      fd.append("number_of_words", String(numberOfWords));
      fd.append("include_pronunciation", String(includePronunciation));
      fd.append("include_meaning", String(includeMeaning));
      fd.append("include_example", String(includeExample));
      fd.append("additional_instruction", additionalInstruction);

      const res = await genPdf(fd).unwrap();
      setRawText(res.rawText);
      setItems(res.items ?? []);
      setErrors(res.errors ?? []);
      setStep("preview");
    } catch (error) {
      const apiError = handleApiError(error);
      notify({
        title: t("Không thể tạo từ vựng với AI"),
        message: apiError.message,
        type: "error",
      });
    }
  };

  const updateItem = (index: number, patch: Partial<PersonalVocabItem>) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  const save = async () => {
    if (!mode) return;
    if (items.length === 0 && mode !== "manual") return;

    try {
      if (mode === "manual") {
        const { id } = await saveManual({
          title: title.trim() || t("Bộ từ cá nhân"),
          topic,
          level,
          include_pronunciation: includePronunciation,
          include_meaning: includeMeaning,
          include_example: includeExample,
          additional_instruction: additionalInstruction,
          rawText: rawText || manualText,
        }).unwrap();
        router.push(`/vocabularies/${id}/flashcards`);
        return;
      }

      if (isAiVocabularyBlocked) {
        notify({
          title: t("Đã hết quota tạo AI"),
          message: aiVocabularyBlockedMessage,
          type: "warning",
        });
        return;
      }

      const { id } = await saveAi({
        source: aiMode === "pdf" ? "ai_pdf" : "ai_prompt",
        title: title.trim() || t("Bộ từ cá nhân"),
        topic,
        level,
        include_pronunciation: includePronunciation,
        include_meaning: includeMeaning,
        include_example: includeExample,
        additional_instruction: additionalInstruction,
        items,
      }).unwrap();
      router.push(`/vocabularies/${id}/flashcards`);
    } catch (error) {
      const apiError = handleApiError(error);
      notify({
        title:
          mode === "manual"
            ? t("Không thể lưu bộ từ")
            : t("Không thể lưu bộ từ AI"),
        message: apiError.message,
        type: "error",
      });
    }
  };

  if (step === "pick") {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <button
          type="button"
          onClick={() => pick("manual")}
          className="flex flex-col items-start rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-slate-400 hover:shadow"
        >
          <FileText className="mb-3 h-10 w-10 text-slate-700" />
          <h2 className="text-lg font-bold">{t("Thêm thủ công")}</h2>
          <p className="mt-2 text-sm text-slate-600">
            {t("Dán danh sách từ")}
          </p>
        </button>
        <button
          type="button"
          onClick={handlePickAi}
          className="flex flex-col items-start rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-slate-400 hover:shadow"
        >
          <Wand2 className="mb-3 h-10 w-10 text-slate-700" />
          <h2 className="text-lg font-bold">{t("Tạo bằng AI")}</h2>
          <p className="mt-2 text-sm text-slate-600">
            {t("Chỉ tạo bằng AI hoặc nhập thủ công")}
          </p>
          <span
            className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
              isAiVocabularyBlocked
                ? "bg-amber-100 text-amber-800"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {aiVocabularyQuotaBadge}
          </span>
        </button>
      </div>
    );
  }

  if (step === "form") {
    return (
      <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-slate-600">
            {mode === "manual" ? t("Thêm thủ công") : t("Tạo bằng AI")}
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

          {mode === "ai" ? (
            <label className="block text-sm">
              <span className="font-medium text-slate-700">{t("Số từ")}</span>
              <input
                type="number"
                min={1}
                max={200}
                value={numberOfWords}
                onChange={(e) => setNumberOfWords(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
          ) : null}
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={includePronunciation}
              onChange={(e) => setIncludePronunciation(e.target.checked)}
            />
            {t("Bao gồm phiên âm")}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={includeMeaning}
              onChange={(e) => setIncludeMeaning(e.target.checked)}
            />
            {t("Bao gồm nghĩa")}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={includeExample}
              onChange={(e) => setIncludeExample(e.target.checked)}
            />
            {t("Bao gồm ví dụ")}
          </label>
        </div>

        <label className="block text-sm">
          <span className="font-medium text-slate-700">{t("Hướng dẫn thêm cho AI")}</span>
          <textarea
            value={additionalInstruction}
            onChange={(e) => setAdditionalInstruction(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>

        {mode === "manual" ? (
          <label className="block text-sm">
            <span className="font-medium text-slate-700">{t("Dán danh sách từ")}</span>
            <textarea
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              rows={10}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-xs"
              placeholder={`apple - quả táo\nbook | quyển sách\nbenefit - /ˈbenɪfɪt/ - lợi ích - This policy brings many benefits.`}
            />
          </label>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setAiMode("prompt")}
                className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
                  aiMode === "prompt"
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                Prompt
              </button>
              <button
                type="button"
                onClick={() => setAiMode("pdf")}
                className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
                  aiMode === "pdf"
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                PDF
              </button>
            </div>

            {aiMode === "pdf" ? (
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
          </div>
        )}

        <div className="flex justify-end">
          {mode === "manual" ? (
            <button
              type="button"
              onClick={() => parseManual()}
              className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              {t("Phân tích")}
            </button>
          ) : (
            <button
              type="button"
              disabled={generating}
              onClick={() => void runAiGenerate()}
              className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              {t("Tạo bằng AI")}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold">{t("Xem trước")}</h2>
        <button type="button" className="text-sm text-slate-500 underline" onClick={() => setStep("form")}>
          {t("Trước")}
        </button>
      </div>

      {errors.length > 0 ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          <p className="font-semibold">{t("Lỗi parser")}</p>
          <ul className="mt-2 list-inside list-disc">
            {errors.slice(0, 8).map((e) => (
              <li key={`${e.line}-${e.message}`}>
                Line {e.line}: {e.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="text-xs text-slate-500">{items.length} {t("Số từ")}</p>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="py-2 pr-2">#</th>
              <th className="py-2 pr-2">Word</th>
              <th className="py-2 pr-2">/IPA/</th>
              <th className="py-2 pr-2">Meaning</th>
              <th className="py-2">Example</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={i} className="border-b border-slate-100 align-top">
                <td className="py-2 pr-2">{i + 1}</td>
                <td className="py-2 pr-2">
                  <input
                    value={it.word}
                    onChange={(e) => updateItem(i, { word: e.target.value })}
                    className="w-full min-w-[140px] rounded border border-slate-200 px-2 py-1 text-xs"
                  />
                </td>
                <td className="py-2 pr-2">
                  <input
                    value={it.pronunciation ?? ""}
                    onChange={(e) => updateItem(i, { pronunciation: e.target.value })}
                    className="w-full min-w-[120px] rounded border border-slate-200 px-2 py-1 text-xs"
                  />
                </td>
                <td className="py-2 pr-2">
                  <input
                    value={it.meaning ?? ""}
                    onChange={(e) => updateItem(i, { meaning: e.target.value })}
                    className="w-full min-w-[180px] rounded border border-slate-200 px-2 py-1 text-xs"
                  />
                </td>
                <td className="py-2">
                  <input
                    value={it.example ?? ""}
                    onChange={(e) => updateItem(i, { example: e.target.value })}
                    className="w-full min-w-[240px] rounded border border-slate-200 px-2 py-1 text-xs"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end border-t border-slate-100 pt-4">
        <button
          type="button"
          disabled={saving || items.length === 0}
          onClick={() => void save()}
          className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {t("Lưu bộ từ")}
        </button>
      </div>
    </div>
  );
}
