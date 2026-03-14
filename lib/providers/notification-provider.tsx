"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/lib/store";
import { addNotification } from "@/lib/slices/notificationSlice";
import { NotificationContainer } from "@/components/notification/notification-container";

export function NotificationProvider() {
  const dispatch = useDispatch();
  const notifications = useSelector(
    (state: RootState) => state.notification.notifications,
  );

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{
        title?: string;
        message?: string;
        type?: "default" | "success" | "error" | "warning" | "info";
        duration?: number;
      }>;

      if (!customEvent.detail?.title) {
        return;
      }

      dispatch(
        addNotification({
          title: customEvent.detail.title,
          message: customEvent.detail.message,
          type: customEvent.detail.type ?? "default",
          duration: customEvent.detail.duration,
        }),
      );
    };

    window.addEventListener("elapp:notify", handler);
    return () => {
      window.removeEventListener("elapp:notify", handler);
    };
  }, [dispatch]);

  return <NotificationContainer notifications={notifications} />;
}
