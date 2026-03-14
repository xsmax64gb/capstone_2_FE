"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Languages, LogOut, User } from "lucide-react";
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

const navItems = [
  { label: "Home", href: "/" },
  { label: "Exercises", href: "/exercises" },
  { label: "Vocabulary", href: "/vocabulary" },
  { label: "AI Speaking", href: "/ai" },
  { label: "Progress", href: "/dashboard" },
];

const DEFAULT_AVATAR_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAHrbU6dGptCG-_BbdkQIQBO5sKyHsHQ3kIcpfJM3eQak-gKt79i7-H0EAqM-qIJ14pXancOSo4qvoDgyqlFP0ChUVL3QtU0PnuHjHKU2bDHY80nSC7YfRssSXAl92pMdk1oHHaMF8ae4b8WG8rXwGQRxDYqO6vASZHYmvH7DULLHz1Eq9gnhyUHy0RR3GZ3iltSlU42ZdpZPzGUVRVpvB9HNXAEu887lKJybHw3qVD5SRa8M36W9QQXIGMPrGHF3u8KyVrQM8c2OWB";

export function UserHeader() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const profileName = user?.fullName || user?.name || t("Profile");
  const avatarUrl = user?.avatarUrl || DEFAULT_AVATAR_URL;

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

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="transition-colors hover:text-black"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <LanguageSwitch />
          <button className="relative rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
          </button>
          <div className="h-8 w-px bg-slate-200" />
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
                {t("Profile")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                {t("Logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
