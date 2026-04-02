"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { notify } from "@/lib/admin";
import { useGenerateAdminLearnStepWithAiMutation } from "@/store/services/learnApi";
import { handleApiError } from "@/lib/api-error-handler";
import { saveLearnStepAiDraft } from "@/lib/learn-step-ai-draft";

type Props = {
  mapId: string;
  nextOrder?: number;
  buttonText?: string;
  className?: string;
  size?: React.ComponentProps<typeof Button>["size"];
  variant?: React.ComponentProps<typeof Button>["variant"];
};

type StepAiFormState = {
  brief: string;
  type: "lesson" | "boss";
  gradingDifficulty: "easy" | "medium" | "hard";
  order: string;
};

const SELECT_FIELD_CLASSNAME =
  "mt-1 flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-black";

export function LearnStepAiCreateButton({
  mapId,
  nextOrder = 0,
  buttonText = "Tạo chặng với AI",
  className,
  size = "default",
  variant = "outline",
}: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<StepAiFormState>({
    brief: "",
    type: "lesson",
    gradingDifficulty: "medium",
    order: String(nextOrder),
  });
  const [generateDraft, { isLoading }] = useGenerateAdminLearnStepWithAiMutation();

  useEffect(() => {
    if (!isOpen) {
      setForm((current) => ({ ...current, order: String(nextOrder) }));
    }
  }, [isOpen, nextOrder]);

  const setField = <K extends keyof StepAiFormState>(key: K, value: StepAiFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleGenerate = async () => {
    if (!form.brief.trim()) {
      notify({
        title: "Thiếu mô tả cho AI",
        message: "Hãy mô tả ngắn mục tiêu của chặng cần tạo.",
        type: "warning",
      });
      return;
    }

    try {
      const draft = await generateDraft({
        mapId,
        body: {
          brief: form.brief.trim(),
          type: form.type,
          gradingDifficulty: form.gradingDifficulty,
        },
      }).unwrap();

      saveLearnStepAiDraft(mapId, {
        ...draft,
        order: Math.max(0, Number(form.order) || draft.order || nextOrder),
      });
      setIsOpen(false);
      setForm({
        brief: "",
        type: "lesson",
        gradingDifficulty: "medium",
        order: String(nextOrder),
      });
      notify({
        title: "Đã tạo draft chặng với AI",
        message: "Form tạo chặng sẽ được điền sẵn để bạn rà lại trước khi lưu.",
        type: "success",
      });
      router.push(`/admin/learn/maps/${mapId}/steps/new?source=ai`);
    } catch (error) {
      const apiError = handleApiError(error);
      notify({
        title: "Không thể tạo draft chặng",
        message: apiError.message,
        type: "error",
      });
    }
  };

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        onClick={() => setIsOpen(true)}
      >
        <Sparkles className="h-4 w-4" />
        {buttonText}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tạo chặng với AI</DialogTitle>
            <DialogDescription>
              AI sẽ sinh draft cho lesson hoặc boss của map hiện tại, rồi mở form create để admin
              rà lại.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-1">
            <div className="space-y-2">
              <Label htmlFor="learn-step-ai-brief">Mô tả cho AI</Label>
              <Textarea
                id="learn-step-ai-brief"
                rows={6}
                value={form.brief}
                onChange={(event) => setField("brief", event.target.value)}
                placeholder="Ví dụ: Tạo một lesson để học viên luyện hỏi đường đến quầy check-in, dùng câu hỏi lịch sự và từ vựng sân bay."
              />
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="learn-step-ai-type">Loại chặng</Label>
                <select
                  id="learn-step-ai-type"
                  className={SELECT_FIELD_CLASSNAME}
                  value={form.type}
                  onChange={(event) =>
                    setField("type", event.target.value as StepAiFormState["type"])
                  }
                >
                  <option value="lesson">Lesson</option>
                  <option value="boss">Boss</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="learn-step-ai-difficulty">Độ khó chấm</Label>
                <select
                  id="learn-step-ai-difficulty"
                  className={SELECT_FIELD_CLASSNAME}
                  value={form.gradingDifficulty}
                  onChange={(event) =>
                    setField(
                      "gradingDifficulty",
                      event.target.value as StepAiFormState["gradingDifficulty"],
                    )
                  }
                >
                  <option value="easy">Dễ</option>
                  <option value="medium">Trung bình</option>
                  <option value="hard">Khó</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="learn-step-ai-order">Order</Label>
                <Input
                  id="learn-step-ai-order"
                  type="number"
                  min={0}
                  value={form.order}
                  onChange={(event) => setField("order", event.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Hủy
            </Button>
            <Button type="button" onClick={handleGenerate} disabled={isLoading}>
              <Sparkles className="h-4 w-4" />
              {isLoading ? "Đang tạo..." : "Tạo draft chặng"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
