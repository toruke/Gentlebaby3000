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
