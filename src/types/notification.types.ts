export type NotificationType =
  | "TASK_ASSIGNED"
  | "TASK_UPDATED"
  | "TASK_STATUS_CHANGED"
  | "PROJECT_ASSIGNED"
  | "WORK_SUBMITTED"
  | "WORK_APPROVED"
  | "WORK_CHANGES_REQUESTED";

export interface NotificationMessage {
  id: string;
  type: NotificationType | string;
  title: string;
  message: string;
  entityId?: string | null;
  entityType?: string | null;
  actionUrl?: string | null;
  createdAt: string;
}