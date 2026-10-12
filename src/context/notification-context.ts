import { createContext } from "react";
import type { NotificationMessage } from "../types/notification.types";

export interface NotificationContextValue {
  notifications: NotificationMessage[];
  unreadCount: number;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

export const NotificationContext =
  createContext<NotificationContextValue | undefined>(
    undefined,
  );
