export type User = {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    createdAt: Date;
};

export type Membership = {
    userId: string;
    role: string;
    status: string;
    createdAt: Date;
};
