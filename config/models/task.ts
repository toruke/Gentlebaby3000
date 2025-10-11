export type Task = {
    taskId: string;
    name: string;
    icon: string;
    type: "Event" | "Ponctual" | "Recurrent";
    active: boolean;
    status: string;
    tolerance: number;
    validation: boolean;
};

export type RecurrentTask = {
    taskId: string;
    occurredAt: number;
};

export type PonctualTask = {
    taskId: string;
    startingAt: Date;
};
