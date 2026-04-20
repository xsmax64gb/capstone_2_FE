"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Languages, LogOut, ShieldCheck, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n/context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LanguageSwitch } from "./language-switch";
import { NotificationBell } from "./notification-bell";

const navItems = [
  { labelKey: "Trang chủ", href: "/" },
  { labelKey: "Bài tập", href: "/exercises" },
  { labelKey: "Từ vựng", href: "/vocabularies" },
  { labelKey: "Nói với AI", href: "/learn" },
  { labelKey: "Đăng ký", href: "/payments" },
];

const DEFAULT_AVATAR_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAHrbU6dGptCG-_BbdkQIQBO5sKyHsHQ3kIcpfJM3eQak-gKt79i7-H0EAqM-qIJ14pXancOSo4qvoDgyqlFP0ChUVL3QtU0PnuHjHKU2bDHY80nSC7YfRssSXAl92pMdk1oHHaMF8ae4b8WG8rXwGQRxDYqO6vASZHYmvH7DULLHz1Eq9gnhyUHy0RR3GZ3iltSlU42ZdpZPzGUVRVpvB9HNXAEu887lKJybHw3qVD5SRa8M36W9QQXIGMPrGHF3u8KyVrQM8c2OWB";

export function UserHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuth();
  const { t } = useI18n();
  /** Tránh hydration mismatch: Redux đọc user từ localStorage chỉ phía client. */
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const profileName =
    user?.fullName ||
    user?.name ||
    (user?.email ? user.email.split("@")[0] : null) ||
    t("Hồ sơ");
  const avatarUrl = user?.avatarUrl || DEFAULT_AVATAR_URL;
  const navLinks =
    user?.role === "admin"
      ? [...navItems, { labelKey: "Quản trị", href: "/admin" }]
      : navItems;

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  const getActiveIndex = () => {
    const activeItem = navLinks.find(
      (item) => isActive(item.href) && item.labelKey !== "Quản trị",
    );
    return activeItem ? navLinks.indexOf(activeItem) : -1;
  };

  const getUnderlinePosition = () => {
    const activeIndex = getActiveIndex();
    if (activeIndex < 0) return 0;

    return activeIndex * 96;
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="rounded bg-black p-1 text-white">
            <Languages className="h-4 w-4" />
          </div>
          <span className="text-xl font-bold tracking-tight">SmartLingo</span>
        </Link>

        <nav className="relative hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          {navLinks.map((item) => (
            <Link
              key={item.labelKey}
              href={item.href}
              className={`relative z-10 px-1 transition-colors duration-300 hover:text-black ${
                isActive(item.href) && item.labelKey !== "Quản trị"
                  ? "font-bold text-black"
                  : ""
              }`}
              data-active={isActive(item.href) && item.labelKey !== "Quản trị"}
            >
              {t(item.labelKey)}
            </Link>
          ))}
          {/* Sliding underline */}
          <div
            className="absolute bottom-[-4px] h-0.5 bg-black transition-all duration-500 ease-out"
            style={{
              width: "45px",
              transform: `translateX(${getActiveIndex() >= 0 ? getUnderlinePosition() + 10 : 0}px)`,
              opacity: getActiveIndex() >= 0 ? 1 : 0,
            }}
          />
        </nav>

        <div className="flex items-center gap-4">
          <LanguageSwitch />
          {mounted && <NotificationBell />}
          <div className="h-8 w-px bg-slate-200" />
          {mounted && isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 transition-colors hover:bg-slate-50"
                >
                  <div className="h-6 w-6 overflow-hidden rounded-full bg-slate-200">
                    <img
                      src={avatarUrl}
                      alt="User avatar"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="text-sm font-medium">{profileName}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  <User className="h-4 w-4" />
                  {t("Hồ sơ")}
                </DropdownMenuItem>
                {user?.role === "admin" && (
                  <DropdownMenuItem onClick={() => router.push("/admin")}>
                    <ShieldCheck className="h-4 w-4" />
                    {t("Quản trị")}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  {t("Đăng xuất")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : mounted ? (
            <Link
              href="/login"
              className="rounded-lg border border-slate-200 px-4 py-1.5 text-sm font-medium transition-colors hover:bg-slate-50"
            >
              {t("Đăng nhập")}
            </Link>
          ) : (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-slate-100" />
          )}
        </div>
      </div>
    </header>
  );
}
