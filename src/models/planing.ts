export type Planning = {
    planningId: string;
    date: Date;
    startTime: Date;
    endTime: Date;
};

export type PlanningAssignment = {
    planningId: string;
    memberId: string;
};
