"use client";

import { useState } from "react";
import { Megaphone, Send } from "lucide-react";
import { useAdminSendInboxNotificationMutation } from "@/store/services/inboxNotificationsApi";
import { useNotification } from "@/hooks/use-notification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function AdminNotificationsPage() {
  const { success, error } = useNotification();
  const [send, { isLoading }] = useAdminSendInboxNotificationMutation();

  const [scope, setScope] = useState<"all" | "user">("all");
  const [userId, setUserId] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      error("Thiếu tiêu đề", "Vui lòng nhập tiêu đề thông báo.");
      return;
    }
    if (scope === "user" && !userId.trim()) {
      error("Thiếu user", "Nhập ID người dùng (MongoDB ObjectId) từ trang Người dùng.");
      return;
    }

    try {
      const res = await send({
        scope,
        userId: scope === "user" ? userId.trim() : undefined,
        title: cleanTitle,
        body: body.trim() || undefined,
      }).unwrap();

      if (scope === "all") {
        success(
          "Đã gửi thông báo toàn hệ thống",
          `Đã tạo thông báo cho khoảng ${res.recipients ?? 0} tài khoản.`,
        );
      } else {
        success("Đã gửi thông báo", "Người dùng sẽ thấy trong hộp thư.");
      }
      setTitle("");
      setBody("");
      setUserId("");
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "data" in err
          ? String((err as { data?: { message?: string } }).data?.message ?? "")
          : "";
      error("Gửi thất bại", msg || "Vui lòng thử lại.");
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-8 lg:px-8">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
          <Megaphone className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">
            Thông báo người dùng
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Gửi thông báo đến toàn bộ học viên đang hoạt động hoặc một tài khoản cụ thể. Tin nhắn
            hiển thị trong chuông thông báo trên header.
          </p>
        </div>
      </div>

      <form
        onSubmit={(e) => void onSubmit(e)}
        className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="space-y-3">
          <Label className="text-slate-800">Phạm vi</Label>
          <RadioGroup
            value={scope}
            onValueChange={(v) => setScope(v as "all" | "user")}
            className="flex flex-col gap-2"
          >
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 hover:bg-slate-50">
              <RadioGroupItem value="all" id="scope-all" />
              <span className="text-sm font-medium text-slate-800">Toàn hệ thống</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 hover:bg-slate-50">
              <RadioGroupItem value="user" id="scope-user" />
              <span className="text-sm font-medium text-slate-800">Một người dùng</span>
            </label>
          </RadioGroup>
        </div>

        {scope === "user" ? (
          <div>
            <Label htmlFor="userId" className="text-slate-800">
              ID người dùng
            </Label>
            <Input
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Ví dụ: 507f1f77bcf86cd799439011"
              className="mt-2 font-mono text-sm"
            />
            <p className="mt-1 text-xs text-slate-500">
              Sao chép từ cột id trong trang Quản trị → Người dùng.
            </p>
          </div>
        ) : null}

        <div>
          <Label htmlFor="title" className="text-slate-800">
            Tiêu đề
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            placeholder="Tiêu đề ngắn gọn"
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="body" className="text-slate-800">
            Nội dung (tuỳ chọn)
          </Label>
          <Textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            maxLength={4000}
            placeholder="Nội dung chi tiết…"
            className="mt-2 resize-y"
          />
        </div>

        <Button type="submit" disabled={isLoading} className="gap-2">
          {isLoading ? (
            "Đang gửi…"
          ) : (
            <>
              <Send className="h-4 w-4" />
              Gửi thông báo
            </>
          )}
        </Button>
      </form>

      <p className="text-center text-xs text-slate-500">
        Gửi toàn hệ thống có thể mất vài giây nếu có nhiều tài khoản. Không đóng trang khi đang xử
        lý.
      </p>
    </div>
  );
}
