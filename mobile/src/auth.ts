import { User } from './api';

// In-memory session: the logged-in user plus their JWT.
let currentUser: User | null = null;
let authToken: string | null = null;

export function setSession(user: User | null, token: string | null) {
  currentUser = user;
  authToken = token;
}

export function setCurrentUser(user: User | null) {
  currentUser = user;
  if (!user) authToken = null; // logging out clears the token too
}

export function getCurrentUser(): User | null {
  return currentUser;
}

export function getToken(): string | null {
  return authToken;
}
