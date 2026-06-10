// Mock users for the demo login. Real auth (JWT) will replace this —
// see docs/company-brd-hld-api.md, "Security Roles".
export const USERS = [
  {
    username: 'jdoe',
    password: 'user123',
    displayName: 'John Doe',
    role: 'USER',
  },
  {
    username: 'asmith',
    password: 'admin123',
    displayName: 'Alice Smith',
    role: 'ADMIN',
  },
];
