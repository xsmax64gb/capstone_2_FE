"use client";

import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { AtSign, GraduationCap, Mail, MapPin, Plus, Save, Trash2, Edit, Lock } from "lucide-react";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { ChangePasswordOtpForm } from "@/components/auth/change-password-otp-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useDeleteAvatarMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
} from "@/store/services/authApi";
import { notify } from "@/lib/admin";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n/context";
import { LevelHistoryTimeline } from "@/components/learn/level-history-timeline";
import { LevelProgressBar } from "@/components/layouts/level-progress-bar";
import { useLevel } from "@/contexts/level-context";

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
  const { user: authUser } = useAuth();
  const { t } = useI18n();
  const { levelInfo } = useLevel();

  const { data: profile, isLoading, isError } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [uploadAvatar, { isLoading: isUploadingAvatar }] = useUploadAvatarMutation();
  const [deleteAvatar, { isLoading: isDeletingAvatar }] = useDeleteAvatarMutation();
  const [form, setForm] = useState<ProfileFormState>(emptyForm);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState("");
  
  // Dialog states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

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

  const displayEmail = profile?.email || authUser?.email || "";
  const displayTimezone =
    profile?.timezone || form.timezone || authUser?.timezone || "";
  const displayNativeLanguage =
    profile?.nativeLanguage || form.nativeLanguage || "";

  const profileHandle = useMemo(() => {
    const email = displayEmail;
    if (!email) {
      return "learner";
    }

    return email.split("@")[0]?.replace(/\s+/g, "_") || "learner";
  }, [displayEmail]);

  const remoteAvatarUrl = profile?.avatarUrl
    ? appendVersion(profile.avatarUrl, profile.updatedAt)
    : DEFAULT_AVATAR_URL;
  const avatarUrl = avatarPreviewUrl || remoteAvatarUrl;
  const profileName =
    form.fullName ||
    profile?.fullName ||
    authUser?.fullName ||
    authUser?.name ||
    "Người dùng";

  const stats = [
    {
      label: t("Email"),
      value: displayEmail || t("Chưa có"),
    },
    {
      label: t("Trình độ (CEFR)"),
      value: profile?.currentLevel || authUser?.currentLevel || "A1",
    },
    {
      label: t("Ngôn ngữ"),
      value: displayNativeLanguage || t("Chưa cập nhật"),
    },
    {
      label: t("Múi giờ"),
      value: displayTimezone || t("Chưa cập nhật"),
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
        title: t("Đã cập nhật avatar"),
        message: t("Ảnh đại diện đã được lưu ngay."),
        type: "success",
      });
    } catch (error) {
      notify({
        title: t("Không thể cập nhật avatar"),
        message: error instanceof Error ? error.message : t("Vui lòng thử lại."),
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
        title: t("Đã cập nhật profile"),
        message: t("Thông tin của bạn đã được lưu."),
        type: "success",
      });
      setIsEditDialogOpen(false);
    } catch (error) {
      notify({
        title: t("Không thể cập nhật profile"),
        message:
          error instanceof Error ? error.message : t("Vui lòng kiểm tra lại dữ liệu."),
        type: "error",
      });
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      await deleteAvatar().unwrap();
      notify({
        title: t("Đã xóa avatar"),
        message: t("Avatar của bạn đã được gỡ."),
        type: "success",
      });
    } catch (error) {
      notify({
        title: t("Không thể xóa avatar"),
        message: error instanceof Error ? error.message : t("Vui lòng thử lại."),
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
                aria-label={t("Đổi avatar")}
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
                    {profileName}
                  </h1>
                </div>
                <p className="text-sm text-slate-600">
                  @{profileHandle}
                  {displayEmail ? (
                    <span className="text-slate-400"> · {displayEmail}</span>
                  ) : null}
                </p>
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
                  <span>{displayEmail || t("Chưa có email")}</span>
                </div>
                <div className="flex items-center justify-center gap-2 lg:justify-start">
                  <MapPin className="h-4 w-4" />
                  <span>{displayTimezone || t("Chưa cập nhật múi giờ")}</span>
                </div>
                <div className="flex items-center justify-center gap-2 lg:justify-start">
                  <GraduationCap className="h-4 w-4" />
                  <span>
                    {t("Trình độ hiện tại:")}{" "}
                    <span className="font-semibold text-slate-950">
                      {profile?.currentLevel || authUser?.currentLevel || "A1"}
                    </span>
                  </span>
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
                  {isUploadingAvatar ? t("Đang cập nhật ảnh...") : t("Đổi ảnh đại diện")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 rounded-2xl border-slate-200 bg-slate-100 text-slate-950 hover:bg-slate-200"
                  onClick={() => setIsEditDialogOpen(true)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  {t("Chỉnh sửa thông tin")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 rounded-2xl border-slate-200 bg-slate-100 text-slate-950 hover:bg-slate-200"
                  onClick={() => setIsPasswordDialogOpen(true)}
                >
                  <Lock className="mr-2 h-4 w-4" />
                  {t("Đổi mật khẩu")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 rounded-2xl border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                  onClick={() => void handleRemoveAvatar()}
                  disabled={isDeletingAvatar || !profile?.avatarUrl}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isDeletingAvatar ? t("Đang xóa...") : t("Xóa avatar")}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {isError ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {t("Không thể tải hồ sơ của bạn. Vui lòng thử lại sau.")}
          </div>
        ) : null}

        {levelInfo && (
          <section className="mt-8">
            <LevelProgressBar
              currentLevel={levelInfo.currentLevel}
              currentLevelName={levelInfo.currentLevelName}
              totalXp={levelInfo.totalXp}
              currentLevelThreshold={levelInfo.currentLevelThreshold}
              nextLevelThreshold={levelInfo.nextLevelThreshold}
              progressPercentage={levelInfo.progressPercentage}
              testAvailable={levelInfo.testAvailable}
              canAttemptTest={levelInfo.canAttemptTest}
            />
          </section>
        )}

        <section className="mt-8">
          <LevelHistoryTimeline />
        </section>

        {/* Edit Profile Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-h-[90vh] w-[min(600px,94vw)] overflow-y-auto sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                {t("Chỉnh sửa thông tin")}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t("Họ và tên")}
                </label>
                <Input
                  value={form.fullName}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, fullName: event.target.value }))
                  }
                  placeholder={t("Nhập họ và tên")}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t("Tiểu sử")}
                </label>
                <Textarea
                  rows={4}
                  value={form.bio}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, bio: event.target.value }))
                  }
                  placeholder={t("Viết vài dòng giới thiệu về bạn")}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    {t("Ngôn ngữ mẹ đẻ")}
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
                    <option value="">{t("Chọn ngôn ngữ")}</option>
                    {DEFAULT_NATIVE_LANGUAGE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    {t("Múi giờ")}
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
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t("Email")}
                </label>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  {displayEmail || "Chưa có email"}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  {t("Hủy")}
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  onClick={() => void handleSave()}
                  disabled={isUpdating || isLoading || !profile}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isUpdating ? t("Đang lưu...") : t("Lưu thay đổi")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Change Password Dialog */}
        <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
          <DialogContent className="w-[min(500px,94vw)] sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                {t("Đổi mật khẩu")}
              </DialogTitle>
            </DialogHeader>
            <div className="pt-2">
              <ChangePasswordOtpForm />
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </ProtectedRoute>
  );
}
