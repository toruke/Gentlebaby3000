
export type NotificationType =
    | 'new_member'
    | 'task_start'
    | 'task_late'
    | 'shift_start'
    | 'babyphone_noise';

export type NotificationStatus =
    | 'unread'
    | 'read';

export type Notification = {
    notificationId: string;
    sourceId: string;
    type: string;
    title: string;
    message: string;
    status: string;
    createdAt: Date;
    expiresAt?: Date;
};












