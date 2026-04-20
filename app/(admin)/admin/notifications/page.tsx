"use client";

import { useState } from "react";
import { Megaphone, Send, Search, User, Users } from "lucide-react";
import { useAdminSendInboxNotificationMutation } from "@/store/services/inboxNotificationsApi";
import { useNotification } from "@/hooks/use-notification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserSearchCombobox } from "@/components/admin/user-search-combobox";

export default function AdminNotificationsPage() {
  const { success, error } = useNotification();
  const [send, { isLoading }] = useAdminSendInboxNotificationMutation();

  const [scope, setScope] = useState<"all" | "user">("all");
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      error("Thiếu tiêu đề", "Vui lòng nhập tiêu đề thông báo.");
      return;
    }
    if (scope === "user" && !selectedUser) {
      error("Thiếu người dùng", "Vui lòng chọn người dùng từ danh sách.");
      return;
    }

    try {
      const res = await send({
        scope,
        userId: scope === "user" ? selectedUser?.id : undefined,
        title: cleanTitle,
        body: body.trim() || undefined,
      }).unwrap();

      if (scope === "all") {
        success(
          "Đã gửi thông báo toàn hệ thống",
          `Đã tạo thông báo cho ${res.recipients ?? 0} tài khoản.`,
        );
      } else {
        success("Đã gửi thông báo", "Người dùng sẽ thấy trong hộp thư.");
      }
      setTitle("");
      setBody("");
      setSelectedUser(null);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "data" in err
          ? String((err as { data?: { message?: string } }).data?.message ?? "")
          : "";
      error("Gửi thất bại", msg || "Vui lòng thử lại.");
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-slate-200 bg-white px-6 py-7 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge
              variant="outline"
              className="rounded-full border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500"
            >
              Notification Admin
            </Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              Gửi thông báo người dùng
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
              Gửi thông báo đến toàn bộ học viên đang hoạt động hoặc một tài khoản cụ thể.
              Tin nhắn hiển thị trong chuông thông báo trên header.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <Card className="border-slate-200 py-5">
          <CardHeader>
            <CardTitle>Soạn thông báo</CardTitle>
            <CardDescription>
              Điền thông tin và chọn đối tượng nhận thông báo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => void onSubmit(e)} className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base font-semibold text-slate-900">
                  Phạm vi gửi
                </Label>
                <RadioGroup
                  value={scope}
                  onValueChange={(v) => {
                    setScope(v as "all" | "user");
                    if (v === "all") {
                      setSelectedUser(null);
                    }
                  }}
                  className="grid gap-3 md:grid-cols-2"
                >
                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                      scope === "all"
                        ? "border-slate-900 bg-slate-50"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <RadioGroupItem value="all" id="scope-all" />
                    <div className="flex flex-1 items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                        <Users className="h-5 w-5 text-slate-700" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Toàn hệ thống</p>
                        <p className="text-xs text-slate-600">Gửi đến tất cả người dùng</p>
                      </div>
                    </div>
                  </label>

                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                      scope === "user"
                        ? "border-slate-900 bg-slate-50"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <RadioGroupItem value="user" id="scope-user" />
                    <div className="flex flex-1 items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                        <User className="h-5 w-5 text-slate-700" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Một người dùng</p>
                        <p className="text-xs text-slate-600">Gửi đến người cụ thể</p>
                      </div>
                    </div>
                  </label>
                </RadioGroup>
              </div>

              {scope === "user" && (
                <div className="space-y-2">
                  <Label htmlFor="user-search" className="text-base font-semibold text-slate-900">
                    Chọn người dùng
                  </Label>
                  <UserSearchCombobox
                    selectedUser={selectedUser}
                    onSelectUser={setSelectedUser}
                  />
                  {selectedUser && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">
                          {selectedUser.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-emerald-900">
                            {selectedUser.name}
                          </p>
                          <p className="text-sm text-emerald-700">{selectedUser.email}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-semibold text-slate-900">
                  Tiêu đề <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={200}
                  placeholder="VD: Cập nhật tính năng mới"
                  className="h-11"
                />
                <p className="text-xs text-slate-500">
                  Tối đa 200 ký tự
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="body" className="text-base font-semibold text-slate-900">
                  Nội dung <span className="text-slate-400">(tùy chọn)</span>
                </Label>
                <Textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={6}
                  maxLength={4000}
                  placeholder="Nhập nội dung chi tiết của thông báo..."
                  className="resize-y"
                />
                <p className="text-xs text-slate-500">
                  Tối đa 4000 ký tự
                </p>
              </div>

              <div className="flex gap-3 border-t border-slate-200 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setTitle("");
                    setBody("");
                    setSelectedUser(null);
                  }}
                  className="rounded-xl"
                >
                  Xóa form
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 gap-2 rounded-xl"
                >
                  {isLoading ? (
                    "Đang gửi..."
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Gửi thông báo
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-slate-200 py-5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-slate-700" />
                Hướng dẫn
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">Toàn hệ thống</p>
                <p className="mt-1">
                  Gửi thông báo đến tất cả người dùng đang hoạt động. Phù hợp cho
                  thông báo bảo trì, cập nhật tính năng mới.
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">Một người dùng</p>
                <p className="mt-1">
                  Gửi thông báo riêng cho một học viên cụ thể. Dùng thanh tìm kiếm
                  để tìm theo tên hoặc email.
                </p>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="font-semibold text-amber-900">Lưu ý</p>
                <ul className="mt-2 space-y-1 text-amber-800">
                  <li>• Thông báo hiển thị trong chuông thông báo</li>
                  <li>• Không thể thu hồi sau khi gửi</li>
                  <li>• Gửi toàn hệ thống có thể mất vài giây</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 py-5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-slate-700" />
                Mẹo tìm kiếm
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <p>
                Khi chọn "Một người dùng", bạn có thể tìm kiếm theo:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-slate-400">•</span>
                  <span>Tên đầy đủ của người dùng</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-slate-400">•</span>
                  <span>Địa chỉ email</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-slate-400">•</span>
                  <span>Kết quả hiển thị tối đa 10 người</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
