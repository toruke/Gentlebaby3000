export type Child = {
    childId: string;
    firstName: string;
    lastName: string;
    gender: 'male' | 'female' | 'other';
    birthday: Date;
};

export type ChildInFamily = {
    childId: string;
    familyId: string;
};
