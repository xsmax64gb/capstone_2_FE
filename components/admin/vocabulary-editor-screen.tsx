"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Plus, Sparkles, Trash2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";

import { AdminPageError, AdminPageLoading } from "@/components/admin/admin-query-state";
import { ImageUploadPreview } from "@/components/admin/image-upload-preview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateAdminVocabularyMutation,
  useCreateAdminVocabularyWordsBulkMutation,
  useGetAdminVocabularyByIdQuery,
  useUpdateAdminVocabularyMutation,
} from "@/store/services/adminApi";
import { ADMIN_LEVEL_OPTIONS, notify } from "@/lib/admin";
import type { AdminVocabularySetItem, AdminVocabularyWordPayload } from "@/types";

type Props = {
  vocabularyId?: string;
};

type VocabularyWordEditor = {
  id: string;
  word: string;
  meaning: string;
  example: string;
};

type VocabularyFormState = {
  name: string;
  description: string;
  level: string;
  topic: string;
  coverImage: string;
  coverImageFile: File | null;
};

const BULK_IMPORT_TEMPLATE = `[
  {
    "word": "schedule",
    "meaning": "lich trinh, thoi khoa bieu",
    "example": "I need to check my schedule before the meeting."
  },
  {
    "word": "efficient",
    "meaning": "hieu qua, nang suat",
    "example": "This method is more efficient for learning."
  }
]`;

const createEmptyWord = (index = 0): VocabularyWordEditor => ({
  id: `word-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
  word: "",
  meaning: "",
  example: "",
});

const emptyForm: VocabularyFormState = {
  name: "",
  description: "",
  level: "A1",
  topic: "general",
  coverImage: "",
  coverImageFile: null,
};

const mapVocabularyToForm = (item: AdminVocabularySetItem): VocabularyFormState => ({
  name: item.name,
  description: item.description,
  level: item.level,
  topic: item.topic,
  coverImage: item.coverImageUrl,
  coverImageFile: null,
});

const mapWordsToEditor = (words: AdminVocabularySetItem["words"]): VocabularyWordEditor[] =>
  words.map((w) => ({
    id: w.id,
    word: w.word,
    meaning: w.meaning,
    example: w.example,
  }));

const buildWordPayload = (words: VocabularyWordEditor[]) => {
  const valid = words.filter((w) => w.word.trim() && w.meaning.trim());
  return valid.map((w) => ({
    word: w.word.trim(),
    meaning: w.meaning.trim(),
    example: w.example.trim(),
  }));
};

const normalizeWordKey = (value: string) => value.trim().toLowerCase();

const dedupeWordPayload = (items: AdminVocabularyWordPayload[]) => {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  const deduped: AdminVocabularyWordPayload[] = [];

  items.forEach((item) => {
    const key = normalizeWordKey(item.word);
    if (seen.has(key)) {
      duplicates.add(item.word);
      return;
    }

    seen.add(key);
    deduped.push(item);
  });

  return {
    deduped,
    duplicates: Array.from(duplicates),
  };
};

const mapBulkWordsToEditor = (input: unknown): VocabularyWordEditor[] => {
  if (!Array.isArray(input)) {
    throw new Error("Dữ liệu import phải là một mảng JSON");
  }

  return input.map((item, index) => {
    if (!item || typeof item !== "object") {
      throw new Error(`Phần tử ${index + 1} không hợp lệ`);
    }

    const record = item as { word?: unknown; meaning?: unknown; example?: unknown };

    const word = String(record.word || "").trim();
    const meaning = String(record.meaning || "").trim();

    if (!word) {
      throw new Error(`Phần tử ${index + 1} thiếu từ (word)`);
    }
    if (!meaning) {
      throw new Error(`Phần tử ${index + 1} thiếu nghĩa (meaning)`);
    }

    return {
      id: createEmptyWord(index).id,
      word,
      meaning,
      example: String(record.example || "").trim(),
    };
  });
};

export function VocabularyEditorScreen({ vocabularyId }: Props) {
  const router = useRouter();
  const isEdit = Boolean(vocabularyId);

  const { data: existingData, isLoading, isError } = useGetAdminVocabularyByIdQuery(vocabularyId ?? "", {
    skip: !vocabularyId,
  });

  const [createVocabulary] = useCreateAdminVocabularyMutation();
  const [createVocabularyWordsBulk] = useCreateAdminVocabularyWordsBulkMutation();
  const [updateVocabulary] = useUpdateAdminVocabularyMutation();

  const [form, setForm] = useState<VocabularyFormState>(emptyForm);
  const [words, setWords] = useState<VocabularyWordEditor[]>([]);
  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single");
  const [bulkInput, setBulkInput] = useState(BULK_IMPORT_TEMPLATE);
  const [bulkError, setBulkError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form when editing existing data
  useEffect(() => {
    if (existingData) {
      setForm(mapVocabularyToForm(existingData));
      setWords(mapWordsToEditor(existingData.words));
    }
  }, [existingData]);

  // Form handlers
  const setField = <K extends keyof VocabularyFormState>(
    key: K,
    value: VocabularyFormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Word list handlers
  const addWord = () => {
    setWords((prev) => [...prev, createEmptyWord(prev.length)]);
  };

  const removeWord = (id: string) => {
    setWords((prev) => prev.filter((w) => w.id !== id));
  };

  const updateWord = (id: string, key: keyof VocabularyWordEditor, value: string) => {
    setWords((prev) =>
      prev.map((w) => (w.id === id ? { ...w, [key]: value } : w))
    );
  };

  // Bulk import
  const applyBulkImport = (mode: "append" | "replace") => {
    setBulkError("");
    try {
      const parsed = JSON.parse(bulkInput);
      const imported = mapBulkWordsToEditor(parsed);

      if (mode === "append" && imported.length === 0) {
        notify({ title: "Không có từ nào để thêm", type: "warning" });
        return;
      }

      setWords((prev) => (mode === "replace" ? imported : [...prev, ...imported]));
      notify({
        title:
          mode === "replace"
            ? `Đã thay danh sách với ${imported.length} từ`
            : `Đã thêm ${imported.length} từ vào danh sách`,
        type: "success",
      });
      setActiveTab("single");
    } catch (err) {
      setBulkError(err instanceof Error ? err.message : "Import thất bại");
    }
  };

  const loadBulkTemplate = () => {
    setBulkInput(BULK_IMPORT_TEMPLATE);
    setBulkError("");
  };

  const validWordCount = words.filter((w) => w.word.trim() && w.meaning.trim()).length;

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      notify({ title: "Thiếu tên bộ từ vựng", type: "error" });
      return;
    }

    if (!isEdit && !form.coverImageFile && !form.coverImage) {
      notify({ title: "Cần upload ảnh bìa", type: "error" });
      return;
    }

    if (!isEdit && validWordCount === 0) {
      notify({ title: "Cần ít nhất 1 từ có đủ thông tin", type: "error" });
      return;
    }

    if (isEdit && words.length > 0 && validWordCount === 0) {
      notify({
        title: "Danh sách từ chưa hợp lệ",
        message: "Hãy nhập ít nhất 1 từ hợp lệ hoặc xóa hết danh sách.",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const wordsPayload = buildWordPayload(words);
      const { deduped: normalizedWordsPayload, duplicates } = dedupeWordPayload(wordsPayload);

      if (duplicates.length > 0) {
        const preview = duplicates.slice(0, 3).join(", ");
        const suffix = duplicates.length > 3 ? ` +${duplicates.length - 3} từ khác` : "";
        notify({
          title: "Đã tự động bỏ từ trùng",
          message: `${preview}${suffix}`,
          type: "warning",
        });
      }

      if (isEdit && vocabularyId) {
        const updatedSet = await updateVocabulary({
          id: vocabularyId,
          body: {
            name: form.name.trim(),
            description: form.description.trim(),
            level: form.level,
            topic: form.topic.trim() || "general",
            coverImage: form.coverImage,
            coverImageFile: form.coverImageFile,
          },
        }).unwrap();

        await createVocabularyWordsBulk({
          setId: updatedSet.id,
          body: {
            mode: "replace",
            items: normalizedWordsPayload,
          },
        }).unwrap();

        notify({ title: "Đã cập nhật bộ từ vựng", type: "success" });
      } else {
        const createdSet = await createVocabulary({
          name: form.name.trim(),
          description: form.description.trim(),
          level: form.level,
          topic: form.topic.trim() || "general",
          isActive: true,
          sortOrder: 0,
          coverImageFile: form.coverImageFile,
        }).unwrap();

        await createVocabularyWordsBulk({
          setId: createdSet.id,
          body: {
            mode: "replace",
            items: normalizedWordsPayload,
          },
        }).unwrap();

        notify({ title: "Đã tạo bộ từ vựng", type: "success" });
      }

      router.push("/admin/vocabularies");
      router.refresh();
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "data" in err
          ? String((err as { data?: { message?: string } }).data?.message || "Lỗi")
          : "Lỗi";
      notify({ title: "Lưu thất bại", message: msg, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <AdminPageLoading />;
  }

  if (isError) {
    return <AdminPageError message="Không thể tải dữ liệu." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="flex items-center gap-4">
        <Link
          href="/admin/vocabularies"
          className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-black"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-bold">
            {isEdit ? "Edit Vocabulary Set" : "Create Vocabulary Set"}
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {isEdit
              ? `Editing: ${existingData?.name ?? ""}`
              : "Add a new vocabulary set with words, cover image, and metadata."}
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Main form */}
        <div className="space-y-6 xl:col-span-2">
          {/* Metadata */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-bold">Vocabulary Set Details</h2>

            <div className="space-y-4">
              <div>
                <Label>
                  Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  placeholder="e.g. A1 Daily Life Vocabulary"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  placeholder="Brief description of this vocabulary set..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Level</Label>
                  <RadioGroup
                    value={form.level}
                    onValueChange={(v) => setField("level", v)}
                    className="mt-2 flex flex-wrap gap-2"
                  >
                    {ADMIN_LEVEL_OPTIONS.map((level) => (
                      <div key={level} className="flex items-center gap-1.5">
                        <RadioGroupItem value={level} id={`level-${level}`} />
                        <Label htmlFor={`level-${level}`} className="cursor-pointer text-sm font-normal">
                          {level}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    value={form.topic}
                    onChange={(e) => setField("topic", e.target.value)}
                    placeholder="e.g. daily-life, work, travel"
                    className="mt-1"
                    list="topic-suggestions"
                  />
                  <datalist id="topic-suggestions">
                    <option value="daily-life" />
                    <option value="work" />
                    <option value="travel" />
                    <option value="technology" />
                    <option value="general" />
                  </datalist>
                </div>
              </div>

              {/* Cover image */}
              <div>
                <Label>
                  Cover Image <span className="text-rose-500">*</span>
                </Label>
                <Input
                  type="file"
                  accept="image/*"
                  className="mt-1"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setField("coverImageFile", file);
                  }}
                />
                <div className="mt-3 max-w-xs">
                  <ImageUploadPreview
                    file={form.coverImageFile}
                    currentUrl={form.coverImage}
                    alt="Vocabulary cover preview"
                    emptyText="Chọn ảnh bìa để xem trước."
                    ratio={4 / 3}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {form.coverImageFile
                    ? `Đã chọn ảnh mới: ${form.coverImageFile.name}`
                    : form.coverImage
                    ? "Đang hiển thị ảnh bìa hiện tại."
                    : "Chưa có ảnh bìa."}
                </p>
              </div>
            </div>
          </div>

          {/* Word bank */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Word Bank</h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  {validWordCount} / {words.length} words ready ({words.length - validWordCount} incomplete)
                </p>
              </div>
              <Button onClick={addWord} size="sm" variant="outline">
                <Plus className="mr-1.5 h-4 w-4" />
                Add Word
              </Button>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as "single" | "bulk")}
            >
              <TabsList>
                <TabsTrigger value="single">Single Entry</TabsTrigger>
                <TabsTrigger value="bulk">
                  <Upload className="mr-1.5 h-3.5 w-3.5" />
                  Bulk Import
                </TabsTrigger>
              </TabsList>

              <TabsContent value="single" className="mt-4 space-y-3">
                {words.length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-300 py-8 text-center text-sm text-slate-500">
                    No words yet. Click "Add Word" or switch to Bulk Import tab.
                  </div>
                )}

                {words.map((word, index) => (
                  <div
                    key={word.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-500">
                        Word {index + 1}
                      </span>
                      <button
                        onClick={() => removeWord(word.id)}
                        className="inline-flex items-center gap-1 text-xs text-rose-500 hover:text-rose-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div>
                        <Label className="text-xs">Word *</Label>
                        <Input
                          value={word.word}
                          onChange={(e) => updateWord(word.id, "word", e.target.value)}
                          placeholder="e.g. schedule"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Meaning *</Label>
                        <Input
                          value={word.meaning}
                          onChange={(e) => updateWord(word.id, "meaning", e.target.value)}
                          placeholder="e.g. lich trinh"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Example</Label>
                        <Input
                          value={word.example}
                          onChange={(e) => updateWord(word.id, "example", e.target.value)}
                          placeholder="Example sentence..."
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {words.length > 0 && (
                  <Button onClick={addWord} variant="outline" size="sm" className="w-full">
                    <Plus className="mr-1.5 h-4 w-4" />
                    Add Another Word
                  </Button>
                )}
              </TabsContent>

              <TabsContent value="bulk" className="mt-4 space-y-3">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <Label>Paste JSON array of words</Label>
                    <Button onClick={loadBulkTemplate} variant="ghost" size="sm">
                      <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                      Load Template
                    </Button>
                  </div>

                  <Textarea
                    value={bulkInput}
                    onChange={(e) => {
                      setBulkInput(e.target.value);
                      setBulkError("");
                    }}
                    placeholder={BULK_IMPORT_TEMPLATE}
                    rows={12}
                    className="font-mono text-xs"
                  />

                  {bulkError && (
                    <p className="mt-2 text-sm text-rose-600">{bulkError}</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button onClick={() => applyBulkImport("append")} disabled={!bulkInput.trim()}>
                    <Upload className="mr-1.5 h-4 w-4" />
                    Import & Add to List
                  </Button>
                  <Button onClick={() => applyBulkImport("replace")} variant="outline">
                    <Sparkles className="mr-1.5 h-4 w-4" />
                    Import & Replace List
                  </Button>
                  <Button
                    onClick={() => {
                      setBulkInput("");
                      setBulkError("");
                    }}
                    variant="outline"
                  >
                    Clear
                  </Button>
                </div>

                <p className="text-xs text-slate-500">
                  JSON format: <code className="rounded bg-slate-100 px-1">{"[{ \"word\": \"...\", \"meaning\": \"...\", \"example\": \"...\" }]"}</code>
                </p>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Submit */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold">Publish</h2>

            <div className="mb-4 space-y-2 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Set name</span>
                <span className="font-semibold">{form.name || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Level</span>
                <span className="font-semibold">{form.level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Topic</span>
                <span className="font-semibold">{form.topic || "general"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Words</span>
                <span className="font-semibold">{validWordCount} ready</span>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? "Saving..." : isEdit ? "Save Changes" : "Create Vocabulary Set"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
