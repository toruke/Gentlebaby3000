export type Invitation = {
    invitationId: string;
    familyId: string;
    senderId: string;
    emailInvited: string;
    tokenInvitation: string;
    roleProposed: string;
    status: string;
    createdAt: Date;
    expiredAt?: Date;
    acceptedAt?: Date;
};
