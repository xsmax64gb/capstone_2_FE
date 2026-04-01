"use client";

import { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { notify } from "@/lib/admin";
import { useGenerateAdminLearnMapWithAiMutation } from "@/lib/api/learnApi";
import { handleApiError } from "@/lib/api-error-handler";
import { saveLearnMapAiDraft } from "@/lib/learn-map-ai-draft";

type Props = {
  buttonText?: string;
  className?: string;
  size?: React.ComponentProps<typeof Button>["size"];
  variant?: React.ComponentProps<typeof Button>["variant"];
};

type MapAiFormState = {
  brief: string;
  level: string;
  theme: string;
  isPublished: boolean;
};

const INITIAL_FORM: MapAiFormState = {
  brief: "",
  level: "1",
  theme: "",
  isPublished: false,
};

export function LearnMapAiCreateButton({
  buttonText = "Tạo với AI",
  className,
  size = "default",
  variant = "outline",
}: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<MapAiFormState>(INITIAL_FORM);
  const [generateDraft, { isLoading }] = useGenerateAdminLearnMapWithAiMutation();

  const setField = <K extends keyof MapAiFormState>(key: K, value: MapAiFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleGenerate = async () => {
    if (!form.brief.trim()) {
      notify({
        title: "Thiếu mô tả cho AI",
        message: "Hãy mô tả ngắn mục tiêu hoặc chủ đề của bản đồ.",
        type: "warning",
      });
      return;
    }

    try {
      const draft = await generateDraft({
        brief: form.brief.trim(),
        level: Math.max(1, Number(form.level) || 1),
        theme: form.theme.trim(),
        isPublished: form.isPublished,
      }).unwrap();

      saveLearnMapAiDraft(draft);
      setIsOpen(false);
      setForm(INITIAL_FORM);
      notify({
        title: "Đã tạo draft map với AI",
        message: "Form tạo map sẽ được điền sẵn để bạn rà lại trước khi lưu.",
        type: "success",
      });
      router.push("/admin/learn/maps/new?source=ai");
    } catch (error) {
      const apiError = handleApiError(error);
      notify({
        title: "Không thể tạo draft map",
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
            <DialogTitle>Tạo map với AI</DialogTitle>
            <DialogDescription>
              AI sẽ tạo một draft map học nói, sau đó chuyển sang form create để admin chỉnh lại.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-1">
            <div className="space-y-2">
              <Label htmlFor="learn-map-ai-brief">Mô tả cho AI</Label>
              <Textarea
                id="learn-map-ai-brief"
                rows={6}
                value={form.brief}
                onChange={(event) => setField("brief", event.target.value)}
                placeholder="Ví dụ: Tạo một map luyện nói về đi siêu thị cho người mới bắt đầu, tập hỏi giá, số lượng và cách thanh toán."
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="learn-map-ai-level">Level map</Label>
                <Input
                  id="learn-map-ai-level"
                  type="number"
                  min={1}
                  value={form.level}
                  onChange={(event) => setField("level", event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="learn-map-ai-theme">Theme gợi ý</Label>
                <Input
                  id="learn-map-ai-theme"
                  value={form.theme}
                  onChange={(event) => setField("theme", event.target.value)}
                  placeholder="shopping"
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div>
                <p className="font-semibold text-slate-900">Xuất bản ngay</p>
                <p className="text-sm text-slate-500">
                  Tắt nếu muốn AI chỉ tạo nháp để admin hoàn thiện thêm.
                </p>
              </div>
              <Switch
                checked={form.isPublished}
                onCheckedChange={(checked) => setField("isPublished", checked)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Hủy
            </Button>
            <Button type="button" onClick={handleGenerate} disabled={isLoading}>
              <Sparkles className="h-4 w-4" />
              {isLoading ? "Đang tạo..." : "Tạo draft map"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
