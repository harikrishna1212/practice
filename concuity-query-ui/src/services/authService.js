// Mock authentication. The real service issues a JWT; here we validate
// against fixture users and return a session-like object.
import { USERS } from '../fixtures/users';

export async function login(username, password) {
  const user = USERS.find(
    (u) => u.username === username && u.password === password
  );
  await new Promise((r) => setTimeout(r, 250));
  if (!user) throw new Error('Invalid username or password.');
  const { password: _omit, ...session } = user;
  return session;
}
