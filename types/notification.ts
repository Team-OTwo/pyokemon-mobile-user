export interface Notification {
  notificationId: string;
  title: string;
  message: string;
  createdAt: string;
  isChecked: boolean;
}

export interface NotificationPaginationResponse {
  notifications: Notification[];
  next_cursor: number | null;
  hasMore: boolean;
}

