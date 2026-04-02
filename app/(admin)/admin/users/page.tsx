"use client";

import { useMemo, useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  UserCog,
  UserPlus,
  Users2,
} from "lucide-react";
import {
  useCreateAdminUserMutation,
  useDeleteAdminUserMutation,
  useGetAdminUsersQuery,
  useResetAdminUserPasswordMutation,
  useUpdateAdminUserMutation,
  useUpdateAdminUserRoleMutation,
  useUpdateAdminUserStatusMutation,
} from "@/store/services/adminApi";
import { formatDateTime, formatNumber, formatPercent } from "@/lib/admin";
import {
  AdminPageError,
  AdminPageLoading,
} from "@/components/admin/admin-query-state";
import { useNotification } from "@/hooks/use-notification";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import type { User } from "@/types";

type UserRole = "user" | "admin";
type UserLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
type FilterToggle = "all" | "true" | "false";

type UserFormState = {
  fullName: string;
  email: string;
  role: UserRole;
  currentLevel: UserLevel;
  exp: string;
  onboardingDone: boolean;
  isActive: boolean;
  bio: string;
  nativeLanguage: string;
  timezone: string;
  avatarUrl: string;
};

const LEVEL_OPTIONS: UserLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

const INITIAL_CREATE_FORM: UserFormState & { password: string } = {
  fullName: "",
  email: "",
  password: "",
  role: "admin",
  currentLevel: "A1",
  exp: "0",
  onboardingDone: false,
  isActive: true,
  bio: "",
  nativeLanguage: "",
  timezone: "",
  avatarUrl: "",
};

const toApiErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error && "data" in error) {
    const data = (error as { data?: { message?: string } }).data;
    if (data?.message) {
      return data.message;
    }
  }

  if (typeof error === "object" && error && "message" in error) {
    const message = (error as { message?: string }).message;
    if (message) {
      return message;
    }
  }

  return fallback;
};

const toUserFormState = (user: User): UserFormState => ({
  fullName: user.fullName || "",
  email: user.email || "",
  role: user.role === "admin" ? "admin" : "user",
  currentLevel: LEVEL_OPTIONS.includes((user.currentLevel || "A1") as UserLevel)
    ? (user.currentLevel as UserLevel)
    : "A1",
  exp: String(user.exp ?? 0),
  onboardingDone: Boolean(user.onboardingDone),
  isActive: user.isActive !== false,
  bio: user.bio || "",
  nativeLanguage: user.nativeLanguage || "",
  timezone: user.timezone || "",
  avatarUrl: user.avatarUrl || "",
});

export default function AdminUsersPage() {
  const { success, error } = useNotification();

  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [levelFilter, setLevelFilter] = useState<UserLevel | "all">("all");
  const [onboardingFilter, setOnboardingFilter] = useState<FilterToggle>("all");
  const [statusFilter, setStatusFilter] = useState<FilterToggle>("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(INITIAL_CREATE_FORM);

  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<UserFormState | null>(null);

  const [passwordTarget, setPasswordTarget] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const queryParams = useMemo(
    () => ({
      page,
      limit,
      query: query || undefined,
      role: roleFilter,
      level: levelFilter,
      onboardingDone: onboardingFilter,
      isActive: statusFilter,
      sortBy: "createdAt" as const,
      sortOrder: "desc" as const,
    }),
    [
      levelFilter,
      limit,
      onboardingFilter,
      page,
      query,
      roleFilter,
      statusFilter,
    ],
  );

  const {
    data,
    isLoading,
    isError,
    error: queryError,
  } = useGetAdminUsersQuery(queryParams);

  const [createAdminUser, { isLoading: isCreating }] =
    useCreateAdminUserMutation();
  const [updateAdminUser, { isLoading: isUpdatingUser }] =
    useUpdateAdminUserMutation();
  const [updateAdminUserRole, { isLoading: isUpdatingRole }] =
    useUpdateAdminUserRoleMutation();
  const [updateAdminUserStatus, { isLoading: isUpdatingStatus }] =
    useUpdateAdminUserStatusMutation();
  const [resetAdminUserPassword, { isLoading: isResettingPassword }] =
    useResetAdminUserPasswordMutation();
  const [deleteAdminUser, { isLoading: isDeletingUser }] =
    useDeleteAdminUserMutation();

  const isMutating =
    isCreating ||
    isUpdatingUser ||
    isUpdatingRole ||
    isUpdatingStatus ||
    isResettingPassword ||
    isDeletingUser;

  const pagination = data?.pagination ?? {
    page,
    limit,
    total: data?.users.length ?? 0,
    totalPages: 1,
  };

  const summary = data?.summary;

  const metrics = summary
    ? [
        {
          label: "Tổng hồ sơ",
          value: formatNumber(summary.totalUsers),
          hint: `${formatNumber(summary.adminUsers)} tài khoản admin`,
          icon: Users2,
        },
        {
          label: "Đã onboard",
          value: formatNumber(summary.onboardingCompleted),
          hint: `${formatNumber(summary.onboardingPending)} còn pending`,
          icon: UserPlus,
        },
        {
          label: "Trạng thái tài khoản",
          value: `${formatNumber(summary.activeUsers ?? 0)} active`,
          hint: `${formatNumber(summary.inactiveUsers ?? 0)} inactive`,
          icon: ShieldCheck,
        },
        {
          label: "Placement trung bình",
          value: formatPercent(summary.averagePlacementScore),
          hint: "Tính từ toàn bộ tài khoản hiện có",
          icon: ShieldAlert,
        },
      ]
    : [];

  const resetFilters = () => {
    setQuery("");
    setRoleFilter("all");
    setLevelFilter("all");
    setOnboardingFilter("all");
    setStatusFilter("all");
    setPage(1);
    setLimit(10);
  };

  const onCreateUser = async () => {
    try {
      if (
        !createForm.fullName.trim() ||
        !createForm.email.trim() ||
        !createForm.password.trim()
      ) {
        error("Thiếu thông tin", "Họ tên, email và mật khẩu là bắt buộc.");
        return;
      }

      if (createForm.password.trim().length < 6) {
        error("Mật khẩu không hợp lệ", "Mật khẩu phải có ít nhất 6 ký tự.");
        return;
      }

      await createAdminUser({
        fullName: createForm.fullName.trim(),
        email: createForm.email.trim().toLowerCase(),
        password: createForm.password,
        role: createForm.role,
        currentLevel: createForm.currentLevel,
        exp: Number.isFinite(Number(createForm.exp))
          ? Math.max(0, Number(createForm.exp))
          : 0,
        onboardingDone: createForm.onboardingDone,
        isActive: createForm.isActive,
        bio: createForm.bio,
        nativeLanguage: createForm.nativeLanguage,
        timezone: createForm.timezone,
        avatarUrl: createForm.avatarUrl,
      }).unwrap();

      success(
        "Tạo tài khoản thành công",
        "Tài khoản đã được tạo mà không cần xác thực Gmail.",
      );
      setCreateForm(INITIAL_CREATE_FORM);
      setIsCreateOpen(false);
      setPage(1);
    } catch (mutationError) {
      error(
        "Tạo tài khoản thất bại",
        toApiErrorMessage(mutationError, "Không thể tạo tài khoản."),
      );
    }
  };

  const onOpenEdit = (user: User) => {
    setEditTarget(user);
    setEditForm(toUserFormState(user));
  };

  const onUpdateUser = async () => {
    if (!editTarget || !editForm) {
      return;
    }

    try {
      if (!editForm.fullName.trim() || !editForm.email.trim()) {
        error("Thiếu thông tin", "Họ tên và email là bắt buộc.");
        return;
      }

      await updateAdminUser({
        id: editTarget.id,
        body: {
          fullName: editForm.fullName.trim(),
          email: editForm.email.trim().toLowerCase(),
          role: editForm.role,
          currentLevel: editForm.currentLevel,
          exp: Number.isFinite(Number(editForm.exp))
            ? Math.max(0, Number(editForm.exp))
            : 0,
          onboardingDone: editForm.onboardingDone,
          isActive: editForm.isActive,
          bio: editForm.bio,
          nativeLanguage: editForm.nativeLanguage,
          timezone: editForm.timezone,
          avatarUrl: editForm.avatarUrl,
        },
      }).unwrap();

      success("Cập nhật thành công", "Thông tin tài khoản đã được lưu.");
      setEditTarget(null);
      setEditForm(null);
    } catch (mutationError) {
      error(
        "Cập nhật thất bại",
        toApiErrorMessage(mutationError, "Không thể cập nhật tài khoản."),
      );
    }
  };

  const onToggleRole = async (user: User) => {
    try {
      const nextRole: UserRole = user.role === "admin" ? "user" : "admin";
      await updateAdminUserRole({ id: user.id, role: nextRole }).unwrap();
      success(
        "Đổi quyền thành công",
        nextRole === "admin"
          ? "User đã được nâng quyền admin."
          : "Admin đã được chuyển về user.",
      );
    } catch (mutationError) {
      error(
        "Đổi quyền thất bại",
        toApiErrorMessage(mutationError, "Không thể cập nhật quyền."),
      );
    }
  };

  const onToggleStatus = async (user: User, nextIsActive: boolean) => {
    try {
      await updateAdminUserStatus({
        id: user.id,
        isActive: nextIsActive,
      }).unwrap();
      success(
        "Cập nhật trạng thái",
        nextIsActive
          ? "Tài khoản đã được kích hoạt."
          : "Tài khoản đã được khóa.",
      );
    } catch (mutationError) {
      error(
        "Cập nhật thất bại",
        toApiErrorMessage(mutationError, "Không thể cập nhật trạng thái."),
      );
    }
  };

  const onResetPassword = async () => {
    if (!passwordTarget) {
      return;
    }

    try {
      if (newPassword.trim().length < 6) {
        error("Mật khẩu không hợp lệ", "Mật khẩu mới phải có ít nhất 6 ký tự.");
        return;
      }

      await resetAdminUserPassword({
        id: passwordTarget.id,
        newPassword: newPassword.trim(),
      }).unwrap();
      success(
        "Đặt lại mật khẩu thành công",
        `Đã cập nhật mật khẩu cho ${passwordTarget.email}.`,
      );
      setNewPassword("");
      setPasswordTarget(null);
    } catch (mutationError) {
      error(
        "Đặt lại mật khẩu thất bại",
        toApiErrorMessage(mutationError, "Không thể đặt lại mật khẩu."),
      );
    }
  };

  const onDeleteUser = async (user: User) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa tài khoản ${user.email}?`,
    );
    if (!confirmed) {
      return;
    }

    try {
      await deleteAdminUser(user.id).unwrap();
      success(
        "Xóa tài khoản thành công",
        `${user.email} đã bị xóa khỏi hệ thống.`,
      );
      if (data?.users.length === 1 && page > 1) {
        setPage((prev) => Math.max(1, prev - 1));
      }
    } catch (mutationError) {
      error(
        "Xóa tài khoản thất bại",
        toApiErrorMessage(mutationError, "Không thể xóa tài khoản."),
      );
    }
  };

  if (isLoading) {
    return <AdminPageLoading />;
  }

  if (isError || !data) {
    const message =
      typeof queryError === "object" && queryError && "status" in queryError
        ? `Yêu cầu thất bại (${String(queryError.status)}).`
        : undefined;

    return <AdminPageError message={message} />;
  }

  return (
    <>
      <section className="rounded-[30px] border border-slate-200 bg-white px-6 py-7 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Badge
              variant="outline"
              className="rounded-full border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500"
            >
              User Operations
            </Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              Quản trị tài khoản người dùng toàn diện
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
              Admin có thể tạo tài khoản mới (kể cả admin), cấp quyền, khóa tài
              khoản, cập nhật hồ sơ, đặt lại mật khẩu và xóa tài khoản.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="rounded-xl"
            disabled={isMutating}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Tạo tài khoản mới
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {metrics.map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.label} className="border-slate-200 py-5">
              <CardContent className="flex items-start justify-between gap-4 pt-1">
                <div>
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                    {item.value}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">{item.hint}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <Card className="border-slate-200 py-5">
        <CardHeader>
          <CardTitle>Bộ lọc quản lý user</CardTitle>
          <CardDescription>
            Lọc theo từ khóa, quyền, level, trạng thái onboarding và trạng thái
            hoạt động.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            <Input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Tìm theo tên hoặc email"
            />

            <select
              value={roleFilter}
              onChange={(event) => {
                setRoleFilter(event.target.value as UserRole | "all");
                setPage(1);
              }}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
            >
              <option value="all">Tất cả role</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>

            <select
              value={levelFilter}
              onChange={(event) => {
                setLevelFilter(event.target.value as UserLevel | "all");
                setPage(1);
              }}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
            >
              <option value="all">Tất cả level</option>
              {LEVEL_OPTIONS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>

            <select
              value={onboardingFilter}
              onChange={(event) => {
                setOnboardingFilter(event.target.value as FilterToggle);
                setPage(1);
              }}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
            >
              <option value="all">Onboarding: tất cả</option>
              <option value="true">Onboarding: done</option>
              <option value="false">Onboarding: pending</option>
            </select>

            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as FilterToggle);
                setPage(1);
              }}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
            >
              <option value="all">Trạng thái: tất cả</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>

            <select
              value={String(limit)}
              onChange={(event) => {
                setLimit(Number(event.target.value));
                setPage(1);
              }}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
            >
              <option value="10">10 / trang</option>
              <option value="20">20 / trang</option>
              <option value="50">50 / trang</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Hiển thị {formatNumber(data.users.length)} /{" "}
              {formatNumber(pagination.total)} tài khoản.
            </p>
            <Button
              variant="outline"
              onClick={resetFilters}
              disabled={isMutating}
            >
              Xóa bộ lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 py-5">
        <CardHeader>
          <CardTitle>Danh sách người dùng</CardTitle>
          <CardDescription>
            Thao tác trực tiếp: cấp quyền, khóa/mở khóa, chỉnh sửa, đặt lại mật
            khẩu và xóa tài khoản.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Họ tên</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Onboarding</TableHead>
                <TableHead>Placement</TableHead>
                <TableHead>Tạo lúc</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="h-24 text-center text-slate-500"
                  >
                    Không có tài khoản phù hợp với bộ lọc hiện tại.
                  </TableCell>
                </TableRow>
              ) : (
                data.users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium text-slate-900">
                      {user.fullName}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`rounded-full capitalize ${
                          user.role === "admin"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-slate-50 text-slate-600"
                        }`}
                      >
                        {user.role || "user"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={user.isActive !== false}
                          onCheckedChange={(checked) =>
                            onToggleStatus(user, checked)
                          }
                          disabled={isMutating}
                        />
                        <span
                          className={
                            user.isActive === false
                              ? "text-rose-600 text-xs"
                              : "text-emerald-600 text-xs"
                          }
                        >
                          {user.isActive === false ? "Inactive" : "Active"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{user.currentLevel || "A1"}</TableCell>
                    <TableCell>
                      <span
                        className={
                          user.onboardingDone
                            ? "text-emerald-600 text-xs"
                            : "text-amber-600 text-xs"
                        }
                      >
                        {user.onboardingDone ? "Done" : "Pending"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {formatPercent(user.placementScore || 0)}
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {formatDateTime(user.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onToggleRole(user)}
                          disabled={isMutating}
                        >
                          {user.role === "admin" ? "Hạ quyền" : "Nâng admin"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onOpenEdit(user)}
                          disabled={isMutating}
                        >
                          <UserCog className="mr-1 h-3.5 w-3.5" />
                          Sửa
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setPasswordTarget(user);
                            setNewPassword("");
                          }}
                          disabled={isMutating}
                        >
                          Reset pass
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => onDeleteUser(user)}
                          disabled={isMutating}
                        >
                          Xóa
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {pagination.totalPages > 1 && (
            <div className="flex justify-center pt-2">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        if (pagination.page > 1) {
                          setPage((prev) => prev - 1);
                        }
                      }}
                      className={
                        pagination.page <= 1
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>

                  {Array.from(
                    { length: pagination.totalPages },
                    (_, index) => index + 1,
                  )
                    .slice(
                      Math.max(0, pagination.page - 3),
                      Math.max(5, pagination.page + 2),
                    )
                    .map((pageItem) => (
                      <PaginationItem key={pageItem}>
                        <PaginationLink
                          href="#"
                          isActive={pagination.page === pageItem}
                          onClick={(event) => {
                            event.preventDefault();
                            setPage(pageItem);
                          }}
                        >
                          {pageItem}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        if (pagination.page < pagination.totalPages) {
                          setPage((prev) => prev + 1);
                        }
                      }}
                      className={
                        pagination.page >= pagination.totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tạo tài khoản mới</DialogTitle>
            <DialogDescription>
              Admin có thể tạo tài khoản user/admin trực tiếp, không cần OTP
              email.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-1 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>Họ tên</Label>
              <Input
                value={createForm.fullName}
                onChange={(event) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    fullName: event.target.value,
                  }))
                }
                placeholder="Nguyen Van A"
              />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={createForm.email}
                onChange={(event) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    email: event.target.value,
                  }))
                }
                placeholder="email@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label>Mật khẩu</Label>
              <Input
                type="password"
                value={createForm.password}
                onChange={(event) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    password: event.target.value,
                  }))
                }
                placeholder="Tối thiểu 6 ký tự"
              />
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <select
                value={createForm.role}
                onChange={(event) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    role: event.target.value as UserRole,
                  }))
                }
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              >
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Level</Label>
              <select
                value={createForm.currentLevel}
                onChange={(event) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    currentLevel: event.target.value as UserLevel,
                  }))
                }
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              >
                {LEVEL_OPTIONS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>EXP</Label>
              <Input
                type="number"
                min={0}
                value={createForm.exp}
                onChange={(event) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    exp: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Native language</Label>
              <Input
                value={createForm.nativeLanguage}
                onChange={(event) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    nativeLanguage: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Timezone</Label>
              <Input
                value={createForm.timezone}
                onChange={(event) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    timezone: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Avatar URL</Label>
              <Input
                value={createForm.avatarUrl}
                onChange={(event) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    avatarUrl: event.target.value,
                  }))
                }
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Bio</Label>
              <Textarea
                value={createForm.bio}
                onChange={(event) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    bio: event.target.value,
                  }))
                }
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
              <Label>Onboarding done</Label>
              <Switch
                checked={createForm.onboardingDone}
                onCheckedChange={(checked) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    onboardingDone: checked,
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
              <Label>Account active</Label>
              <Switch
                checked={createForm.isActive}
                onCheckedChange={(checked) =>
                  setCreateForm((prev) => ({ ...prev, isActive: checked }))
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateOpen(false);
                setCreateForm(INITIAL_CREATE_FORM);
              }}
              disabled={isMutating}
            >
              Hủy
            </Button>
            <Button onClick={onCreateUser} disabled={isMutating}>
              Tạo tài khoản
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(editTarget && editForm)}
        onOpenChange={(open) => {
          if (!open) {
            setEditTarget(null);
            setEditForm(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Cập nhật tài khoản</DialogTitle>
            <DialogDescription>
              Chỉnh sửa đầy đủ thông tin và quyền của tài khoản người dùng.
            </DialogDescription>
          </DialogHeader>

          {editForm && (
            <div className="grid gap-4 py-1 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Họ tên</Label>
                <Input
                  value={editForm.fullName}
                  onChange={(event) =>
                    setEditForm((prev) =>
                      prev ? { ...prev, fullName: event.target.value } : prev,
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={editForm.email}
                  onChange={(event) =>
                    setEditForm((prev) =>
                      prev ? { ...prev, email: event.target.value } : prev,
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <select
                  value={editForm.role}
                  onChange={(event) =>
                    setEditForm((prev) =>
                      prev
                        ? { ...prev, role: event.target.value as UserRole }
                        : prev,
                    )
                  }
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Level</Label>
                <select
                  value={editForm.currentLevel}
                  onChange={(event) =>
                    setEditForm((prev) =>
                      prev
                        ? {
                            ...prev,
                            currentLevel: event.target.value as UserLevel,
                          }
                        : prev,
                    )
                  }
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  {LEVEL_OPTIONS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>EXP</Label>
                <Input
                  type="number"
                  min={0}
                  value={editForm.exp}
                  onChange={(event) =>
                    setEditForm((prev) =>
                      prev ? { ...prev, exp: event.target.value } : prev,
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Native language</Label>
                <Input
                  value={editForm.nativeLanguage}
                  onChange={(event) =>
                    setEditForm((prev) =>
                      prev
                        ? { ...prev, nativeLanguage: event.target.value }
                        : prev,
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Timezone</Label>
                <Input
                  value={editForm.timezone}
                  onChange={(event) =>
                    setEditForm((prev) =>
                      prev ? { ...prev, timezone: event.target.value } : prev,
                    )
                  }
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>Avatar URL</Label>
                <Input
                  value={editForm.avatarUrl}
                  onChange={(event) =>
                    setEditForm((prev) =>
                      prev ? { ...prev, avatarUrl: event.target.value } : prev,
                    )
                  }
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>Bio</Label>
                <Textarea
                  value={editForm.bio}
                  onChange={(event) =>
                    setEditForm((prev) =>
                      prev ? { ...prev, bio: event.target.value } : prev,
                    )
                  }
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                <Label>Onboarding done</Label>
                <Switch
                  checked={editForm.onboardingDone}
                  onCheckedChange={(checked) =>
                    setEditForm((prev) =>
                      prev ? { ...prev, onboardingDone: checked } : prev,
                    )
                  }
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                <Label>Account active</Label>
                <Switch
                  checked={editForm.isActive}
                  onCheckedChange={(checked) =>
                    setEditForm((prev) =>
                      prev ? { ...prev, isActive: checked } : prev,
                    )
                  }
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setEditTarget(null);
                setEditForm(null);
              }}
              disabled={isMutating}
            >
              Hủy
            </Button>
            <Button onClick={onUpdateUser} disabled={isMutating}>
              Lưu thay đổi
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(passwordTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setPasswordTarget(null);
            setNewPassword("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Đặt lại mật khẩu</DialogTitle>
            <DialogDescription>
              Nhập mật khẩu mới cho tài khoản {passwordTarget?.email}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label>Mật khẩu mới</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="Tối thiểu 6 ký tự"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setPasswordTarget(null);
                setNewPassword("");
              }}
              disabled={isMutating}
            >
              Hủy
            </Button>
            <Button onClick={onResetPassword} disabled={isMutating}>
              Cập nhật mật khẩu
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
