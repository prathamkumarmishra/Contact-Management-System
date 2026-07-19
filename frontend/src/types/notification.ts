export type NotificationType =
  | 'contact_created'
  | 'contact_updated'
  | 'contact_deleted'
  | 'contact_restored'
  | 'import_complete'
  | 'duplicate_detected'
  | 'birthday_reminder'
  | 'system';

export interface Notification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  referenceId: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface PaginatedNotifications {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
  };
}
