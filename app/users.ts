// users.ts
// Liste d'utilisateurs de test pour simuler une "base de données" locale.
// N'ajoute pas d'utilisateurs ici en production — c'est uniquement pour tests.

export type TestUser = {
  id: string;
  email: string;
  password: string;
  displayName?: string;
};

export const TEST_USERS: TestUser[] = [
  {
    id: "u1",
    email: "alice@example.com",
    password: "Password123", // respecte les critères (min 8, majuscule, chiffre)
    displayName: "Alice Dupont",
  },
  {
    id: "u2",
    email: "bob@example.com",
    password: "Secret2024",
    displayName: "Bob Martin",
  },
  {
    id: "u3",
    email: "demo@test.com",
    password: "DemoPass1",
    displayName: "Demo User",
  },
];
