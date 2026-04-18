"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Bell, CheckCheck, Loader2, Sparkles } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import {
  useGetInboxNotificationsQuery,
  useGetInboxUnreadCountQuery,
  useMarkAllInboxNotificationsReadMutation,
  useMarkInboxNotificationReadMutation,
} from "@/store/services/inboxNotificationsApi";
import type { InboxNotificationItem } from "@/store/services/inboxNotificationsApi";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";

function formatViTime(iso: string | null) {
  if (!iso) return "";
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: vi });
  } catch {
    return "";
  }
}

function categoryIcon(category: InboxNotificationItem["category"]) {
  switch (category) {
    case "milestone":
      return <Sparkles className="h-4 w-4 text-amber-500" />;
    case "admin_broadcast":
      return <Bell className="h-4 w-4 text-sky-600" />;
    default:
      return <Bell className="h-4 w-4 text-slate-500" />;
  }
}

export function NotificationBell() {
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);
  const [open, setOpen] = useState(false);
  const { t } = useI18n();

  const { data: unreadPack } = useGetInboxUnreadCountQuery(undefined, {
    skip: !isAuthenticated,
    pollingInterval: 45_000,
  });

  const { data: listPack, isFetching } = useGetInboxNotificationsQuery(
    { limit: 25, offset: 0 },
    { skip: !isAuthenticated || !open },
  );

  const [markRead] = useMarkInboxNotificationReadMutation();
  const [markAll, { isLoading: markingAll }] =
    useMarkAllInboxNotificationsReadMutation();

  const unread = unreadPack?.unreadCount ?? 0;
  const items = listPack?.items ?? [];

  const onItemClick = async (item: InboxNotificationItem) => {
    if (!item.read) {
      try {
        await markRead(item.id).unwrap();
      } catch {
        /* ignore */
      }
    }
  };

  const onMarkAll = async () => {
    try {
      await markAll().unwrap();
    } catch {
      /* ignore */
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100"
          aria-label={t("Thông báo")}
        >
          <Bell className="h-5 w-5" />
          {unread > 0 ? (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow ring-2 ring-white">
              {unread > 9 ? "9+" : unread}
            </span>
          ) : null}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={10}
        className={cn(
          "w-[min(100vw-1.5rem,22rem)] p-0 shadow-xl",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-3 data-[side=top]:slide-in-from-bottom-3",
          "duration-200",
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2.5">
          <p className="text-sm font-semibold text-slate-900">{t("Thông báo")}</p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 gap-1 text-xs text-slate-600"
            disabled={markingAll || unread === 0}
            onClick={() => void onMarkAll()}
          >
            {markingAll ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCheck className="h-3.5 w-3.5" />
            )}
            {t("Đọc hết")}
          </Button>
        </div>

        <ScrollArea className="h-[min(60vh,320px)]">
          {isFetching && items.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-slate-500">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-slate-500">
              {t("Chưa có thông báo nào.")}
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {items.map((item, index) => (
                <li
                  key={item.id}
                  className={cn(
                    "transition-colors hover:bg-slate-50/90",
                    !item.read && "bg-sky-50/50",
                    "animate-in fade-in slide-in-from-top-1",
                  )}
                  style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}
                >
                  <button
                    type="button"
                    className="flex w-full gap-3 px-3 py-3 text-left"
                    onClick={() => void onItemClick(item)}
                  >
                    <div className="mt-0.5 shrink-0 rounded-lg bg-white p-1.5 shadow-sm ring-1 ring-slate-100">
                      {categoryIcon(item.category)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "text-sm leading-snug text-slate-900",
                          !item.read && "font-semibold",
                        )}
                      >
                        {item.title}
                      </p>
                      {item.body ? (
                        <p className="mt-0.5 line-clamp-3 text-xs leading-relaxed text-slate-600">
                          {item.body}
                        </p>
                      ) : null}
                      <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                        {formatViTime(item.createdAt)}
                      </p>
                    </div>
                    {!item.read ? (
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-sky-500" />
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
