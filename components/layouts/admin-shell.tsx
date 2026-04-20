"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowUpRight,
  BarChart3,
  BookOpen,
  CircleDollarSign,
  ChevronRight,
  FileText,
  LayoutDashboard,
  Languages,
  LogOut,
  Map as MapIcon,
  Megaphone,
  ShieldCheck,
  Sparkles,
  Users2,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useGetAdminOverviewQuery } from "@/store/services/adminApi";
import { formatCompactNumber, formatUptime } from "@/lib/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { LanguageSwitch } from "./language-switch";

const adminNavigation = [
  {
    title: "Tổng quan",
    heading: "Bảng điều khiển quản trị",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Người dùng",
    heading: "Vận hành học viên và tài khoản",
    href: "/admin/users",
    icon: Users2,
  },
  {
    title: "Thông báo",
    heading: "Gửi thông báo toàn hệ thống hoặc từng người",
    href: "/admin/notifications",
    icon: Megaphone,
  },
  {
    title: "Exercises",
    heading: "Quản trị ngân hàng bài tập",
    href: "/admin/exercises",
    icon: BookOpen,
  },
  {
    title: "Placement tests",
    heading: "Bài test đầu vào và rule chấm điểm",
    href: "/admin/placement-tests",
    icon: FileText,
  },
  {
    title: "Level tests",
    heading: "Bài kiểm tra cấp độ và quản lý tiến trình",
    href: "/admin/level-tests",
    icon: ShieldCheck,
  },
  {
    title: "Vocabulary",
    heading: "Quản trị ngân hàng từ vựng",
    href: "/admin/vocabularies",
    icon: Languages,
  },
  {
    title: "Learn maps",
    heading: "Bản đồ hội thoại & boss",
    href: "/admin/learn/maps",
    icon: MapIcon,
  },
  {
    title: "Báo cáo",
    heading: "Theo dõi hiệu suất và cảnh báo",
    href: "/admin/reports",
    icon: BarChart3,
  },
  {
    title: "Gói thanh toán",
    heading: "Quản lý gói, quyền và quota theo module",
    href: "/admin/payment-packages",
    icon: Wallet,
  },
  {
    title: "Doanh thu",
    heading: "Phân tích doanh thu và đối soát thanh toán",
    href: "/admin/revenue",
    icon: CircleDollarSign,
  },
] as const;

const quickLinks = [
  { title: "Exercises", href: "/exercises", icon: ArrowUpRight },
  { title: "Vocabulary", href: "/vocabularies", icon: Languages },
  { title: "AI Speaking", href: "/learn", icon: Sparkles },
] as const;

function isActivePath(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function getCurrentItem(pathname: string) {
  return (
    adminNavigation.find((item) => isActivePath(pathname, item.href)) ??
    adminNavigation[0]
  );
}

function getInitials(name: string) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "AD";
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/admin";
  const router = useRouter();
  const { user, logout } = useAuth();
  const { data: overviewData } = useGetAdminOverviewQuery(undefined, {
    skip: user?.role !== "admin",
  });
  const currentItem = getCurrentItem(pathname);
  const displayName = user?.fullName || user?.name || "Administrator";
  const roleLabel = (user?.role || "admin").toUpperCase();
  const initials = getInitials(displayName);
  const systemHighlights = [
    {
      label: "Uptime",
      value: overviewData?.systemSnapshot
        ? formatUptime(overviewData.systemSnapshot.uptime)
        : "N/A",
    },
    {
      label: "Attempts 7d",
      value: overviewData
        ? formatCompactNumber(overviewData.summary.attemptsLast7Days)
        : "N/A",
    },
    {
      label: "AI active",
      value: overviewData
        ? formatCompactNumber(overviewData.summary.activeAiSessions)
        : "N/A",
    },
  ];

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <SidebarProvider defaultOpen>
      <Sidebar
        variant="inset"
        collapsible="icon"
        className="border-r border-slate-200/70 bg-white"
      >
        <SidebarHeader className="gap-4 px-3 py-3">
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-2xl bg-slate-950 px-3 py-3 text-white shadow-lg shadow-slate-950/10 transition-transform hover:-translate-y-0.5 group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
          >
            <div className="flex size-10 items-center justify-center rounded-2xl bg-white/10 text-sky-300">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0 group-data-[collapsible=icon]:hidden">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                SmartLingo
              </p>
              <p className="truncate text-sm font-semibold">Admin Center</p>
            </div>
          </Link>
        </SidebarHeader>

        <SidebarContent className="px-2 pb-4">
          <SidebarGroup>
            <SidebarGroupLabel>Admin Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNavigation.map((item) => {
                  const Icon = item.icon;

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActivePath(pathname, item.href)}
                        tooltip={item.title}
                        className="h-10 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 data-[active=true]:bg-slate-950 data-[active=true]:text-white data-[active=true]:hover:bg-slate-950 data-[active=true]:hover:text-white"
                      >
                        <Link href={item.href}>
                          <Icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Quick Links</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {quickLinks.map((item) => {
                  const Icon = item.icon;

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        tooltip={item.title}
                        className="h-10 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                      >
                        <Link href={item.href}>
                          <Icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="mt-auto">
            <SidebarGroupLabel>System Snapshot</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/90 p-3 group-data-[collapsible=icon]:hidden">
                {systemHighlights.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 shadow-sm"
                  >
                    <span className="text-xs font-medium text-slate-500">
                      {item.label}
                    </span>
                    <span className="text-sm font-semibold text-slate-900">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="px-3 pb-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm group-data-[collapsible=icon]:hidden">
            <div className="flex items-center gap-3">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={displayName}
                  className="h-11 w-11 rounded-full object-cover ring-2 ring-slate-100"
                />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white ring-2 ring-slate-100">
                  {initials}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {displayName}
                </p>
                <p className="text-xs text-slate-500">
                  {user?.email || roleLabel}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <Badge
                variant="outline"
                className="rounded-full border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500"
              >
                {roleLabel}
              </Badge>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="rounded-xl border-slate-200"
              >
                <LogOut className="h-4 w-4" />
                Đăng xuất
              </Button>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="mx-auto hidden rounded-xl border border-slate-200 bg-white shadow-sm group-data-[collapsible=icon]:inline-flex"
          >
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Đăng xuất</span>
          </Button>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <SidebarInset className="min-h-svh bg-slate-50">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.14),_transparent_58%)]" />

        <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <SidebarTrigger className="rounded-xl border border-slate-200 bg-white shadow-sm" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                  <span>Admin</span>
                  <ChevronRight className="h-3 w-3" />
                  <span className="truncate">{currentItem.title}</span>
                </div>
                <h1 className="truncate text-xl font-semibold text-slate-900 sm:text-2xl">
                  {currentItem.heading}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <LanguageSwitch />
              <Button
                asChild
                variant="outline"
                className="hidden rounded-xl border-slate-200 bg-white sm:inline-flex"
              >
                <Link href="/exercises">Xem learner</Link>
              </Button>
              <div className="hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm md:flex">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={displayName}
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-100"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white ring-2 ring-slate-100">
                    {initials}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {displayName}
                  </p>
                  <p className="text-xs text-slate-500">Admin workspace</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="relative flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute right-4 top-10 hidden h-40 w-40 rounded-full bg-sky-100/70 blur-3xl lg:block" />
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
