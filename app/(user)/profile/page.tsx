"use client";

import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { AtSign, Mail, MapPin, Plus, Save, Trash2 } from "lucide-react";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { ChangePasswordOtpForm } from "@/components/auth/change-password-otp-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useDeleteAvatarMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
} from "@/lib/api/authApi";
import { notify } from "@/lib/admin";

const DEFAULT_AVATAR_URL = "/placeholder-user.jpg";

const DEFAULT_NATIVE_LANGUAGE_OPTIONS = [
  "Vietnamese",
  "English",
  "Japanese",
  "Korean",
  "Chinese",
  "French",
];

type ProfileFormState = {
  fullName: string;
  bio: string;
  nativeLanguage: string;
  timezone: string;
};

const emptyForm: ProfileFormState = {
  fullName: "",
  bio: "",
  nativeLanguage: "",
  timezone: "",
};

const appendVersion = (url: string, version?: string) => {
  if (!url) {
    return DEFAULT_AVATAR_URL;
  }

  if (!version) {
    return url;
  }

  return `${url}${url.includes("?") ? "&" : "?"}v=${encodeURIComponent(version)}`;
};

export default function ProfilePage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const securitySectionRef = useRef<HTMLDivElement | null>(null);

  const { data: profile, isLoading, isError } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [uploadAvatar, { isLoading: isUploadingAvatar }] = useUploadAvatarMutation();
  const [deleteAvatar, { isLoading: isDeletingAvatar }] = useDeleteAvatarMutation();
  const [form, setForm] = useState<ProfileFormState>(emptyForm);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState("");

  useEffect(() => {
    if (!profile) {
      return;
    }

    setForm({
      fullName: profile.fullName || "",
      bio: profile.bio || "",
      nativeLanguage: profile.nativeLanguage || "",
      timezone: profile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "",
    });
  }, [profile]);

  const profileHandle = useMemo(() => {
    if (!profile?.email) {
      return "learner";
    }

    return profile.email.split("@")[0]?.replace(/\s+/g, "_") || "learner";
  }, [profile?.email]);

  const remoteAvatarUrl = profile?.avatarUrl
    ? appendVersion(profile.avatarUrl, profile.updatedAt)
    : DEFAULT_AVATAR_URL;
  const avatarUrl = avatarPreviewUrl || remoteAvatarUrl;
  const profileName = form.fullName || profile?.fullName || "Người dùng";

  const stats = [
    {
      label: "Email",
      value: profile?.email || "Chưa có",
    },
    {
      label: "Ngôn ngữ",
      value: form.nativeLanguage || "Chưa cập nhật",
    },
    {
      label: "Múi giờ",
      value: form.timezone || "Chưa cập nhật",
    },
  ];

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0];

    if (!nextFile) {
      return;
    }

    const objectUrl = URL.createObjectURL(nextFile);
    setAvatarPreviewUrl(objectUrl);

    try {
      await uploadAvatar(nextFile).unwrap();
      notify({
        title: "Đã cập nhật avatar",
        message: "Ảnh đại diện đã được lưu ngay.",
        type: "success",
      });
    } catch (error) {
      notify({
        title: "Không thể cập nhật avatar",
        message: error instanceof Error ? error.message : "Vui lòng thử lại.",
        type: "error",
      });
    } finally {
      URL.revokeObjectURL(objectUrl);
      setAvatarPreviewUrl("");
      event.target.value = "";
    }
  };

  const handleSave = async () => {
    try {
      await updateProfile(form).unwrap();
      notify({
        title: "Đã cập nhật profile",
        message: "Thông tin của bạn đã được lưu.",
        type: "success",
      });
    } catch (error) {
      notify({
        title: "Không thể cập nhật profile",
        message:
          error instanceof Error ? error.message : "Vui lòng kiểm tra lại dữ liệu.",
        type: "error",
      });
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      await deleteAvatar().unwrap();
      notify({
        title: "Đã xóa avatar",
        message: "Avatar của bạn đã được gỡ.",
        type: "success",
      });
    } catch (error) {
      notify({
        title: "Không thể xóa avatar",
        message: error instanceof Error ? error.message : "Vui lòng thử lại.",
        type: "error",
      });
    }
  };

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-10">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            <div className="relative mx-auto lg:mx-0">
              <Avatar className="h-36 w-36 border-4 border-white shadow-[0_20px_45px_-24px_rgba(15,23,42,0.55)] sm:h-40 sm:w-40">
                <AvatarImage src={avatarUrl} alt={profileName} className="object-cover" />
                <AvatarFallback className="bg-slate-100 text-3xl font-semibold text-slate-500">
                  {profileName.slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 flex h-11 w-11 items-center justify-center rounded-full border-4 border-white bg-slate-950 text-white shadow-lg transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Đổi avatar"
                disabled={isUploadingAvatar}
              >
                <Plus className="h-5 w-5" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => void handleAvatarChange(event)}
              />
            </div>

            <div className="min-w-0 flex-1 space-y-4">
              <div className="space-y-2 text-center lg:text-left">
                <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                  <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                    {profileHandle}
                  </h1>
                </div>
                <p className="text-lg text-slate-900">{profileName}</p>
              </div>

              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-700 lg:justify-start">
                {stats.map((item) => (
                  <p key={item.label}>
                    <span className="font-semibold text-slate-950">{item.value}</span>{" "}
                    {item.label}
                  </p>
                ))}
              </div>

              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-center justify-center gap-2 lg:justify-start">
                  <AtSign className="h-4 w-4" />
                  <span>{profileHandle}</span>
                </div>
                <div className="flex items-center justify-center gap-2 lg:justify-start">
                  <Mail className="h-4 w-4" />
                  <span>{profile?.email || "Chưa có email"}</span>
                </div>
                <div className="flex items-center justify-center gap-2 lg:justify-start">
                  <MapPin className="h-4 w-4" />
                  <span>{form.timezone || "Chưa cập nhật múi giờ"}</span>
                </div>
              </div>

              {form.bio ? (
                <p className="max-w-2xl text-sm leading-7 text-slate-600">{form.bio}</p>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 rounded-2xl border-slate-200 bg-slate-100 text-slate-950 hover:bg-slate-200"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                >
                  {isUploadingAvatar ? "Đang cập nhật ảnh..." : "Đổi ảnh đại diện"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 rounded-2xl border-slate-200 bg-slate-100 text-slate-950 hover:bg-slate-200"
                  onClick={() =>
                    securitySectionRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    })
                  }
                >
                  Đổi mật khẩu
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">Chỉnh sửa thông tin</h2>
                </div>
                <Avatar className="h-14 w-14 border border-slate-200">
                <AvatarImage src={avatarUrl} alt={profileName} className="object-cover" />
                <AvatarFallback className="bg-slate-100 text-slate-500">
                  {profileName.slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Họ và tên
                </label>
                <Input
                  value={form.fullName}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, fullName: event.target.value }))
                  }
                  placeholder="Nhập họ và tên"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Bio</label>
                <Textarea
                  rows={4}
                  value={form.bio}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, bio: event.target.value }))
                  }
                  placeholder="Viết vài dòng giới thiệu về bạn"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Ngôn ngữ mẹ đẻ
                  </label>
                  <select
                    value={form.nativeLanguage}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        nativeLanguage: event.target.value,
                      }))
                    }
                    className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                  >
                    <option value="">Chọn ngôn ngữ</option>
                    {DEFAULT_NATIVE_LANGUAGE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Timezone
                  </label>
                  <Input
                    value={form.timezone}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, timezone: event.target.value }))
                    }
                    placeholder="Asia/Ho_Chi_Minh"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  {profile?.email || "Chưa có email"}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  className="rounded-xl"
                  onClick={() => void handleSave()}
                  disabled={isUpdating || isLoading || !profile}
                >
                  <Save className="h-4 w-4" />
                  {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                  onClick={() => void handleRemoveAvatar()}
                  disabled={isDeletingAvatar || !profile?.avatarUrl}
                >
                  <Trash2 className="h-4 w-4" />
                  {isDeletingAvatar ? "Đang xóa..." : "Xóa avatar"}
                </Button>
              </div>
            </div>
          </div>

          <div
            ref={securitySectionRef}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-slate-950">Bảo mật tài khoản</h2>
            </div>
            <div className="pt-5">
              <ChangePasswordOtpForm />
            </div>
          </div>
        </section>

        {isError ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            Không thể tải hồ sơ của bạn. Vui lòng thử lại sau.
          </div>
        ) : null}
      </main>
    </ProtectedRoute>
  );
}
