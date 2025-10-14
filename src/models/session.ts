export type BabyphoneSession = {
    sessionId: string;
    startTime: Date;
    endTime: Date;
    status: string;
};

export type SessionAssignment = {
    sessionId: string;
    childId: string;
};
