import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  notificationService,
  SIGNALR_EVENTS,
} from "../services";
import type { NotificationMessage } from "../types/notification.types";
import { useAuthContext } from "./useAuthContext";
import { NotificationContext } from "./notification-context";

interface NotificationState {
  userId?: string;
  notifications: NotificationMessage[];
  unreadIds: Set<string>;
}

const EMPTY_NOTIFICATION_STATE: NotificationState = {
  userId: undefined,
  notifications: [],
  unreadIds: new Set(),
};

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({
  children,
}: NotificationProviderProps) {
  const { user, isAuthenticated } = useAuthContext();
  const queryClient = useQueryClient();
  const [state, setState] = useState<NotificationState>(
    EMPTY_NOTIFICATION_STATE,
  );
  const userId = user?.id;

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      notificationService.disconnect();
      return;
    }

    let active = true;
    let retryTimeout: number | null = null;

    const scheduleReconnect = () => {
      if (!active || retryTimeout !== null) {
        return;
      }

      retryTimeout = window.setTimeout(() => {
        retryTimeout = null;
        void connect();
      }, 5_000);
    };

    const handleNotification = (
      notification: NotificationMessage,
    ) => {
      if (
        !notification ||
        typeof notification.id !== "string" ||
        typeof notification.type !== "string" ||
        typeof notification.title !== "string" ||
        typeof notification.message !== "string"
      ) {
        console.error(
          "Received an invalid notification from SignalR:",
          notification,
        );
        return;
      }

      setState((current) => {
        const currentNotifications =
          current.userId === userId
            ? current.notifications
            : [];
        const currentUnreadIds =
          current.userId === userId
            ? current.unreadIds
            : new Set<string>();

        if (
          currentNotifications.some(
            (existing) => existing.id === notification.id,
          )
        ) {
          return current;
        }

        const notifications = [
          notification,
          ...currentNotifications,
        ].slice(0, 50);
        const retainedIds = new Set(
          notifications.map((item) => item.id),
        );
        const unreadIds = new Set([
          ...currentUnreadIds,
          notification.id,
        ]);

        for (const id of unreadIds) {
          if (!retainedIds.has(id)) {
            unreadIds.delete(id);
          }
        }

        return { userId, notifications, unreadIds };
      });

      if (notification.type.startsWith("TASK_")) {
        void queryClient.invalidateQueries({
          queryKey: ["tasks"],
        });
      }

      if (notification.type.startsWith("PROJECT_")) {
        void queryClient.invalidateQueries({
          queryKey: ["projects"],
        });
      }

      void queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
    };

    notificationService.on(
      SIGNALR_EVENTS.RECEIVE_NOTIFICATION,
      handleNotification,
    );

    const connect = async () => {
      try {
        await notificationService.connect();
      } catch (error) {
        if (active) {
          console.error(
            "Notification connection error:",
            error,
          );
          scheduleReconnect();
        }
      }
    };

    void connect();

    return () => {
      active = false;
      if (retryTimeout !== null) {
        window.clearTimeout(retryTimeout);
      }
      notificationService.off(
        SIGNALR_EVENTS.RECEIVE_NOTIFICATION,
        handleNotification,
      );
      notificationService.disconnect();
    };
  }, [isAuthenticated, queryClient, userId]);

  const markAllAsRead = useCallback(() => {
    setState((current) => ({
      ...current,
      unreadIds: new Set(),
    }));
  }, []);

  const clearNotifications = useCallback(() => {
    setState(EMPTY_NOTIFICATION_STATE);
  }, []);

  const hasCurrentUserNotifications =
    isAuthenticated && state.userId === userId;
  const value = useMemo(
    () => ({
      notifications: hasCurrentUserNotifications
        ? state.notifications
        : [],
      unreadCount: hasCurrentUserNotifications
        ? state.unreadIds.size
        : 0,
      markAllAsRead,
      clearNotifications,
    }),
    [
      clearNotifications,
      hasCurrentUserNotifications,
      markAllAsRead,
      state,
    ],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
