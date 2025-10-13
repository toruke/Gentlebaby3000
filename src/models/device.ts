export type Device = {
    serialNumber: string;
    type: string;
    status: string;
    pairedAt: Date;
    lastSeen: Date;
};

export type DeviceAssignment = {
    serialNumber: string;
    assignedAt: Date;
};
