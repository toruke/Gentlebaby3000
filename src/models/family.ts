export type Family = {
    familyId: string;
    name: string;
    createdBy: string;
    createdAt: Date;
    photoUrl?: string;
    members: string[];
    babies: string[];
};
