"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useNotification } from "@/hooks/use-notification";
import { useI18n } from "@/lib/i18n/context";
import { ReactNode, MouseEvent } from "react";

interface AuthAwareLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  requireAuth?: boolean;
}

export function AuthAwareLink({
  href,
  children,
  className,
  requireAuth = true,
}: AuthAwareLinkProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { warning } = useNotification();
  const { t } = useI18n();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (requireAuth && !isAuthenticated) {
      e.preventDefault();
      warning(
        t("Yêu cầu đăng nhập"),
        t("Vui lòng đăng nhập để sử dụng tính năng này"),
      );
      router.push("/login");
    }
  };

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}
