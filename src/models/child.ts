export type Child = {
    childId: string;
    firstName: string;
    lastName: string;
    gender: 'male' | 'female' | 'other';
    birthday: Date;
    profilePicture?: string;
    createdAt?: Date;
    updatedAt?: Date;
};

// Type pour la création (sans les champs générés automatiquement)
export type CreateChildRequest = {
    firstName: string;
    lastName: string;
    gender: 'male' | 'female' | 'other';
    birthday: Date;
};